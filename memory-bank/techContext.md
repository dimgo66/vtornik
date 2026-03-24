# Technical Context

## Стек технологий

### Frontend
- **Vue 3** — фреймворк с Composition API
- **Vite** — быстрый сборщик
- **Pinia** — управление состоянием (вместо Vuex)
- **Vue Router** — маршрутизация
- **jsPDF** — генерация PDF

### Backend (планируется)
- **Supabase** — PostgreSQL + Auth + Storage
- **Локально:** Docker Supabase для разработки

## Структура проекта

```
src/
├── components/
│   ├── layout/          # Header, Footer
│   ├── cards/           # IssueCard, EssayCard, AuthorCard
│   ├── modals/          # Modal, ArticleModal, AuthorModal
│   └── ui/              # Button, ThemeToggle
├── pages/
│   ├── Home.vue
│   ├── Issue.vue
│   ├── Article.vue
│   ├── Authors.vue
│   ├── AuthorDetail.vue
│   ├── About.vue
│   └── cms/             # CMS компоненты
├── stores/              # Pinia stores
│   ├── issues.js
│   ├── authors.js
│   ├── articles.js
│   └── ui.js
├── data/                # JSON данные (временное решение)
│   ├── issues.json
│   ├── authors.json
│   └── articles.json
├── styles/
│   ├── variables.css    # CSS переменные (дизайн-токены)
│   ├── base.css         # Базовые стили
│   ├── neuromorphic.css # Нейроморфная тема
│   ├── components/      # Стили компонентов
│   └── utils/           # Утилиты
├── router/
│   └── index.js
├── services/
│   └── pdfGenerator.js
├── App.vue
└── main.js
```

## Настройка разработки

```bash
# Установка
npm install

# Dev сервер
npm run dev  # → http://localhost:3000

# Production сборка
npm run build  # → dist/

# Preview
npm run preview
```

## Технические ограничения

1. **Данные в JSON** — нет сохранения между сессиями
2. **Нет аутентификации** — CMS доступна всем
3. **PDF генерация** — требует доработки
4. **Нет 404 страницы**

## Зависимости

См. `package.json`:
- vue ^3.x
- pinia ^2.x
- vue-router ^4.x
- jspdf ^2.x
- vite ^5.x

## Следующие технические шаги

1. Настроить Supabase клиент
2. Создать `src/services/api.js`
3. Заменить JSON на API вызовы
4. Добавить обработку loading/error
5. Реализовать аутентификацию
