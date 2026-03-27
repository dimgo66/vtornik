// Upload Server — простой сервер для загрузки файлов
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_BASE = path.join(__dirname, 'public/uploads')
const API_URL = 'http://localhost:3000'

const app = express()
const PORT = 3001

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Простое хранилище — сохраняем в нужную папку сразу
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Читаем bucket из query string (передаётся из mediaService.js)
    const bucket = req.query.bucket_id || 'images'
    const folderName = req.query.folder_name || ''
    const destPath = path.join(UPLOAD_BASE, bucket, folderName)
    fs.mkdirSync(destPath, { recursive: true })
    cb(null, destPath)
  },
  filename: (req, file, cb) => {
    const prefix = bucketPrefix(req.query.bucket_id)
    const ext = path.extname(file.originalname) || '.jpg'
    const random = Math.random().toString(36).substr(2, 9)
    const timestamp = Date.now()
    cb(null, `${prefix}_${timestamp}_${random}${ext}`)
  }
})

function bucketPrefix(bucketId) {
  const prefixes = { images: 'img', videos: 'vid', audio: 'aud', documents: 'doc' }
  return prefixes[bucketId] || 'file'
}

// Используем single() для одного файла
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
}).single('file')

// Сохранение метаданных в БД
async function saveFileMetadata(fileData) {
  const response = await fetch(`${API_URL}/storage_objects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(fileData)
  })
  if (!response.ok) throw new Error(await response.text())
  const data = await response.json()
  return data[0]
}

// POST /api/upload
app.post('/api/upload', upload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не выбран' })
    }

    console.log('Upload:', req.file.filename, 'Body:', req.body)

    // Читаем из body (FormData)
    const bucket = req.body.bucket_id || 'images'
    const folderName = req.body.folder_id ? `folder_${req.body.folder_id}` : ''  // Используем ID вместо имени
    const folderId = req.body.folder_id || null
    const originalName = req.body.original_name || req.file.originalname

    const url = `/uploads/${bucket}/${folderName ? folderName + '/' : ''}${req.file.filename}`

    const fileData = {
      bucket_id: bucket,
      name: req.file.filename,
      original_name: originalName,
      size: req.file.size,
      type: req.file.mimetype,
      url: url,
      path: req.file.path,
      folder_id: folderId
    }

    const savedFile = await saveFileMetadata(fileData)

    res.json({
      success: true,
      file: savedFile,
      message: 'Файл загружен'
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Upload Server: http://localhost:${PORT}`)
  console.log(`CORS enabled`)
})
