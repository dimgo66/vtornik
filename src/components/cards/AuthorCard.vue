<template>
  <article class="neu-author-card" @click="handleClick">
    <div class="neu-author-card__photo">
      <img v-if="author.photoUrl" :src="author.photoUrl" :alt="author.name" />
      <span v-else class="neu-author-card__placeholder">👤</span>
    </div>
    <div class="neu-author-card__info">
      <h3 class="neu-author-card__name">{{ author.name }}</h3>
      <p class="neu-author-card__tagline">{{ author.tagline }}</p>
      <div class="neu-author-card__count">{{ articlesCount }} публикаций</div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useArticlesStore } from '@/stores/articles'

const props = defineProps({
  author: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const articlesStore = useArticlesStore()

const articlesCount = computed(() => {
  return articlesStore.getArticlesByAuthor(props.author.id).length
})

function handleClick() {
  router.push(`/authors/${props.author.id}`)
}
</script>

<style scoped>
.neu-author-card {
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
  box-shadow:
    6px 6px 12px var(--neu-shadow-dark),
    -6px -6px 12px var(--neu-shadow-light);
}

.neu-author-card:hover {
  transform: translateY(-4px);
  box-shadow:
    8px 8px 16px var(--neu-shadow-dark),
    -8px -8px 16px var(--neu-shadow-light);
}

.neu-author-card__photo {
  aspect-ratio: 1;
  overflow: hidden;
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
}

.neu-author-card__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.neu-author-card__placeholder {
  opacity: 0.4;
}

.neu-author-card__info {
  padding: var(--space-md);
}

.neu-author-card__name {
  font-family: var(--fj);
  font-size: 1rem;
  font-weight: 700;
  color: var(--neu-primary);
  margin-bottom: var(--space-xs);
}

.neu-author-card__tagline {
  font-size: 0.75rem;
  color: var(--neu-text-secondary);
  font-style: italic;
  margin-bottom: var(--space-sm);
}

.neu-author-card__count {
  font-size: 0.68rem;
  color: var(--neu-text-muted);
  font-family: var(--fnr);
}
</style>
