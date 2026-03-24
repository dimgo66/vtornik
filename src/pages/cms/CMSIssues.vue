<template>
  <div class="neu-cms-section">
    <div class="neu-cms-section-header">
      <h2 class="neu-cms-section-title">Управление номерами</h2>
      <RouterLink to="/cms/issue/new" class="neu-btn neu-btn--primary">
        + Добавить номер
      </RouterLink>
    </div>

    <div class="neu-cms-table-wrap">
      <table class="neu-cms-table">
        <thead>
          <tr>
            <th>№</th>
            <th>Сквозной</th>
            <th>Месяц</th>
            <th>Год</th>
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
</script>

<style scoped>
.neu-cms-table-num {
  font-weight: 700;
  color: var(--neu-primary);
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
</style>
