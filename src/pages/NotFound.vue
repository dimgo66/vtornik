<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <div class="not-found-content">
        <h1 class="not-found-title">404</h1>
        <h2 class="not-found-subtitle">Страница не найдена</h2>
        <p class="not-found-text">
          К сожалению, страница, которую вы ищете, не существует или была перемещена.
        </p>
        <div class="not-found-actions">
          <RouterLink to="/" class="neu-btn neu-btn--primary">
            🏠 На главную
          </RouterLink>
          <RouterLink to="/cms" class="neu-btn neu-btn--secondary">
            📚 В CMS
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
  padding: var(--space-lg);
}

.not-found-container {
  width: 100%;
  max-width: 500px;
}

.not-found-content {
  text-align: center;
  padding: var(--space-2xl);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-xl);
  box-shadow:
    8px 8px 16px var(--neu-shadow-dark),
    -8px -8px 16px var(--neu-shadow-light);
}

.not-found-title {
  font-family: var(--fj);
  font-size: 6rem;
  font-weight: 700;
  color: var(--neu-primary);
  margin: 0;
  line-height: 1;
  text-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
}

.not-found-subtitle {
  font-family: var(--fj);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--neu-text-primary);
  margin: var(--space-lg) 0 var(--space-md) 0;
}

.not-found-text {
  font-family: var(--fn);
  font-size: 0.95rem;
  color: var(--neu-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-xl);
}

.not-found-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
}

.neu-btn {
  padding: var(--space-sm) var(--space-lg);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.neu-btn--primary {
  background: linear-gradient(135deg, var(--neu-primary), var(--neu-primary-dark));
  color: #fff;
}

.neu-btn--primary:hover {
  background: linear-gradient(135deg, var(--neu-primary-dark), var(--neu-primary));
  box-shadow:
    3px 3px 6px var(--neu-shadow-dark),
    -3px -3px 6px var(--neu-shadow-light);
}

.neu-btn--secondary {
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  color: var(--neu-text-primary);
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
}

.neu-btn--secondary:hover {
  box-shadow:
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
}

@media (max-width: 480px) {
  .not-found-title {
    font-size: 4rem;
  }

  .not-found-subtitle {
    font-size: 1.2rem;
  }

  .not-found-content {
    padding: var(--space-lg);
  }

  .not-found-actions {
    flex-direction: column;
  }

  .neu-btn {
    width: 100%;
  }
}
</style>
