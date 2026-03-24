<template>
  <article class="neu-issue-card" @click="handleClick">
    <div class="neu-issue-card__cover">
      <!-- Видео обложка -->
      <video 
        v-if="issue.coverVideoUrl" 
        :src="issue.coverVideoUrl" 
        autoplay 
        muted 
        loop 
        playsinline
        class="neu-issue-card__video"
      />
      
      <!-- Изображение обложка -->
      <img 
        v-else-if="issue.coverImageUrl" 
        :src="issue.coverImageUrl" 
        :alt="issueTitle" 
        class="neu-issue-card__image"
      />
      
      <!-- Заглушка если нет обложки -->
      <div v-else class="neu-issue-card__placeholder">
        <span class="neu-issue-card__number">№ {{ issue.num }}</span>
        <span class="neu-issue-card__month">{{ issue.month }} {{ issue.year }}</span>
      </div>
      
      <!-- Логотип -->
      <div class="neu-issue-card__logo">
        <img src="@/assets/images/ВТОРНИК white.svg" alt="ВТОРНИК" class="neu-issue-card__logo-img" />
      </div>
      
      <!-- Номер и тема -->
      <div class="neu-issue-card__overlay">
        <div class="neu-issue-card__number-line">
          <span class="neu-issue-card__number-full">
            № {{ issue.num }} ({{ issue.serial }})
          </span>
          <span class="neu-issue-card__month-full">
            {{ issue.month.toUpperCase() }} {{ issue.year }}
          </span>
        </div>
        <div v-if="issue.theme" class="neu-issue-card__theme">
          {{ issue.theme }}
        </div>
      </div>
    </div>
    <div class="neu-issue-card__info">
      <div class="neu-issue-card__num">Выпуск {{ issue.num }}</div>
      <div class="neu-issue-card__date">{{ issue.month }} {{ issue.year }}</div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  issue: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const issueTitle = computed(() => 
  `ВТОРНИК №${props.issue.num} — ${props.issue.month} ${props.issue.year}`
)

function handleClick() {
  router.push(`/issue/${props.issue.id}`)
}
</script>

<style scoped>
.neu-issue-card {
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
  box-shadow:
    6px 6px 12px var(--neu-shadow-dark),
    -6px -6px 12px var(--neu-shadow-light);
}

.neu-issue-card:hover {
  transform: translateY(-4px);
  box-shadow:
    8px 8px 16px var(--neu-shadow-dark),
    -8px -8px 16px var(--neu-shadow-light);
}

.neu-issue-card__cover {
  aspect-ratio: 3/4;
  overflow: hidden;
  background: linear-gradient(145deg, var(--neu-primary), var(--neu-primary-dark));
  position: relative;
}

.neu-issue-card__video,
.neu-issue-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.neu-issue-card:hover .neu-issue-card__video,
.neu-issue-card:hover .neu-issue-card__image {
  transform: scale(1.05);
}

.neu-issue-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, var(--neu-primary), var(--neu-primary-dark));
  color: rgba(255, 255, 255, 0.7);
  padding: var(--space-md);
  text-align: center;
}

.neu-issue-card__logo {
  position: absolute;
  top: var(--space-md);
  left: var(--space-md);
  right: var(--space-md);
  text-align: center;
  z-index: 5;
  pointer-events: none;
}

.neu-issue-card__logo-img {
  width: 90%;
  max-width: 280px;
  height: auto;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8));
}

.neu-issue-card__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-md);
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.7) 70%, transparent 100%);
  z-index: 5;
  pointer-events: none;
}

.neu-issue-card__number-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-xs);
  margin-bottom: var(--space-xs);
}

.neu-issue-card__number-full {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--neu-accent);
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.neu-issue-card__month-full {
  font-size: 0.65rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  flex: 1;
  text-align: right;
}

.neu-issue-card__theme {
  font-family: var(--fd);
  font-size: 1rem;
  font-style: italic;
  color: #fff;
  text-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.8),
    -2px -2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.3;
}

.neu-issue-card__info {
  padding: var(--space-sm);
}

.neu-issue-card__num {
  font-family: var(--fj);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--neu-primary);
}

.neu-issue-card__date {
  font-size: 0.7rem;
  color: var(--neu-text-secondary);
  margin-top: var(--space-xs);
  font-family: var(--fnr);
}
</style>
