<template>
  <div class="article-page" v-if="article">
    <main class="main">
      <div class="art-wrap container">
        <button class="art-back" @click="goBack">
          ← Назад
        </button>
        
        <div class="art-tag">{{ article.rubric || article.section }}</div>
        
        <h1 class="art-h1">{{ article.title }}</h1>
        
        <h2 v-if="article.subtitle" class="art-h2">{{ article.subtitle }}</h2>
        
        <div class="art-byline" @click="openAuthorModal">
          <div class="art-av">
            <img v-if="author?.photoUrl" :src="author.photoUrl" :alt="author.name" />
            <span v-else class="art-av-n">{{ authorInitial }}</span>
          </div>
          <div>
            <div class="art-av-n">{{ author?.name || 'Неизвестный автор' }}</div>
            <div class="art-av-s">{{ author?.tagline || '' }}</div>
          </div>
        </div>
        
        <div class="art-body" v-html="article.body"></div>
        
        <hr v-if="article.genre" />
        
        <div v-if="article.genre" class="text-right text-xs text-gray">
          {{ article.genre }}
        </div>
      </div>
    </main>

    <!-- Author Modal -->
    <AuthorModal 
      :isOpen="isAuthorModalOpen" 
      :author="selectedAuthor" 
      @close="closeAuthorModal" 
    />
  </div>

  <div v-else class="container text-center p-5">
    <p class="text-gray">Статья не найдена</p>
    <RouterLink to="/" class="btn btn--primary mt-3">На главную</RouterLink>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useArticlesStore } from '@/stores/articles'
import { useAuthorsStore } from '@/stores/authors'
import { useUIStore } from '@/stores/ui'
import AuthorModal from '@/components/modals/AuthorModal.vue'

const route = useRoute()
const router = useRouter()
const articlesStore = useArticlesStore()
const authorsStore = useAuthorsStore()
const uiStore = useUIStore()

const selectedAuthor = ref(null)

const article = computed(() => articlesStore.getArticleById(route.params.id))

const author = computed(() => {
  if (!article.value?.authorId) return null
  return authorsStore.getAuthorById(article.value.authorId)
})

const authorInitial = computed(() => {
  return author.value?.name?.charAt(0) || '?'
})

const isAuthorModalOpen = computed(() => uiStore.isAuthorModalOpen)

function goBack() {
  if (article.value?.issueId) {
    router.push(`/issue/${article.value.issueId}`)
  } else {
    router.back()
  }
}

function openAuthorModal() {
  if (author.value) {
    selectedAuthor.value = author.value
    uiStore.openAuthorModal(author.value)
  }
}

function closeAuthorModal() {
  uiStore.closeAuthorModal()
  selectedAuthor.value = null
}
</script>
