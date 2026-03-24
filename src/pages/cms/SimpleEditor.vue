<template>
  <div class="simple-editor">
    <h1>Редактор статьи</h1>
    <p>ID: {{ route.params.id }}</p>
    <p>Загрузка...</p>
    <RouterLink to="/cms/articles">← Назад</RouterLink>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style scoped>
.simple-editor {
  padding: var(--space-2xl);
  max-width: 800px;
  margin: 0 auto;
}

.simple-editor h1 {
  font-family: var(--fj);
  font-size: 2rem;
  color: var(--neu-primary);
  margin-bottom: var(--space-lg);
}

.simple-editor p {
  font-size: 1.1rem;
  color: var(--neu-text-primary);
  margin-bottom: var(--space-md);
}
</style>
