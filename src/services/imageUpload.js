/**
 * Сервис загрузки файлов (изображения и видео)
 * Сохраняет метаданные в базу через PostgREST API
 */

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB
const UPLOAD_DIR = '/uploads'
const API_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:3004'

/**
 * Загрузка файла (изображение или видео)
 * @param {File} file - файл
 * @param {string} bucket - тип бакета (images/videos)
 * @returns {Promise<{url: string, id: string, path: string}>}
 */
export async function uploadImage(file, bucket = 'images') {
  const isVideo = bucket === 'videos'
  
  // Проверка типа файла
  if (isVideo && !file.type.startsWith('video/')) {
    throw new Error('Файл не является видео')
  }
  if (!isVideo && !file.type.startsWith('image/')) {
    throw new Error('Файл не является изображением')
  }

  // Проверка размера
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
  if (file.size > maxSize) {
    throw new Error(`Файл слишком большой (максимум ${maxSize / 1024 / 1024}MB)`)
  }

  // Генерация уникального ID и пути
  const prefix = isVideo ? 'vid' : 'img'
  const id = `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const extension = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg')
  const filename = `${id}.${extension}`
  const relativePath = `${UPLOAD_DIR}/${bucket}/${filename}`
  const url = relativePath // Для локальной разработки URL = путь

  // Сохраняем метаданные в базу через PostgREST API
  try {
    const response = await fetch(`${API_URL}/storage_objects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        bucket_id: bucket,
        name: filename,
        original_name: file.name,
        size: file.size,
        type: file.type,
        url: url,
        path: relativePath
      })
    })
    
    if (!response.ok) throw new Error(await response.text())
    
    const data = await response.json()
    console.log(`Файл сохранён: ${relativePath} (${file.size} байт)`)
    
    return { url, id: data[0].id, path: relativePath, filename }
  } catch (error) {
    console.error('Ошибка сохранения в базу:', error)
    // Fallback: возвращаем путь без сохранения в БД
    return { url, id, path: relativePath, filename }
  }
}

/**
 * Чтение файла как Base64
 */
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1]) // Убираем data:image/...;base64,
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Сохранение метаданных изображения в localStorage
 */
function saveImageToStorage(imageData) {
  try {
    const images = getStoredImages()
    images.push(imageData)
    localStorage.setItem('vtornik_images', JSON.stringify(images))
  } catch (e) {
    console.warn('Не удалось сохранить изображение в localStorage:', e)
  }
}

/**
 * Получение списка загруженных изображений
 */
export function getStoredImages() {
  try {
    const data = localStorage.getItem('vtornik_images')
    return data ? JSON.parse(data) : []
  } catch (e) {
    return []
  }
}

/**
 * Получение изображения по ID
 */
export function getImageById(id) {
  const images = getStoredImages()
  return images.find(img => img.id === id)
}

/**
 * Удаление изображения
 */
export async function deleteImage(id) {
  try {
    const images = getStoredImages()
    const filtered = images.filter(img => img.id !== id)
    localStorage.setItem('vtornik_images', JSON.stringify(filtered))
    return true
  } catch (e) {
    console.error('Ошибка при удалении изображения:', e)
    return false
  }
}

/**
 * Сжатие изображения (опционально)
 */
export async function compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height
      
      // Масштабирование
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
        blob => resolve(blob),
        file.type,
        quality
      )
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
