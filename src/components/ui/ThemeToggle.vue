<template>
  <button
    type="button"
    class="theme-toggle neu-raised-sm neu-btn neu-focus"
    :aria-label="isDark ? 'Включить светлую тему' : 'Включить тёмную тему'"
    :aria-pressed="isDark"
    @click="toggleTheme"
    :title="isDark ? 'Светлая тема' : 'Тёмная тема'"
  >
    <!-- Солнце для светлой темы -->
    <svg 
      v-if="!isDark"
      class="theme-icon theme-icon--sun"
      xmlns="http://www.w3.org/2000/svg" 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
    
    <!-- Луна для тёмной темы -->
    <svg 
      v-if="isDark"
      class="theme-icon theme-icon--moon"
      xmlns="http://www.w3.org/2000/svg" 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const STORAGE_KEY = 'vtornik-theme'

onMounted(() => {
  // Проверяем сохранённую тему или системную настройку
  const saved = localStorage.getItem(STORAGE_KEY)
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = saved ? saved === 'dark' : prefersDark
  applyTheme()

  // Слушаем изменения системной темы
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      isDark.value = e.matches
      applyTheme()
    }
  })
})

function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme()
  localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light')
}

function applyTheme() {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
</script>

<style scoped>
.theme-toggle {
  width: 40px !important;
  height: 40px !important;
  border-radius: 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  position: relative;
  overflow: hidden;
}

.theme-icon {
  transition: all 0.3s ease;
}

.theme-icon--sun {
  color: #F59E0B;
}

.theme-icon--moon {
  color: #6B7280;
}
</style>
