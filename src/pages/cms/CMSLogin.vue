<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">ВТОРНИК</h1>
          <p class="auth-subtitle">Вход в CMS</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="auth-field">
            <label for="email" class="auth-label">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="auth-input"
              placeholder="admin@vtornik.ru"
              required
              autocomplete="email"
            />
          </div>

          <div class="auth-field auth-field--password">
            <label for="password" class="auth-label">Пароль</label>
            <div class="auth-password-wrapper">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="auth-input"
                placeholder="••••••••"
                required
                autocomplete="current-password"
              />
              <button
                type="button"
                class="auth-password-toggle"
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <span class="iconify" :data-icon="showPassword ? 'mdi:eye-off' : 'mdi:eye'"></span>
              </button>
            </div>
          </div>

          <div class="auth-options">
            <label class="auth-remember">
              <input type="checkbox" v-model="rememberMe" />
              <span>Запомнить меня</span>
            </label>
            <RouterLink to="/cms/reset-password" class="auth-forgot">
              Забыли пароль?
            </RouterLink>
          </div>

          <button
            type="submit"
            class="auth-submit neu-btn neu-btn--primary neu-btn--full"
            :disabled="loading"
          >
            <span v-if="!loading">Войти</span>
            <span v-else class="auth-loading">
              <span class="auth-spinner"></span>
              Вход...
            </span>
          </button>

          <div v-if="error" class="auth-error">
            <span class="auth-error-icon">❌</span>
            <span>{{ error }}</span>
          </div>
        </form>

        <div class="auth-footer">
          <p class="auth-demo-hint">
            💡 Email: admin@vtornik.ru | Пароль: admin123
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('admin@vtornik.ru')
const password = ref('admin123')
const rememberMe = ref(true)
const showPassword = ref(false)

const loading = computed(() => authStore.loading)
const error = computed(() => authStore.error)

onMounted(async () => {
  // Если уже авторизован — редирект на CMS
  if (authStore.isAuthenticated) {
    router.push('/cms')
    return
  }
  // Инициализируем auth store
  await authStore.init()
})

async function handleLogin() {
  if (!email.value || !password.value) return

  const result = await authStore.login(email.value, password.value)

  if (result.success) {
    const redirect = route.query.redirect || '/cms'
    router.push(redirect)
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
  padding: var(--space-lg);
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  box-shadow:
    8px 8px 16px var(--neu-shadow-dark),
    -8px -8px 16px var(--neu-shadow-light);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.auth-title {
  font-family: var(--fj);
  font-size: 2rem;
  font-weight: 700;
  color: var(--neu-primary);
  margin: 0 0 var(--space-xs) 0;
  letter-spacing: 0.1em;
}

.auth-subtitle {
  font-family: var(--fn);
  font-size: 0.95rem;
  color: var(--neu-text-secondary);
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.auth-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.auth-label {
  font-family: var(--fn);
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a1a1a;
}

.auth-input {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-md);
  background: #fff;
  font-family: var(--fn);
  font-size: 0.95rem;
  color: #1a1a1a;
  transition: all var(--transition-fast);
}

.auth-input::placeholder {
  color: #999;
}

.auth-input:focus {
  outline: none;
  border-color: var(--neu-primary);
  box-shadow:
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
}

.auth-password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.auth-password-toggle {
  position: absolute;
  right: var(--space-sm);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: var(--space-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: color var(--transition-fast);
  z-index: 1;
}

.auth-password-toggle:hover {
  color: var(--neu-primary);
}

.auth-password-toggle .iconify {
  width: 20px;
  height: 20px;
}

.auth-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.auth-remember {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: #1a1a1a;
  cursor: pointer;
}

.auth-remember input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.auth-forgot {
  color: var(--neu-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.auth-forgot:hover {
  color: var(--neu-primary-dark);
  text-decoration: underline;
}

.auth-submit {
  margin-top: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.auth-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
}

.auth-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auth-error {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(244, 67, 54, 0.05));
  border-radius: var(--radius-md);
  color: #d32f2f;
  font-size: 0.85rem;
  font-family: var(--fn);
}

.auth-error-icon {
  flex-shrink: 0;
}

.auth-footer {
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--neu-shadow-dark);
  text-align: center;
}

.auth-demo-hint {
  font-size: 0.8rem;
  color: #1a1a1a;
  margin: 0;
}

@media (max-width: 480px) {
  .auth-card {
    padding: var(--space-lg);
  }

  .auth-title {
    font-size: 1.5rem;
  }

  .auth-options {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-xs);
  }
}
</style>
