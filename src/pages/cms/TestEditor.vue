<template>
  <div class="test-page">
    <h1>Страница редактирования статьи</h1>
    <p>ID: {{ route.params.id }}</p>
    <p>Маршрут: {{ route.name }}</p>
    <RouterLink to="/cms/articles">← Назад к статьям</RouterLink>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style scoped>
.test-page {
  padding: var(--space-2xl);
  max-width: 800px;
  margin: 0 auto;
}

.test-page h1 {
  font-family: var(--fj);
  font-size: 2rem;
  color: var(--neu-primary);
  margin-bottom: var(--space-lg);
}

.test-page p {
  font-size: 1.1rem;
  color: var(--neu-text-primary);
  margin-bottom: var(--space-md);
}
</style>
