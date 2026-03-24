# 🚀 Инструкция по запуску проекта ВТОРНИК

## 1. Запуск Docker (База данных + REST API)

```bash
cd /Volumes/Store1/Yandex.Disk.localized/Вторник/vtornik-vue
docker-compose up -d
```

**Проверка:**
```bash
docker ps
```

Должны быть видны:
- `vtornik-db` — PostgreSQL (порт 54322)
- `vtornik-rest` — REST API (порт 3000)

---

## 2. Запуск Vue приложения (Dev сервер)

```bash
cd /Volumes/Store1/Yandex.Disk.localized/Вторник/vtornik-vue
npm run dev
```

**Проверка:**
- Откройте http://localhost:5173
- Должна загрузиться главная страница

---

## 📊 Порты

| Сервис | Порт | URL |
|--------|------|-----|
| **Vue App** | 5173 | http://localhost:5173 |
| **REST API** | 3000 | http://localhost:3000 |
| **PostgreSQL** | 54322 | localhost:54322 |

---

## 🛑 Остановка

```bash
# Остановить Vue (в терминале где запущен)
Ctrl+C

# Остановить Docker
cd /Volumes/Store1/Yandex.Disk.localized/Вторник/vtornik-vue
docker-compose down
```

---

## 🔧 Очистка портов (если что-то зависло)

```bash
# Убить все процессы на портах
lsof -ti :3000,3002,3003,5173 | xargs kill -9

# Перезапустить Docker
docker-compose restart
```

---

## 🧪 Тестирование

### Проверка REST API
```bash
curl http://localhost:3000/issues
```

### Проверка базы данных
```bash
docker exec vtornik-db psql -U postgres -d postgres -c "SELECT num, serial, month, year FROM issues ORDER BY serial DESC LIMIT 5;"
```

---

## 📝 Примечания

- **Vue Dev Server** автоматически перезагружается при изменении файлов
- **Docker контейнеры** работают в фоне
- **Данные** сохраняются в PostgreSQL (порт 54322)
- **Файлы** (видео/изображения) сохраняются в базе в виде Base64
