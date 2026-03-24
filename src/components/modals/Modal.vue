<template>
  <Teleport to="body">
    <div 
      class="neu-modal-backdrop" 
      :class="{ 'neu-modal-backdrop--active': isOpen }"
      @click="handleOverlayClick"
    >
      <div class="neu-modal-box" @click.stop>
        <button class="neu-modal-close" @click="close" aria-label="Закрыть">
          ✕
        </button>
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}

function handleOverlayClick() {
  emit('close')
}
</script>

<style scoped>
.neu-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(26, 20, 16, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-normal);
}

.neu-modal-backdrop--active {
  opacity: 1;
  visibility: visible;
}

.neu-modal-box {
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
  border-radius: var(--radius-2xl);
  box-shadow:
    8px 8px 16px rgba(0, 0, 0, 0.15),
    -8px -8px 16px rgba(255, 255, 255, 0.1);
  position: relative;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  transform: translateY(-20px) scale(0.95);
  transition: all var(--transition-normal);
}

.neu-modal-backdrop--active .neu-modal-box {
  transform: translateY(0) scale(1);
}

.neu-modal-close {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
  color: var(--neu-primary);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all var(--transition-fast);
  z-index: 10;
}

.neu-modal-close:hover {
  color: var(--neu-primary-dark);
  box-shadow:
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
}
</style>
