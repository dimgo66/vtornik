<template>
  <article class="neu-essay-card" @click="handleClick">
    <div class="neu-essay-card__image">
      <img v-if="article.image" :src="article.image" :alt="article.title" />
      <span v-else class="neu-essay-card__placeholder">📄</span>
    </div>
    <div class="neu-essay-card__body">
      <div class="neu-essay-card__cat">{{ article.rubric || article.section }}</div>
      <h3 class="neu-essay-card__title">{{ article.title }}</h3>
      <div class="neu-essay-card__author">{{ authorName }}</div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthorsStore } from '@/stores/authors'

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const authorsStore = useAuthorsStore()

const authorName = computed(() => {
  const author = authorsStore.getAuthorById(props.article.authorId)
  return author ? author.name : 'Неизвестный автор'
})

function handleClick() {
  router.push(`/article/${props.article.id}`)
}
</script>

<style scoped>
.neu-essay-card {
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
  box-shadow:
    6px 6px 12px var(--neu-shadow-dark),
    -6px -6px 12px var(--neu-shadow-light);
}

.neu-essay-card:hover {
  transform: translateY(-4px);
  box-shadow:
    8px 8px 16px var(--neu-shadow-dark),
    -8px -8px 16px var(--neu-shadow-light);
}

.neu-essay-card__image {
  aspect-ratio: 16/9;
  overflow: hidden;
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.neu-essay-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.neu-essay-card__placeholder {
  opacity: 0.5;
}

.neu-essay-card__body {
  padding: var(--space-md);
}

.neu-essay-card__cat {
  font-size: 0.62rem;
  font-family: var(--fnr);
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--neu-primary);
  margin-bottom: var(--space-xs);
}

.neu-essay-card__title {
  font-family: var(--fj);
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: var(--space-xs);
  color: var(--neu-text-primary);
}

.neu-essay-card__author {
  font-size: 0.75rem;
  color: var(--neu-text-secondary);
  font-style: italic;
}
</style>
