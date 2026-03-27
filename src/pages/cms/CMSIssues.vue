<template>
  <div class="neu-cms-section">
    <div class="neu-cms-section-header">
      <h2 class="neu-cms-section-title">Управление номерами</h2>
      <RouterLink to="/cms/issue/new" class="neu-btn neu-btn--primary">
        + Добавить номер
      </RouterLink>
    </div>

    <div v-if="loading" class="neu-cms-loading">
      <div class="neu-cms-loading-spinner"></div>
      <p class="neu-cms-loading-text">Загрузка номеров...</p>
    </div>

    <div v-else-if="error" class="neu-cms-error">
      <p class="neu-cms-error-text">❌ {{ error }}</p>
      <button class="neu-btn neu-btn--primary" @click="refreshIssues">Попробовать снова</button>
    </div>

    <div v-else class="neu-cms-table-wrap">
      <table class="neu-cms-table">
        <thead>
          <tr>
            <th>№</th>
            <th>Сквозной</th>
            <th>Месяц</th>
            <th>Год</th>
            <th>Статус</th>
            <th>Обложка</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="issue in issues" :key="issue.id">
            <td class="neu-cms-table-num">{{ issue.num }}</td>
            <td>{{ issue.serial }}</td>
            <td>{{ issue.month }}</td>
            <td>{{ issue.year }}</td>
            <td>
              <span :class="['neu-cms-status', issue.status === 'published' ? 'neu-cms-status--published' : 'neu-cms-status--draft']">
                {{ issue.status === 'published' ? '✅ Опубликован' : '📝 Черновик' }}
              </span>
            </td>
            <td>
              <video v-if="issue.coverVideoUrl" :src="issue.coverVideoUrl" autoplay muted loop playsinline class="neu-cms-cover-video" />
              <img v-else-if="issue.coverImageUrl" :src="issue.coverImageUrl" alt="Обложка" class="neu-cms-cover" />
              <span v-else class="neu-cms-no-cover">Нет обложки</span>
            </td>
            <td>
              <div class="neu-cms-table-actions">
                <RouterLink :to="`/issue/${issue.id}`" class="neu-cms-icon-btn" title="Просмотр">
                  👁️
                </RouterLink>
                <RouterLink :to="`/cms/issue/${issue.id}/edit`" class="neu-cms-icon-btn" title="Редактировать">
                  ✏️
                </RouterLink>
                <button
                  v-if="issue.status !== 'published'"
                  class="neu-cms-icon-btn neu-cms-icon-btn--success"
                  @click="publishIssue(issue.id)"
                  title="Опубликовать"
                >
                  ✅
                </button>
                <button
                  v-if="issue.status === 'published'"
                  class="neu-cms-icon-btn neu-cms-icon-btn--warning"
                  @click="unpublishIssue(issue.id)"
                  title="В черновик"
                >
                  ⏸️
                </button>
                <button class="neu-cms-icon-btn neu-cms-icon-btn--danger" @click="deleteIssue(issue.id)" title="Удалить">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="issues.length === 0" class="neu-cms-empty">
        <p class="neu-cms-empty-text">Номера пока не добавлены</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useIssuesStore } from '@/stores/issues'

const issuesStore = useIssuesStore()
const issues = computed(() => issuesStore.allIssues)
const loading = computed(() => issuesStore.loading)
const error = computed(() => issuesStore.error)

onMounted(() => {
  if (issuesStore.issues.length === 0) {
    issuesStore.fetchIssues()
  }
})

function deleteIssue(id) {
  if (confirm('Вы уверены, что хотите удалить этот номер?')) {
    issuesStore.deleteIssue(id)
  }
}

async function publishIssue(id) {
  if (confirm('Опубликовать этот номер?')) {
    await issuesStore.updateIssue(id, { status: 'published' })
  }
}

async function unpublishIssue(id) {
  if (confirm('Перевести номер в черновики?')) {
    await issuesStore.updateIssue(id, { status: 'draft' })
  }
}

async function refreshIssues() {
  await issuesStore.fetchIssues()
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

.neu-cms-table-num {
  font-weight: 700;
  color: var(--neu-primary);
}

.neu-cms-status {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 600;
}

.neu-cms-status--published {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1));
  color: #2e7d32;
}

.neu-cms-status--draft {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 193, 7, 0.1));
  color: #f57f17;
}

.neu-cms-cover {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  box-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.1),
    -2px -2px 4px rgba(255, 255, 255, 0.05);
}

.neu-cms-cover-video {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  box-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.1),
    -2px -2px 4px rgba(255, 255, 255, 0.05);
}

.neu-cms-no-cover {
  font-size: 0.75rem;
  color: var(--neu-text-muted);
  font-style: italic;
}

.neu-cms-icon-btn--success {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.05));
}

.neu-cms-icon-btn--success:hover {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.25), rgba(76, 175, 80, 0.1));
}

.neu-cms-icon-btn--warning {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 193, 7, 0.05));
}

.neu-cms-icon-btn--warning:hover {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.25), rgba(255, 193, 7, 0.1));
}
</style>
