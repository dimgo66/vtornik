<template>
  <header class="neu-header">
    <div class="neu-header__inner">
      <RouterLink to="/" class="neu-header__logo">
        <span class="logo-main">ВТОРНИК</span>
        <span class="logo-sub">литературно-художественный журнал</span>
      </RouterLink>
      
      <nav class="neu-header__nav">
        <RouterLink to="/" class="neu-header__nav-link">Главная</RouterLink>
        <RouterLink to="/authors" class="neu-header__nav-link">Авторы</RouterLink>
        <RouterLink to="/about" class="neu-header__nav-link">О журнале</RouterLink>
        <div class="neu-header__divider"></div>
        <RouterLink to="/cms" class="neu-header__nav-link neu-header__nav-link--cms">CMS</RouterLink>
        <ThemeToggle />
      </nav>
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
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
  padding: var(--space-md) 0;
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--neu-shadow-dark);
}

.neu-header__inner {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
}

.neu-header__logo {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-main {
  font-family: var(--fj);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--neu-primary);
  letter-spacing: 0.15em;
  line-height: 1;
  transition: color var(--transition-fast);
}

.logo-sub {
  font-family: var(--fd);
  font-size: 0.75rem;
  font-style: italic;
  color: var(--neu-text-secondary);
  letter-spacing: 0.05em;
  margin-top: var(--space-xs);
}

.neu-header__logo:hover .logo-main {
  color: var(--neu-primary-dark);
}

.neu-header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-left: auto;
}

.neu-header__nav-link {
  font-family: var(--fnr);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
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

@media (max-width: 768px) {
  .neu-header__inner {
    flex-wrap: wrap;
  }
  
  .neu-header__logo {
    width: 100%;
    align-items: center;
    margin-bottom: var(--space-sm);
  }
  
  .neu-header__nav {
    width: 100%;
    justify-content: center;
    margin-left: 0;
    padding-top: var(--space-sm);
    border-top: 1px solid var(--neu-shadow-dark);
    flex-wrap: wrap;
  }
  
  .neu-header__divider {
    display: none;
  }
}
</style>
