#!/bin/bash
# start.sh — Автоматический запуск проекта ВТОРНИК

echo "🚀 Запуск проекта ВТОРНИК..."

# Проверка Docker
echo "📦 Проверка Docker..."
if ! docker ps &>/dev/null; then
    echo "⚠️ Docker не запущен. Запускаю Docker Desktop..."
    open -a Docker
    echo "⏳ Ожидание запуска Docker (20 секунд)..."
    sleep 20
fi

# Запуск Docker Compose
echo "🐳 Запуск Docker Compose (БД + PostgREST)..."
cd /Volumes/Store1/Yandex.Disk.localized/Вторник/vtornik-vue
docker-compose up -d

# Ожидание пока БД запустится
echo "⏳ Ожидание готовности БД (5 секунд)..."
sleep 5

# Проверка PostgREST
if curl -s http://localhost:3000/storage_folders &>/dev/null; then
    echo "✅ PostgREST работает (порт 3000)"
else
    echo "⚠️ PostgREST не отвечает. Пробую ещё раз..."
    sleep 5
fi

# Запуск Upload Server
echo "📤 Запуск Upload Server (порт 3001)..."
if lsof -ti :3001 &>/dev/null; then
    echo "⚠️ Upload Server уже запущен"
else
    node test-upload-server.js &
    sleep 3
fi

# Проверка Upload Server
if curl -s http://localhost:3001/health &>/dev/null; then
    echo "✅ Upload Server работает (порт 3001)"
else
    echo "❌ Upload Server не запустился"
fi

# Запуск Vue Dev Server
echo "🎨 Запуск Vue Dev Server (порт 3003)..."
if lsof -ti :3003 &>/dev/null; then
    echo "⚠️ Vue Dev Server уже запущен"
else
    npm run dev &
fi

echo ""
echo "=========================================="
echo "✅ Проект запущен!"
echo "=========================================="
echo ""
echo "📊 Сервисы:"
echo "  - Vue App:       http://localhost:3003"
echo "  - Upload Server: http://localhost:3001"
echo "  - PostgREST API: http://localhost:3000"
echo "  - PostgreSQL:    localhost:54322"
echo ""
echo "🎯 CMS: http://localhost:3003/cms"
echo "📁 Медиа-менеджер: http://localhost:3003/cms/media"
echo ""
echo "=========================================="
echo "Для остановки: docker-compose down"
echo "=========================================="
