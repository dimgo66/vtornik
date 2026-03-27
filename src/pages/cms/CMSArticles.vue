<template>
  <div class="neu-cms-section">
    <div class="neu-cms-section-header">
      <h2 class="neu-cms-section-title">Управление статьями</h2>
      <RouterLink to="/cms/article/new" class="neu-btn neu-btn--primary">
        + Добавить статью
      </RouterLink>
    </div>

    <div v-if="loading" class="neu-cms-loading">
      <div class="neu-cms-loading-spinner"></div>
      <p class="neu-cms-loading-text">Загрузка статей...</p>
    </div>

    <div v-else-if="error" class="neu-cms-error">
      <p class="neu-cms-error-text">❌ {{ error }}</p>
      <button class="neu-btn neu-btn--primary" @click="fetchArticles">Попробовать снова</button>
    </div>

    <div v-else class="neu-cms-table-wrap">
      <table class="neu-cms-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Автор</th>
            <th>Раздел</th>
            <th>Номер</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in articles" :key="article.id">
            <td>
              <div class="neu-cms-table-title">{{ article.title }}</div>
              <div v-if="article.subtitle" class="neu-cms-table-subtitle">{{ article.subtitle }}</div>
            </td>
            <td>{{ getAuthorName(article.authorId) }}</td>
            <td>
              <span class="neu-cms-badge">{{ getSectionName(article.section) }}</span>
            </td>
            <td>{{ getIssueName(article.issueId) }}</td>
            <td>
              <div class="neu-cms-table-actions">
                <RouterLink :to="`/article/${article.id}`" class="neu-cms-icon-btn" title="Просмотр">
                  👁️
                </RouterLink>
                <RouterLink :to="`/cms/article/${article.id}/edit`" class="neu-cms-icon-btn" title="Редактировать">
                  ✏️
                </RouterLink>
                <button class="neu-cms-icon-btn neu-cms-icon-btn--danger" @click.stop="deleteArticle(article.id)" title="Удалить">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="articles.length === 0" class="neu-cms-empty">
        <p class="neu-cms-empty-text">Статьи пока не добавлены</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useArticlesStore } from '@/stores/articles'
import { useAuthorsStore } from '@/stores/authors'
import { useIssuesStore } from '@/stores/issues'

const articlesStore = useArticlesStore()
const authorsStore = useAuthorsStore()
const issuesStore = useIssuesStore()

const articles = computed(() => articlesStore.allArticles)
const authors = computed(() => authorsStore.allAuthors)
const issues = computed(() => issuesStore.allIssues)
const loading = computed(() => articlesStore.loading)
const error = computed(() => articlesStore.error)

onMounted(() => {
  if (articlesStore.articles.length === 0) {
    articlesStore.fetchArticles()
  }
})

function fetchArticles() {
  articlesStore.fetchArticles()
}

const sections = {
  prose: 'Проза',
  poetry: 'Поэзия',
  essays: 'Эссе'
}

function getAuthorName(authorId) {
  const author = authorsStore.getAuthorById(authorId)
  return author ? author.name : 'Неизвестный автор'
}

function getIssueName(issueId) {
  const issue = issuesStore.getIssueById(issueId)
  return issue ? `№ ${issue.num}` : 'Неизвестный номер'
}

function getSectionName(sectionId) {
  return sections[sectionId] || sectionId
}

function deleteArticle(id) {
  if (confirm('Вы уверены, что хотите удалить эту статью?')) {
    articlesStore.deleteArticle(id)
  }
}
</script>

<style scoped>
.neu-cms-loading,
.neu-cms-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  gap: var(--space-md);
}

.neu-cms-loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--neu-shadow-dark);
  border-top-color: var(--neu-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.neu-cms-loading-text,
.neu-cms-error-text {
  color: var(--neu-text-secondary);
  font-size: 0.95rem;
}

.neu-cms-error-text {
  color: var(--neu-error);
}

.neu-cms-section {
  max-width: 1200px;
}

.neu-cms-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-md);
  border-bottom: 2px solid var(--neu-primary);
}

.neu-cms-section-title {
  font-family: var(--fj);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--neu-primary);
}

.neu-cms-table-wrap {
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow:
    8px 8px 16px var(--neu-shadow-dark),
    -8px -8px 16px var(--neu-shadow-light);
}

.neu-cms-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.neu-cms-table th {
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  padding: var(--space-sm) var(--space-md);
  text-align: left;
  font-weight: 700;
  font-family: var(--fnr);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--neu-text-primary);
  border-bottom: 2px solid var(--neu-shadow-dark);
}

.neu-cms-table td {
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--neu-shadow-dark);
  vertical-align: middle;
  color: var(--neu-text-secondary);
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

.neu-cms-table-actions {
  display: flex;
  gap: var(--space-xs);
}

.neu-cms-icon-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.neu-cms-icon-btn:hover {
  box-shadow:
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
}

.neu-cms-icon-btn--danger:hover {
  color: var(--neu-error);
}

.neu-cms-empty {
  padding: var(--space-2xl);
  text-align: center;
}

.neu-cms-empty-text {
  color: var(--neu-text-muted);
}

.neu-cms-badge {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  background: linear-gradient(135deg, var(--neu-primary), var(--neu-primary-dark));
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-radius: var(--radius-md);
}
</style>
