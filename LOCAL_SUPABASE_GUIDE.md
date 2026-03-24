# 🚀 Локальный Supabase — Инструкция

## ✅ Что настроено

**Docker контейнеры:**
- `vtornik-db` — PostgreSQL 15 (порт 54322)
- `vtornik-rest` — PostgREST API (порт 3000)

**Доступ к БД:**
- Host: `localhost:54322`
- Database: `postgres`
- User: `postgres`
- Password: `postgres`

**REST API:**
- URL: `http://localhost:3000`
- Роль: `postgres` (без JWT для разработки)

---

## 📦 Управление Docker

```bash
# Запустить
cd /Volumes/Store1/Yandex.Disk.localized/Вторник/vtornik-vue
docker-compose up -d

# Остановить
docker-compose down

# Перезапустить
docker-compose restart

# Посмотреть логи
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f supabase-rest
```

---

## 🗄️ Работа с базой данных

### Через psql
```bash
# Подключиться к БД
docker exec -it vtornik-db psql -U postgres -d postgres

# Просмотреть таблицы
\dt

# Просмотреть данные
SELECT * FROM issues;
SELECT * FROM authors;
SELECT * FROM articles;

# Выйти
\q
```

### Через REST API
```bash
# Получить все номера
curl http://localhost:3000/issues

# Получить номер по ID
curl http://localhost:3000/issues?id=eq.e49345a8-c06d-4a3e-9614-60dcc3291dca

# Создать номер
curl -X POST http://localhost:3000/issues \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "num": 5,
    "serial": 109,
    "month": "апрель",
    "year": 2026,
    "theme": "Весеннее обострение"
  }'
```

---

## 🎬 Загрузка видео и изображений

### В редакторе номеров:
1. **CMS → Номера → + Добавить номер**
2. Заполните параметры (Номер, Сквозной, Месяц, Год, Тема)
3. Нажмите **"🎬 Загрузить видео"** или **"🖼️ Загрузить изображение"**
4. Выберите файл на компьютере
5. Предпросмотр обновится автоматически
6. Нажмите **"💾 Сохранить"**

### Данные сохраняются в:
- **issues** — информация о номере
- **cover_image_url** — URL изображения
- **cover_video_url** — URL видео
- **team** — команда (JSON массив)

---

## 🐛 Решение проблем

### REST API не работает
```bash
# Перезапустить REST
docker restart vtornik-rest

# Проверить логи
docker logs vtornik-rest
```

### База данных не запускается
```bash
# Посмотреть логи
docker logs vtornik-db

# Пересоздать контейнер
docker-compose down -v
docker-compose up -d
```

### Ошибки прав доступа
```bash
# Выдать права
docker exec vtornik-db psql -U postgres -d postgres -c \
  "GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;"
```

---

## 📊 Структура базы данных

### issues (Номера)
- `id` — UUID
- `num` — номер за год
- `serial` — сквозной номер
- `month` — месяц
- `year` — год
- `theme` — тема
- `editor` — редактор
- `cover_image_url` — обложка (изображение)
- `cover_video_url` — обложка (видео)
- `description` — описание

### authors (Авторы)
- `id` — UUID
- `name` — имя
- `tagline` — статус
- `bio` — биография
- `photo_url` — фото

### articles (Статьи)
- `id` — UUID
- `issue_id` — номер (FK)
- `author_id` — автор (FK)
- `title` — заголовок
- `subtitle` — подзаголовок
- `body` — текст (HTML)
- `section` — раздел
- `genre` — жанр

---

## 🔗 Полезные ссылки

- **PostgREST документация:** https://postgrest.org/
- **Supabase документация:** https://supabase.com/docs
- **Docker Compose документация:** https://docs.docker.com/compose/
