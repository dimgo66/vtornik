<template>
  <div class="neu-cms-section">
    <!-- Progress Overlay -->
    <div v-if="isGenerating" class="neu-progress-overlay" @click="isGenerating = false">
      <div class="neu-progress-box" @click.stop>
        <div class="neu-progress-header">
          <span class="neu-progress-title">Генерация PDF</span>
          <button class="neu-progress-close" @click="isGenerating = false">✕</button>
        </div>
        <div class="neu-progress-bar">
          <div class="neu-progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="neu-progress-message">{{ progressMessage }}</div>
        <div class="neu-progress-sub">№ {{ selectedIssue?.num }} ({{ selectedIssue?.serial }}) {{ selectedIssue?.month }} {{ selectedIssue?.year }}</div>
      </div>
    </div>

    <h2 class="neu-cms-section-title">Подготовка к печати</h2>
    
    <div class="neu-cms-prepare-wrap">
      <!-- Issue Selector -->
      <div class="neu-cms-card neu-cms-card--mb">
        <h3 class="neu-cms-card-title">Выберите номер для подготовки</h3>
        <select v-model="selectedIssueId" class="neu-cms-input neu-cms-input--lg" @change="loadIssueData">
          <option value="">-- Выберите номер --</option>
          <option v-for="issue in issues" :key="issue.id" :value="issue.id">
            № {{ issue.num }} — {{ issue.month }} {{ issue.year }} ({{ issue.theme }})
          </option>
        </select>
      </div>

      <div v-if="selectedIssue" class="neu-cms-card neu-cms-card--mb">
        <h3 class="neu-cms-card-title">Информация о номере</h3>
        <div class="neu-prepare-info">
          <div class="neu-info-row">
            <span class="neu-info-label">Тема:</span>
            <span class="neu-info-value">{{ selectedIssue.theme || '—' }}</span>
          </div>
          <div class="neu-info-row">
            <span class="neu-info-label">Редактор:</span>
            <span class="neu-info-value">{{ selectedIssue.editor || '—' }}</span>
          </div>
          <div class="neu-info-row">
            <span class="neu-info-label">Тираж:</span>
            <span class="neu-info-value">{{ selectedIssue.printCount || 500 }} экз.</span>
          </div>
          <div class="neu-info-row">
            <span class="neu-info-label">Статей:</span>
            <span class="neu-info-value">{{ issueArticles.length }}</span>
          </div>
          <div class="neu-info-row">
            <span class="neu-info-label">Полос:</span>
            <span class="neu-info-value">{{ estimatedPages }}</span>
          </div>
        </div>
      </div>

      <div v-if="selectedIssue" class="neu-cms-card neu-cms-card--mb">
        <h3 class="neu-cms-card-title">Параметры печати</h3>
        <div class="neu-cms-form-row">
          <div class="neu-cms-form-group">
            <label class="neu-cms-label">Тип бумаги</label>
            <select v-model="printSettings.paperType" class="neu-cms-input">
              <option value="offset60">Офсет 60 г/м²</option>
              <option value="coated90" selected>Мелованная 90 г/м²</option>
              <option value="coated115">Мелованная 115 г/м²</option>
              <option value="coated150">Мелованная 150 г/м²</option>
            </select>
          </div>
          <div class="neu-cms-form-group">
            <label class="neu-cms-label">Переплёт</label>
            <select v-model="printSettings.binding" class="neu-cms-input">
              <option value="staple" :disabled="estimatedPages > 64">Скрепка</option>
              <option value="perfect" selected>КБС</option>
              <option value="sewn">Швейное</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="selectedIssue" class="neu-cms-card neu-cms-card--mb">
        <h3 class="neu-cms-card-title">Содержание номера</h3>
        <div v-for="section in groupedArticles" :key="section.id" class="neu-prepare-section">
          <h4 class="neu-prepare-section-title">{{ section.name }}</h4>
          <ul class="neu-prepare-list">
            <li v-for="article in section.articles" :key="article.id" class="neu-prepare-list-item">
              <span class="neu-prepare-list-title">{{ article.title }}</span>
              <span class="neu-prepare-list-author">{{ getAuthorName(article.authorId) }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="selectedIssue" class="neu-cms-actions">
        <button class="neu-btn neu-btn--primary neu-btn--lg" @click="generatePDF">
          📄 Скачать PDF для печати
        </button>
        <RouterLink to="/cms/spine" class="neu-btn neu-btn--secondary neu-btn--lg">
          📐 Рассчитать корешок
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useIssuesStore } from '@/stores/issues'
import { useArticlesStore } from '@/stores/articles'
import { useAuthorsStore } from '@/stores/authors'
import { generateIssuePDF } from '@/services/pdfGenerator'

const issuesStore = useIssuesStore()
const articlesStore = useArticlesStore()
const authorsStore = useAuthorsStore()

const issues = computed(() => issuesStore.allIssues)

const selectedIssueId = ref('')
const printSettings = ref({
  paperType: 'coated90',
  binding: 'perfect'
})

const isGenerating = ref(false)
const progress = ref(0)
const progressMessage = ref('')

const selectedIssue = computed(() => {
  if (!selectedIssueId.value) return null
  return issuesStore.getIssueById(selectedIssueId.value)
})

const issueArticles = computed(() => {
  if (!selectedIssueId.value) return []
  return articlesStore.getArticlesByIssue(selectedIssueId.value)
})

const estimatedPages = computed(() => {
  const totalWords = issueArticles.value.reduce((sum, article) => {
    const text = article.body?.replace(/<[^>]*>/g, '') || ''
    return sum + text.split(/\s+/).length
  }, 0)
  const pages = Math.ceil(totalWords / 220)
  return Math.max(pages, 4) + 4
})

const groupedArticles = computed(() => {
  const sections = [
    { id: 'prose', name: 'Проза', articles: [] },
    { id: 'poetry', name: 'Поэзия', articles: [] },
    { id: 'essays', name: 'Эссе', articles: [] }
  ]
  
  return sections.map(section => ({
    ...section,
    articles: issueArticles.value.filter(article => article.section === section.id)
  })).filter(section => section.articles.length > 0)
})

function getAuthorName(authorId) {
  const author = authorsStore.getAuthorById(authorId)
  return author ? author.name : 'Неизвестный автор'
}

function loadIssueData() {
  // Загрузка данных о номере
}

async function generatePDF() {
  if (!selectedIssue.value) return
  
  isGenerating.value = true
  progress.value = 0
  progressMessage.value = 'Подготовка...'

  try {
    const allAuthors = authorsStore.allAuthors
    const allSections = [
      { id: 'prose', name: 'Проза', color: '#7A1515' },
      { id: 'poetry', name: 'Поэзия', color: '#5C0F0F' },
      { id: 'essays', name: 'Эссе', color: '#C9A962' }
    ]

    await generateIssuePDF(
      selectedIssue.value,
      issueArticles.value,
      allAuthors,
      allSections,
      (p, msg) => {
        progress.value = p
        progressMessage.value = msg
      }
    )

    alert('PDF сохранён ✓')
  } catch (error) {
    console.error('PDF generation error:', error)
    alert('Ошибка генерации PDF')
  } finally {
    isGenerating.value = false
    setTimeout(() => {
      progress.value = 0
      progressMessage.value = ''
    }, 1000)
  }
}
</script>

<style scoped>
.neu-cms-prepare-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  max-width: 800px;
}

.neu-cms-card {
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  box-shadow:
    6px 6px 12px rgba(0, 0, 0, 0.1),
    -6px -6px 12px rgba(255, 255, 255, 0.1);
}

.neu-cms-card--mb {
  margin-bottom: var(--space-md);
}

.neu-cms-card-title {
  font-family: var(--fj);
  font-size: 1rem;
  font-weight: 700;
  color: var(--neu-primary);
  margin-bottom: var(--space-md);
}

.neu-cms-input--lg {
  padding: var(--space-md);
  font-size: 1rem;
}

.neu-prepare-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-md);
}

.neu-info-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.neu-info-label {
  font-size: 0.75rem;
  color: var(--neu-text-secondary);
  font-family: var(--fnr);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.neu-info-value {
  font-weight: 700;
  color: var(--neu-text-primary);
}

.neu-prepare-section {
  margin-bottom: var(--space-md);
}

.neu-prepare-section-title {
  font-size: 0.7rem;
  font-family: var(--fnr);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--neu-primary);
  margin-bottom: var(--space-sm);
  padding-bottom: var(--space-xs);
  border-bottom: 2px solid var(--neu-primary);
}

.neu-prepare-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  list-style: none;
  padding: 0;
  margin: 0;
}

.neu-prepare-list-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: var(--space-xs) var(--space-sm);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-md);
  box-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.05),
    -2px -2px 4px rgba(255, 255, 255, 0.05);
}

.neu-prepare-list-title {
  font-weight: 700;
  font-family: var(--fj);
  color: var(--neu-text-primary);
}

.neu-prepare-list-author {
  font-size: 0.8rem;
  color: var(--neu-text-secondary);
  font-family: var(--fnr);
}

.neu-cms-actions {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
}

/* Progress Overlay */
.neu-progress-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 20, 16, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  cursor: pointer;
}

.neu-progress-box {
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  width: 100%;
  max-width: 400px;
  box-shadow:
    8px 8px 16px rgba(0, 0, 0, 0.15),
    -8px -8px 16px rgba(255, 255, 255, 0.15);
  cursor: default;
}

.neu-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.neu-progress-title {
  font-family: var(--fj);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--neu-primary);
}

.neu-progress-close {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.1),
    -2px -2px 4px rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--neu-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all var(--transition-fast);
}

.neu-progress-close:hover {
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.1),
    inset -2px -2px 4px rgba(255, 255, 255, 0.1);
}

.neu-progress-bar {
  height: 8px;
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: 4px;
  overflow: hidden;
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.1),
    inset -2px -2px 4px rgba(255, 255, 255, 0.1);
  margin-bottom: var(--space-sm);
}

.neu-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--neu-primary), var(--neu-primary-dark));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.neu-progress-message {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--neu-text-primary);
  margin-bottom: var(--space-xs);
}

.neu-progress-sub {
  font-size: 0.75rem;
  color: var(--neu-text-secondary);
  font-family: var(--fnr);
}

@media (max-width: 640px) {
  .neu-cms-form-row {
    grid-template-columns: 1fr;
  }
  
  .neu-cms-actions {
    flex-direction: column;
  }
}
</style>
