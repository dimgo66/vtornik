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
    <div v-if="viewMode === 'grid'" class="neu-media-file-grid">
      <div
        v-for="file in filteredFiles"
        :key="file.id"
        class="neu-media-file-card"
        @click="openPreview(file)"
        @contextmenu="(e) => openContextMenu(e, file)"
      >
        <div class="neu-media-file-preview">
          <img v-if="file.fileType === 'image'" :src="file.url" :alt="file.original_name" loading="lazy" />
          <video v-else-if="file.fileType === 'video'" :src="file.url" muted preload="metadata" poster="">
            <source :src="file.url" :type="file.type" />
          </video>
          <span v-else class="neu-media-file-icon">📄</span>
        </div>
        <div class="neu-media-file-info">
          <div class="neu-media-file-name" :title="file.original_name">{{ file.original_name || file.name }}</div>
          <div class="neu-media-file-meta">
            <span>{{ file.sizeFormatted }}</span>
            <span>{{ file.fileType }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- File List -->
    <div v-else-if="viewMode === 'list'" class="neu-media-file-list">
      <div
        v-for="file in filteredFiles"
        :key="file.id"
        class="neu-media-file-list-item"
        @contextmenu="(e) => openContextMenu(e, file)"
      >
        <div
          class="neu-media-file-checkbox"
          :class="{ 'neu-media-file-checkbox--checked': selectedFileIds.includes(file.id) }"
          @click.stop="toggleSelection(file.id)"
        >
          {{ selectedFileIds.includes(file.id) ? '✓' : '' }}
        </div>
        <div class="neu-media-file-list-thumbnail">
          <img v-if="file.fileType === 'image'" :src="file.url" :alt="file.original_name" loading="lazy" />
          <video v-else-if="file.fileType === 'video'" :src="file.url" muted preload="metadata"></video>
          <span v-else class="neu-media-file-list-icon">📄</span>
        </div>
        <div class="neu-media-file-list-name-wrapper">
          <div class="neu-media-file-list-name" :title="file.original_name" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ file.original_name || file.name }}</div>
        </div>
        <div class="neu-media-file-list-meta">{{ file.sizeFormatted }}</div>
        <div class="neu-media-file-list-meta">{{ file.fileType.toUpperCase() }}</div>
        <div class="neu-media-file-list-actions" style="margin-left: auto; justify-content: flex-end;">
          <button class="neu-media-file-action-btn" @click.stop="editMetadata(file)" title="Редактировать">
            ✏️
          </button>
          <button class="neu-media-file-action-btn" @click.stop="copyUrl(file)" title="Копировать URL">
            🔗
          </button>
          <button class="neu-media-file-action-btn neu-media-file-action-btn--danger" @click.stop="deleteFile(file)" title="Удалить">
            🗑️
          </button>
        </div>
      </div>
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
  emits: ['select-folder', 'delete-file', 'edit-metadata', 'copy-url', 'download-file', 'preview'],
  setup(props, { emit }) {
    const mediaStore = useMediaStore()
    const contextMenu = ref({
      isOpen: false,
      x: 0,
      y: 0,
      file: null
    })

    const filteredFiles = computed(() => {
      const files = mediaStore.filteredFiles
      console.log('MediaBrowser filteredFiles:', files.length, files)
      return files
    })
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
      emit('preview', file)
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
      const url = window.location.origin + file.url
      navigator.clipboard.writeText(url).then(() => {
        console.log('URL скопирован:', url)
      }).catch(err => {
        console.error('Ошибка копирования:', err)
      })
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

/* File List Styles */
.neu-media-file-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.neu-media-file-list-item {
  display: grid;
  grid-template-columns: 40px 50px minmax(200px, 50%) 90px 80px auto;
  gap: var(--space-md);
  align-items: center;
  min-height: 52px;
  padding: var(--space-sm) var(--space-md);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-md);
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.neu-media-file-list-item:hover {
  box-shadow:
    3px 3px 6px var(--neu-shadow-dark),
    -3px -3px 6px var(--neu-shadow-light);
}

.neu-media-file-list-item--selected {
  box-shadow:
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light),
    0 0 0 2px var(--neu-primary);
}

.neu-media-file-list-thumbnail {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--neu-bg-tertiary);
  flex-shrink: 0;
}

.neu-media-file-list-thumbnail img,
.neu-media-file-list-thumbnail video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.neu-media-file-list-icon {
  font-size: 1.8rem;
  opacity: 0.6;
}

.neu-media-file-list-name-wrapper {
  display: flex;
  align-items: center;
  min-width: 0;
  padding-left: var(--space-md);
  border-left: 1px solid var(--neu-border);
  overflow: hidden;
}

.neu-media-file-list-name {
  font-family: var(--fn);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--neu-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.neu-media-file-list-meta {
  font-size: 0.75rem;
  color: var(--neu-text-secondary);
  font-weight: 500;
  white-space: nowrap;
}

.neu-media-file-list-actions {
  display: flex;
  gap: var(--space-xs);
  justify-content: flex-start;
  margin-left: auto;
}

.neu-media-file-action-btn {
  width: 36px;
  height: 32px;
  border: none;
  border-radius: var(--radius-sm);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.neu-media-file-action-btn:hover {
  box-shadow:
    3px 3px 6px var(--neu-shadow-dark),
    -3px -3px 6px var(--neu-shadow-light);
  transform: translateY(-1px);
}

.neu-media-file-action-btn--danger:hover {
  background: linear-gradient(135deg, var(--neu-primary), var(--neu-primary-dark));
  color: #fff;
}
</style>
