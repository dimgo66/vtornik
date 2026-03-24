# ВТОРНИК — Vue 3 Приложение

Литературно-художественный журнал на Vue 3 + Vite + Pinia

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev

# Сборка production
npm run build

# Preview production сборки
npm run preview
```

## 📁 Структура проекта

```
src/
├── components/
│   ├── layout/          # Header, Footer
│   ├── cards/           # IssueCard, EssayCard, AuthorCard
│   ├── modals/          # Modal, ArticleModal, AuthorModal
│   └── ui/              # Button и другие UI компоненты
├── pages/
│   ├── Home.vue         # Главная страница
│   ├── Issue.vue        # Страница номера
│   ├── Article.vue      # Страница статьи
│   ├── Authors.vue      # Список авторов
│   ├── AuthorDetail.vue # Страница автора
│   ├── About.vue        # О журнале
│   └── cms/             # CMS компоненты
├── stores/              # Pinia хранилища
│   ├── issues.js
│   ├── authors.js
│   ├── articles.js
│   └── ui.js
├── data/                # JSON данные
│   ├── issues.json
│   ├── authors.json
│   └── articles.json
├── styles/
│   ├── variables.css    # CSS переменные
│   ├── base.css         # Базовые стили
│   ├── components/      # Стили компонентов
│   └── utils/           # Утилиты
├── router/
│   └── index.js         # Маршруты
├── App.vue
└── main.js
```

## 🛠 Технологии

- **Vue 3** — фреймворк с Composition API
- **Vite** — быстрый сборщик
- **Pinia** — управление состоянием
- **Vue Router** — маршрутизация
- **jsPDF** — генерация PDF

## 📄 Маршруты

### Публичные
- `/` — Главная
- `/issue/:id` — Страница номера
- `/article/:id` — Страница статьи
- `/authors` — Авторы
- `/authors/:id` — Страница автора
- `/about` — О журнале

### CMS
- `/cms` — Панель управления
- `/cms/issues` — Управление номерами
- `/cms/articles` — Управление статьями
- `/cms/authors` — Управление авторами
- `/cms/prepare` — Подготовка к печати
- `/cms/spine` — Калькулятор корешка

## 🎨 Дизайн-токены

Основные CSS переменные:

```css
--cr: #7A1515;        /* Красный акцент */
--dcr: #5C0F0F;       /* Тёмно-красный */
--ink: #1C1410;       /* Текст */
--paper: #F9F5F0;     /* Фон бумаги */
--warm: #F7EFE3;      /* Тёплый фон */
--sand: #F2E8D8;      /* Песочный */
--gold: #C9A962;      /* Золото */
```

## 📝 Данные

Данные хранятся в `src/data/*.json`. Для подключения реальной БД:

1. Создайте сервис `src/services/api.js`
2. Замените импорты JSON на API вызовы
3. Обновите actions в stores

## 🔜 Следующие шаги

1. **Генерация PDF** — перенести логику из старого проекта
2. **API интеграция** — подключить Supabase/бэкенд
3. **Аутентификация** — защита CMS маршрутов
4. **Оптимизация** — code splitting, lazy loading

## 📦 Сборка

```bash
# Production сборка
npm run build

# Локальный preview
npm run preview
```

Собранные файлы будут в `/dist`

## 🌐 Деплой

### Vercel
```bash
npm i -g vercel
vercel deploy --prod
```

### Netlify
```bash
npm run build
# Перетащить папку dist в Netlify Drop
```

## 📞 Контакты

- Сайт: vtornik.online
- Email: info@vtornik.online
