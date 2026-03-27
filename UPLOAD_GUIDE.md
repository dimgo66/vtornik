# 📁 Загрузка файлов — Инструкция

## ✅ Что настроено

Файлы загружаются в файловую систему проекта:
```
public/uploads/
├── images/
│   ├── {имя-папки}/
│   │   ├── img_1234567890_abc.jpg
│   │   └── img_0987654321_def.png
├── videos/
├── audio/
└── documents/
```

Метаданные сохраняются в PostgreSQL (таблица `storage_objects`).

---

## 🚀 Запуск проекта

### 1. Запустить Docker

```bash
# Убедитесь что Docker Desktop запущен
docker ps

# Запустить БД и PostgREST
npm run db:start
```

### 2. Запустить Vue dev-сервер

```bash
npm run dev
```

**Порты:**
- Vue App: **3003** → http://localhost:3003
- PostgREST API: **3000** → http://localhost:3000
- PostgreSQL: **54322** → localhost:54322

---

## 📤 Загрузка файлов

### Через интерфейс (CMS)

1. Откройте http://localhost:3003/cms/media
2. Выберите папку (или создайте новую)
3. Нажмите "📤 Загрузить файлы"
4. Перетащите файлы или выберите через диалог
5. Файлы сохранятся в `public/uploads/{bucket}/{folder}/`

### Через API

```bash
# Одиночная загрузка
curl -X POST http://localhost:3003/api/upload \
  -F "file=@/path/to/file.jpg" \
  -F "bucket_id=images" \
  -F "folder_id=UUID-папки" \
  -F "folder_name=ИмяПапки" \
  -F "original_name=my-photo.jpg"

# Массовая загрузка
curl -X POST http://localhost:3003/api/upload/multiple \
  -F "files=@file1.jpg" \
  -F "files=@file2.png" \
  -F "bucket_id=images" \
  -F "folder_name=Папка"
```

**Ответ:**
```json
{
  "success": true,
  "file": {
    "id": "uuid",
    "bucket_id": "images",
    "name": "img_1234567890_abc.jpg",
    "original_name": "my-photo.jpg",
    "size": 102400,
    "type": "image/jpeg",
    "url": "/uploads/images/Папка/img_1234567890_abc.jpg",
    "folder_id": "uuid"
  }
}
```

---

## 🗂️ Структура БД

### storage_folders
```sql
id           uuid PRIMARY KEY
name         text           -- Имя папки
parent_id    uuid           -- Родительская папка
folder_path  text           -- Путь в ФС (совпадает с name)
created_at   timestamptz
updated_at   timestamptz
```

### storage_objects
```sql
id           uuid PRIMARY KEY
bucket_id    text           -- images/videos/audio/documents
name         text           -- Уникальное имя файла
original_name text          -- Оригинальное имя
size         integer        -- Размер в байтах
type         text           -- MIME type
url          text           -- URL для доступа
path         text           -- Полный путь в ФС
folder_id    uuid           -- Ссылка на папку
alt_text     text           -- Alt текст
description  text           -- Описание
width        integer        -- Ширина (для изображений)
height       integer        -- Высота (для изображений)
created_at   timestamptz
```

---

## 🔧 Настройки

### vite.config.js
```javascript
import { uploadMiddleware } from './vite-upload-middleware.js'

export default defineConfig({
  server: {
    port: 3003,
    configureServer(server) {
      server.middlewares.use(uploadMiddleware)
    }
  }
})
```

### vite-upload-middleware.js
- Обрабатывает POST `/api/upload`
- Сохраняет файлы в `public/uploads/`
- Записывает метаданные в PostgreSQL

### Поддерживаемые типы файлов
- **Изображения:** JPEG, PNG, GIF, WebP, SVG
- **Видео:** MP4, WebM, MOV
- **Аудио:** MP3, WAV, OGG
- **Документы:** PDF, TXT, DOC, DOCX, XLS, XLSX, PPT, PPTX

**Максимальный размер:** 50 MB

---

## 🧪 Тестирование

### 1. Проверить API
```bash
curl http://localhost:3000/storage_folders
```

### 2. Загрузить тестовый файл
```bash
echo "Тест" > /tmp/test.txt
curl -X POST http://localhost:3003/api/upload \
  -F "file=@/tmp/test.txt" \
  -F "bucket_id=documents" \
  -F "folder_name=" \
  -F "original_name=test.txt"
```

### 3. Проверить файл в ФС
```bash
ls -la public/uploads/documents/
```

### 4. Проверить запись в БД
```bash
curl http://localhost:3000/storage_objects?order=created_at.desc&limit=1
```

---

## 🐛 Решение проблем

### Ошибка "fetch failed"
**Причина:** PostgREST не запущен
**Решение:**
```bash
docker-compose up -d
```

### Ошибка "Cannot connect to Docker daemon"
**Причина:** Docker Desktop не запущен
**Решение:** Перезапустить Docker Desktop

### Файлы не загружаются
**Проверка:**
1. Есть ли папки `public/uploads/{bucket}/`
2. Права на запись: `ls -la public/uploads/`
3. Логи Vite: смотрите консоль где запущен `npm run dev`

### 404 на /api/upload
**Причина:** Vite не перезагружен после изменений
**Решение:**
```bash
lsof -ti :3003 | xargs kill -9
npm run dev
```

---

## 📊 Доступ к файлам

Файлы доступны по URL:
```
http://localhost:3003/uploads/images/Папка/file.jpg
```

В Vue компонентах:
```vue
<img :src="file.url" />
<!-- или -->
<img :src="`/uploads/${file.bucket_id}/${folderName}/${file.name}`" />
```

---

## 📝 Команды npm

```bash
# Запуск всего проекта
npm run start

# Только БД
npm run db:start      # Запуск с очисткой портов
npm run db:stop       # Остановка
npm run db:reset      # Сброс (удаление данных)
npm run db:logs       # Логи

# Только Vue
npm run dev           # Dev сервер с очисткой портов
npm run build         # Production сборка
npm run preview       # Preview production

# Очистка портов
npm run ports:clean   # Убить процессы на 3000, 3003, 54322
```

---

## 🔑 Ключевые изменения

| Было | Стало |
|------|-------|
| Файлы в IndexedDB | Файлы в `public/uploads/` |
| Только метаданные в БД | Метаданные + путь в БД |
| Загрузка через FileReader | Загрузка через FormData |
| Нет прямого доступа | Прямой доступ по URL |

---

## 📞 Контакты

- Проект: ВТОРНИК
- Сайт: vtornik.online
- Email: info@vtornik.online
