# 📊 Структура данных для импорта из старого сайта vtornik.online

## 🔍 Анализ старого сайта

На основе изучения https://www.vtornik.online/ выявлена следующая структура:

---

## 1. НОМЕРА ЖУРНАЛА (issues)

### Формат нумерации:
- **Порядковый номер за год** (num) — например, № 4
- **Сквозной номер** (serial) — например, 108
- **Месяц** (month) — русское название
- **Год** (year) — 4 цифры

### Поля таблицы issues:
```sql
CREATE TABLE issues (
  id uuid PRIMARY KEY,
  num integer NOT NULL,           -- Номер за год (4)
  serial integer NOT NULL,        -- Сквозной номер (108)
  month text NOT NULL,            -- Месяц (март)
  year integer NOT NULL,          -- Год (2026)
  theme text,                     -- Тема номера (опционально)
  editor text,                    -- Редактор (опционально)
  status text DEFAULT 'published',-- published/draft/archived
  cover_image_url text,           -- URL обложки
  description text,               -- Описание
  created_at timestamptz,
  updated_at timestamptz
);
```

### Пример данных:
```json
{
  "num": 4,
  "serial": 108,
  "month": "март",
  "year": 2026,
  "theme": "",
  "editor": "",
  "status": "published",
  "cover_image_url": "https://www.vtornik.online/uploads/cover108.jpg"
}
```

---

## 2. АВТОРЫ (authors)

### Поля таблицы authors:
```sql
CREATE TABLE authors (
  id uuid PRIMARY KEY,
  name text NOT NULL,        -- Имя фамилия
  tagline text,              -- Статус/подпись (Поэт, прозаик)
  photo_url text,            -- URL фото
  bio text,                  -- Биография
  sort_order integer,
  is_active boolean DEFAULT true,
  created_at timestamptz,
  updated_at timestamptz
);
```

### Пример данных:
```json
{
  "name": "Елена Романычева",
  "tagline": "Литературный критик",
  "photo_url": "",
  "bio": ""
}
```

---

## 3. РАЗДЕЛЫ (sections)

### Справочник разделов:
```sql
CREATE TABLE sections (
  id text PRIMARY KEY,       -- prose, poetry, essays...
  name text NOT NULL,        -- Название раздела
  css_class text,            -- CSS класс
  color text,                -- Цвет раздела
  sort_order integer
);
```

### Разделы старого сайта:
| ID | Название | CSS | Цвет |
|----|----------|-----|------|
| prose | Отдел прозы | sp | #8B1A1A |
| poetry | Отдел поэзии | po | #1A408B |
| profundis | De Profundis | pr | #1A6B3C |
| cinema | Город кино | ci | #7A3C1A |
| interview | Интервью | in | #4A1A8B |
| reading | Домашнее чтение | rd | #6B6B1A |
| essays | Эссе | es | #7A1515 |
| books | Книги | bk | #5A5A5A |
| audio | Аудиокниги | au | #1A8B6B |
| radio | Радио | ra | #8B4A1A |
| culture | И о культуре... | cu | #6B1A8B |

---

## 4. ЖАНРЫ (genres)

### Справочник жанров:
```sql
CREATE TABLE genres (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  sort_order integer
);
```

### Жанры:
- Роман
- Рассказ
- Повесть
- Стихотворения
- Поэма
- Эссе
- Статья
- Интервью
- Рецензия
- Репортаж
- Очерк
- Критика
- Травелог
- Исторический экскурс
- Редакционное слово

---

## 5. СТАТЬИ (articles)

### Поля таблицы articles:
```sql
CREATE TABLE articles (
  id uuid PRIMARY KEY,
  issue_id uuid REFERENCES issues(id),
  author_id uuid REFERENCES authors(id),
  section_id text REFERENCES sections(id),
  rubric text,                    -- Рубрика (отдел)
  genre_id integer REFERENCES genres(id),
  custom_genre text,              -- Свой жанр
  title text NOT NULL,
  subtitle text,                  -- Подзаголовок
  body text NOT NULL,             -- HTML контент
  sort_order integer,
  views_count integer DEFAULT 0,
  is_published boolean DEFAULT true,
  published_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
);
```

### Пример данных:
```json
{
  "title": "КАК МОТОЭКСПЕДИЦИЯ РОЖДАЕТ КНИГИ И КИНОФИЛЬМЫ",
  "subtitle": "",
  "author_id": "uuid-автора",
  "issue_id": "uuid-номера",
  "section_id": "essays",
  "rubric": "",
  "genre_id": 8,
  "custom_genre": "Репортаж",
  "body": "<p>Текст статьи...</p>",
  "is_published": true,
  "published_at": "2026-02-11T00:00:00Z"
}
```

---

## 6. ИЗОБРАЖЕНИЯ (images)

### Поля таблицы images:
```sql
CREATE TABLE images (
  id uuid PRIMARY KEY,
  filename text NOT NULL,
  original_name text,
  size integer,
  type text,
  url text NOT NULL,
  width integer,
  height integer,
  alt_text text,
  created_at timestamptz
);
```

---

## 📝 План импорта

### Этап 1: Подготовка
1. Выгрузить все номера из старого сайта
2. Выгрузить всех авторов
3. Выгрузить все статьи с привязкой к номерам и авторам

### Этап 2: Импорт в БД
1. Импортировать номера (issues)
2. Импортировать авторов (authors)
3. Импортировать справочники (sections, genres)
4. Импортировать статьи (articles)
5. Импортировать изображения (images)

### Этап 3: Проверка
1. Проверить целостность связей
2. Проверить отображение на сайте
3. Исправить ошибки

---

## 🔧 Скрипт импорта (пример)

```javascript
// import-from-old-site.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 1. Импорт номеров
async function importIssues(issues) {
  for (const issue of issues) {
    await supabase.from('issues').insert({
      num: issue.num,
      serial: issue.serial,
      month: issue.month,
      year: issue.year,
      cover_image_url: issue.coverImageUrl,
      description: issue.description
    })
  }
}

// 2. Импорт авторов
async function importAuthors(authors) {
  for (const author of authors) {
    await supabase.from('authors').insert({
      name: author.name,
      tagline: author.tagline,
      photo_url: author.photoUrl,
      bio: author.bio
    })
  }
}

// 3. Импорт статей
async function importArticles(articles) {
  for (const article of articles) {
    await supabase.from('articles').insert({
      title: article.title,
      body: article.body,
      author_id: article.authorId,
      issue_id: article.issueId,
      section_id: article.sectionId,
      genre_id: article.genreId
    })
  }
}
```

---

## 📌 Примечания

1. **Обложки номеров**: На старом сайте обложки могут отсутствовать — нужно проверить
2. **Авторы**: У некоторых авторов может не быть биографии и фото
3. **Статьи**: Некоторые старые статьи могут быть только в виде текста без HTML
4. **Разделы**: Использовать справочник sections для категоризации
5. **Жанры**: Использовать справочник genres или custom_genre для уникальных жанров

---

## 📞 Контакты

Для вопросов по импорту: vtornik2020@rambler.ru
