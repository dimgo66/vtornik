<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="strip strip-cream">
      <div class="container">
        <div class="hero">
          <div class="hero-l">
            <div class="hero-badge">🏆 Свежий номер</div>
            <div class="hero-num">{{ latestIssue ? `№ ${latestIssue.num} (${latestIssue.serial})` : '—' }}</div>
            <div class="hero-theme">«{{ latestIssue?.theme || 'Вторник' }}»</div>
            <div class="hero-desc">
              {{ latestIssue ? `${cap(latestIssue.month)} ${latestIssue.year}` : '' }} · Москва · Издательский дом «Вторник»
              <br>
              <em style="opacity:.6;font-size:.85rem">Толстый зависимый* литературно-художественный журнал</em>
            </div>
            <div class="hero-btns">
              <button v-if="latestIssue" class="btn btn-gold" @click="goToIssue(latestIssue.id)">
                📖 Читать номер
              </button>
              <button class="btn btn-outline" @click="scrollToIssues">
                🗂 Все номера
              </button>
            </div>
          </div>
          <div class="hero-r" :class="{ 'has-vid': latestIssue?.coverVideoUrl }">
            <video v-if="latestIssue?.coverVideoUrl" :src="latestIssue.coverVideoUrl" autoplay muted loop playsinline></video>
            <div v-if="latestIssue?.coverVideoUrl" class="hero-overlay"></div>
            <div v-if="latestIssue?.coverImageUrl" class="hero-cover">
              <img :src="latestIssue.coverImageUrl" :alt="latestIssue.theme" />
            </div>
            
            <!-- Логотип и информация поверх видео/изображения -->
            <div class="hero-branding">
              <img src="@/assets/images/ВТОРНИК white.svg" alt="ВТОРНИК" class="hero-logo" />
              <div class="hero-full-number">№ {{ latestIssue?.num }} ({{ latestIssue?.serial }})</div>
              <div class="hero-issue-info">
                <span class="hero-issue-number">{{ latestIssue?.month?.toUpperCase() }} {{ latestIssue?.year }}</span>
              </div>
              <div v-if="latestIssue?.theme" class="hero-issue-theme">{{ latestIssue.theme }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Issues Section -->
    <section id="issues" class="strip strip-warm">
      <div class="container">
        <div class="sec-hd">
          <span>📚</span>
          <span>Все номера</span>
        </div>
        <div class="issues-grid">
          <IssueCard
            v-for="issue in issues"
            :key="issue.id"
            :issue="issue"
            @click="goToIssue(issue.id)"
          />
        </div>
      </div>
    </section>

    <!-- Articles Section -->
    <section class="strip strip-cream">
      <div class="container">
        <div class="sec-hd">
          <span>📄</span>
          <span>Публикации</span>
        </div>
        <div class="essays-grid">
          <EssayCard
            v-for="article in recentArticles"
            :key="article.id"
            :article="article"
            @click="goToArticle(article.id)"
          />
        </div>
        <div class="text-center" style="margin-top:2rem">
          <button class="btn btn-outline btn-lg" @click="scrollToIssues">
            📂 Архив номеров
          </button>
        </div>
      </div>
    </section>

    <!-- Authors Section -->
    <section class="strip strip-warm">
      <div class="container">
        <div class="sec-hd">
          <span>✍️</span>
          <span>Авторы</span>
        </div>
        <div class="authors-grid">
          <AuthorCard
            v-for="author in authors"
            :key="author.id"
            :author="author"
            @click="goToAuthor(author.id)"
          />
        </div>
        <div class="text-center" style="margin-top:2rem">
          <RouterLink to="/authors" class="btn btn-outline btn-lg">
            👥 Все авторы
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="strip strip-cream">
      <div class="container">
        <div class="about-wrap">
          <div class="about-logo">
            <span class="about-logo-text">ВТОРНИК</span>
            <span class="about-logo-sub">литературно-художественный журнал</span>
          </div>
          <div class="about-text">
            <p>
              <strong>«ВТОРНИК»</strong> — это независимый литературно-художественный журнал, 
              публикующий прозу, поэзию и эссеистику современных авторов.
            </p>
            <p>
              Мы стремимся создать пространство для качественного литературного высказывания, 
              где каждый текст находит своего читателя.
            </p>
          </div>
          <div class="about-stats">
            <div class="stat-item">
              <div class="stat-num">{{ issuesCount }}</div>
              <div class="stat-label">выпусков</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">{{ authorsCount }}</div>
              <div class="stat-label">авторов</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">{{ articlesCount }}</div>
              <div class="stat-label">публикаций</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useIssuesStore } from '@/stores/issues'
import { useArticlesStore } from '@/stores/articles'
import { useAuthorsStore } from '@/stores/authors'
import IssueCard from '@/components/cards/IssueCard.vue'
import EssayCard from '@/components/cards/EssayCard.vue'
import AuthorCard from '@/components/cards/AuthorCard.vue'

const router = useRouter()
const issuesStore = useIssuesStore()
const articlesStore = useArticlesStore()
const authorsStore = useAuthorsStore()

const issues = computed(() => issuesStore.allIssues)
const latestIssue = computed(() => issuesStore.getLatestIssue)
const recentArticles = computed(() => articlesStore.allArticles.slice(0, 6))
const authors = computed(() => authorsStore.allAuthors.slice(0, 4))

const issuesCount = computed(() => issuesStore.issuesCount)
const authorsCount = computed(() => authorsStore.authorsCount)
const articlesCount = computed(() => articlesStore.articlesCount)

onMounted(() => {
  if (issuesStore.issues.length === 0) {
    issuesStore.fetchIssues()
  }
  if (articlesStore.allArticles.length === 0) {
    articlesStore.fetchArticles()
  }
  if (authorsStore.allAuthors.length === 0) {
    authorsStore.fetchAuthors()
  }
})

const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

function goToIssue(id) {
  router.push(`/issue/${id}`)
}

function goToArticle(id) {
  router.push(`/article/${id}`)
}

function goToAuthor(id) {
  router.push(`/authors/${id}`)
}

function scrollToIssues() {
  document.getElementById('issues')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
/* Hero Section */
.hero {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 3rem;
  align-items: center;
  padding: 2rem 0;
}

.hero-l {
  padding: 1rem;
}

.hero-badge {
  display: inline-block;
  background: linear-gradient(135deg, var(--neu-primary), var(--neu-primary-dark));
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.hero-num {
  font-family: var(--fj);
  font-size: 3rem;
  font-weight: 700;
  color: var(--neu-primary);
  line-height: 1;
  margin-bottom: var(--space-sm);
}

.hero-theme {
  font-family: var(--fd);
  font-size: 1.5rem;
  font-style: italic;
  color: var(--neu-text-secondary);
  margin-bottom: var(--space-md);
}

.hero-desc {
  font-size: 0.9rem;
  color: var(--neu-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-lg);
}

.hero-btns {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.hero-r {
  position: relative;
  aspect-ratio: 3/4;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow:
    8px 8px 16px var(--neu-shadow-dark),
    -8px -8px 16px var(--neu-shadow-light);
}

.hero-r.has-vid video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.08) 60%, rgba(0,0,0,0.55) 100%);
}

.hero-cover {
  width: 100%;
  height: 100%;
}

.hero-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Hero Branding */
.hero-branding {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 10%;
  z-index: 10;
  pointer-events: none;
}

.hero-logo {
  width: 80%;
  max-width: 320px;
  height: auto;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8));
  margin-bottom: var(--space-md);
}

.hero-issue-info {
  display: flex;
  gap: var(--space-md);
  align-items: baseline;
  margin-bottom: var(--space-sm);
}

.hero-issue-number {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--neu-accent);
  letter-spacing: 0.05em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.hero-issue-month {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.hero-full-number {
  font-family: var(--fj);
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.9);
  margin-bottom: var(--space-sm);
  letter-spacing: 0.05em;
}

.hero-issue-theme {
  font-family: var(--fd);
  font-size: 1.3rem;
  font-style: italic;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  text-align: center;
  max-width: 80%;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  font-family: var(--fnr);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: var(--radius-lg);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-gold {
  background: linear-gradient(135deg, var(--neu-accent), var(--neu-accent-light));
  color: #fff;
  box-shadow:
    4px 4px 8px rgba(201, 169, 98, 0.3),
    -4px -4px 8px rgba(255, 255, 255, 0.1);
}

.btn-gold:hover {
  transform: translateY(-2px);
  box-shadow:
    6px 6px 12px rgba(201, 169, 98, 0.4),
    -6px -6px 12px rgba(255, 255, 255, 0.15);
}

.btn-outline {
  background: transparent;
  color: var(--neu-text-primary);
  border: 2px solid var(--neu-shadow-dark);
}

.btn-outline:hover {
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-color: var(--neu-primary);
}

.btn-lg {
  padding: var(--space-md) var(--space-lg);
  font-size: 0.85rem;
}

/* Section Header */
.sec-hd {
  font-family: var(--fj);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--neu-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-sm);
  border-bottom: 2px solid var(--neu-primary);
}

.sec-hd::before {
  content: '';
  width: 4px;
  height: 1.1em;
  background: var(--neu-accent);
  border-radius: 2px;
  flex-shrink: 0;
}

/* Grids */
.issues-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--space-md);
}

.essays-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: var(--space-md);
}

.authors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-md);
}

/* About Section */
.about-wrap {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.about-logo {
  margin-bottom: var(--space-lg);
}

.about-logo-text {
  display: block;
  font-family: var(--fj);
  font-size: 3rem;
  font-weight: 700;
  color: var(--neu-primary);
  letter-spacing: 0.1em;
}

.about-logo-sub {
  display: block;
  font-family: var(--fd);
  font-size: 1.1rem;
  font-style: italic;
  color: var(--neu-text-secondary);
  margin-top: var(--space-xs);
}

.about-text {
  margin-bottom: var(--space-xl);
}

.about-text p {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--neu-text-primary);
  margin-bottom: var(--space-md);
}

.about-stats {
  display: flex;
  justify-content: center;
  gap: var(--space-2xl);
  padding: var(--space-lg);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-xl);
  box-shadow:
    inset 4px 4px 8px var(--neu-shadow-dark),
    inset -4px -4px 8px var(--neu-shadow-light);
}

.stat-item {
  text-align: center;
}

.stat-num {
  font-family: var(--fj);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--neu-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--neu-text-secondary);
  font-family: var(--fnr);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: var(--space-xs);
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
  
  .hero-r {
    order: -1;
    max-height: 400px;
  }
  
  .hero-num {
    font-size: 2rem;
  }
  
  .hero-theme {
    font-size: 1.2rem;
  }
  
  .about-stats {
    flex-direction: column;
    gap: var(--space-lg);
  }
  
  .issues-grid,
  .essays-grid,
  .authors-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>
