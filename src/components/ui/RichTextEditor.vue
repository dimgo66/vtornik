<template>
  <div class="neu-rte">
    <textarea 
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="neu-rte-textarea"
      :disabled="disabled"
      :style="{ height: height + 'px' }"
    ></textarea>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  height: {
    type: Number,
    default: 400
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.neu-rte-textarea {
  width: 100%;
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  border: none;
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
  color: var(--neu-text-primary);
  font-family: 'PT Serif', Georgia, serif;
  font-size: 16px;
  line-height: 1.8;
  resize: vertical;
  transition: all var(--transition-fast);
}

.neu-rte-textarea:focus {
  outline: none;
  box-shadow:
    inset 4px 4px 8px var(--neu-shadow-dark),
    inset -4px -4px 8px var(--neu-shadow-light);
}

.neu-rte-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
