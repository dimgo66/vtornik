<template>
  <div class="neu-media-browser">
    <!-- Toolbar -->
    <div class="neu-media-toolbar">
      <div class="neu-media-toolbar-left">
        <!-- Breadcrumbs -->
        <div class="neu-media-breadcrumbs">
          <span
            class="neu-media-breadcrumb-item"
            :class="{ 'neu-media-breadcrumb-item--active': !currentFolderId }"
            @click="selectFolder(null)"
          >
            📁 Все файлы
          </span>
          <template v-for="(folder, index) in breadcrumbPath" :key="folder.id">
            <span class="neu-media-breadcrumb-separator">/</span>
            <span
              class="neu-media-breadcrumb-item"
              :class="{ 'neu-media-breadcrumb-item--active': folder.id === currentFolderId }"
              @click="selectFolder(folder.id)"
            >
              {{ folder.name }}
            </span>
          </template>
        </div>
      </div>

      <div class="neu-media-toolbar-right">
        <!-- Bulk actions -->
        <div v-if="hasSelection" class="neu-media-bulk-actions">
          <span>{{ selectionCount }} выбрано</span>
          <button class="neu-media-bulk-action-btn" @click="deleteSelected" title="Удалить">
            🗑️
          </button>
        </div>

        <!-- View toggle -->
        <div class="neu-media-view-toggle">
          <button
            class="neu-media-view-btn"
            :class="{ 'neu-media-view-btn--active': viewMode === 'grid' }"
            @click="setViewMode('grid')"
            title="Сетка"
          >
            ▦
          </button>
          <button
            class="neu-media-view-btn"
            :class="{ 'neu-media-view-btn--active': viewMode === 'list' }"
            @click="setViewMode('list')"
            title="Список"
          >
            ☰
          </button>
        </div>

        <!-- Select all -->
        <button class="neu-btn neu-btn--secondary neu-btn--sm" @click="toggleSelectAll">
          {{ allSelected ? 'Снять все' : 'Выбрать все' }}
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="neu-media-loading">
      <div class="neu-media-spinner"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredFiles.length === 0" class="neu-media-empty">
      <span class="neu-media-empty-icon">📁</span>
      <h3 class="neu-media-empty-title">Нет файлов</h3>
      <p class="neu-media-empty-text">
        {{ searchQuery ? 'По вашему запросу ничего не найдено' : 'Загрузите файлы в эту папку' }}
      </p>
    </div>

    <!-- File Grid -->
    <div v-else-if="viewMode === 'grid'" class="neu-media-file-grid">
      <FileCard
        v-for="file in filteredFiles"
        :key="file.id"
        :file="file"
        :selected="selectedFileIds.includes(file.id)"
        @select="toggleSelection"
        @preview="openPreview"
        @contextmenu="(e) => openContextMenu(e, file)"
      />
    </div>

    <!-- File List -->
    <div v-else class="neu-media-file-list">
      <FileListItem
        v-for="file in filteredFiles"
        :key="file.id"
        :file="file"
        :selected="selectedFileIds.includes(file.id)"
        @select="toggleSelection"
        @preview="openPreview"
        @contextmenu="(e) => openContextMenu(e, file)"
      />
    </div>

    <!-- Context Menu -->
    <div
      v-if="contextMenu.isOpen"
      class="neu-media-context-menu"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      @click="closeContextMenu"
    >
      <div class="neu-media-context-item" @click="downloadFile(contextMenu.file)">
        ⬇️ Скачать
      </div>
      <div class="neu-media-context-item" @click="copyUrl(contextMenu.file)">
        🔗 Копировать URL
      </div>
      <div class="neu-media-context-item" @click="editMetadata(contextMenu.file)">
        ✏️ Редактировать
      </div>
      <div class="neu-media-context-item neu-media-context-item--danger" @click="deleteFile(contextMenu.file)">
        🗑️ Удалить
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, defineComponent } from 'vue'
import { useMediaStore } from '@/stores/media'
import { getFileIcon, getLocalFileUrl } from '@/services/mediaService'

// ── File Card Component ──
const FileCard = defineComponent({
  name: 'FileCard',
  props: {
    file: { type: Object, required: true },
    selected: { type: Boolean, default: false }
  },
  emits: ['select', 'preview', 'contextmenu'],
  setup(props, { emit }) {
    const fileUrl = computed(() => getLocalFileUrl(props.file.url))
    const fileIcon = computed(() => getFileIcon(props.file.fileType))
    const isImage = computed(() => props.file.fileType === 'image')
    const isVideo = computed(() => props.file.fileType === 'video')

    const handleClick = (event) => {
      if (event.target.closest('.neu-media-file-checkbox')) {
        emit('select', props.file.id)
      } else {
        emit('preview', props.file)
      }
    }

    const handleContextMenu = (event) => {
      emit('contextmenu', event)
    }

    return {
      fileUrl,
      fileIcon,
      isImage,
      isVideo,
      handleClick,
      handleContextMenu
    }
  },
  template: `
    <div
      class="neu-media-file-card"
      :class="{ 'neu-media-file-card--selected': selected }"
      @click="handleClick"
      @contextmenu="handleContextMenu"
    >
      <div
        class="neu-media-file-checkbox"
        :class="{ 'neu-media-file-checkbox--checked': selected }"
        @click.stop
      >
        {{ selected ? '✓' : '' }}
      </div>
      <div class="neu-media-file-preview">
        <img v-if="isImage" :src="fileUrl" :alt="file.original_name" loading="lazy" />
        <video v-else-if="isVideo" :src="fileUrl" muted></video>
        <span v-else class="neu-media-file-icon">{{ fileIcon }}</span>
      </div>
      <div class="neu-media-file-info">
        <div class="neu-media-file-name" :title="file.original_name">{{ file.original_name }}</div>
        <div class="neu-media-file-meta">
          <span>{{ file.sizeFormatted }}</span>
          <span>{{ file.fileType }}</span>
        </div>
      </div>
    </div>
  `
})

// ── File List Item Component ──
const FileListItem = defineComponent({
  name: 'FileListItem',
  props: {
    file: { type: Object, required: true },
    selected: { type: Boolean, default: false }
  },
  emits: ['select', 'preview', 'contextmenu'],
  setup(props, { emit }) {
    const fileUrl = computed(() => getLocalFileUrl(props.file.url))
    const fileIcon = computed(() => getFileIcon(props.file.fileType))
    const isImage = computed(() => props.file.fileType === 'image')
    const isVideo = computed(() => props.file.fileType === 'video')

    const handleClick = (event) => {
      if (event.target.closest('.neu-media-file-checkbox')) {
        emit('select', props.file.id)
      } else {
        emit('preview', props.file)
      }
    }

    const handleContextMenu = (event) => {
      emit('contextmenu', event)
    }

    return {
      fileUrl,
      fileIcon,
      isImage,
      isVideo,
      handleClick,
      handleContextMenu
    }
  },
  template: `
    <div
      class="neu-media-file-list-item"
      :class="{ 'neu-media-file-list-item--selected': selected }"
      @click="handleClick"
      @contextmenu="handleContextMenu"
    >
      <div
        class="neu-media-file-checkbox"
        :class="{ 'neu-media-file-checkbox--checked': selected }"
        @click.stop
      >
        {{ selected ? '✓' : '' }}
      </div>
      <div class="neu-media-file-list-thumbnail">
        <img v-if="isImage" :src="fileUrl" :alt="file.original_name" loading="lazy" />
        <video v-else-if="isVideo" :src="fileUrl" muted></video>
        <span v-else class="neu-media-file-list-icon">{{ fileIcon }}</span>
      </div>
      <div class="neu-media-file-list-name" :title="file.original_name">{{ file.original_name }}</div>
      <div class="neu-media-file-list-meta">{{ file.sizeFormatted }}</div>
      <div class="neu-media-file-list-meta">{{ file.fileType.toUpperCase() }}</div>
    </div>
  `
})

// ── Main Component ──
export default defineComponent({
  name: 'MediaBrowser',
  components: { FileCard, FileListItem },
  props: {
    currentFolderId: {
      type: String,
      default: null
    }
  },
  emits: ['select-folder', 'delete-file', 'edit-metadata', 'copy-url', 'download-file'],
  setup(props, { emit }) {
    const mediaStore = useMediaStore()
    const contextMenu = ref({
      isOpen: false,
      x: 0,
      y: 0,
      file: null
    })

    const filteredFiles = computed(() => mediaStore.filteredFiles)
    const selectedFileIds = computed(() => mediaStore.selectedFileIds)
    const hasSelection = computed(() => mediaStore.hasSelection)
    const selectionCount = computed(() => mediaStore.selectionCount)
    const allSelected = computed(() => {
      return filteredFiles.value.length > 0 &&
        filteredFiles.value.every(f => selectedFileIds.value.includes(f.id))
    })
    const viewMode = computed(() => mediaStore.viewMode)
    const isLoading = computed(() => mediaStore.isLoading)
    const searchQuery = computed(() => mediaStore.searchQuery)

    // Breadcrumb path
    const breadcrumbPath = computed(() => {
      if (!props.currentFolderId) return []
      const path = []
      let currentFolder = mediaStore.folders.find(f => f.id === props.currentFolderId)
      while (currentFolder) {
        path.unshift(currentFolder)
        currentFolder = mediaStore.folders.find(f => f.id === currentFolder.parent_id)
      }
      return path
    })

    function toggleSelection(fileId) {
      mediaStore.toggleFileSelection(fileId)
    }

    function toggleSelectAll() {
      if (allSelected.value) {
        mediaStore.clearSelection()
      } else {
        mediaStore.selectAllFiles()
      }
    }

    function setViewMode(mode) {
      mediaStore.setViewMode(mode)
    }

    function selectFolder(folderId) {
      emit('select-folder', folderId)
    }

    function openPreview(file) {
      mediaStore.openPreviewModal(file.id)
    }

    function openContextMenu(event, file) {
      event.preventDefault()
      contextMenu.value = {
        isOpen: true,
        x: event.clientX,
        y: event.clientY,
        file
      }
    }

    function closeContextMenu() {
      contextMenu.value.isOpen = false
      contextMenu.value.file = null
    }

    function deleteFile(file) {
      closeContextMenu()
      if (confirm(`Удалить файл "${file.original_name}"?`)) {
        emit('delete-file', file.id)
      }
    }

    function deleteSelected() {
      if (confirm(`Удалить выбранные файлы (${selectionCount.value} шт.)?`)) {
        mediaStore.deleteSelectedFiles()
      }
    }

    function editMetadata(file) {
      closeContextMenu()
      emit('edit-metadata', file)
    }

    function copyUrl(file) {
      closeContextMenu()
      const url = getLocalFileUrl(file.url)
      navigator.clipboard.writeText(url)
      emit('copy-url', url)
    }

    async function downloadFile(file) {
      closeContextMenu()
      try {
        const url = await getLocalFileUrl(file.url)
        const a = document.createElement('a')
        a.href = url
        a.download = file.original_name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        emit('download-file', file)
      } catch (error) {
        console.error('Download failed:', error)
      }
    }

    // Close context menu on click outside
    function handleClickOutside(event) {
      if (contextMenu.value.isOpen && !event.target.closest('.neu-media-context-menu')) {
        closeContextMenu()
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      filteredFiles,
      selectedFileIds,
      hasSelection,
      selectionCount,
      allSelected,
      viewMode,
      isLoading,
      searchQuery,
      breadcrumbPath,
      contextMenu,
      toggleSelection,
      toggleSelectAll,
      setViewMode,
      selectFolder,
      openPreview,
      openContextMenu,
      closeContextMenu,
      deleteFile,
      deleteSelected,
      editMetadata,
      copyUrl,
      downloadFile
    }
  }
})
</script>

<style scoped>
.neu-media-breadcrumb-item--active {
  color: var(--neu-primary);
  font-weight: 600;
}

.neu-media-bulk-action-btn {
  padding: 4px 8px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.neu-media-bulk-action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}
</style>
