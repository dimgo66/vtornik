<template>
  <div class="neu-cms-section neu-media-page-wrapper">
    <div class="neu-media-page">
      <!-- Sidebar -->
      <aside class="neu-media-sidebar">
        <!-- Folders -->
        <div class="neu-media-sidebar-section">
          <h3 class="neu-media-sidebar-title">Папки</h3>
          <MediaFolderTree
            :current-folder-id="currentFolderId"
            @select-folder="selectFolder"
            @create-folder="openCreateFolderDialog"
            @delete-folder="confirmDeleteFolder"
          />
        </div>

        <!-- Statistics -->
        <div class="neu-media-sidebar-section">
          <h3 class="neu-media-sidebar-title">Статистика</h3>
          <div class="neu-media-stats">
            <div class="neu-media-stat-card">
              <div class="neu-media-stat-value">{{ statistics?.totalFiles || 0 }}</div>
              <div class="neu-media-stat-label">Файлов</div>
            </div>
            <div class="neu-media-stat-card">
              <div class="neu-media-stat-value">{{ statistics?.totalSizeFormatted || '0 B' }}</div>
              <div class="neu-media-stat-label">Объём</div>
            </div>
          </div>

          <!-- Files by type -->
          <div class="neu-media-stats" style="margin-top: var(--space-sm)">
            <div v-for="(count, type) in filesByType" :key="type" class="neu-media-stat-card">
              <div class="neu-media-stat-value">{{ count }}</div>
              <div class="neu-media-stat-label">{{ getTypeName(type) }}</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="neu-media-sidebar-section">
          <button class="neu-btn neu-btn--primary neu-btn--full" @click="showUploadSection = !showUploadSection">
            {{ showUploadSection ? 'Скрыть загрузку' : '📤 Загрузить файлы' }}
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="neu-media-main">
        <!-- Upload Section -->
        <div v-if="showUploadSection" class="neu-media-upload-section">
          <div class="neu-media-upload-section-header">
            <h3>Загрузка файлов</h3>
            <button class="neu-media-close-btn" @click="showUploadSection = false">×</button>
          </div>
          <MediaUpload
            :folder-id="currentFolderId"
            @upload-complete="handleUploadComplete"
            @upload-error="handleUploadError"
          />
        </div>

        <!-- Search and Filters -->
        <div class="neu-media-filters-section">
          <div class="neu-media-search-wrap">
            <span class="neu-media-search-icon">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              class="neu-media-search-input"
              placeholder="Поиск файлов..."
              @input="handleSearch"
            />
          </div>

          <div class="neu-media-filter-group">
            <button
              v-for="type in filterTypes"
              :key="type.value"
              class="neu-media-filter-btn"
              :class="{ 'neu-media-filter-btn--active': filterType === type.value }"
              @click="setFilterType(type.value)"
            >
              {{ type.icon }} {{ type.label }}
            </button>
          </div>

          <div class="neu-media-sort-group">
            <select v-model="sortBy" class="neu-media-sort-select" @change="applySort">
              <option value="created_at">По дате</option>
              <option value="name">По имени</option>
              <option value="size">По размеру</option>
            </select>
            <button class="neu-media-sort-btn" @click="toggleSortOrder">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </button>
          </div>
        </div>

        <!-- File Browser -->
        <MediaBrowser
          :current-folder-id="currentFolderId"
          @select-folder="selectFolder"
          @delete-file="deleteFile"
          @edit-metadata="editMetadata"
          @copy-url="copyUrl"
        />
      </main>
    </div>

    <!-- Preview Modal -->
    <div v-if="isPreviewModalOpen" class="neu-media-preview-modal" @click="closePreviewModal">
      <div class="neu-media-preview-content" @click.stop>
        <button class="neu-media-preview-close" @click="closePreviewModal">×</button>
        <template v-if="previewFile">
          <img v-if="previewFile.fileType === 'image'" :src="previewFile.url" :alt="previewFile.original_name" />
          <video v-else-if="previewFile.fileType === 'video'" :src="previewFile.url" controls></video>
          <div v-else class="neu-media-preview-other">
            <span class="neu-media-preview-icon">{{ getFileIcon(previewFile.fileType) }}</span>
            <p>{{ previewFile.original_name }}</p>
          </div>
          <div class="neu-media-preview-info">
            <div class="neu-media-preview-name">{{ previewFile.original_name }}</div>
            <div class="neu-media-preview-meta">
              {{ previewFile.sizeFormatted }} • {{ previewFile.fileType.toUpperCase() }}
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Create Folder Dialog -->
    <div v-if="isFolderDialogOpen" class="neu-media-dialog-overlay" @click="closeCreateFolderDialog">
      <div class="neu-media-dialog" @click.stop>
        <h3 class="neu-media-dialog-title">Новая папка</h3>
        <input
          v-model="newFolderName"
          type="text"
          class="neu-media-dialog-input"
          placeholder="Название папки"
          @keyup.enter.prevent="createFolder"
          ref="folderInput"
        />
        <div class="neu-media-dialog-actions">
          <button class="neu-btn neu-btn--secondary" @click="closeCreateFolderDialog">Отмена</button>
          <button class="neu-btn neu-btn--primary" @click="createFolder" :disabled="!newFolderName.trim()">
            Создать
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Metadata Dialog -->
    <div v-if="isEditDialogOpen" class="neu-media-dialog-overlay" @click="closeEditDialog">
      <div class="neu-media-dialog neu-media-dialog--wide" @click.stop>
        <h3 class="neu-media-dialog-title">Редактирование метаданных</h3>
        <div class="neu-media-dialog-form">
          <div class="neu-media-form-group">
            <label class="neu-media-form-label">Название</label>
            <input
              v-model="editForm.original_name"
              type="text"
              class="neu-media-form-input"
              placeholder="Название файла"
            />
          </div>
          <div class="neu-media-form-group">
            <label class="neu-media-form-label">Alt текст</label>
            <input
              v-model="editForm.alt_text"
              type="text"
              class="neu-media-form-input"
              placeholder="Альтернативный текст"
            />
          </div>
          <div class="neu-media-form-group">
            <label class="neu-media-form-label">Описание</label>
            <textarea
              v-model="editForm.description"
              class="neu-media-form-textarea"
              placeholder="Описание файла"
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="neu-media-dialog-actions">
          <button class="neu-btn neu-btn--secondary" @click="closeEditDialog">Отмена</button>
          <button class="neu-btn neu-btn--primary" @click="saveMetadata">Сохранить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useMediaStore } from '@/stores/media'
import { useUIStore } from '@/stores/ui'
import { getFileIcon } from '@/services/mediaService'
import MediaFolderTree from '@/components/cms/MediaFolderTree.vue'
import MediaBrowser from '@/components/cms/MediaBrowser.vue'
import MediaUpload from '@/components/cms/MediaUpload.vue'

const mediaStore = useMediaStore()
const uiStore = useUIStore()

// State
const currentFolderId = ref(null)
const showUploadSection = ref(false)
const searchQuery = ref('')
const filterType = ref('all')
const sortBy = ref('created_at')
const sortOrder = ref('desc')

// Dialogs
const isFolderDialogOpen = ref(false)
const isEditDialogOpen = ref(false)
const newFolderName = ref('')
const newFolderParentId = ref(null)
const editForm = ref({ id: null, original_name: '', alt_text: '', description: '' })

const folderInput = ref(null)

// Computed
const statistics = computed(() => mediaStore.statistics)
const filesByType = computed(() => mediaStore.filesByType)
const isPreviewModalOpen = computed(() => mediaStore.isPreviewModalOpen)
const previewFile = computed(() => {
  if (!mediaStore.previewFileId) return null
  return mediaStore.files.find(f => f.id === mediaStore.previewFileId)
})

// Filter types
const filterTypes = [
  { value: 'all', label: 'Все', icon: '📁' },
  { value: 'image', label: 'Фото', icon: '🖼️' },
  { value: 'video', label: 'Видео', icon: '🎬' },
  { value: 'audio', label: 'Аудио', icon: '🎵' },
  { value: 'document', label: 'Документы', icon: '📄' }
]

// Methods
function getTypeName(type) {
  const names = {
    image: 'Фото',
    video: 'Видео',
    audio: 'Аудио',
    document: 'Документы',
    unknown: 'Другие'
  }
  return names[type] || type
}

function selectFolder(folderId) {
  currentFolderId.value = folderId
  mediaStore.setCurrentFolder(folderId)
}

function handleSearch() {
  mediaStore.setSearchQuery(searchQuery.value)
}

function setFilterType(type) {
  filterType.value = type
  mediaStore.setFilterType(type)
}

function applySort() {
  mediaStore.setSortBy(sortBy.value)
}

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  mediaStore.setSortOrder(sortOrder.value)
}

function openCreateFolderDialog(parentId = null) {
  newFolderParentId.value = parentId
  newFolderName.value = ''
  isFolderDialogOpen.value = true
  nextTick(() => {
    folderInput.value?.focus()
  })
}

function closeCreateFolderDialog() {
  isFolderDialogOpen.value = false
  newFolderName.value = ''
  newFolderParentId.value = null
}

async function createFolder() {
  if (!newFolderName.value.trim()) return

  try {
    await mediaStore.createFolder(newFolderName.value.trim(), newFolderParentId.value)
    closeCreateFolderDialog()
  } catch (error) {
    console.error('Failed to create folder:', error)
    // Ошибка уже показана в store
  }
}

async function confirmDeleteFolder(folderId) {
  const count = mediaStore.files.filter(f => f.folder_id === folderId).length
  if (count > 0) {
    if (!confirm(`В папке есть файлы (${count} шт.). Удалить папку вместе с содержимым?`)) {
      return
    }
  } else {
    if (!confirm('Удалить папку?')) {
      return
    }
  }

  try {
    await mediaStore.deleteFolder(folderId)
  } catch (error) {
    console.error('Failed to delete folder:', error)
    // Ошибка уже показана в store
  }
}

function handleUploadComplete(file) {
  console.log('File uploaded:', file)
}

function handleUploadError(error) {
  console.error('Upload error:', error)
  uiStore.showError('Ошибка загрузки: ' + error.message)
}

async function deleteFile(fileId) {
  try {
    await mediaStore.deleteFile(fileId)
  } catch (error) {
    console.error('Failed to delete file:', error)
    // Ошибка уже показана в store
  }
}

function editMetadata(file) {
  editForm.value = {
    id: file.id,
    original_name: file.original_name || '',
    alt_text: file.alt_text || '',
    description: file.description || ''
  }
  isEditDialogOpen.value = true
}

function closeEditDialog() {
  isEditDialogOpen.value = false
  editForm.value = { id: null, original_name: '', alt_text: '', description: '' }
}

async function saveMetadata() {
  try {
    await mediaStore.updateFile(editForm.value.id, {
      name: editForm.value.original_name,
      alt_text: editForm.value.alt_text,
      description: editForm.value.description
    })
    closeEditDialog()
  } catch (error) {
    console.error('Failed to update file:', error)
    // Ошибка уже показана в store
  }
}

function copyUrl(url) {
  console.log('Copied URL:', url)
}

function closePreviewModal() {
  mediaStore.closePreviewModal()
}

// Init
onMounted(async () => {
  // Инициализация store загружает папки и файлы
  await mediaStore.init()
  console.log('CMSMedia mounted: Folders=', mediaStore.folders.length, 'Files=', mediaStore.files.length)
})
</script>

<style scoped>
.neu-media-page-wrapper {
  height: auto;
  min-height: calc(100vh - 120px);
}

.neu-media-upload-section {
  margin-bottom: var(--space-lg);
  padding: var(--space-lg);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-lg);
  box-shadow:
    3px 3px 6px var(--neu-shadow-dark),
    -3px -3px 6px var(--neu-shadow-light);
}

.neu-media-upload-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.neu-media-upload-section-header h3 {
  font-family: var(--fn);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--neu-text-primary);
  margin: 0;
}

.neu-media-close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
  font-size: 1.5rem;
  color: var(--neu-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.neu-media-close-btn:hover {
  color: var(--neu-primary);
  box-shadow:
    3px 3px 6px var(--neu-shadow-dark),
    -3px -3px 6px var(--neu-shadow-light);
}

.neu-media-filters-section {
  display: flex;
  gap: var(--space-md);
  align-items: center;
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
}

.neu-media-search-wrap {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.neu-media-search-icon {
  position: absolute;
  left: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  color: var(--neu-text-secondary);
}

.neu-media-search-input {
  width: 100%;
  padding: var(--space-xs) var(--space-md);
  padding-left: var(--space-xl);
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
  font-family: var(--fn);
  font-size: 0.85rem;
  color: var(--neu-text-primary);
  transition: all var(--transition-fast);
}

.neu-media-search-input:focus {
  outline: none;
  box-shadow:
    inset 3px 3px 6px var(--neu-shadow-dark),
    inset -3px -3px 6px var(--neu-shadow-light);
}

.neu-media-filter-group {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.neu-media-sort-group {
  display: flex;
  gap: var(--space-xs);
}

.neu-media-sort-select {
  padding: var(--space-xs) var(--space-sm);
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
  font-family: var(--fn);
  font-size: 0.8rem;
  color: var(--neu-text-primary);
  cursor: pointer;
}

.neu-media-sort-btn {
  padding: var(--space-xs) var(--space-sm);
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
  font-size: 1rem;
  color: var(--neu-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.neu-media-sort-btn:hover {
  color: var(--neu-primary);
}

.neu-btn--full {
  width: 100%;
  margin-bottom: var(--space-xs);
}

/* Preview Modal */
.neu-media-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.neu-media-preview-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.neu-media-preview-content img,
.neu-media-preview-content video {
  max-width: 100%;
  max-height: 90vh;
  border-radius: var(--radius-lg);
}

.neu-media-preview-other {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-lg);
  min-width: 300px;
}

.neu-media-preview-icon {
  font-size: 5rem;
  margin-bottom: var(--space-md);
  opacity: 0.5;
}

.neu-media-preview-info {
  position: absolute;
  bottom: var(--space-lg);
  left: var(--space-lg);
  right: var(--space-lg);
  color: #fff;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.neu-media-preview-name {
  font-family: var(--fn);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.neu-media-preview-meta {
  font-size: 0.85rem;
  opacity: 0.8;
}

/* Dialogs */
.neu-media-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.neu-media-dialog {
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  min-width: 400px;
  max-width: 90vw;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.neu-media-dialog--wide {
  min-width: 500px;
}

.neu-media-dialog-title {
  font-family: var(--fn);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--neu-text-primary);
  margin-bottom: var(--space-lg);
}

.neu-media-dialog-input,
.neu-media-form-input,
.neu-media-form-textarea {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-md);
  background: #fff;
  font-family: var(--fn);
  font-size: 0.9rem;
  color: var(--neu-text-primary);
  margin-bottom: var(--space-md);
  transition: border-color var(--transition-fast);
}

.neu-media-dialog-input:focus,
.neu-media-form-input:focus,
.neu-media-form-textarea:focus {
  outline: none;
  border-color: var(--neu-primary);
}

.neu-media-form-group {
  margin-bottom: var(--space-md);
}

.neu-media-form-label {
  display: block;
  font-family: var(--fn);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--neu-text-primary);
  margin-bottom: var(--space-xs);
}

.neu-media-dialog-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}

@media (max-width: 1024px) {
  .neu-media-page {
    grid-template-columns: 1fr;
  }

  .neu-media-sidebar {
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .neu-media-filters-section {
    flex-direction: column;
  }

  .neu-media-search-wrap,
  .neu-media-filter-group,
  .neu-media-sort-group {
    width: 100%;
  }

  .neu-media-dialog {
    min-width: auto;
    width: 90vw;
  }
}
</style>
