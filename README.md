# 📚 ВТОРНИК — Литературно-художественный журнал

[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)](https://vitejs.dev/)
[![Pinia](https://img.shields.io/badge/Pinia-3.0-ffe645?logo=pinia)](https://pinia.vuejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)

> Толстый зависимый литературно-художественный журнал

**Сайт:** [vtornik.online](https://vtornik.online)  
**Email:** info@vtornik.online

---

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ 
- Docker и Docker Compose (для локальной БД)
- npm или yarn

### Установка и запуск

```bash
# 1. Клонировать репозиторий
git clone <repository-url>
cd vtornik-vue

# 2. Установить зависимости
npm install

# 3. Запустить Docker (БД + REST API + Auth)
docker-compose up -d

# 4. Запустить dev-сервер
npm run dev
```

**Открыть:** http://localhost:3003

---

## 📁 Структура проекта

```
vtornik-vue/
├── src/
│   ├── components/
│   │   ├── layout/        # Header, Footer
│   │   ├── cards/         # IssueCard, EssayCard, AuthorCard
│   │   ├── modals/        # Modal, ArticleModal, AuthorModal
│   │   ├── ui/            # Button, ToastNotifications, ThemeToggle
│   │   └── cms/           # MediaFolderTree, MediaBrowser, MediaUpload
│   ├── pages/
│   │   ├── Home.vue
│   │   ├── Issue.vue
│   │   ├── Article.vue
│   │   ├── Authors.vue
│   │   ├── AuthorDetail.vue
│   │   ├── About.vue
│   │   ├── NotFound.vue       # 404 страница
│   │   └── cms/               # CMS страницы
│   ├── stores/
│   │   ├── issues.js          # Номера журнала
│   │   ├── authors.js         # Авторы
│   │   ├── articles.js        # Статьи
│   │   ├── media.js           # Медиафайлы
│   │   ├── auth.js            # Аутентификация
│   │   └── ui.js              # UI состояние
│   ├── services/
│   │   ├── database.js        # API вызовы (PostgREST)
│   │   ├── supabase.js        # Supabase клиент
│   │   ├── mediaService.js    # Медиа операции
│   │   ├── pdfGenerator.js    # Генерация PDF
│   │   └── imageUpload.js     # Загрузка изображений
│   ├── styles/
│   │   ├── variables.css      # Дизайн-токены
│   │   ├── base.css           # Базовые стили
│   │   ├── neuromorphic.css   # Neuromorphic тема
│   │   └── main.css           # Главный импорт
│   ├── router/
│   │   └── index.js           # Маршруты (lazy loading)
│   ├── App.vue
│   └── main.js
├── scripts/
│   ├── import.html            # UI для импорта данных
│   ├── import-dictionaries.js # Импорт справочников
│   └── import-test-data.js    # Импорт тестовых данных
├── docker-compose.yml         # Supabase (DB + REST + Auth)
├── supabase-schema.sql        # Миграция БД
├── supabase-auth.sql          # Аутентификация
├── package.json
├── vite.config.js
└── README.md
```

---

## 🛠 Технологии

### Frontend
- **Vue 3.5** — Composition API, `<script setup>`
- **Vite 6.2** — быстрый сборщик, HMR
- **Pinia 3.0** — управление состоянием
- **Vue Router 4.5** — маршрутизация с lazy loading
- **jsPDF** — генерация PDF для печати

### Backend (локально)
- **PostgreSQL 15** — база данных
- **PostgREST 12** — REST API
- **GoTrue** — аутентификация (Supabase Auth)

### Инфраструктура
- **Docker** — контейнеризация
- **Vercel** — хостинг (production)
- **Supabase** — БД + Auth + Storage (production)

---

## 📄 Маршруты

### Публичные страницы
| Маршрут | Описание |
|---------|----------|
| `/` | Главная страница |
| `/issue/:id` | Страница номера |
| `/article/:id` | Страница статьи |
| `/authors` | Список авторов |
| `/authors/:id` | Страница автора |
| `/about` | О журнале |

### CMS (требуется авторизация)
| Маршрут | Описание |
|---------|----------|
| `/cms/login` | Вход в систему |
| `/cms` | Панель управления |
| `/cms/issues` | Управление номерами |
| `/cms/articles` | Управление статьями |
| `/cms/authors` | Управление авторами |
| `/cms/media` | Медиа-менеджер |
| `/cms/prepare` | Подготовка к печати |
| `/cms/spine` | Калькулятор корешка |

---

## 🔐 Аутентификация

### Локальная разработка

**Тестовый пользователь:**
- Email: `admin@vtornik.online`
- Пароль: `admin123`

**Вход:** http://localhost:3003/cms/login

### Production

Для доступа к CMS необходимо:
1. Зарегистрировать учётную запись
2. Подтвердить email
3. Войти через форму

---

## 📊 Импорт данных

### Через UI

```bash
# Открыть страницу импорта
open scripts/import.html
```

1. Нажать "Импортировать справочники" (11 разделов + 15 жанров)
2. Нажать "Импортировать тестовые данные" (5 авторов + 3 номера + 3 статьи)

### Через консоль браузера

```javascript
// Импортировать справочники
import { importAllDictionaries } from '@/scripts/import-dictionaries.js'
await importAllDictionaries()

// Импортировать тестовые данные
import { importAllTestData } from '@/scripts/import-test-data.js'
await importAllTestData()
```

---

## 📐 Генерация PDF

1. Открыть CMS → В печать (`/cms/prepare`)
2. Выбрать номер
3. Настроить параметры (бумага, переплёт)
4. Нажать "Скачать PDF для печати"

**Параметры PDF:**
- Формат: А5 + вылет 3 мм
- Страниц: ~4 + количество статей
- Шрифты: встроены
- Изображения: поддерживаются

---

## 🎨 Дизайн-токены

```css
:root {
  /* Основные цвета */
  --cr: #7A1515;        /* Красный акцент */
  --dcr: #5C0F0F;       /* Тёмно-красный */
  --ink: #1C1410;       /* Текст */
  --paper: #F9F5F0;     /* Фон бумаги */
  --warm: #F7EFE3;      /* Тёплый фон */
  --sand: #F2E8D8;      /* Песочный */
  --gold: #C9A962;      /* Золото */
  
  /* Neuromorphic */
  --neu-bg-primary: #F9F5F0;
  --neu-bg-secondary: #F7EFE3;
  --neu-shadow-dark: rgba(0, 0, 0, 0.1);
  --neu-shadow-light: rgba(255, 255, 255, 0.8);
}
```

---

## 📦 Команды

```bash
# Разработка
npm run dev          # Запуск dev-сервера
npm run build        # Production сборка
npm run preview      # Preview production

# Docker
npm run db:start     # Запуск Docker (БД + REST + Auth)
npm run db:stop      # Остановка Docker
npm run db:reset     # Сброс БД
npm run db:logs      # Логи Docker
npm run db:studio    # Supabase Studio (http://localhost:3001)
npm run db:psql      # PSQL консоль
npm run db:backup    # Бэкап БД

# Утилиты
npm run ports:clean  # Очистка портов 3000, 3003, 54322
```

---

## 🌐 Деплой

### Vercel (рекомендуется)

```bash
# Установить Vercel CLI
npm i -g vercel

# Деплой
vercel --prod
```

**Переменные окружения:**
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Netlify

```bash
# Сборка
npm run build

# Перетащить папку dist в Netlify Drop
```

📖 **Подробно:** см. [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🧪 Тестирование

```bash
# Запустить тесты (в разработке)
npm run test

# E2E тесты
npm run test:e2e

# Линтинг
npm run lint
```

---

## 📚 Документация

| Файл | Описание |
|------|----------|
| [README.md](./README.md) | Этот файл |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Руководство по деплою |
| [LOCAL_AUTH.md](./LOCAL_AUTH.md) | Локальная аутентификация |
| [PHASE3_COMPLETE.md](./PHASE3_COMPLETE.md) | Отчёт по Фазе 3 |
| [IMPORT_STRUCTURE.md](./IMPORT_STRUCTURE.md) | Структура импорта |
| [MEDIA_MANAGER.md](./MEDIA_MANAGER.md) | Медиа-менеджер |
| [EDITOR_GUIDE.md](./EDITOR_GUIDE.md) | Редактор статей |

---

## 🐛 Известные ограничения

1. **PDF генерация** — базовая поддержка изображений
2. **Аутентификация** — только email/password
3. **Storage** — файлы в IndexedDB (локально)

---

## 🤝 Вклад

1. Fork репозиторий
2. Создать ветку (`git checkout -b feature/amazing`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing`)
5. Открыть Pull Request

---

## 📄 Лицензия

© Изд. дом «Вторник», 2026

---

## 📞 Контакты

- **Сайт:** [vtornik.online](https://vtornik.online)
- **Email:** info@vtornik.online
- **GitHub:** [dimgo66/vtornik-vue](https://github.com/dimgo66/vtornik-vue)

---

## 📊 Статус проекта

**Версия:** 1.0.0  
**Прогресс:** 54% (45/83 задач)  
**Фазы:** 3/4 завершены

| Фаза | Статус |
|------|--------|
| Фаза 0: Инициализация | ✅ Завершено |
| Фаза 1: Стабилизация | ✅ Завершено |
| Фаза 2: Безопасность | ✅ Завершено |
| Фаза 3: Контент | ✅ Завершено |
| Фаза 4: Production | 🔄 В процессе |
