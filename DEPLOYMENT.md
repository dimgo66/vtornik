# 🚀 DEPLOYMENT GUIDE — ВТОРНИК

## 📋 Обзор

Руководство по деплою проекта ВТОРНИК на production.

---

## 🏗️ Архитектура

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Vercel CDN    │────▶│  Vercel Hosting  │────▶│  Supabase Cloud │
│   (Static)      │     │  (Vue 3 App)     │     │  (PostgreSQL)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                        │
        │                       │                        │
        ▼                       ▼                        ▼
  Контент доставляется   SSR/SPA приложение    БД + Auth + Storage
  через Edge Network
```

---

## 📦 Подготовка к деплою

### 1. Проверка сборки

```bash
# Локальная сборка
npm run build

# Проверка размера бандла
ls -lh dist/assets/

# Preview production сборки
npm run preview
```

### 2. Переменные окружения

Создать `.env.production`:

```bash
# Supabase Production
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Приложение
VITE_APP_NAME=ВТОРНИК
VITE_APP_URL=https://vtornik.online
```

### 3. Конфигурация Vite

Обновить `vite.config.js` для production:

```javascript
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-pdf': ['jspdf', 'html2canvas'],
          'cms': ['./src/pages/cms/CMS.vue', './src/pages/cms/CMSIssues.vue']
        }
      }
    }
  }
})
```

---

## 🌐 Деплой на Vercel

### Шаг 1: Подготовка

```bash
# Установить Vercel CLI
npm i -g vercel

# Войти в аккаунт
vercel login
```

### Шаг 2: Инициализация проекта

```bash
# Инициализировать проект
vercel

# Следовать инструкциям:
# - Set up and deploy? Y
# - Which scope? (выбрать аккаунт)
# - Link to existing project? N
# - Project name? vtornik-vue
# - Directory? ./
# - Override settings? N
```

### Шаг 3: Настройка переменных окружения

```bash
# Добавить переменные в Vercel
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

Или через Vercel Dashboard:
1. Открыть проект на vercel.com
2. Settings → Environment Variables
3. Добавить переменные

### Шаг 4: Деплой

```bash
# Production деплой
vercel --prod

# Или просто
vercel
```

### Шаг 5: Настройка домена

1. Vercel Dashboard → Project Settings → Domains
2. Добавить домен: `vtornik.online`
3. Настроить DNS:
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21`
   - TTL: `Auto`

   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`

---

## 🔗 Настройка Supabase Production

### Шаг 1: Создать проект

1. Открыть https://supabase.com
2. New Project
3. Выбрать регион (Europe/US)
4. Установить пароль БД

### Шаг 2: Настроить БД

```sql
-- Выполнить миграции в SQL Editor:
-- 1. supabase-schema.sql (основная схема)
-- 2. supabase-auth.sql (аутентификация)
```

### Шаг 3: Включить аутентификацию

1. Authentication → Providers
2. Включить Email/Password
3. Настроить Email Templates
4. Установить Site URL: `https://vtornik.online`

### Шаг 4: Настроить Storage (опционально)

1. Storage → Create Bucket
2. Создать бакеты:
   - `images` (public)
   - `videos` (public)
   - `documents` (private)

### Шаг 5: Получить ключи

1. Settings → API
2. Скопировать:
   - Project URL
   - anon/public key

---

## 🔧 CI/CD с GitHub Actions

### .github/workflows/deploy.yml

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Секреты GitHub

```bash
# Добавить в Settings → Secrets → Actions:
VERCEL_TOKEN      # vercel token
VERCEL_ORG_ID     # organization ID
VERCEL_PROJECT_ID # project ID
VITE_SUPABASE_URL # Supabase URL
VITE_SUPABASE_ANON_KEY # Supabase anon key
```

---

## 📊 Мониторинг

### Vercel Analytics

1. Vercel Dashboard → Analytics
2. Enable Web Analytics
3. Enable Speed Insights

### Supabase Logs

1. Supabase Dashboard → Logs
2. Filter by level (error, warning)
3. Настроить алерты

### Error Tracking

Рекомендуется добавить Sentry:

```bash
npm install @sentry/vue
```

```javascript
// src/main.js
import * as Sentry from "@sentry/vue";

Sentry.init({
  app: createApp(App),
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

---

## 🔄 Rollback

### Откат на предыдущую версию

```bash
# Список деплоев
vercel ls

# Откат на конкретный деплой
vercel rollback [deployment-url]
```

Или через Vercel Dashboard:
1. Deployments
2. Выбрать предыдущий успешный
3. Promote to Production

---

## 📝 Чек-лист деплоя

### Pre-deploy
- [ ] Локальная сборка без ошибок
- [ ] Все тесты проходят
- [ ] Переменные окружения настроены
- [ ] Supabase проект создан
- [ ] Миграции выполнены
- [ ] Домен настроен

### Deploy
- [ ] Деплой на Vercel выполнен
- [ ] HTTPS сертификат активен
- [ ] Домен подключён
- [ ] Переменные окружения применены

### Post-deploy
- [ ] Главная страница загружается
- [ ] CMS доступна по /cms
- [ ] Аутентификация работает
- [ ] Данные загружаются из БД
- [ ] PDF генерация работает
- [ ] Мобильная версия корректна

---

## 🐛 Решение проблем

### Сборка не проходит

```bash
# Очистить кэш
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Ошибки CORS

Проверить настройки Supabase:
1. Authentication → URL Configuration
2. Добавить домен в Site URL
3. Проверить RLS политики

### Slow Performance

1. Включить caching в Vercel
2. Оптимизировать изображения
3. Включить gzip/brotli
4. Проверить размер бандла

---

## 📞 Контакты

- Vercel: https://vercel.com/support
- Supabase: https://supabase.com/docs
- Проект: vtornik2020@rambler.ru
