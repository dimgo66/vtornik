<template>
  <div class="author-detail-page" v-if="author">
    <main class="main">
      <div class="container">
        <!-- Author Header -->
        <div class="author-header mb-5">
          <div class="flex items-center gap-4 mb-4">
            <div class="author-photo">
              <img v-if="author.photoUrl" :src="author.photoUrl" :alt="author.name" />
              <div v-else class="author-photo-placeholder">👤</div>
            </div>
            <div>
              <h1 class="font-journal text-2xl text-cr">{{ author.name }}</h1>
              <p class="font-serif text-gray">{{ author.tagline }}</p>
            </div>
          </div>
          
          <p class="text-gray">{{ author.bio }}</p>
        </div>

        <!-- Articles Section -->
        <h2 class="section-header">Публикации автора</h2>
        
        <div v-if="authorArticles.length > 0" class="grid-essays">
          <EssayCard 
            v-for="article in authorArticles" 
            :key="article.id" 
            :article="article" 
          />
        </div>
        
        <div v-else class="text-center text-gray p-5">
          <p>У этого автора пока нет публикаций</p>
        </div>
      </div>
    </main>
  </div>

  <div v-else class="container text-center p-5">
    <p class="text-gray">Автор не найден</p>
    <RouterLink to="/authors" class="btn btn--primary mt-3">К списку авторов</RouterLink>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAuthorsStore } from '@/stores/authors'
import { useArticlesStore } from '@/stores/articles'
import EssayCard from '@/components/cards/EssayCard.vue'

const route = useRoute()
const authorsStore = useAuthorsStore()
const articlesStore = useArticlesStore()

const author = computed(() => authorsStore.getAuthorById(route.params.id))
const authorArticles = computed(() => {
  if (!author.value) return []
  return articlesStore.getArticlesByAuthor(author.value.id)
})
</script>

<style scoped>
.author-photo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--paper);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: var(--lgray);
  flex-shrink: 0;
}

.author-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
