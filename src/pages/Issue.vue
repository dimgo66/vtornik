<template>
  <div class="issue-page" v-if="issue">
    <!-- Progress Overlay -->
    <div v-if="isGenerating" class="progress-overlay">
      <div class="progress-box">
        <div class="progress-header">
          <span class="font-journal text-cr">Генерация PDF</span>
          <button class="btn btn--ghost btn--sm" @click="isGenerating = false">✕</button>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="progress-message">{{ progressMessage }}</div>
        <div class="progress-sub">№ {{ issue.num }} ({{ issue.serial }}) {{ issue.month }} {{ issue.year }}</div>
      </div>
    </div>

    <!-- Issue Header -->
    <section class="iss-head">
      <div class="iss-head-in container">
        <div class="iss-cov">
          <img v-if="issue.coverImage" :src="issue.coverImage" :alt="issue.title" />
          <div v-else class="iss-cov-ph">
            <span class="font-journal text-2xl text-cr">№ {{ issue.num }}</span>
            <span class="text-sm text-gray">{{ issue.month }} {{ issue.year }}</span>
          </div>
        </div>
        
        <div class="iss-meta">
          <div class="iss-badge">Выпуск {{ issue.num }} ({{ issue.serial }})</div>
          <h1 class="iss-title">{{ issue.theme || 'ВТОРНИК' }}</h1>
          <p class="iss-theme">{{ issue.description }}</p>
          
          <div class="iss-stats">
            <div class="ist">
              <div class="ist-n">{{ articlesCount }}</div>
              <div class="ist-l">Публикаций</div>
            </div>
            <div class="ist">
              <div class="ist-n">{{ authorsCount }}</div>
              <div class="ist-l">Авторов</div>
            </div>
            <div class="ist">
              <div class="ist-n">{{ issue.printCount || 500 }}</div>
              <div class="ist-l">Тираж</div>
            </div>
          </div>
          
          <div class="flex gap-2">
            <button class="btn btn--primary" @click="generatePDF">
              Скачать PDF
            </button>
            <RouterLink to="/cms/prepare" class="btn btn--secondary">
              В печать
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Table of Contents -->
    <div class="toc-wrap container">
      <div v-for="section in sections" :key="section.id" class="toc-sec">
        <h3 class="toc-sec-hd">{{ section.name }}</h3>
        
        <div 
          v-for="article in section.articles" 
          :key="article.id"
          class="toc-row"
          @click="openArticle(article)"
        >
          <div>
            <div class="toc-auth">{{ getAuthorName(article.authorId) }}</div>
            <div class="toc-title">{{ article.title }}</div>
            <div v-if="article.subtitle" class="toc-sub">{{ article.subtitle }}</div>
          </div>
          <div class="toc-pg">→</div>
        </div>
      </div>
    </div>

    <!-- Article Modal -->
    <ArticleModal 
      :isOpen="isArticleModalOpen" 
      :article="selectedArticle" 
      @close="closeArticleModal" 
    />
  </div>

  <div v-else class="container text-center p-5">
    <p class="text-gray">Номер не найден</p>
    <RouterLink to="/" class="btn btn--primary mt-3">На главную</RouterLink>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useIssuesStore } from '@/stores/issues'
import { useArticlesStore } from '@/stores/articles'
import { useAuthorsStore } from '@/stores/authors'
import { useUIStore } from '@/stores/ui'
import { generateIssuePDF } from '@/services/pdfGenerator'
import ArticleModal from '@/components/modals/ArticleModal.vue'

const route = useRoute()
const issuesStore = useIssuesStore()
const articlesStore = useArticlesStore()
const authorsStore = useAuthorsStore()
const uiStore = useUIStore()

const selectedArticle = ref(null)
const isGenerating = ref(false)
const progress = ref(0)
const progressMessage = ref('')

const issue = computed(() => issuesStore.getIssueById(route.params.id))
const issueArticles = computed(() => articlesStore.getArticlesByIssue(route.params.id))

const sections = ref([
  { id: 'prose', name: 'Проза', articles: [], color: '#7A1515' },
  { id: 'poetry', name: 'Поэзия', articles: [], color: '#5C0F0F' },
  { id: 'essays', name: 'Эссе', articles: [], color: '#C9A962' }
])

const articlesCount = computed(() => issueArticles.value.length)
const authorsCount = computed(() => {
  const authorIds = new Set(issueArticles.value.map(a => a.authorId))
  return authorIds.size
})

function getAuthorName(authorId) {
  const author = authorsStore.getAuthorById(authorId)
  return author ? author.name : 'Неизвестный автор'
}

function openArticle(article) {
  selectedArticle.value = article
  uiStore.openArticleModal(article)
}

function closeArticleModal() {
  uiStore.closeArticleModal()
  selectedArticle.value = null
}

async function generatePDF() {
  if (!issue.value) return
  
  isGenerating.value = true
  progress.value = 0
  progressMessage.value = 'Подготовка...'

  try {
    const allAuthors = authorsStore.allAuthors
    const allSections = sections.value

    await generateIssuePDF(
      issue.value,
      issueArticles.value,
      allAuthors,
      allSections,
      (p, msg) => {
        progress.value = p
        progressMessage.value = msg
      }
    )

    uiStore.showNotification('PDF сохранён ✓', 'ok')
  } catch (error) {
    console.error('PDF generation error:', error)
    uiStore.showNotification('Ошибка генерации PDF', 'error')
  } finally {
    isGenerating.value = false
    setTimeout(() => {
      progress.value = 0
      progressMessage.value = ''
    }, 1000)
  }
}

onMounted(() => {
  // Group articles by section
  sections.value = sections.value.map(section => ({
    ...section,
    articles: issueArticles.value.filter(article => article.section === section.id)
  }))
})
</script>

<style scoped>
.progress-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 20, 16, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.progress-box {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.progress-header .font-journal {
  font-size: 1.1rem;
  font-weight: 700;
}

.progress-bar {
  height: 8px;
  background: var(--lgray);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: var(--space-sm);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--cr), var(--dcr));
  border-radius: var(--radius-sm);
  transition: width 0.3s ease;
}

.progress-message {
  font-size: 0.85rem;
  color: var(--ink);
  font-weight: 700;
  margin-bottom: var(--space-xs);
}

.progress-sub {
  font-size: 0.75rem;
  color: var(--gray);
  font-family: var(--fnr);
}
</style>
