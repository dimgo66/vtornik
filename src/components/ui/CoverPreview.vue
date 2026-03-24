<template>
  <div class="neu-cover" :class="{ 'neu-cover--with-theme': theme, 'neu-cover--small': size === 'small' }">
    <!-- Видео обложка -->
    <video
      v-show="coverVideoUrl"
      :key="coverVideoUrl"
      :src="coverVideoUrl"
      autoplay
      muted
      loop
      playsinline
      class="neu-cover__media"
    />

    <!-- Изображение обложка -->
    <img
      v-show="!coverVideoUrl && coverImageUrl"
      :src="coverImageUrl"
      alt="Обложка"
      class="neu-cover__media"
    />

    <!-- Заглушка если нет обложки -->
    <div v-show="!coverVideoUrl && !coverImageUrl" class="neu-cover__placeholder">
      <span>Загрузите видео или изображение</span>
    </div>

    <!-- Логотип -->
    <div class="neu-cover__logo">
      <img src="@/assets/images/ВТОРНИК white.svg" alt="ВТОРНИК" class="neu-cover__logo-img" />
    </div>

    <!-- Номер и дата -->
    <div class="neu-cover__number-date">
      <span class="neu-cover__number">№ {{ num }} ({{ serial }})</span>
      <span class="neu-cover__date">{{ month?.toUpperCase() }} {{ year }}</span>
    </div>

    <!-- Тема -->
    <div v-if="theme" class="neu-cover__theme">
      {{ theme }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  coverVideoUrl: {
    type: String,
    default: ''
  },
  coverImageUrl: {
    type: String,
    default: ''
  },
  num: {
    type: [String, Number],
    default: 'X'
  },
  serial: {
    type: [String, Number],
    default: 'XXX'
  },
  month: {
    type: String,
    default: 'МЕСЯЦ'
  },
  year: {
    type: [String, Number],
    default: 'ГОД'
  },
  theme: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'normal',
    validator: (value) => ['normal', 'small'].includes(value)
  }
})
</script>

<style scoped>
.neu-cover {
  position: relative;
  aspect-ratio: 3/4;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow:
    8px 8px 16px var(--neu-shadow-dark),
    -8px -8px 16px var(--neu-shadow-light);
}

.neu-cover__media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.neu-cover__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  color: var(--neu-text-muted);
  font-size: 0.9rem;
}

/* Логотип */
.neu-cover__logo {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 10;
  pointer-events: none;
  transform: translateY(5%);
}

.neu-cover__logo-img {
  width: 100%;
  height: auto;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8));
}

/* Номер и дата */
.neu-cover__number-date {
  position: absolute;
  top: 3%;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 10;
  pointer-events: none;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--space-md);
}

.neu-cover__number {
  font-family: var(--fj);
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  font-weight: 700;
  color: #fff;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.9);
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.neu-cover__date {
  font-family: var(--fj);
  font-size: clamp(0.7rem, 1.8vw, 0.85rem);
  font-weight: 700;
  color: #fff;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.9);
  letter-spacing: 0.05em;
}

/* Тема */
.neu-cover__theme {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-sm);
  font-family: var(--fd);
  font-size: clamp(0.9rem, 2vw, 1.3rem);
  font-style: italic;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  text-align: center;
  background: linear-gradient(to top, rgba(28, 20, 16, 0.85) 0%, rgba(28, 20, 16, 0.4) 50%, transparent 100%);
  z-index: 10;
  pointer-events: none;
}

/* Маленький размер для карточек */
.neu-cover--small .neu-cover__number {
  font-size: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
}

.neu-cover--small .neu-cover__date {
  font-size: 0.4rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
}

.neu-cover--small .neu-cover__theme {
  font-size: 0.9rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
  background: linear-gradient(to top, rgba(28, 20, 16, 0.85) 0%, rgba(28, 20, 16, 0.4) 50%, transparent 100%);
}
</style>
