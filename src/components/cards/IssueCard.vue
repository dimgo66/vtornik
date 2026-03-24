<template>
  <article class="neu-issue-card" @click="handleClick">
    <div class="neu-issue-card__cover">
      <CoverPreview
        v-if="issue"
        size="small"
        :cover-video-url="issue.coverVideoUrl"
        :cover-image-url="issue.coverImageUrl"
        :num="issue.num"
        :serial="issue.serial"
        :month="issue.month"
        :year="issue.year"
        :theme="issue.theme"
      />
    </div>
    <div class="neu-issue-card__info">
      <div class="neu-issue-card__num">№ {{ issue.num }} ({{ issue.serial }}) · {{ issue.month }} {{ issue.year }}</div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import CoverPreview from '@/components/ui/CoverPreview.vue'

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
    3px 3px 6px var(--neu-shadow-dark),
    -3px -3px 6px var(--neu-shadow-light);
}

.neu-issue-card:hover {
  transform: translateY(-2px);
  box-shadow:
    4px 4px 8px var(--neu-shadow-dark),
    -4px -4px 8px var(--neu-shadow-light);
}

.neu-issue-card__cover {
  aspect-ratio: 3/4;
  overflow: hidden;
  background: linear-gradient(145deg, var(--neu-primary), var(--neu-primary-dark));
}

.neu-issue-card__info {
  padding: var(--space-sm);
}

.neu-issue-card__num {
  font-family: var(--fj);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--neu-primary);
}
</style>
