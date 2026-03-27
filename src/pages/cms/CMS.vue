<template>
  <div class="neu-cms-page">
    <div class="neu-cms-layout">
      <!-- Sidebar -->
      <aside class="neu-cms-sidebar">
        <div class="neu-cms-sidebar-header">
          <h1 class="neu-cms-logo">ВТОРНИК <span class="neu-cms-badge">CMS</span></h1>
          <RouterLink to="/" class="neu-cms-back-btn">
            ← Сайт
          </RouterLink>
        </div>

        <nav class="neu-cms-nav">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="neu-cms-nav-link"
            :class="{ 'neu-cms-nav-link--active': $route.path === item.path }"
          >
            <span class="neu-cms-nav-icon">{{ item.icon }}</span>
            {{ item.name }}
          </RouterLink>
        </nav>

        <div class="neu-cms-sidebar-footer">
          <div v-if="userEmail" class="neu-cms-user-info">
            <span class="neu-cms-user-email">{{ userEmail }}</span>
          </div>
          <button @click="handleLogout" class="neu-cms-logout-btn">
            🚪 Выйти
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="neu-cms-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const userEmail = computed(() => authStore.userEmail)

const navItems = [
  { path: '/cms/issues', name: 'Номера', icon: '📚' },
  { path: '/cms/articles', name: 'Статьи', icon: '📄' },
  { path: '/cms/authors', name: 'Авторы', icon: '✍️' },
  { path: '/cms/media', name: 'Медиа', icon: '📁' },
  { path: '/cms/prepare', name: 'В печать', icon: '🖨️' },
  { path: '/cms/spine', name: 'Корешок', icon: '📐' }
]

async function handleLogout() {
  const result = await authStore.logout()
  if (result.success) {
    router.push('/cms/login')
  }
}
</script>

<style scoped>
.neu-cms-page {
  min-height: 100vh;
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
}

.neu-cms-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
}

.neu-cms-sidebar {
  background: linear-gradient(180deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-right: 1px solid var(--neu-shadow-dark);
  box-shadow:
    4px 0 8px var(--neu-shadow-dark),
    -4px 0 4px var(--neu-shadow-light);
  padding: var(--space-lg);
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.neu-cms-sidebar-header {
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-md);
  border-bottom: 2px solid var(--neu-primary);
}

.neu-cms-logo {
  font-family: var(--fj);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--neu-text-primary);
  margin-bottom: var(--space-sm);
}

.neu-cms-badge {
  display: inline-block;
  background: linear-gradient(135deg, var(--neu-primary), var(--neu-primary-dark));
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  letter-spacing: 0.1em;
  margin-left: var(--space-xs);
}

.neu-cms-back-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-family: var(--fnr);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--neu-text-secondary);
  text-decoration: none;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.neu-cms-back-btn:hover {
  color: var(--neu-primary);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
}

.neu-cms-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.neu-cms-nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-lg);
  color: var(--neu-text-secondary);
  text-decoration: none;
  font-family: var(--fnr);
  font-size: 0.8rem;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.neu-cms-nav-link:hover {
  color: var(--neu-text-primary);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
}

.neu-cms-nav-link--active {
  color: #fff;
  background: linear-gradient(135deg, var(--neu-primary), var(--neu-primary-dark));
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
}

.neu-cms-nav-icon {
  font-size: 1.2rem;
}

.neu-cms-sidebar-footer {
  margin-top: auto;
  padding-top: var(--space-lg);
  border-top: 1px solid var(--neu-shadow-dark);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.neu-cms-user-info {
  padding: var(--space-xs) var(--space-sm);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-md);
  box-shadow:
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
}

.neu-cms-user-email {
  font-family: var(--fnr);
  font-size: 0.7rem;
  color: var(--neu-text-secondary);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.neu-cms-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
  color: var(--neu-text-secondary);
  font-family: var(--fnr);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.neu-cms-logout-btn:hover {
  color: var(--neu-error);
  box-shadow:
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
}

.neu-cms-main {
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
  padding: var(--space-xl);
  overflow-y: auto;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .neu-cms-layout {
    grid-template-columns: 1fr;
  }
  
  .neu-cms-sidebar {
    position: static;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--neu-shadow-dark);
  }
}
</style>
