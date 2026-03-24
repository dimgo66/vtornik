<template>
  <Modal :isOpen="isOpen" @close="close">
    <div class="neu-article-content">
      <button class="neu-article-back" @click="goToIssue">
        ← Назад к номеру
      </button>
      
      <div class="neu-article-tag">{{ article.rubric || article.section }}</div>
      
      <h1 class="neu-article-title">{{ article.title }}</h1>
      
      <p v-if="article.subtitle" class="neu-article-subtitle">{{ article.subtitle }}</p>
      
      <div class="neu-article-byline" @click="openAuthorModal">
        <div class="neu-article-avatar">
          <img v-if="author?.photoUrl" :src="author.photoUrl" :alt="author.name" />
          <span v-else>{{ authorInitial }}</span>
        </div>
        <div>
          <div class="neu-article-avatar-name">{{ author?.name || 'Неизвестный автор' }}</div>
          <div class="neu-article-avatar-tagline">{{ author?.tagline || '' }}</div>
        </div>
      </div>
      
      <div class="neu-article-body" v-html="article.body"></div>
      
      <hr v-if="article.genre" />
      <p v-if="article.genre" class="neu-article-genre">{{ article.genre }}</p>
    </div>
  </Modal>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthorsStore } from '@/stores/authors'
import { useUIStore } from '@/stores/ui'
import Modal from './Modal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  article: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const router = useRouter()
const authorsStore = useAuthorsStore()
const uiStore = useUIStore()

const author = computed(() => {
  if (!props.article.authorId) return null
  return authorsStore.getAuthorById(props.article.authorId)
})

const authorInitial = computed(() => {
  return author.value?.name?.charAt(0) || '?'
})

function close() {
  emit('close')
}

function goToIssue() {
  if (props.article.issueId) {
    router.push(`/issue/${props.article.issueId}`)
  }
  emit('close')
}

function openAuthorModal() {
  if (author.value) {
    uiStore.openAuthorModal(author.value)
  }
}
</script>

<style scoped>
.neu-article-content {
  max-width: var(--article-max);
  margin: 0 auto;
  padding: var(--space-2xl) var(--space-lg);
}

.neu-article-back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.76rem;
  color: var(--neu-text-secondary);
  cursor: pointer;
  margin-bottom: var(--space-lg);
  font-family: var(--fnr);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all var(--transition-fast);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
}

.neu-article-back:hover {
  color: var(--neu-primary);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
}

.neu-article-tag {
  font-family: var(--fnr);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--neu-primary);
  margin-bottom: var(--space-sm);
}

.neu-article-title {
  font-family: var(--fj);
  font-size: 2.1rem;
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: var(--space-xs);
  color: var(--neu-primary);
}

.neu-article-subtitle {
  font-family: var(--fd);
  font-size: 1.05rem;
  font-style: italic;
  color: var(--neu-text-secondary);
  margin-bottom: var(--space-md);
}

.neu-article-byline {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm);
  margin-bottom: var(--space-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-radius: var(--radius-lg);
}

.neu-article-byline:hover {
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
}

.neu-article-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: var(--neu-text-muted);
}

.neu-article-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.neu-article-avatar-name {
  font-family: var(--fj);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--neu-primary);
}

.neu-article-avatar-tagline {
  font-size: 0.75rem;
  color: var(--neu-text-secondary);
}

.neu-article-body {
  font-size: 1rem;
  line-height: 1.88;
  color: var(--neu-text-primary);
}

.neu-article-body :deep(p) {
  margin-bottom: 1.1em;
  text-indent: 1.6em;
}

.neu-article-body :deep(p:first-of-type) {
  text-indent: 0;
}

.neu-article-body :deep(h3) {
  font-family: var(--fj);
  font-size: 1.05rem;
  font-weight: 700;
  margin: 2em 0 0.7em;
  color: var(--neu-primary);
}

.neu-article-body :deep(img) {
  max-width: 100%;
  border-radius: var(--radius-md);
  margin: var(--space-md) 0;
  display: block;
}

.neu-article-body :deep(blockquote) {
  border-left: 3px solid var(--neu-primary);
  padding: var(--space-sm) var(--space-md);
  margin: var(--space-lg) 0;
  font-style: italic;
  color: var(--neu-text-secondary);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
}

.neu-article-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--neu-shadow-dark);
  margin: var(--space-2xl) 0;
}

.neu-article-genre {
  text-align: right;
  font-size: 0.75rem;
  color: var(--neu-text-muted);
  font-style: italic;
}
</style>
