# 📁 Медиа-менеджер ВТОРНИК

Полнофункциональный менеджер медиафайлов для CMS проекта ВТОРНИК.

## 🚀 Быстрый старт

### 1. Выполните миграцию БД

```bash
# Подключитесь к PostgreSQL
docker exec -it vtornik-db psql -U postgres -d postgres

# Выполните миграцию
# Скопируйте содержимое media-migration.sql и выполните в psql
```

Или через Supabase SQL Editor:
1. Откройте https://app.supabase.com
2. Перейдите в SQL Editor
3. Выполните `media-migration.sql`

### 2. Откройте медиа-менеджер

```
http://localhost:3003/cms/media
```

---

## 📋 Возможности

### Файлы
- ✅ Загрузка файлов (drag-n-drop)
- ✅ Поддержка изображений, видео, аудио, документов
- ✅ Предпросмотр изображений и видео
- ✅ Поиск по имени файла
- ✅ Фильтрация по типу
- ✅ Сортировка (дата, имя, размер)
- ✅ Массовое выделение и операции
- ✅ Контекстное меню (ПКМ)
- ✅ Редактирование метаданных (alt, описание)

### Папки
- ✅ Создание/удаление папок
- ✅ Иерархическая структура (дерево)
- ✅ Перемещение между папками
- ✅ Навигация (хлебные крошки)

### Загрузка
- ✅ Drag-n-drop зона
- ✅ Множественная загрузка
- ✅ Прогресс бар
- ✅ Сжатие изображений (опционально)
- ✅ Выбор типа файлов

---

## 🎯 Использование

### Загрузка файлов

1. Откройте `/cms/media`
2. Нажмите "📤 Загрузить файлы"
3. Перетащите файлы или кликните для выбора
4. Выберите тип файлов (изображения/видео/аудио/документы)
5. При необходимости включите "Сжимать изображения"
6. Файлы автоматически загрузятся в текущую папку

### Создание папки

1. В sidebar нажмите "📁 Новая папка"
2. Введите название
3. Нажмите "Создать"

Или:
1. В дереве папок нажмите "+" у нужной папки
2. Создастся дочерняя папка

### Поиск и фильтры

**Поиск:**
- Введите текст в поле поиска
- Фильтрация происходит автоматически

**Фильтры по типу:**
- 📁 Все
- 🖼️ Фото
- 🎬 Видео
- 🎵 Аудио
- 📄 Документы

**Сортировка:**
- По дате создания
- По имени
- По размеру
- Порядок: ↑ по возрастанию, ↓ по убыванию

### Массовые операции

1. Выделите файлы кликом или Shift+клик
2. Используйте панель массовых операций:
   - 🗑️ Удалить выбранные
   - Копировать URL
   - Переместить в папку

### Контекстное меню (ПКМ)

- ⬇️ Скачать
- 🔗 Копировать URL
- ✏️ Редактировать метаданные
- 🗑️ Удалить

---

## 🔧 Интеграция с редактором статей

### Использование MediaModal

```vue
<template>
  <div>
    <button @click="openMediaModal">🖼️ Вставить изображение</button>
    <MediaModal
      :is-open="isMediaModalOpen"
      @close="closeMediaModal"
      @insert="insertMedia"
      @insert-url="insertMediaUrl"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MediaModal from '@/components/cms/MediaModal.vue'

const isMediaModalOpen = ref(false)

function openMediaModal() {
  isMediaModalOpen.value = true
}

function closeMediaModal() {
  isMediaModalOpen.value = false
}

function insertMedia({ url, alt, title }) {
  // Вставка в Rich Text Editor
  const html = `<img src="${url}" alt="${alt}" title="${title}" />`
  document.execCommand('insertHTML', false, html)
  closeMediaModal()
}

function insertMediaUrl({ url }) {
  const html = `<img src="${url}" />`
  document.execCommand('insertHTML', false, html)
  closeMediaModal()
}
</script>
```

---

## 📊 Структура БД

### Таблицы

**storage_folders** — папки
```sql
id           uuid PRIMARY KEY
name         text NOT NULL
parent_id    uuid REFERENCES storage_folders(id)
created_at   timestamptz
updated_at   timestamptz
```

**storage_objects** — файлы
```sql
id           uuid PRIMARY KEY
bucket_id    text (images/videos/audio/documents)
name         text (уникальное имя)
original_name text
size         integer
type         text (MIME type)
url          text
path         text
folder_id    uuid REFERENCES storage_folders(id)
alt_text     text
description  text
width        integer
height       integer
created_at   timestamptz
```

### Представления

**storage_folders_tree** — иерархия папок
**media_statistics** — статистика по файлам

### Функции

**get_folder_files_recursive** — получить все файлы папки (включая подпапки)

---

## 🎨 Компоненты

```
src/components/cms/
├── MediaFolderTree.vue    # Дерево папок
├── MediaBrowser.vue       # Браузер файлов
├── MediaUpload.vue        # Загрузчик
├── MediaModal.vue         # Модалка выбора
└── src/pages/cms/
    └── CMSMedia.vue       # Главная страница
```

### MediaFolderTree

**Props:**
- `currentFolderId` — ID текущей папки

**Events:**
- `select-folder` — выбор папки
- `create-folder` — создание папки
- `delete-folder` — удаление папки

### MediaBrowser

**Props:**
- `currentFolderId` — ID текущей папки

**Events:**
- `select-folder` — навигация
- `delete-file` — удаление файла
- `edit-metadata` — редактирование
- `copy-url` — копирование URL

### MediaUpload

**Props:**
- `folderId` — ID папки для загрузки

**Events:**
- `upload-complete` — загрузка завершена
- `upload-error` — ошибка загрузки

### MediaModal

**Props:**
- `isOpen` — открыта ли модалка
- `fileType` — тип файлов (image/video/all)

**Events:**
- `close` — закрытие
- `insert` — вставка файла
- `insert-url` — вставка URL

---

## 🔑 Горячие клавиши

- **Escape** — закрыть модалку
- **Delete** — удалить выбранные файлы
- **Ctrl+A** — выделить все файлы
- **Двойной клик** — открыть предпросмотр

---

## 🐛 Решение проблем

### Файлы не загружаются

1. Проверьте размер файла (макс. 5MB для изображений, 50MB для видео)
2. Проверьте тип файла
3. Откройте консоль браузера (F12) для ошибок

### Ошибка БД

```bash
# Проверьте подключение к БД
docker ps

# Перезапустите Docker
docker-compose restart
```

### Файлы не отображаются

1. Обновите страницу
2. Проверьте текущую папку
3. Проверьте фильтры

---

## 📝 Планы

- [ ] Пакетное переименование
- [ ] Редактор изображений (кроп, поворот)
- [ ] Генерация превью для видео
- [ ] Экспорт/импорт медиа
- [ ] История операций
- [ ] Корзина для файлов

---

## 📞 Контакты

- Проект: ВТОРНИК
- Сайт: vtornik.online
- Email: info@vtornik.online
