<template>
  <div class="about-page">
    <main class="main">
      <div class="container">
        <h1 class="font-journal text-2xl text-cr mb-5">О журнале</h1>
        
        <div class="about-content">
          <section class="mb-5">
            <h2 class="font-journal text-xl text-cr mb-3">ВТОРНИК</h2>
            <p class="font-serif text-lg text-gray mb-4">
              Литературно-художественный журнал
            </p>
            <p class="mb-4">
              «ВТОРНИК» — это независимый литературно-художественный журнал, 
              публикующий прозу, поэзию и эссеистику современных авторов.
            </p>
            <p class="mb-4">
              Мы стремимся создать пространство для качественного литературного 
              высказывания, где каждый текст находит своего читателя.
            </p>
          </section>

          <section class="mb-5">
            <h2 class="font-journal text-xl text-cr mb-3">Выпускаем журналы</h2>
            <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
              <div class="about-card">
                <div class="text-3xl mb-2">📖</div>
                <h3 class="font-bold mb-1">{{ issuesCount }}</h3>
                <p class="text-sm text-gray">Выпусков опубликовано</p>
              </div>
              <div class="about-card">
                <div class="text-3xl mb-2">✍️</div>
                <h3 class="font-bold mb-1">{{ authorsCount }}</h3>
                <p class="text-sm text-gray">Авторов с нами</p>
              </div>
              <div class="about-card">
                <div class="text-3xl mb-2">📄</div>
                <h3 class="font-bold mb-1">{{ articlesCount }}</h3>
                <p class="text-sm text-gray">Публикаций</p>
              </div>
            </div>
          </section>

          <section class="mb-5">
            <h2 class="font-journal text-xl text-cr mb-3">Разделы</h2>
            <ul class="about-list">
              <li>
                <strong class="text-cr">Проза</strong>
                <span class="text-gray">— рассказы, повести, романы</span>
              </li>
              <li>
                <strong class="text-cr">Поэзия</strong>
                <span class="text-gray">— стихотворения, поэмы</span>
              </li>
              <li>
                <strong class="text-cr">Эссе</strong>
                <span class="text-gray">— литературная критика, размышления</span>
              </li>
            </ul>
          </section>

          <section class="mb-5">
            <h2 class="font-journal text-xl text-cr mb-3">Контакты</h2>
            <div class="contact-info">
              <p class="mb-2">
                <strong>Email:</strong> 
                <a href="mailto:info@vtornik.online" class="text-cr">info@vtornik.online</a>
              </p>
              <p class="mb-2">
                <strong>Город:</strong> Москва
              </p>
              <p>
                <strong>Сайт:</strong> 
                <a href="https://vtornik.online" class="text-cr">vtornik.online</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useIssuesStore } from '@/stores/issues'
import { useAuthorsStore } from '@/stores/authors'
import { useArticlesStore } from '@/stores/articles'

const issuesStore = useIssuesStore()
const authorsStore = useAuthorsStore()
const articlesStore = useArticlesStore()

const issuesCount = computed(() => issuesStore.issuesCount)
const authorsCount = computed(() => authorsStore.authorsCount)
const articlesCount = computed(() => articlesStore.articlesCount)
</script>

<style scoped>
.about-card {
  background: var(--warm);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  text-align: center;
  border: 1px solid var(--border);
}

.about-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.about-list li {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}

.contact-info {
  background: var(--warm);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}
</style>
