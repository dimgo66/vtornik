<template>
  <div class="neu-cms-section">
    <div class="neu-cms-section-header">
      <h2 class="neu-cms-section-title">Управление авторами</h2>
      <RouterLink to="/cms/author/new" class="neu-btn neu-btn--primary">
        + Добавить автора
      </RouterLink>
    </div>

    <div class="neu-cms-table-wrap">
      <table class="neu-cms-table">
        <thead>
          <tr>
            <th>Фото</th>
            <th>Имя</th>
            <th>Статус</th>
            <th>Публикаций</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="author in authors" :key="author.id">
            <td>
              <div class="neu-cms-avatar">
                <img v-if="author.photoUrl" :src="author.photoUrl" :alt="author.name" />
                <span v-else>👤</span>
              </div>
            </td>
            <td>
              <div class="neu-cms-table-title">{{ author.name }}</div>
              <div v-if="author.tagline" class="neu-cms-table-subtitle">{{ author.tagline }}</div>
            </td>
            <td>
              <span class="neu-cms-badge neu-cms-badge--success">Активен</span>
            </td>
            <td>{{ getArticlesCount(author.id) }}</td>
            <td>
              <div class="neu-cms-table-actions">
                <RouterLink :to="`/authors/${author.id}`" class="neu-cms-icon-btn" title="Просмотр">
                  👁️
                </RouterLink>
                <RouterLink :to="`/cms/author/${author.id}/edit`" class="neu-cms-icon-btn" title="Редактировать">
                  ✏️
                </RouterLink>
                <button class="neu-cms-icon-btn neu-cms-icon-btn--danger" @click="deleteAuthor(author.id)" title="Удалить">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="authors.length === 0" class="neu-cms-empty">
        <p class="neu-cms-empty-text">Авторы пока не добавлены</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthorsStore } from '@/stores/authors'
import { useArticlesStore } from '@/stores/articles'

const authorsStore = useAuthorsStore()
const articlesStore = useArticlesStore()

const authors = computed(() => authorsStore.allAuthors)

function getArticlesCount(authorId) {
  return articlesStore.getArticlesByAuthor(authorId).length
}

function deleteAuthor(id) {
  const count = getArticlesCount(id)
  if (count > 0) {
    if (!confirm(`У этого автора есть ${count} публикаций. Вы всё равно хотите удалить?`)) {
      return
    }
  }
  authorsStore.deleteAuthor(id)
}
</script>

<style scoped>
.neu-cms-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.1),
    -2px -2px 4px rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: var(--neu-text-muted);
  flex-shrink: 0;
}

.neu-cms-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.neu-cms-table-title {
  font-weight: 700;
  color: var(--neu-text-primary);
  margin-bottom: var(--space-xs);
}

.neu-cms-table-subtitle {
  font-size: 0.8rem;
  color: var(--neu-text-secondary);
  font-style: italic;
}
</style>
