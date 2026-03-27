<template>
  <header class="neu-header">
    <div class="neu-header__inner">
      <RouterLink to="/" class="neu-header__logo">
        <img :src="isDark ? logoDark : logoLight" alt="ВТОРНИК" class="neu-header__logo-img" />
      </RouterLink>

      <button class="neu-header__burger" @click="toggleMenu" :class="{ 'neu-header__burger--active': isMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav class="neu-header__nav" :class="{ 'neu-header__nav--open': isMenuOpen }">
        <RouterLink to="/" class="neu-header__nav-link">Главная</RouterLink>
        <RouterLink to="/authors" class="neu-header__nav-link">Авторы</RouterLink>
        <RouterLink to="/about" class="neu-header__nav-link">О журнале</RouterLink>
        <div class="neu-header__divider"></div>
        <RouterLink to="/cms/login" class="neu-header__nav-link neu-header__nav-link--cms" title="Вход в CMS">
          <span class="iconify" data-icon="mdi:login"></span>
        </RouterLink>
        <ThemeToggle />
      </nav>
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import { ref, onMounted } from 'vue'

const isMenuOpen = ref(false)
const isDark = ref(false)

const logoLight = new URL('@/assets/images/ВТОРНИК OK.svg', import.meta.url).href
const logoDark = new URL('@/assets/images/ВТОРНИК OKdark.svg', import.meta.url).href

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
  
  const observer = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains('dark')
  })
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  document.body.classList.toggle('menu-open', isMenuOpen.value)
}
</script>

<style scoped>
.neu-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
  box-shadow:
    0 4px 8px var(--neu-shadow-dark),
    0 -2px 4px var(--neu-shadow-light);
  padding: 0;
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--neu-shadow-dark);
  height: 80px;
}

.neu-header__inner {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  height: 100%;
}

.neu-header__logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}

.neu-header__logo-img {
  height: 80px;
  width: auto;
  transition: opacity var(--transition-fast);
}

.neu-header__logo:hover .neu-header__logo-img {
  opacity: 0.8;
}

.neu-header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-left: auto;
}

.neu-header__nav-link {
  font-family: var(--fj);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--neu-text-secondary);
  text-decoration: none;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.neu-header__nav-link:hover {
  color: var(--neu-primary);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
}

.neu-header__nav-link.router-link-active {
  color: var(--neu-primary);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
}

.neu-header__nav-link--cms {
  color: var(--neu-accent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.neu-header__nav-link--cms .iconify {
  width: 24px;
  height: 24px;
}

.neu-header__nav-link--cms:hover {
  color: var(--neu-accent-light);
}

.neu-header__divider {
  width: 1px;
  height: 20px;
  background: var(--neu-shadow-dark);
  margin: 0 var(--space-xs);
  flex-shrink: 0;
}

/* Burger */
.neu-header__burger {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 101;
}

.neu-header__burger span {
  display: block;
  width: 100%;
  height: 3px;
  background: var(--neu-primary);
  border-radius: 2px;
  transition: all var(--transition-fast);
}

.neu-header__burger--active span:nth-child(1) {
  transform: translateY(10.5px) rotate(45deg);
}

.neu-header__burger--active span:nth-child(2) {
  opacity: 0;
}

.neu-header__burger--active span:nth-child(3) {
  transform: translateY(-10.5px) rotate(-45deg);
}

@media (max-width: 768px) {
  .neu-header__burger {
    display: flex;
  }

  .neu-header__inner {
    flex-wrap: nowrap;
  }

  .neu-header__logo {
    margin: 0 auto;
  }

  .neu-header__nav {
    position: fixed;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100vh;
    background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--space-md);
    transition: left var(--transition-slow);
    z-index: 100;
    overflow-y: auto;
  }

  .neu-header__nav--open {
    left: 0;
  }

  .neu-header__nav-link {
    font-size: 1.2rem;
    padding: var(--space-sm) var(--space-md);
  }

  .neu-header__divider {
    display: none;
  }

  body.menu-open {
    overflow: hidden;
  }
}
</style>
