// Upload Server — отдельный сервер для загрузки файлов
import express from 'express'
import cors from 'cors'
import { uploadMiddleware } from './vite-upload-middleware.js'

const app = express()
const PORT = 3001

// Разрешаем CORS для всех источников
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(uploadMiddleware)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Upload Server running on http://localhost:${PORT}`)
  console.log(`Upload endpoint: POST http://localhost:${PORT}/api/upload`)
  console.log(`CORS enabled for all origins`)
})
