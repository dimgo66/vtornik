import { defineStore } from 'pinia'
import * as mediaService from '@/services/mediaService'
import { useUIStore } from './ui'

export const useMediaStore = defineStore('media', {
  state: () => ({
    // Файлы
    files: [],
    selectedFileIds: [],
    
    // Папки
    folders: [],
    folderTree: [],
    currentFolderId: null,
    
    // Поиск и фильтры
    searchQuery: '',
    filterType: 'all', // all, image, video, audio, document
    filterBucket: 'all', // all, images, videos
    sortBy: 'created_at', // created_at, name, size
    sortOrder: 'desc', // asc, desc
    
    // UI
    viewMode: 'grid', // grid, list
    isLoading: false,
    error: null,
    
    // Статистика
    statistics: null,
    
    // Модальные окна
    isPreviewModalOpen: false,
    isUploadModalOpen: false,
    isFolderModalOpen: false,
    previewFileId: null
  }),

  getters: {
    // Фильтрованные файлы
    filteredFiles: (state) => {
      let files = state.files

      // Поиск
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        files = files.filter(file => 
          file.original_name?.toLowerCase().includes(query) ||
          file.name?.toLowerCase().includes(query) ||
          file.alt_text?.toLowerCase().includes(query)
        )
      }

      // Фильтр по типу
      if (state.filterType !== 'all') {
        files = files.filter(file => file.fileType === state.filterType)
      }

      // Фильтр по бакету
      if (state.filterBucket !== 'all') {
        files = files.filter(file => file.bucket_id === state.filterBucket)
      }

      // Сортировка
      files = [...files].sort((a, b) => {
        let comparison = 0
        switch (state.sortBy) {
          case 'name':
            comparison = (a.original_name || '').localeCompare(b.original_name || '')
            break
          case 'size':
            comparison = (a.size || 0) - (b.size || 0)
            break
          case 'created_at':
          default:
            comparison = new Date(a.created_at) - new Date(b.created_at)
        }
        return state.sortOrder === 'asc' ? comparison : -comparison
      })

      return files
    },

    // Выбранные файлы
    selectedFiles: (state) => {
      return state.files.filter(file => state.selectedFileIds.includes(file.id))
    },

    // Текущая папка
    currentFolder: (state) => {
      if (!state.currentFolderId) return null
      return state.folders.find(f => f.id === state.currentFolderId)
    },

    // Дочерние папки текущей папки
    childFolders: (state) => {
      if (!state.currentFolderId) return state.folderTree
      const currentFolder = state.folders.find(f => f.id === state.currentFolderId)
      if (!currentFolder) return state.folderTree
      return currentFolder.children || []
    },

    // Есть ли выбранные файлы
    hasSelection: (state) => state.selectedFileIds.length > 0,

    // Количество выбранных файлов
    selectionCount: (state) => state.selectedFileIds.length,

    // Общий размер выбранных файлов
    selectionSize: (state) => {
      return state.selectedFiles.reduce((sum, file) => sum + (file.size || 0), 0)
    },

    // Статистика по типам файлов
    filesByType: (state) => {
      return state.files.reduce((acc, file) => {
        acc[file.fileType] = (acc[file.fileType] || 0) + 1
        return acc
      }, {})
    }
  },

  actions: {
    // ══════════════════════════════════════════════════
    //  FOLDERS (Папки)
    // ══════════════════════════════════════════════════

    async fetchFolders() {
      this.isLoading = true
      this.error = null
      try {
        const folders = await mediaService.fetchAllFolders()
        this.folders = folders
        this.folderTree = mediaService.buildFolderTree(folders)
        this.$patch({
          folders: [...folders],
          folderTree: mediaService.buildFolderTree(folders)
        })
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch folders:', error)
        const uiStore = useUIStore()
        uiStore.showError('Не удалось загрузить папки')
      } finally {
        this.isLoading = false
      }
    },

    async createFolder(name, parentId = null) {
      const uiStore = useUIStore()
      try {
        const folder = await mediaService.createFolder(name, parentId)
        await this.fetchFolders()
        uiStore.showSuccess('Папка создана')
        return folder
      } catch (error) {
        console.error('Failed to create folder:', error)
        uiStore.showError('Не удалось создать папку')
        throw error
      }
    },

    async updateFolder(id, updates) {
      const uiStore = useUIStore()
      try {
        const folder = await mediaService.updateFolder(id, updates)
        const index = this.folders.findIndex(f => f.id === id)
        if (index !== -1) {
          this.folders[index] = folder
          this.folderTree = mediaService.buildFolderTree(this.folders)
        }
        uiStore.showSuccess('Папка обновлена')
        return folder
      } catch (error) {
        console.error('Failed to update folder:', error)
        uiStore.showError('Не удалось обновить папку')
        throw error
      }
    },

    async deleteFolder(id) {
      const uiStore = useUIStore()
      try {
        await mediaService.deleteFolder(id)
        this.folders = this.folders.filter(f => f.id !== id)
        this.folderTree = mediaService.buildFolderTree(this.folders)
        if (this.currentFolderId === id) {
          this.currentFolderId = null
        }
        uiStore.showSuccess('Папка удалена')
      } catch (error) {
        console.error('Failed to delete folder:', error)
        uiStore.showError('Не удалось удалить папку')
        throw error
      }
    },

    setCurrentFolder(folderId) {
      this.currentFolderId = folderId
      this.selectedFileIds = []
      this.fetchFiles()
    },

    // ══════════════════════════════════════════════════
    //  FILES (Файлы)
    // ══════════════════════════════════════════════════

    async fetchFiles() {
      this.isLoading = true
      this.error = null
      try {
        const filters = {}
        if (this.currentFolderId) filters.folder_id = this.currentFolderId
        if (this.filterBucket !== 'all') filters.bucket_id = this.filterBucket
        if (this.searchQuery) filters.search = this.searchQuery
        if (this.filterType !== 'all') filters.type = this.filterType

        const files = await mediaService.fetchFiles(filters)
        this.files = files
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch files:', error)
        const uiStore = useUIStore()
        uiStore.showError('Не удалось загрузить файлы')
      } finally {
        this.isLoading = false
      }
    },

    async uploadFiles(files, folderId = null, folderName = '', bucketId = 'images') {
      const uiStore = useUIStore()
      this.isLoading = true
      this.error = null
      const uploadedFiles = []

      try {
        for (const file of files) {
          const uploadedFile = await mediaService.uploadFile(file, folderId, folderName, bucketId)
          uploadedFiles.push(uploadedFile)
          this.files.unshift(uploadedFile)
        }
        await this.fetchStatistics()
        uiStore.showSuccess(`Загружено файлов: ${uploadedFiles.length}`)
        return uploadedFiles
      } catch (error) {
        this.error = error.message
        console.error('Failed to upload files:', error)
        uiStore.showError('Ошибка загрузки файлов')
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateFile(id, updates) {
      const uiStore = useUIStore()
      try {
        const file = await mediaService.updateFile(id, updates)
        const index = this.files.findIndex(f => f.id === id)
        if (index !== -1) {
          this.files[index] = file
        }
        uiStore.showSuccess('Файл обновлён')
        return file
      } catch (error) {
        this.error = error.message
        console.error('Failed to update file:', error)
        throw error
      }
    },

    async deleteFile(id) {
      const uiStore = useUIStore()
      try {
        await mediaService.deleteFile(id)
        this.files = this.files.filter(f => f.id !== id)
        this.selectedFileIds = this.selectedFileIds.filter(fid => fid !== id)
        await this.fetchStatistics()
        uiStore.showSuccess('Файл удалён')
      } catch (error) {
        console.error('Failed to delete file:', error)
        uiStore.showError('Не удалось удалить файл')
        throw error
      }
    },

    async deleteSelectedFiles() {
      const uiStore = useUIStore()
      try {
        await mediaService.deleteFiles(this.selectedFileIds)
        this.files = this.files.filter(f => !this.selectedFileIds.includes(f.id))
        this.selectedFileIds = []
        await this.fetchStatistics()
        uiStore.showSuccess(`Удалено файлов: ${this.selectedFileIds.length}`)
      } catch (error) {
        console.error('Failed to delete selected files:', error)
        uiStore.showError('Не удалось удалить файлы')
        throw error
      }
    },

    async moveFilesToFolder(fileIds, folderId) {
      const uiStore = useUIStore()
      try {
        await mediaService.moveFiles(fileIds, folderId)
        const folderName = folderId ? 'папку' : 'корень'
        uiStore.showSuccess(`Файлы перемещены в ${folderName}`)

        // Обновляем файлы в текущем списке
        if (this.currentFolderId && this.currentFolderId !== folderId) {
          this.files = this.files.filter(f => !fileIds.includes(f.id))
        }
        this.selectedFileIds = []
      } catch (error) {
        console.error('Failed to move files:', error)
        throw error
      }
    },

    // Выделение файлов
    toggleFileSelection(fileId) {
      const index = this.selectedFileIds.indexOf(fileId)
      if (index === -1) {
        this.selectedFileIds.push(fileId)
      } else {
        this.selectedFileIds.splice(index, 1)
      }
    },

    selectAllFiles() {
      this.selectedFileIds = this.filteredFiles.map(f => f.id)
    },

    clearSelection() {
      this.selectedFileIds = []
    },

    // ══════════════════════════════════════════════════
    //  SEARCH & FILTERS (Поиск и фильтры)
    // ══════════════════════════════════════════════════

    setSearchQuery(query) {
      this.searchQuery = query
      this.fetchFiles()
    },

    setFilterType(type) {
      this.filterType = type
      this.fetchFiles()
    },

    setFilterBucket(bucket) {
      this.filterBucket = bucket
      this.fetchFiles()
    },

    setSortBy(sortBy) {
      this.sortBy = sortBy
    },

    setSortOrder(order) {
      this.sortOrder = order
    },

    // ══════════════════════════════════════════════════
    //  UI (Интерфейс)
    // ══════════════════════════════════════════════════

    setViewMode(mode) {
      this.viewMode = mode
    },

    toggleViewMode() {
      this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid'
    },

    // ══════════════════════════════════════════════════
    //  STATISTICS (Статистика)
    // ══════════════════════════════════════════════════

    async fetchStatistics() {
      try {
        const stats = await mediaService.fetchTotalStatistics()
        this.statistics = stats
      } catch (error) {
        console.error('Failed to fetch statistics:', error)
      }
    },

    // ══════════════════════════════════════════════════
    //  MODALS (Модальные окна)
    // ══════════════════════════════════════════════════

    openPreviewModal(fileId) {
      this.previewFileId = fileId
      this.isPreviewModalOpen = true
    },

    closePreviewModal() {
      this.isPreviewModalOpen = false
      this.previewFileId = null
    },

    openUploadModal() {
      this.isUploadModalOpen = true
    },

    closeUploadModal() {
      this.isUploadModalOpen = false
    },

    openFolderModal() {
      this.isFolderModalOpen = true
    },

    closeFolderModal() {
      this.isFolderModalOpen = false
    },

    // ══════════════════════════════════════════════════
    //  INIT (Инициализация)
    // ══════════════════════════════════════════════════

    async init() {
      // Запускаем параллельно, но ошибки не блокируют другие запросы
      await Promise.allSettled([
        this.fetchFolders(),
        this.fetchFiles(),
        this.fetchStatistics()
      ])
    }
  }
})
