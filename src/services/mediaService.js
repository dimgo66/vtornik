/**
 * Media Service — API для работы с медиафайлами и папками
 * Работает с таблицами storage_objects и storage_folders через PostgREST
 */

const API_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:3004'

// ══════════════════════════════════════════════════
//  Вспомогательные функции
// ══════════════════════════════════════════════════

async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers
    }
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || response.statusText)
  }

  return response.json()
}

function getFileType(mimeType) {
  if (!mimeType) return 'unknown'
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.startsWith('text/') || mimeType.includes('word') || mimeType.includes('excel') || mimeType.includes('powerpoint')) return 'document'
  return 'unknown'
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// ══════════════════════════════════════════════════
//  FOLDERS (Папки)
// ══════════════════════════════════════════════════

/**
 * Получить все корневые папки
 */
export async function fetchRootFolders() {
  const data = await apiRequest('/storage_folders?select=*&parent_id=is.null&order=name.asc')
  return data
}

/**
 * Получить все папки (плоский список)
 */
export async function fetchAllFolders() {
  const data = await apiRequest('/storage_folders?select=*&order=name.asc')
  return data
}

/**
 * Получить дочерние папки
 */
export async function fetchChildFolders(parentId) {
  const data = await apiRequest(`/storage_folders?select=*&parent_id=eq.${parentId}&order=name.asc`)
  return data
}

/**
 * Получить папку по ID
 */
export async function fetchFolderById(id) {
  const data = await apiRequest(`/storage_folders?id=eq.${id}`)
  return data[0] || null
}

/**
 * Создать папку
 */
export async function createFolder(name, parentId = null) {
  const folder = {
    name,
    parent_id: parentId
  }
  const data = await apiRequest('/storage_folders', {
    method: 'POST',
    body: JSON.stringify(folder)
  })
  return data[0]
}

/**
 * Обновить папку
 */
export async function updateFolder(id, updates) {
  const dbUpdates = {}
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.parent_id !== undefined) dbUpdates.parent_id = updates.parent_id

  const data = await apiRequest(`/storage_folders?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dbUpdates)
  })
  return data[0]
}

/**
 * Удалить папку (вместе с содержимым)
 */
export async function deleteFolder(id) {
  await apiRequest(`/storage_folders?id=eq.${id}`, { method: 'DELETE' })
  return true
}

/**
 * Построить дерево папок
 */
export function buildFolderTree(folders) {
  const folderMap = new Map()
  const rootFolders = []

  // Создаем мапу всех папок
  folders.forEach(folder => {
    folderMap.set(folder.id, { ...folder, children: [] })
  })

  // Строим дерево
  folders.forEach(folder => {
    const folderNode = folderMap.get(folder.id)
    if (folder.parent_id === null) {
      rootFolders.push(folderNode)
    } else {
      const parent = folderMap.get(folder.parent_id)
      if (parent) {
        parent.children.push(folderNode)
      }
    }
  })

  return rootFolders
}

// ══════════════════════════════════════════════════
//  FILES (Файлы)
// ══════════════════════════════════════════════════

/**
 * Получить все файлы
 */
export async function fetchFiles(filters = {}) {
  let query = '/storage_objects?select=*&order=created_at.desc'

  if (filters.folder_id) {
    query = `/storage_objects?select=*&folder_id=eq.${filters.folder_id}&order=created_at.desc`
  }

  if (filters.bucket_id) {
    const separator = query.includes('?') ? '&' : '?'
    query += `${separator}bucket_id=eq.${filters.bucket_id}`
  }

  if (filters.search) {
    const separator = query.includes('?') ? '&' : '?'
    query += `${separator}original_name=ilike.*${filters.search}*`
  }

  if (filters.type) {
    const separator = query.includes('?') ? '&' : '?'
    query += `${separator}type=like.${filters.type}%`
  }

  const data = await apiRequest(query)
  return data.map(file => ({
    ...file,
    fileType: getFileType(file.type),
    sizeFormatted: formatFileSize(file.size)
  }))
}

/**
 * Получить файл по ID
 */
export async function fetchFileById(id) {
  const data = await apiRequest(`/storage_objects?id=eq.${id}`)
  const file = data[0]
  if (!file) return null
  return {
    ...file,
    fileType: getFileType(file.type),
    sizeFormatted: formatFileSize(file.size)
  }
}

/**
 * Получить файлы папки (рекурсивно)
 */
export async function fetchFolderFilesRecursive(folderId, bucketId = null) {
  // Используем PostgreSQL функцию get_folder_files_recursive
  const endpoint = bucketId
    ? `/rpc/get_folder_files_recursive?target_folder_id=${folderId}&target_bucket_id=${bucketId}`
    : `/rpc/get_folder_files_recursive?target_folder_id=${folderId}`

  try {
    const data = await apiRequest(endpoint)
    return data.map(file => ({
      ...file,
      fileType: getFileType(file.type),
      sizeFormatted: formatFileSize(file.size)
    }))
  } catch (error) {
    console.error('Error fetching folder files:', error)
    return []
  }
}

/**
 * Загрузить файл
 */
export async function uploadFile(file, folderId = null, bucketId = 'images') {
  // Генерация уникального ID
  const prefix = bucketId === 'videos' ? 'vid' : bucketId === 'audio' ? 'aud' : 'img'
  const id = `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const extension = file.name.split('.').pop()
  const filename = `${id}.${extension}`
  const relativePath = `/uploads/${bucketId}/${filename}`

  // Чтение файла как Base64 для локального хранения
  const base64Data = await readFileAsBase64(file)

  // Сохраняем метаданные в базу через PostgREST API
  const metadata = {
    bucket_id: bucketId,
    name: filename,
    original_name: file.name,
    size: file.size,
    type: file.type,
    url: relativePath,
    path: relativePath,
    folder_id: folderId,
    width: file.width || null,
    height: file.height || null
  }

  try {
    const response = await apiRequest('/storage_objects', {
      method: 'POST',
      body: JSON.stringify(metadata)
    })

    const savedFile = response[0]
    console.log(`Файл сохранён: ${relativePath} (${formatFileSize(file.size)})`)

    // Для локальной разработки сохраняем файл в IndexedDB или localStorage
    await saveFileLocally(relativePath, base64Data)

    return {
      ...savedFile,
      fileType: getFileType(savedFile.type),
      sizeFormatted: formatFileSize(savedFile.size)
    }
  } catch (error) {
    console.error('Ошибка сохранения в базу:', error)
    throw error
  }
}

/**
 * Обновить метаданные файла
 */
export async function updateFile(id, updates) {
  const dbUpdates = {}
  if (updates.folder_id !== undefined) dbUpdates.folder_id = updates.folder_id
  if (updates.alt_text !== undefined) dbUpdates.alt_text = updates.alt_text
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.name !== undefined) dbUpdates.name = updates.name

  const data = await apiRequest(`/storage_objects?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dbUpdates)
  })
  return data[0]
}

/**
 * Удалить файл
 */
export async function deleteFile(id) {
  await apiRequest(`/storage_objects?id=eq.${id}`, { method: 'DELETE' })
  await deleteFileLocally(id)
  return true
}

/**
 * Массовое удаление файлов
 */
export async function deleteFiles(ids) {
  for (const id of ids) {
    await deleteFile(id)
  }
  return true
}

/**
 * Переместить файл в другую папку
 */
export async function moveFile(id, folderId) {
  return updateFile(id, { folder_id: folderId })
}

/**
 * Массовое перемещение файлов
 */
export async function moveFiles(ids, folderId) {
  for (const id of ids) {
    await moveFile(id, folderId)
  }
  return true
}

// ══════════════════════════════════════════════════
//  STATISTICS (Статистика)
// ══════════════════════════════════════════════════

/**
 * Получить статистику медиа
 */
export async function fetchMediaStatistics() {
  try {
    const data = await apiRequest('/media_statistics')
    return data
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return null
  }
}

/**
 * Получить общую статистику
 */
export async function fetchTotalStatistics() {
  const files = await fetchFiles()
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const byType = files.reduce((acc, file) => {
    acc[file.fileType] = (acc[file.fileType] || 0) + 1
    return acc
  }, {})

  return {
    totalFiles: files.length,
    totalSize,
    totalSizeFormatted: formatFileSize(totalSize),
    byType
  }
}

// ══════════════════════════════════════════════════
//  LOCAL STORAGE (Локальное хранение файлов)
// ══════════════════════════════════════════════════

const DB_NAME = 'vtornik_media'
const DB_VERSION = 1
const STORE_NAME = 'files'

let db = null

async function getDB() {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'path' })
      }
    }
  })
}

async function saveFileLocally(path, base64Data) {
  try {
    const database = await getDB()
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    store.put({ path, data: base64Data })
  } catch (error) {
    console.error('Error saving file locally:', error)
  }
}

async function getFileLocally(path) {
  try {
    const database = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(path)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error getting file locally:', error)
    return null
  }
}

async function deleteFileLocally(id) {
  // Файл удаляется по path, но у нас только ID
  // В реальном приложении нужно хранить маппинг
  return true
}

export async function getLocalFileUrl(path) {
  const result = await getFileLocally(path)
  if (result && result.data) {
    return `data:image;base64,${result.data}`
  }
  return path
}

// ══════════════════════════════════════════════════
//  UTILS (Утилиты)
// ══════════════════════════════════════════════════

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Получить иконку для типа файла
 */
export function getFileIcon(fileType) {
  const icons = {
    image: '🖼️',
    video: '🎬',
    audio: '🎵',
    pdf: '📄',
    document: '📝',
    unknown: '📁'
  }
  return icons[fileType] || icons.unknown
}

/**
 * Получить MIME тип для расширения
 */
export function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  const mimeTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  }
  return mimeTypes[ext] || 'application/octet-stream'
}
