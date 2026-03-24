# План восстановления функциональности ВТОРНИК

## 📊 Анализ исходного проекта (vtornik-v3.html)

### Структура данных

```javascript
// SECTIONS — разделы журнала
const SECTIONS = [
  {id:'prose',     name:'Отдел прозы',     cls:'sp', color:'#8B1A1A'},
  {id:'poetry',    name:'Отдел поэзии',    cls:'po', color:'#1A408B'},
  {id:'profundis', name:'De Profundis',    cls:'pr', color:'#1A6B3C'},
  {id:'cinema',    name:'Город кино',      cls:'ci', color:'#7A3C1A'},
  {id:'interview', name:'Интервью',        cls:'in', color:'#4A1A8B'},
  {id:'reading',   name:'Домашнее чтение', cls:'rd', color:'#6B6B1A'},
];

// GENRES — жанры
const GENRES = [
  'Роман','Рассказ','Повесть','Стихотворения','Поэма',
  'Эссе','Статья','Интервью','Рецензия','Исторический экскурс',
  'Редакционное слово','Репортаж','Очерк','Критика'
];

// MONTHS — месяцы
const MONTHS = ['январь','февраль','март','апрель','май','июнь',
                'июль','август','сентябрь','октябрь','ноябрь','декабрь'];

// DB — база данных
{
  issues: [
    {
      id: 1,
      num: 4,              // номер выпуска
      serial: 108,         // серийный номер (сквозной)
      month: 'март',
      year: 2026,
      theme: 'Зацепин',    // тема номера
      editor: 'Игорь Михайлов',
      print: 500,          // тираж
      status: 'published', // published/draft
      coverImage: null,    // base64 или URL обложки
      coverVideo: null,    // base64 или URL видео (для hero)
      articles: [          // встроенные статьи
        {
          id: 101,
          section: 'prose',      // раздел (из SECTIONS)
          authorId: 1,           // ссылка на authors.id
          rubric: 'Отдел прозы', // рубрика (текст)
          genre: 'Эссе',         // жанр (из GENRES)
          customGenre: '',       // свой жанр (приоритет над genre)
          title: 'Зацепин',
          subtitle: 'Редакционное слово',
          body: '<p>HTML контент</p>'
        }
      ]
    }
  ],
  
  essays: [
    {
      id: 301,
      authorId: 1,
      rubric: 'Редакционное',
      genre: 'Эссе',
      title: 'Культурный симбиоз',
      subtitle: '',
      date: '2026-03',     // YYYY-MM
      coverImage: null,
      body: '<p>HTML контент</p>'
    }
  ],
  
  authors: [
    {
      id: 1,
      name: 'Игорь Михайлов',
      tagline: 'Главный редактор',
      photo: null,         // base64 или URL
      bio: 'Полная биография...'
    }
  ]
}
```

---

## 🔧 Функциональность для восстановления

### 1. Главная страница
- [x] Hero секция со свежим номером
- [ ] Видео-обложка (coverVideo) для hero
- [x] Сетка всех номеров
- [x] Сетка последних эссе
- [x] Сетка авторов

### 2. Страница номера
- [x] Обложка номера
- [x] Информация (тема, редактор, тираж)
- [x] Оглавление по разделам (SECTIONS)
- [ ] Видео-превью для номера
- [x] Модальное окно статьи
- [x] Навигация между статьями

### 3. Страница статьи
- [x] Полный текст с форматированием
- [x] Информация об авторе
- [x] Навигация (назад к номеру)
- [ ] Соседние статьи в номере

### 4. Страница авторов
- [x] Список всех авторов
- [x] Страница автора со всеми публикациями
- [ ] Поиск авторов

### 5. CMS — Номера
- [x] Список номеров (таблица)
- [x] Добавление/редактирование номера
- [x] Удаление номера
- [ ] Загрузка обложки (картинка/видео)
- [ ] Предпросмотр перед публикацией

### 6. CMS — Статьи
- [x] Список статей (таблица)
- [x] Добавление/редактирование статьи
- [x] Выбор номера из списка
- [x] Выбор раздела (SECTIONS)
- [x] Выбор жанра (GENRES) + свой жанр
- [x] Выбор автора из базы
- [ ] Rich Text Editor для контента
- [ ] Удаление статьи

### 7. CMS — Авторы
- [x] Список авторов
- [x] Добавление/редактирование автора
- [x] Загрузка фото
- [x] Удаление автора
- [ ] Подсчёт публикаций автора

### 8. CMS — Подготовка к печати
- [x] Выбор номера
- [x] Параметры печати (бумага, переплёт)
- [x] Подсчёт полос (~220 слов = 1 полоса А5)
- [ ] Генерация PDF (перенесено из vtornik-v3)
- [ ] Предпросмотр вёрстки

### 9. CMS — Калькулятор корешка
- [x] Ввод количества полос
- [x] Выбор типа бумаги
- [x] Расчёт толщины корешка
- [x] Таблица корешков (48-224 полосы)
- [x] Результат для типографии

---

## 📝 Приоритеты восстановления

### Критичные (восстановить в первую очередь):
1. **Rich Text Editor** — для набора статей с форматированием
2. **Загрузка файлов** — обложки, фото авторов (base64 или S3)
3. **Экспорт в PDF** — полная генерация печатной версии
4. **Поиск и фильтрация** — в CMS для больших баз

### Важные:
5. **Видео-обложки** — для hero секции
6. **Статусы материалов** — published/draft/archived
7. **Сортировка** — порядок статей в номере
8. **Предпросмотр** — перед публикацией

### Желательные:
9. **Импорт/экспорт DB** — резервное копирование
10. **Многоязычность** — для будущих версий
11. **Комментарии** — для авторов и редакторов
12. **История изменений** — кто и когда редактировал

---

## 🗄 Структура для Supabase (будущее)

```sql
-- issues (номера)
CREATE TABLE issues (
  id uuid PRIMARY KEY,
  num integer NOT NULL,
  serial integer NOT NULL,
  month text NOT NULL,
  year integer NOT NULL,
  theme text,
  editor text,
  print_count integer DEFAULT 500,
  status text DEFAULT 'published', -- published/draft/archived
  cover_image_url text,
  cover_video_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- authors (авторы)
CREATE TABLE authors (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  tagline text,
  photo_url text,
  bio text,
  created_at timestamptz DEFAULT now()
);

-- sections (разделы — справочник)
CREATE TABLE sections (
  id text PRIMARY KEY,
  name text NOT NULL,
  css_class text,
  color text
);

-- genres (жанры — справочник)
CREATE TABLE genres (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE
);

-- articles (статьи)
CREATE TABLE articles (
  id uuid PRIMARY KEY,
  issue_id uuid REFERENCES issues(id) ON DELETE CASCADE,
  author_id uuid REFERENCES authors(id),
  section_id text REFERENCES sections(id),
  rubric text,
  genre_id integer REFERENCES genres(id),
  custom_genre text,
  title text NOT NULL,
  subtitle text,
  body text NOT NULL, -- HTML
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- essays (отдельные эссе, не привязанные к номерам)
CREATE TABLE essays (
  id uuid PRIMARY KEY,
  author_id uuid REFERENCES authors(id),
  rubric text,
  genre_id integer REFERENCES genres(id),
  title text NOT NULL,
  subtitle text,
  cover_image_url text,
  body text NOT NULL,
  published_date date,
  created_at timestamptz DEFAULT now()
);

-- Индексы
CREATE INDEX articles_issue_id_idx ON articles(issue_id);
CREATE INDEX articles_author_id_idx ON articles(author_id);
CREATE INDEX essays_author_id_idx ON essays(author_id);
```

---

## 🔄 Миграция данных

### Из localStorage в Supabase:
1. Экспорт из localStorage: `JSON.stringify(DB)`
2. Парсинг и валидация данных
3. Импорт в Supabase через API
4. Проверка целостности связей

### Из старого сайта (vtornik.online):
1. Парсинг HTML страниц
2. Извлечение текстов статей
3. Извлечение метаданных (авторы, номера)
4. Импорт в новую структуру

---

## 📋 Чек-лист готовности

- [ ] Rich Text Editor (TinyMCE/Quill)
- [ ] Загрузка изображений (base64 → S3)
- [ ] Генерация PDF (перенос из vtornik-v3)
- [ ] Поиск по статьям/авторам
- [ ] Фильтрация в CMS
- [ ] Сортировка статей (drag & drop)
- [ ] Предпросмотр перед публикацией
- [ ] Статусы материалов
- [ ] Резервное копирование DB
- [ ] История изменений

---

## 🎯 Ближайшие задачи

1. **Установить Rich Text Editor**
   ```bash
   npm install @tinymce/tinymce-vue
   ```

2. **Создать сервис загрузки файлов**
   - Base64 для маленьких файлов
   - S3 bucket для больших

3. **Восстановить PDF генератор**
   - Перенести `generateIssuePDF()` из vtornik-v3
   - Интегрировать с новым UI

4. **Добавить поиск и фильтрацию**
   - Поиск по статьям (название, автор, текст)
   - Фильтр по разделам/жанрам
   - Сортировка по дате/алфавиту
