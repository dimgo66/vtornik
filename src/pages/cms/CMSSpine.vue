<template>
  <div class="neu-cms-section">
    <h2 class="neu-cms-section-title">Калькулятор корешка</h2>
    
    <div class="neu-spine-calculator">
      <!-- Calculator Card -->
      <div class="neu-cms-card neu-spine-card">
        <div class="neu-spine-header">
          <div>
            <div class="neu-spine-label">Толщина корешка</div>
            <div class="neu-spine-value">{{ spineThickness }} мм</div>
            <div class="neu-spine-info">{{ pages }} полос · {{ paperName }}</div>
          </div>
          <div class="neu-spine-visual">
            <div class="neu-spine-visual-inner">
              <div class="neu-spine-visual-cover"></div>
              <div class="neu-spine-visual-block" :style="{ minWidth: spineVisualWidth + 'px' }"></div>
              <div class="neu-spine-visual-cover neu-spine-visual-cover--back"></div>
            </div>
            <div class="neu-spine-mm">{{ spineThickness }} мм</div>
          </div>
        </div>

        <div class="neu-spine-controls">
          <div class="neu-spine-control">
            <label class="neu-spine-control-label">Количество полос</label>
            <div class="neu-spine-input-group">
              <input 
                v-model.number="pages" 
                type="number" 
                min="8" 
                max="500" 
                step="2"
                class="neu-cms-input"
              />
              <span class="neu-spine-input-suffix">полос</span>
            </div>
          </div>

          <div class="neu-spine-control">
            <label class="neu-spine-control-label">Тип бумаги</label>
            <select v-model="paperThickness" class="neu-cms-input">
              <option :value="0.07">Офсет 60 г/м² (0,07 мм)</option>
              <option :value="0.08" selected>Мелованная 90 г/м² (0,08 мм)</option>
              <option :value="0.09">Мелованная 115 г/м² (0,09 мм)</option>
              <option :value="0.10">Мелованная 150 г/м² (0,10 мм)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Result Card -->
      <div class="neu-cms-card neu-spine-result">
        <h3 class="neu-cms-card-title">Результат для типографии</h3>
        <div class="neu-spine-result-list">
          <div class="neu-result-row">
            <span class="neu-result-label">Ширина корешка:</span>
            <span class="neu-result-value neu-result-value--cr">{{ spineThickness }} мм</span>
          </div>
          <div class="neu-result-row">
            <span class="neu-result-label">Формат обложки (разворот):</span>
            <span class="neu-result-value">{{ coverWidth }} × 216 мм</span>
          </div>
          <div class="neu-result-row">
            <span class="neu-result-label">Переплёт:</span>
            <span class="neu-result-value">{{ bindingType }}</span>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="neu-cms-card neu-spine-table-wrap">
        <h3 class="neu-cms-card-title">Таблица корешков (мм)</h3>
        <div class="neu-table-scroll">
          <table class="neu-cms-table neu-spine-table">
            <thead>
              <tr>
                <th>Полос</th>
                <th>60 г</th>
                <th>90 г</th>
                <th>115 г</th>
                <th>150 г</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in [48,64,80,96,112,128,144,160,176,192,224]" :key="p">
                <td class="neu-spine-table-num">{{ p }}</td>
                <td>{{ (p * 0.07).toFixed(1) }}</td>
                <td>{{ (p * 0.08).toFixed(1) }}</td>
                <td>{{ (p * 0.09).toFixed(1) }}</td>
                <td>{{ (p * 0.10).toFixed(1) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Info Card -->
      <div class="neu-cms-card neu-spine-info-card">
        <p class="neu-spine-info-text">
          <strong>Примечание:</strong> количество полос рассчитывается автоматически по объёму текста 
          (~220 слов = 1 полоса А5). Метки обрезки 3 мм включены. Шрифты встроены.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const pages = ref(130)
const paperThickness = ref(0.08)

const paperNames = {
  0.07: 'Офсет 60 г/м²',
  0.08: 'Мелованная 90 г/м²',
  0.09: 'Мелованная 115 г/м²',
  0.10: 'Мелованная 150 г/м²'
}

const spineThickness = computed(() => {
  return (pages.value * paperThickness.value).toFixed(1)
})

const paperName = computed(() => {
  return paperNames[paperThickness.value]
})

const coverWidth = computed(() => {
  return (148 * 2 + parseFloat(spineThickness.value) + 6).toFixed(1)
})

const bindingType = computed(() => {
  if (pages.value <= 64) return 'Скрепка'
  if (pages.value <= 128) return 'КБС (клеевое бесшвейное)'
  return 'КБС или швейное'
})

const spineVisualWidth = computed(() => {
  return Math.max(4, Math.min(90, parseFloat(spineThickness.value) * 2))
})
</script>

<style scoped>
.neu-spine-calculator {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  max-width: 800px;
}

.neu-cms-card {
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  box-shadow:
    6px 6px 12px rgba(0, 0, 0, 0.1),
    -6px -6px 12px rgba(255, 255, 255, 0.1);
}

.neu-cms-card-title {
  font-family: var(--fj);
  font-size: 1rem;
  font-weight: 700;
  color: var(--neu-primary);
  margin-bottom: var(--space-md);
}

.neu-spine-card {
  background: linear-gradient(135deg, var(--sand), var(--paper));
}

.neu-spine-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-lg);
  align-items: center;
  margin-bottom: var(--space-lg);
}

.neu-spine-label {
  font-family: var(--fnr);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: var(--space-xs);
}

.neu-spine-value {
  font-family: var(--fj);
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--neu-primary);
  line-height: 1;
}

.neu-spine-info {
  font-size: 0.78rem;
  color: var(--neu-text-secondary);
  margin-top: var(--space-xs);
}

.neu-spine-visual {
  text-align: center;
}

.neu-spine-visual-inner {
  display: flex;
  align-items: stretch;
  height: 80px;
  gap: 2px;
  justify-content: center;
}

.neu-spine-visual-cover {
  width: 22px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 3px 0 0 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.45rem;
  writing-mode: vertical-rl;
  color: var(--neu-primary);
}

.neu-spine-visual-cover--back {
  border-radius: 0 3px 3px 0;
  background: rgba(122, 21, 21, 0.15);
}

.neu-spine-visual-block {
  background: rgba(122, 21, 21, 0.08);
  border: 1px solid rgba(122, 21, 21, 0.25);
  min-width: 8px;
  transition: min-width 0.4s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5rem;
  color: var(--neu-primary);
}

.neu-spine-mm {
  font-size: 0.68rem;
  color: var(--neu-text-secondary);
  margin-top: var(--space-xs);
}

.neu-spine-controls {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.neu-spine-control {
  flex: 1;
  min-width: 200px;
}

.neu-spine-control-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.neu-spine-input-group {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.neu-spine-input-suffix {
  font-size: 0.85rem;
  color: var(--neu-text-secondary);
}

.neu-spine-result-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.neu-result-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--neu-shadow-dark);
}

.neu-result-row:last-child {
  border-bottom: none;
}

.neu-result-label {
  color: var(--neu-text-secondary);
  font-size: 0.9rem;
}

.neu-result-value {
  font-weight: 700;
  color: var(--neu-text-primary);
}

.neu-result-value--cr {
  color: var(--neu-primary);
  font-size: 1.1rem;
}

.neu-spine-table-wrap {
  overflow-x: auto;
}

.neu-table-scroll {
  overflow-x: auto;
}

.neu-spine-table {
  width: 100%;
  font-size: 0.8rem;
  white-space: nowrap;
}

.neu-spine-table th,
.neu-spine-table td {
  padding: var(--space-xs) var(--space-sm);
  text-align: center;
  border-bottom: 1px solid var(--neu-shadow-dark);
}

.neu-spine-table th {
  font-weight: 700;
  text-align: center;
}

.neu-spine-table-num {
  font-weight: 700;
  color: var(--neu-primary);
  text-align: left;
}

.neu-spine-info-card {
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
}

.neu-spine-info-text {
  font-size: 0.85rem;
  color: var(--neu-text-secondary);
  line-height: 1.6;
}

@media (max-width: 640px) {
  .neu-spine-header {
    grid-template-columns: 1fr;
  }
  
  .neu-spine-controls {
    flex-direction: column;
  }
}
</style>
