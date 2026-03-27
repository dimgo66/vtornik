<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['toast', `toast--${notification.type}`]"
      >
        <span class="toast-icon">{{ getIcon(notification.type) }}</span>
        <span class="toast-message">{{ notification.message }}</span>
        <button class="toast-close" @click="removeNotification(notification.id)">
          ✕
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
const notifications = computed(() => uiStore.notifications)

function removeNotification(id) {
  uiStore.removeNotification(id)
}

function getIcon(type) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[type] || icons.info
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: var(--space-md);
  right: var(--space-md);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-lg);
  box-shadow:
    4px 4px 8px rgba(0, 0, 0, 0.15),
    -4px -4px 8px rgba(255, 255, 255, 0.1);
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
  border-left: 4px solid;
  min-width: 280px;
  max-width: 400px;
  pointer-events: auto;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast--success {
  border-left-color: #4caf50;
}

.toast--success .toast-icon {
  color: #4caf50;
}

.toast--error {
  border-left-color: #f44336;
}

.toast--error .toast-icon {
  color: #f44336;
}

.toast--warning {
  border-left-color: #ff9800;
}

.toast--warning .toast-icon {
  color: #ff9800;
}

.toast--info {
  border-left-color: #2196f3;
}

.toast--info .toast-icon {
  color: #2196f3;
}

.toast-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 0.9rem;
  color: var(--neu-text-primary);
  line-height: 1.4;
}

.toast-close {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: var(--neu-text-muted);
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.toast-close:hover {
  background: var(--neu-shadow-dark);
  color: var(--neu-text-primary);
}

/* Transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Mobile */
@media (max-width: 768px) {
  .toast-container {
    top: auto;
    bottom: var(--space-md);
    left: var(--space-md);
    right: var(--space-md);
  }

  .toast {
    min-width: auto;
    max-width: none;
  }
}
</style>
