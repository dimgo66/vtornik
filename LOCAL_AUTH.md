# 🔐 LOCAL AUTH GUIDE — Локальная аутентификация

## 📋 Обзор

Локальная аутентификация реализована через **GoTrue** (Supabase Auth) в Docker контейнере.

---

## 🚀 Быстрый старт

### 1. Запуск Docker с аутентификацией

```bash
# Остановить старые контейнеры
docker-compose down

# Запустить все сервисы (БД + REST + Auth)
docker-compose up -d

# Проверить статус
docker ps
```

**Должны быть видны:**
- `vtornik-db` — PostgreSQL (порт 54322)
- `vtornik-rest` — REST API (порт 3000)
- `vtornik-auth` — GoTrue Auth (порт 9999)

---

### 2. Проверка подключения

```bash
# Проверка Auth API
curl http://localhost:9999/health

# Проверка REST API
curl http://localhost:3000/auth_users
```

---

### 3. Тестовый пользователь

**По умолчанию создан:**
- **Email:** `admin@vtornik.online`
- **Пароль:** `admin123`
- **Роль:** `admin`

---

## 📁 Файлы

### docker-compose.yml
Добавлен сервис `supabase-auth`:
```yaml
supabase-auth:
  image: supabase/gotrue:v2.164.0
  ports:
    - "9999:9999"
  environment:
    GOTRUE_JWT_SECRET: your-super-secret-jwt-token-change-in-production
    GOTRUE_MAILER_AUTOCONFIRM: true
    # ... другие настройки
```

### supabase-auth.sql
SQL миграция создаёт:
- Таблицу `auth_users` (пользователи)
- Таблицу `auth_sessions` (сессии)
- Функции: `register_user()`, `authenticate_user()`, `logout_user()`
- Тестового пользователя `admin@vtornik.online`

### .env
```bash
VITE_SUPABASE_URL=http://localhost:3000
VITE_SUPABASE_ANON_KEY=your-super-secret-jwt-token-change-in-production
VITE_GOTRUE_URL=http://localhost:9999
```

### vite.config.js
Добавлен proxy для `/auth`:
```javascript
'/auth': {
  target: 'http://localhost:9999',
  changeOrigin: true
}
```

---

## 🔧 Использование

### Вход через UI

1. Откройте http://localhost:3003/cms/login
2. Введите:
   - Email: `admin@vtornik.online`
   - Пароль: `admin123`
3. Нажмите "Войти"
4. Редирект на `/cms`

### Вход через API

```bash
# Через curl
curl -X POST http://localhost:9999/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vtornik.online",
    "password": "admin123",
    "grant_type": "password"
  }'
```

### Через JavaScript

```javascript
import { supabase } from '@/services/supabase'

// Вход
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@vtornik.online',
  password: 'admin123'
})

// Выход
await supabase.auth.signOut()

// Текущий пользователь
const { data: { user } } = await supabase.auth.getUser()
```

---

## 🗄️ База данных

### Таблица auth_users

| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid | ID пользователя |
| email | text | Email (уникальный) |
| encrypted_password | text | Хешированный пароль |
| role | text | Роль (user/admin) |
| email_confirmed_at | timestamptz | Дата подтверждения email |
| last_sign_in_at | timestamptz | Последний вход |

### Таблица auth_sessions

| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid | ID сессии |
| user_id | uuid | Ссылка на пользователя |
| token | text | Токен сессии |
| expires_at | timestamptz | Срок действия |

---

## 🔐 Безопасность

### JWT Secret

**Важно:** Измените JWT secret для production!

```yaml
# docker-compose.yml
environment:
  GOTRUE_JWT_SECRET: your-super-secret-jwt-token-change-in-production
```

### RLS (Row Level Security)

Включён для таблиц:
- `auth_users`
- `auth_sessions`

Политики разрешают пользователям доступ только к своим данным.

---

## 🐛 Решение проблем

### Auth контейнер не запускается

```bash
# Проверить логи
docker logs vtornik-auth

# Перезапустить
docker-compose restart supabase-auth
```

### Ошибка "Invalid login credentials"

1. Проверьте email/password
2. Убедитесь, что миграция выполнена:
   ```bash
   docker exec -it vtornik-db psql -U postgres -d postgres -c "SELECT email FROM auth_users;"
   ```

### Токен не работает

1. Проверьте срок действия (1 час по умолчанию)
2. Обновите токен через `refresh_session()`
3. Войдите заново

### CORS ошибки

Проверьте proxy в `vite.config.js`:
```javascript
'/auth': {
  target: 'http://localhost:9999',
  changeOrigin: true
}
```

---

## 📝 Создание нового пользователя

### Через SQL

```sql
INSERT INTO auth_users (email, encrypted_password, role)
VALUES (
  'new@vtornik.online',
  crypt('newpassword123', gen_salt('bf', 10)),
  'user'
);
```

### Через функцию

```sql
SELECT register_user('new@vtornik.online', 'newpassword123', 'user');
```

### Через API (если включена регистрация)

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'new@vtornik.online',
  password: 'newpassword123'
})
```

---

## 🔄 Сброс пароля

### Через SQL

```sql
UPDATE auth_users
SET encrypted_password = crypt('newpassword123', gen_salt('bf', 10))
WHERE email = 'admin@vtornik.online';
```

---

## 📊 Мониторинг

### Активные сессии

```sql
SELECT 
  u.email,
  s.token,
  s.expires_at,
  s.ip_address
FROM auth_sessions s
JOIN auth_users u ON s.user_id = u.id
WHERE s.expires_at > now()
ORDER BY s.expires_at;
```

### Статистика пользователей

```sql
SELECT 
  role,
  count(*) as count,
  max(created_at) as last_created
FROM auth_users
GROUP BY role;
```

---

## 🎯 Следующие шаги

### Для production:

1. **Изменить JWT secret** на случайную строку
2. **Настроить email подтверждения** (SMTP)
3. **Включить HTTPS**
4. **Настроить rate limiting**
5. **Добавить 2FA** (опционально)

### Для разработки:

1. Создать больше тестовых пользователей
2. Настроить роли и разрешения
3. Добавить audit log

---

## 📞 Контакты

- Проект: ВТОРНИК
- Сайт: vtornik.online
- Email: info@vtornik.online
