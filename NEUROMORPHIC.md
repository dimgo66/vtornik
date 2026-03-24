# Neuromorphic Theme для ВТОРНИК

## 🎨 Обзор

Neuromorphic (неоморфизм) — стиль дизайна, использующий мягкие тени и градиенты для создания эффекта объёма. Элементы интерфейса выглядят как выдавленные из фона или вдавленные в него.

## 🎯 Основные принципы

### 1. Мягкие тени
- **Raised** (выпуклый): две тени — тёмная снизу-справа, светлая сверху-слева
- **Inset** (вдавленный): внутренние тени для эффекта углубления
- **Flat** (плоский): градиентный фон без теней

### 2. Цветовая палитра

```css
/* Светлая тема */
--neu-bg-primary: #F7EFE3      /* Тёплый бежевый */
--neu-bg-secondary: #F2E8D8    /* Песочный */
--neu-shadow-dark: #D4C5B0     /* Тёмная тень */
--neu-shadow-light: #FFFFFF    /* Светлая тень */

/* Тёмная тема */
--neu-bg-primary: #1F2937      /* Тёмно-серый */
--neu-bg-secondary: #111827    /* Угольный */
--neu-shadow-dark: #0F172A     /* Глубокая тень */
--neu-shadow-light: #374151    /* Светлая тень */
```

### 3. Бренд-цвета ВТОРНИК

```css
--neu-primary: #7A1515         /* Красный акцент */
--neu-primary-dark: #5C0F0F    /* Тёмно-красный */
--neu-accent: #C9A962          /* Золотой */
```

## 📦 Компоненты

### Кнопки

```vue
<!-- Default -->
<button class="neu-btn neu-btn--default">Текст</button>

<!-- Primary -->
<button class="neu-btn neu-btn--primary">Текст</button>

<!-- Accent -->
<button class="neu-btn neu-btn--accent">Текст</button>

<!-- Sizes -->
<button class="neu-btn neu-btn--sm">Маленькая</button>
<button class="neu-btn neu-btn--lg">Большая</button>
```

### Карточки

```vue
<article class="neu-card">
  <h2>Заголовок</h2>
  <p>Содержимое карточки</p>
</article>
```

### Поля ввода

```vue
<input type="text" class="neu-input" placeholder="Введите текст..." />
```

### Прогресс-бар

```vue
<div class="neu-progress">
  <div class="neu-progress__fill" style="width: 50%"></div>
</div>
```

### Бейджи

```vue
<span class="neu-badge neu-badge--primary">Новый</span>
<span class="neu-badge neu-badge--accent">VIP</span>
<span class="neu-badge neu-badge--success">Одобрено</span>
```

## 🌓 Переключение темы

Компонент `ThemeToggle.vue` автоматически:
- Определяет системную тему пользователя
- Сохраняет выбор в localStorage
- Применяет тёмную/светлую тему

```vue
<template>
  <ThemeToggle />
</template>

<script setup>
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
</script>
```

## ✨ Анимации

### Shimmer (мерцание)
Используется в прогресс-барах и skeleton-загрузке:

```css
@keyframes shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
```

### Skeleton (скелетон)
Для загрузки контента:

```vue
<div class="neu-skeleton" style="width: 100%; height: 20px"></div>
```

### Toast (уведомления)
Появление/исчезновение уведомлений:

```css
@keyframes toast-in {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

## 🎯 Примеры использования

### 1. Форма с neuromorphic стилями

```vue
<template>
  <form class="neu-card p-6">
    <h2 class="neu-text-primary mb-4">Регистрация</h2>
    
    <input 
      type="text" 
      class="neu-input mb-4" 
      placeholder="Ваше имя"
    />
    
    <input 
      type="email" 
      class="neu-input mb-4" 
      placeholder="Email"
    />
    
    <button class="neu-btn neu-btn--primary w-full">
      Зарегистрироваться
    </button>
  </form>
</template>
```

### 2. Карточка статьи

```vue
<template>
  <article class="neu-card">
    <div class="neu-badge neu-badge--accent mb-2">Проза</div>
    <h3 class="neu-text-primary">Название статьи</h3>
    <p class="neu-text-secondary">Краткое описание...</p>
    <button class="neu-btn neu-btn--default">Читать</button>
  </article>
</template>
```

### 3. Toast уведомления

```javascript
import { showToast } from '@/utils/toast'

showToast('success', 'Готово!', 'PDF сохранён')
showToast('error', 'Ошибка', 'Не удалось сохранить')
showToast('warning', 'Внимание', 'Сессия истекает')
showToast('info', 'Инфо', 'Обновление доступно')
```

## ♿ Доступность

### Focus states
Все интерактивные элементы имеют видимый фокус:

```css
.neu-focus:focus-visible {
  outline: 3px solid var(--neu-primary);
  outline-offset: 2px;
}
```

### Reduced motion
Для пользователей с вестибулярными расстройствами:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### ARIA атрибуты
- `aria-pressed` для кнопок-переключателей
- `aria-expanded` для аккордеонов
- `aria-label` для иконок
- `role="alert"` для уведомлений

## 📱 Адаптивность

Все компоненты адаптируются под разные размеры экрана:

```css
@media (max-width: 768px) {
  .neu-card {
    padding: var(--space-md);
    border-radius: var(--radius-lg);
  }
}
```

## 🎨 Кастомизация

### Изменение радиуса скругления

```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
}
```

### Изменение интенсивности теней

```css
.neu-raised-strong {
  box-shadow:
    12px 12px 24px var(--neu-shadow-dark),
    -12px -12px 24px var(--neu-shadow-light);
}
```

## 🔧 Утилиты

### Классы видимости

```css
.neu-hidden { display: none; }
.neu-invisible { visibility: hidden; }
.neu-opacity-0 { opacity: 0; }
```

### Текстовые классы

```css
.neu-text-primary { color: var(--neu-text-primary); }
.neu-text-secondary { color: var(--neu-text-secondary); }
.neu-text-muted { color: var(--neu-text-muted); }
```

### Отступы

```css
.neu-mb-sm { margin-bottom: var(--space-sm); }
.neu-mb-md { margin-bottom: var(--space-md); }
.neu-mb-lg { margin-bottom: var(--space-lg); }
```

## 📊 Производительность

### CSS
- CSS Custom Properties для быстрого переключения тем
- Минимальное использование `filter` и `backdrop-filter`
- GPU-ускоренные трансформации

### JavaScript
- Ленивая инициализация компонентов
- Debounce для частых событий
- Event delegation для динамических элементов

## 🐛 Известные ограничения

1. **Safari**: `backdrop-filter` может требовать префикса `-webkit-`
2. **Старые браузеры**: CSS Custom Properties не поддерживаются в IE11
3. **Тёмная тема**: Некоторые цвета могут требовать ручной настройки контраста

## 📚 Ресурсы

- [Neumorphism.io](https://neumorphism.io/) — генератор теней
- [Material Design](https://material.io/design/environment/elevation.html) — система elevation
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) — доступность
