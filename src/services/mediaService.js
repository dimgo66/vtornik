/**
 * Media Service — API для работы с медиафайлами и папками
 * Работает с таблицами storage_objects и storage_folders через PostgREST
 */

// Используем относительный URL для Vite dev-сервера
const API_URL = ''
const UPLOAD_SERVER_URL = 'http://localhost:3001'

// ══════════════════════════════════════════════════
//  Вспомогательные функции
// ══════════════════════════════════════════════════

async function apiRequest(endpoint, options = {}) {
  // Используем относительный URL (Vite proxy)
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
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
    parent_id: parentId,
    folder_path: name  // Добавляем folder_path для совместимости
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
  console.log('buildFolderTree: folders=', folders.length, folders.map(f => f.name))
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

  console.log('buildFolderTree: rootFolders=', rootFolders.length)
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

  console.log('fetchFiles: query=', query)
  const data = await apiRequest(query)
  console.log('fetchFiles: API returned', data.length, 'files')
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
 * Загрузить файл через FormData
 */
export async function uploadFile(file, folderId = null, folderName = '', bucketId = 'images') {
  // Создание FormData
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucket_id', bucketId)
  formData.append('folder_id', folderId || '')
  formData.append('folder_name', folderName)
  formData.append('original_name', file.name)

  try {
    // Отправка через Vite proxy на Upload Server
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || 'Ошибка загрузки')
    }

    const result = await response.json()
    const savedFile = result.file

    console.log(`Файл загружен: ${savedFile.url} (${formatFileSize(savedFile.size)})`)

    return {
      ...savedFile,
      fileType: getFileType(savedFile.type),
      sizeFormatted: formatFileSize(savedFile.size)
    }
  } catch (error) {
    console.error('Ошибка загрузки файла:', error)
    throw error
  }
}

/**
 * Загрузить несколько файлов
 */
export async function uploadMultipleFiles(files, folderId = null, folderName = '', bucketId = 'images') {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  formData.append('bucket_id', bucketId)
  formData.append('folder_id', folderId || '')
  formData.append('folder_name', folderName)

  try {
    const response = await fetch('/api/upload/multiple', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || 'Ошибка загрузки')
    }

    const result = await response.json()
    return result.files.map(file => ({
      ...file,
      fileType: getFileType(file.type),
      sizeFormatted: formatFileSize(file.size)
    }))
  } catch (error) {
    console.error('Ошибка загрузки файлов:', error)
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
  // Файлы в файловой системе не удаляем автоматически
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
//  FILE URL (Получение URL файла)
// ══════════════════════════════════════════════════

/**
 * Получить URL файла (теперь файлы в файловой системе)
 */
export async function getLocalFileUrl(path) {
  // Просто возвращаем путь, файлы доступны напрямую
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
