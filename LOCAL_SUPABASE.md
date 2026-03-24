# Локальная Supabase для разработки

## 🐳 Быстрый старт

### 1. Установка Docker

Убедитесь, что у вас установлен Docker Desktop:
- macOS: https://docs.docker.com/desktop/install/mac-install/
- Windows: https://docs.docker.com/desktop/install/windows-install/
- Linux: https://docs.docker.com/desktop/install/linux-install/

### 2. Запуск локальной Supabase

```bash
# Перейдите в директорию проекта
cd /Volumes/Store1/Yandex.Disk.localized/Вторник/vtornik-vue

# Запустите все сервисы
docker-compose up -d

# Проверьте статус
docker-compose ps
```

### 3. Проверка работы

Откройте в браузере:
- **Supabase Studio**: http://localhost:3001
- **REST API**: http://localhost:3000/rest/v1/
- **Storage**: http://localhost:5000

**Логин в Studio:**
- Email: `admin@example.com`
- Password: `postgres`

### 4. Настройка проекта

Проект автоматически подключится к локальной Supabase через `.env.local`.

Проверьте подключение:
```bash
npm run dev
```

## 📊 Сервисы

| Сервис | Порт | Описание |
|--------|------|----------|
| **Database** | 54322 | PostgreSQL 15 |
| **Studio** | 3001 | Админ-панель (как phpMyAdmin) |
| **Auth** | 9999 | Аутентификация (GoTrue) |
| **Storage** | 5000 | Файловое хранилище |
| **REST** | 3000 | PostgREST API |
| **Realtime** | 4000 | WebSocket подписки |

## 🗄 Работа с базой данных

### Через Studio (веб-интерфейс)

1. Откройте http://localhost:3001
2. Перейдите в **SQL Editor**
3. Выполните запрос:

```sql
-- Проверка данных
SELECT * FROM authors;
SELECT * FROM issues;
SELECT * FROM articles;
```

### Через psql (командная строка)

```bash
# Подключение к базе
docker exec -it vtornik-db psql -U postgres -d postgres

# Или через psql на хосте
psql -h localhost -p 54322 -U postgres -d postgres
# Пароль: postgres
```

### Примеры запросов

```sql
-- Создать автора
INSERT INTO authors (name, tagline, bio) 
VALUES ('Тестовый Автор', 'Тест', 'Биография');

-- Получить все статьи с авторами
SELECT a.title, a.body, auth.name 
FROM articles a 
JOIN authors auth ON a.author_id = auth.id;

-- Обновить статью
UPDATE articles 
SET title = 'Новый заголовок' 
WHERE id = '...';
```

## 📁 Создание бакета для изображений

1. Откройте http://localhost:3001
2. Перейдите в **Storage**
3. Нажмите "New bucket"
4. Name: `images`
5. Public: ✅ Yes
6. Создайте политики доступа:

```sql
-- В SQL Editor выполните:
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated Upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'images');
```

## 🔄 Управление данными

### Экспорт данных

```bash
# Дамп базы данных
docker exec vtornik-db pg_dump -U postgres postgres > backup.sql

# Или в формате custom
docker exec vtornik-db pg_dump -U postgres -Fc postgres > backup.dump
```

### Импорт данных

```bash
# Восстановление из дампа
docker exec -i vtornik-db psql -U postgres -d postgres < backup.sql
```

### Сброс данных

```bash
# Удалить все данные (ОСТОРОЖНО!)
docker exec -it vtornik-db psql -U postgres -d postgres << EOF
TRUNCATE articles, authors, issues, images RESTART IDENTITY CASCADE;
EOF
```

## 🛑 Остановка сервисов

```bash
# Остановить все сервисы
docker-compose down

# Остановить и удалить данные (полный сброс)
docker-compose down -v
```

## 🔧 Решение проблем

### Ошибка: "Port already in use"

```bash
# Проверьте, какие порты заняты
lsof -i :3001
lsof -i :54322

# Остановите конфликтующие сервисы или измените порты в docker-compose.yml
```

### Ошибка: "Container failed to start"

```bash
# Посмотрите логи
docker-compose logs supabase-db
docker-compose logs supabase-studio

# Перезапустите сервис
docker-compose restart supabase-db
```

### Ошибка подключения к базе

```bash
# Проверьте, что база запущена
docker-compose ps supabase-db

# Проверьте логи
docker logs vtornik-db
```

## 📝 Примечания

**Для разработки:**
- ✅ Все данные сохраняются в volumes
- ✅ При перезапуске данные сохраняются
- ✅ Полная копия продакшена

**Для продакшена:**
- ❌ Не используйте локальную Supabase
- ✅ Создайте проект на https://supabase.com
- ✅ Используйте облачную версию

## 🚀 Готово!

Теперь у вас есть полная локальная копия Supabase для разработки. Все данные сохраняются в базе PostgreSQL и могут быть использованы повторно.

**Следующие шаги:**
1. Откройте http://localhost:3001
2. Проверьте, что таблицы созданы
3. Добавьте тестовые данные
4. Запустите проект: `npm run dev`
