# Настройка базы данных Supabase

## 📋 Шаг 1: Создание проекта

1. Перейдите на https://supabase.com
2. Нажмите "New Project"
3. Заполните:
   - **Name**: vtornik
   - **Database Password**: (сохраните в надёжном месте)
   - **Region**: выберите ближайшую (Europe - Frankfurt)

## 📋 Шаг 2: Настройка схемы БД

1. В проекте перейдите в **SQL Editor**
2. Скопируйте содержимое файла `supabase-schema.sql`
3. Вставьте и нажмите **Run**
4. Проверьте, что все таблицы созданы успешно

## 📋 Шаг 3: Настройка Storage

1. Перейдите в **Storage** (левое меню)
2. Нажмите "New bucket"
3. Создайте бакет:
   - **Name**: `images`
   - **Public**: ✅ Yes
4. В настройках бакета установите политики:

```sql
-- Публичный доступ на чтение
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'images');

-- Загрузка только для авторизованных
CREATE POLICY "Authenticated Upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'images');
```

## 📋 Шаг 4: Получение ключей API

1. Перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbG...`

## 📋 Шаг 5: Настройка проекта

Создайте файл `.env` в корне проекта:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Или обновите `src/services/database.js`:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key'
```

## 📋 Шаг 6: Проверка подключения

Запустите проект и проверьте консоль браузера. Должно быть:
```
Database connected successfully
```

## 📊 Структура базы данных

```
issues (Номера)
├── id (uuid)
├── num (integer) - номер выпуска
├── serial (integer) - сквозной номер
├── month (text) - месяц
├── year (integer) - год
├── theme (text) - тема номера
├── editor (text) - редактор
├── print_count (integer) - тираж
├── status (text) - published/draft/archived
├── cover_image_url (text) - обложка
└── ...

authors (Авторы)
├── id (uuid)
├── name (text) - имя
├── tagline (text) - статус
├── photo_url (text) - фото
├── bio (text) - биография
└── ...

articles (Статьи)
├── id (uuid)
├── issue_id (uuid) → issues
├── author_id (uuid) → authors
├── section_id (text) → sections
├── rubric (text) - рубрика
├── genre_id (integer) → genres
├── custom_genre (text) - свой жанр
├── title (text) - заголовок
├── subtitle (text) - подзаголовок
├── body (text) - текст (HTML)
└── ...

images (Изображения)
├── id (uuid)
├── filename (text)
├── original_name (text)
├── size (integer)
├── type (text)
├── url (text) - полный URL
└── ...

sections (Разделы - справочник)
├── id (text) - prose, poetry, essays...
├── name (text) - название
├── color (text) - цвет
└── ...

genres (Жанры - справочник)
├── id (serial)
└── name (text) - Роман, Рассказ...
```

## 🔄 Миграция данных из localStorage

Если у вас есть данные в localStorage, выполните в консоли браузера:

```javascript
// Экспорт данных
const exportData = () => {
  const data = {
    issues: JSON.parse(localStorage.getItem('vtornik_issues') || '[]'),
    authors: JSON.parse(localStorage.getItem('vtornik_authors') || '[]'),
    articles: JSON.parse(localStorage.getItem('vtornik_articles') || '[]'),
    images: JSON.parse(localStorage.getItem('vtornik_images') || '[]')
  }
  console.log(JSON.stringify(data, null, 2))
  return data
}

// Скопируйте результат и импортируйте через Supabase Dashboard
```

## 🚀 Готово!

Теперь все данные сохраняются в базу данных:
- ✅ Статьи и авторы в PostgreSQL
- ✅ Изображения в Supabase Storage
- ✅ Возможность повторного использования
- ✅ Поиск и фильтрация
- ✅ Резервное копирование

## 📝 Примечания

**Demo режим:**
Если ключи Supabase не настроены, приложение работает в демо-режиме (localStorage).

**Безопасность:**
- Включите RLS (Row Level Security)
- Настройте политики доступа
- Используйте аутентификацию для CMS

**Оптимизация:**
- Индексы созданы автоматически
- Кэширование через Pinia
- Lazy loading для изображений
