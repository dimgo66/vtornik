<template>
  <Modal :isOpen="isOpen" @close="close">
    <div class="neu-author-modal">
      <div class="neu-author-modal__head">
        <div class="neu-author-modal__photo">
          <img v-if="author.photoUrl" :src="author.photoUrl" :alt="author.name" />
          <div v-else class="neu-author-modal__photo-placeholder">👤</div>
        </div>
        <div class="neu-author-modal__info">
          <h2 class="neu-author-modal__name">{{ author.name }}</h2>
          <p class="neu-author-modal__tagline">{{ author.tagline }}</p>
        </div>
        <button class="neu-modal-close" @click="close" aria-label="Закрыть">✕</button>
      </div>
      <div class="neu-author-modal__body">
        <p class="neu-author-modal__bio">{{ author.bio }}</p>
        
        <h3 class="neu-author-modal__articles-title">Публикации:</h3>
        <ul class="neu-author-modal__articles">
          <li 
            v-for="article in authorArticles" 
            :key="article.id"
            class="neu-author-modal__article-item"
            @click="selectArticle(article)"
          >
            <span class="neu-author-modal__article-rubric">{{ article.rubric }}</span>
            <div class="neu-author-modal__article-title">{{ article.title }}</div>
          </li>
        </ul>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useArticlesStore } from '@/stores/articles'
import Modal from './Modal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  author: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const router = useRouter()
const articlesStore = useArticlesStore()

const authorArticles = computed(() => {
  if (!props.author.id) return []
  return articlesStore.getArticlesByAuthor(props.author.id)
})

function close() {
  emit('close')
}

function selectArticle(article) {
  router.push(`/article/${article.id}`)
  emit('close')
}
</script>

<style scoped>
.neu-author-modal {
  overflow: hidden;
}

.neu-author-modal__head {
  display: grid;
  grid-template-columns: 140px 1fr;
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  min-height: 160px;
  border-bottom: 1px solid var(--neu-shadow-dark);
  position: relative;
}

.neu-author-modal__photo {
  overflow: hidden;
  display: flex;
  align-items: stretch;
}

.neu-author-modal__photo img {
  width: 100%;
  object-fit: cover;
}

.neu-author-modal__photo-placeholder {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  opacity: 0.4;
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
}

.neu-author-modal__info {
  padding: var(--space-lg);
  color: var(--neu-text-primary);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.neu-author-modal__name {
  font-family: var(--fj);
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: var(--space-xs);
  color: var(--neu-primary);
}

.neu-author-modal__tagline {
  font-size: 0.85rem;
  color: var(--neu-text-secondary);
  font-style: italic;
  margin-bottom: var(--space-sm);
}

.neu-author-modal__body {
  padding: var(--space-lg);
}

.neu-author-modal__bio {
  color: var(--neu-text-secondary);
  margin-bottom: var(--space-lg);
  line-height: 1.6;
}

.neu-author-modal__articles-title {
  font-family: var(--fj);
  font-size: 1rem;
  font-weight: 700;
  color: var(--neu-primary);
  margin-bottom: var(--space-md);
}

.neu-author-modal__articles {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  list-style: none;
  padding: 0;
  margin: 0;
}

.neu-author-modal__article-item {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.neu-author-modal__article-item:hover {
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
}

.neu-author-modal__article-rubric {
  font-size: 0.68rem;
  font-family: var(--fnr);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--neu-primary);
}

.neu-author-modal__article-title {
  font-family: var(--fj);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--neu-text-primary);
  margin-top: var(--space-xs);
}
</style>
