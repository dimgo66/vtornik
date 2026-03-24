<template>
  <div class="neu-media-upload">
    <!-- Upload Zone -->
    <div
      class="neu-media-upload-zone"
      :class="{ 'neu-media-upload-zone--dragover': isDragOver }"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <div class="neu-media-upload-icon">📤</div>
      <h3 class="neu-media-upload-title">Перетащите файлы сюда</h3>
      <p class="neu-media-upload-text">
        или кликните для выбора файлов
      </p>
      <p class="neu-media-upload-hint">
        Поддерживаются: изображения, видео, аудио, документы (макс. {{ maxFileSize }}MB)
      </p>
    </div>

    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      multiple
      :accept="acceptedTypes"
      class="neu-media-upload-input"
      @change="handleFileSelect"
    />

    <!-- File Type Selector -->
    <div class="neu-media-upload-options">
      <div class="neu-media-upload-option">
        <label class="neu-media-upload-label">Тип файлов:</label>
        <select v-model="selectedBucket" class="neu-media-upload-select">
          <option value="images">🖼️ Изображения</option>
          <option value="videos">🎬 Видео</option>
          <option value="audio">🎵 Аудио</option>
          <option value="documents">📄 Документы</option>
        </select>
      </div>

      <div class="neu-media-upload-option">
        <label class="neu-media-upload-label">
          <input type="checkbox" v-model="compressImages" />
          Сжимать изображения
        </label>
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploadingFiles.length > 0" class="neu-media-upload-progress">
      <h4 class="neu-media-upload-progress-title">Загрузка файлов:</h4>
      <div v-for="file in uploadingFiles" :key="file.id" class="neu-media-upload-progress-item">
        <div class="neu-media-upload-progress-info">
          <span class="neu-media-upload-progress-name">{{ file.name }}</span>
          <span class="neu-media-upload-progress-size">{{ file.sizeFormatted }}</span>
        </div>
        <div class="neu-media-progress-bar">
          <div class="neu-media-progress-fill" :style="{ width: file.progress + '%' }"></div>
        </div>
        <div class="neu-media-upload-progress-status">
          {{ getStatusText(file.status) }}
        </div>
      </div>
    </div>

    <!-- Uploaded Files -->
    <div v-if="uploadedFiles.length > 0" class="neu-media-upload-result">
      <h4 class="neu-media-upload-result-title">Загружено файлов: {{ uploadedFiles.length }}</h4>
      <div class="neu-media-upload-result-grid">
        <div v-for="file in uploadedFiles" :key="file.id" class="neu-media-upload-result-item">
          <div class="neu-media-upload-result-preview">
            <img v-if="file.fileType === 'image'" :src="file.url" :alt="file.original_name" />
            <span v-else class="neu-media-upload-result-icon">{{ getFileIcon(file.fileType) }}</span>
          </div>
          <div class="neu-media-upload-result-name" :title="file.original_name">
            {{ file.original_name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMediaStore } from '@/stores/media'
import { getFileIcon } from '@/services/mediaService'

const props = defineProps({
  folderId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['upload-complete', 'upload-error'])

const mediaStore = useMediaStore()

const fileInput = ref(null)
const isDragOver = ref(false)
const selectedBucket = ref('images')
const compressImages = ref(false)
const uploadingFiles = ref([])
const uploadedFiles = ref([])

const maxFileSize = 50 // MB для видео, 5MB для изображений

const acceptedTypes = computed(() => {
  const types = {
    images: 'image/*',
    videos: 'video/*',
    audio: 'audio/*',
    documents: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt'
  }
  return types[selectedBucket.value]
})

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files)
  if (files.length > 0) {
    uploadFiles(files)
  }
  event.target.value = ''
}

function handleDrop(event) {
  isDragOver.value = false
  const files = Array.from(event.dataTransfer.files)
  if (files.length > 0) {
    uploadFiles(files)
  }
}

async function uploadFiles(files) {
  // Фильтрация по типу
  const validFiles = files.filter(file => {
    const bucket = selectedBucket.value
    if (bucket === 'images') return file.type.startsWith('image/')
    if (bucket === 'videos') return file.type.startsWith('video/')
    if (bucket === 'audio') return file.type.startsWith('audio/')
    if (bucket === 'documents') {
      return file.type.includes('pdf') || file.type.includes('word') || 
             file.type.includes('excel') || file.type.includes('powerpoint') ||
             file.type === 'text/plain'
    }
    return true
  })

  if (validFiles.length === 0) {
    emit('upload-error', new Error('Нет файлов подходящего типа'))
    return
  }

  // Добавляем файлы в очередь загрузки
  validFiles.forEach(file => {
    uploadingFiles.value.push({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      sizeFormatted: formatFileSize(file.size),
      progress: 0,
      status: 'pending'
    })
  })

  // Загружаем файлы
  for (let i = 0; i < validFiles.length; i++) {
    const file = validFiles[i]
    const uploadItem = uploadingFiles.value.find(f => f.name === file.name)

    try {
      uploadItem.status = 'uploading'
      uploadItem.progress = 10

      // Сжатие изображений если включено
      let fileToUpload = file
      if (compressImages.value && file.type.startsWith('image/')) {
        fileToUpload = await compressImageFile(file)
      }

      const uploadedFile = await mediaStore.uploadFiles([fileToUpload], props.folderId, selectedBucket.value)
      
      uploadItem.progress = 100
      uploadItem.status = 'complete'
      
      uploadedFiles.value.push({
        ...uploadedFile[0],
        url: uploadedFile[0].url
      })

      emit('upload-complete', uploadedFile[0])
    } catch (error) {
      console.error('Upload error:', error)
      uploadItem.status = 'error'
      uploadItem.progress = 0
      emit('upload-error', error)
    }
  }

  // Очищаем список загрузки через 3 секунды
  setTimeout(() => {
    uploadingFiles.value = []
  }, 3000)
}

function getStatusText(status) {
  const texts = {
    pending: 'Ожидание...',
    uploading: 'Загрузка...',
    complete: '✓ Готово',
    error: '✗ Ошибка'
  }
  return texts[status] || status
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

async function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      // Максимальный размер 1920x1080
      const maxWidth = 1920
      const maxHeight = 1080

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        blob => {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve(compressedFile)
        },
        'image/jpeg',
        0.8
      )
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
</script>

<style scoped>
.neu-media-upload {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.neu-media-upload-zone {
  border: 2px dashed var(--neu-border);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    inset 3px 3px 6px var(--neu-shadow-dark),
    inset -3px -3px 6px var(--neu-shadow-light);
}

.neu-media-upload-zone:hover,
.neu-media-upload-zone--dragover {
  border-color: var(--neu-primary);
  box-shadow:
    inset 4px 4px 8px var(--neu-shadow-dark),
    inset -4px -4px 8px var(--neu-shadow-light);
}

.neu-media-upload-icon {
  font-size: 4rem;
  margin-bottom: var(--space-md);
  opacity: 0.5;
}

.neu-media-upload-title {
  font-family: var(--fn);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--neu-text-primary);
  margin-bottom: var(--space-xs);
}

.neu-media-upload-text {
  font-size: 0.85rem;
  color: var(--neu-text-secondary);
  margin-bottom: var(--space-sm);
}

.neu-media-upload-hint {
  font-size: 0.75rem;
  color: var(--neu-text-secondary);
  opacity: 0.7;
}

.neu-media-upload-input {
  display: none;
}

.neu-media-upload-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-lg);
  box-shadow:
    3px 3px 6px var(--neu-shadow-dark),
    -3px -3px 6px var(--neu-shadow-light);
}

.neu-media-upload-option {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.neu-media-upload-label {
  font-family: var(--fn);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--neu-text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.neu-media-upload-select {
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

.neu-media-upload-progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.neu-media-upload-progress-title,
.neu-media-upload-result-title {
  font-family: var(--fn);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--neu-text-primary);
  margin-bottom: var(--space-xs);
}

.neu-media-upload-progress-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-md);
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
}

.neu-media-upload-progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.neu-media-upload-progress-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--neu-text-primary);
}

.neu-media-upload-progress-size {
  font-size: 0.75rem;
  color: var(--neu-text-secondary);
}

.neu-media-upload-progress-status {
  font-size: 0.75rem;
  color: var(--neu-text-secondary);
  text-align: right;
}

.neu-media-upload-result {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.neu-media-upload-result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: var(--space-sm);
}

.neu-media-upload-result-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-xs);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-md);
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
}

.neu-media-upload-result-preview {
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--neu-bg-tertiary);
}

.neu-media-upload-result-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.neu-media-upload-result-icon {
  font-size: 2rem;
  opacity: 0.5;
}

.neu-media-upload-result-name {
  font-size: 0.7rem;
  color: var(--neu-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}
</style>
