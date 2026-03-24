<template>
  <div v-if="isOpen" class="neu-media-modal-overlay" @click="close">
    <div class="neu-media-modal" @click.stop>
      <!-- Header -->
      <div class="neu-media-modal-header">
        <h3 class="neu-media-modal-title">Выберите изображение</h3>
        <button class="neu-media-modal-close" @click="close">×</button>
      </div>

      <!-- Content -->
      <div class="neu-media-modal-content">
        <!-- Tabs -->
        <div class="neu-media-modal-tabs">
          <button
            class="neu-media-modal-tab"
            :class="{ 'neu-media-modal-tab--active': activeTab === 'gallery' }"
            @click="activeTab = 'gallery'"
          >
            📁 Галерея
          </button>
          <button
            class="neu-media-modal-tab"
            :class="{ 'neu-media-modal-tab--active': activeTab === 'upload' }"
            @click="activeTab = 'upload'"
          >
            📤 Загрузить
          </button>
          <button
            class="neu-media-modal-tab"
            :class="{ 'neu-media-modal-tab--active': activeTab === 'url' }"
            @click="activeTab = 'url'"
          >
            🔗 URL
          </button>
        </div>

        <!-- Gallery Tab -->
        <div v-if="activeTab === 'gallery'" class="neu-media-modal-gallery">
          <!-- Filters -->
          <div class="neu-media-modal-filters">
            <div class="neu-media-modal-search">
              <span class="neu-media-modal-search-icon">🔍</span>
              <input
                v-model="searchQuery"
                type="text"
                class="neu-media-modal-search-input"
                placeholder="Поиск..."
              />
            </div>
            <select v-model="filterType" class="neu-media-modal-filter-select">
              <option value="all">Все типы</option>
              <option value="image">Изображения</option>
              <option value="video">Видео</option>
            </select>
          </div>

          <!-- Files Grid -->
          <div class="neu-media-modal-files">
            <div
              v-for="file in filteredFiles"
              :key="file.id"
              class="neu-media-modal-file"
              :class="{ 'neu-media-modal-file--selected': selectedFile?.id === file.id }"
              @click="selectFile(file)"
              @dblclick="insertFile"
            >
              <div class="neu-media-modal-file-preview">
                <img v-if="file.fileType === 'image'" :src="file.url" :alt="file.original_name" loading="lazy" />
                <span v-else class="neu-media-modal-file-icon">{{ getFileIcon(file.fileType) }}</span>
              </div>
              <div class="neu-media-modal-file-name" :title="file.original_name">{{ file.original_name }}</div>
            </div>

            <div v-if="filteredFiles.length === 0" class="neu-media-modal-empty">
              <span class="neu-media-modal-empty-icon">📁</span>
              <p>Нет файлов</p>
            </div>
          </div>
        </div>

        <!-- Upload Tab -->
        <div v-if="activeTab === 'upload'" class="neu-media-modal-upload">
          <MediaUpload
            :folder-id="null"
            @upload-complete="handleUploadComplete"
            @upload-error="handleUploadError"
          />
        </div>

        <!-- URL Tab -->
        <div v-if="activeTab === 'url'" class="neu-media-modal-url">
          <div class="neu-media-modal-url-form">
            <label class="neu-media-modal-url-label">Введите URL изображения:</label>
            <input
              v-model="urlInput"
              type="text"
              class="neu-media-modal-url-input"
              placeholder="https://example.com/image.jpg"
              @keyup.enter="insertUrl"
            />
            <div v-if="urlPreview" class="neu-media-modal-url-preview">
              <img :src="urlInput" alt="Preview" />
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="neu-media-modal-footer">
        <div v-if="selectedFile" class="neu-media-modal-info">
          <strong>{{ selectedFile.original_name }}</strong>
          <span>{{ selectedFile.sizeFormatted }}</span>
        </div>
        <div class="neu-media-modal-actions">
          <button class="neu-btn neu-btn--secondary" @click="close">Отмена</button>
          <button
            v-if="activeTab === 'url'"
            class="neu-btn neu-btn--primary"
            @click="insertUrl"
            :disabled="!urlInput"
          >
            Вставить URL
          </button>
          <button
            v-else
            class="neu-btn neu-btn--primary"
            @click="insertFile"
            :disabled="!selectedFile"
          >
            Вставить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useMediaStore } from '@/stores/media'
import { getFileIcon, getLocalFileUrl } from '@/services/mediaService'
import MediaUpload from '@/components/cms/MediaUpload.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  fileType: {
    type: String,
    default: 'image' // image, video, all
  }
})

const emit = defineEmits(['close', 'insert', 'insert-url'])

const mediaStore = useMediaStore()

const activeTab = ref('gallery')
const searchQuery = ref('')
const filterType = ref('all')
const selectedFile = ref(null)
const urlInput = ref('')
const urlPreview = ref(false)

const files = computed(() => mediaStore.files)
const filteredFiles = computed(() => {
  let result = files.value

  // Filter by type
  if (filterType.value !== 'all') {
    result = result.filter(f => f.fileType === filterType.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(f => f.original_name?.toLowerCase().includes(query))
  }

  return result
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    mediaStore.fetchFiles()
  }
})

function selectFile(file) {
  selectedFile.value = file
}

function insertFile() {
  if (!selectedFile.value) return

  const url = getLocalFileUrl(selectedFile.value.url)
  emit('insert', {
    url,
    alt: selectedFile.value.alt_text || selectedFile.value.original_name,
    title: selectedFile.value.original_name,
    width: selectedFile.value.width,
    height: selectedFile.value.height
  })

  close()
}

function handleUploadComplete(file) {
  selectFile(file)
  activeTab.value = 'gallery'
}

function handleUploadError(error) {
  console.error('Upload error:', error)
}

function insertUrl() {
  if (!urlInput.value) return

  emit('insert-url', {
    url: urlInput.value,
    alt: '',
    title: ''
  })

  urlInput.value = ''
  urlPreview.value = false
  close()
}

function close() {
  emit('close')
  resetState()
}

function resetState() {
  selectedFile.value = null
  searchQuery.value = ''
  filterType.value = 'all'
  urlInput.value = ''
  urlPreview.value = false
  activeTab.value = 'gallery'
}

// Close on Escape key
function handleEscape(event) {
  if (event.key === 'Escape' && props.isOpen) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.neu-media-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.neu-media-modal {
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-lg);
  width: 90vw;
  max-width: 800px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow:
    8px 8px 16px var(--neu-shadow-dark),
    -8px -8px 16px var(--neu-shadow-light);
}

.neu-media-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--neu-border);
}

.neu-media-modal-title {
  font-family: var(--fn);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--neu-text-primary);
  margin: 0;
}

.neu-media-modal-close {
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

.neu-media-modal-close:hover {
  color: var(--neu-primary);
  box-shadow:
    3px 3px 6px var(--neu-shadow-dark),
    -3px -3px 6px var(--neu-shadow-light);
}

.neu-media-modal-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
}

.neu-media-modal-tabs {
  display: flex;
  gap: var(--space-xs);
  margin-bottom: var(--space-lg);
}

.neu-media-modal-tab {
  padding: var(--space-sm) var(--space-md);
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
  font-family: var(--fn);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--neu-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.neu-media-modal-tab:hover {
  color: var(--neu-text-primary);
}

.neu-media-modal-tab--active {
  background: linear-gradient(135deg, var(--neu-primary), var(--neu-primary-dark));
  color: #fff;
}

.neu-media-modal-filters {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.neu-media-modal-search {
  position: relative;
  flex: 1;
}

.neu-media-modal-search-icon {
  position: absolute;
  left: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  color: var(--neu-text-secondary);
}

.neu-media-modal-search-input {
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
}

.neu-media-modal-filter-select {
  padding: var(--space-xs) var(--space-sm);
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
  font-family: var(--fn);
  font-size: 0.85rem;
  color: var(--neu-text-primary);
  cursor: pointer;
}

.neu-media-modal-files {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-md);
  max-height: 400px;
  overflow-y: auto;
}

.neu-media-modal-file {
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow:
    3px 3px 6px var(--neu-shadow-dark),
    -3px -3px 6px var(--neu-shadow-light);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.neu-media-modal-file:hover {
  box-shadow:
    4px 4px 8px var(--neu-shadow-dark),
    -4px -4px 8px var(--neu-shadow-light);
  transform: translateY(-2px);
}

.neu-media-modal-file--selected {
  box-shadow:
    0 0 0 2px var(--neu-primary),
    4px 4px 8px var(--neu-shadow-dark),
    -4px -4px 8px var(--neu-shadow-light);
}

.neu-media-modal-file-preview {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--neu-bg-tertiary);
  overflow: hidden;
}

.neu-media-modal-file-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.neu-media-modal-file-icon {
  font-size: 2.5rem;
  opacity: 0.5;
}

.neu-media-modal-file-name {
  padding: var(--space-xs) var(--space-sm);
  font-size: 0.75rem;
  color: var(--neu-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.neu-media-modal-empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  text-align: center;
}

.neu-media-modal-empty-icon {
  font-size: 3rem;
  opacity: 0.3;
  margin-bottom: var(--space-md);
}

.neu-media-modal-empty p {
  font-size: 0.9rem;
  color: var(--neu-text-secondary);
}

.neu-media-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-top: 1px solid var(--neu-border);
}

.neu-media-modal-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  font-size: 0.8rem;
  color: var(--neu-text-secondary);
}

.neu-media-modal-actions {
  display: flex;
  gap: var(--space-sm);
}

.neu-media-modal-url-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.neu-media-modal-url-label {
  font-family: var(--fn);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--neu-text-primary);
}

.neu-media-modal-url-input {
  padding: var(--space-sm) var(--space-md);
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
  font-family: var(--fn);
  font-size: 0.9rem;
  color: var(--neu-text-primary);
}

.neu-media-modal-url-preview {
  max-width: 300px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--neu-bg-tertiary);
}

.neu-media-modal-url-preview img {
  width: 100%;
  height: auto;
}
</style>
