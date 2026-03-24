<template>
  <footer class="neu-footer">
    <div class="neu-footer__inner">
      <div class="neu-footer__section">
        <h4 class="neu-footer__title">Журнал</h4>
        <RouterLink to="/" class="neu-footer__link">Главная</RouterLink>
        <RouterLink to="/authors" class="neu-footer__link">Авторы</RouterLink>
        <RouterLink to="/about" class="neu-footer__link">О журнале</RouterLink>
      </div>
      
      <div class="neu-footer__section">
        <h4 class="neu-footer__title">Разделы</h4>
        <a href="#prose" class="neu-footer__link">Проза</a>
        <a href="#poetry" class="neu-footer__link">Поэзия</a>
        <a href="#essays" class="neu-footer__link">Эссе</a>
      </div>
      
      <div class="neu-footer__section">
        <h4 class="neu-footer__title">CMS</h4>
        <RouterLink to="/cms/issues" class="neu-footer__link">Номера</RouterLink>
        <RouterLink to="/cms/articles" class="neu-footer__link">Статьи</RouterLink>
        <RouterLink to="/cms/authors" class="neu-footer__link">Авторы</RouterLink>
        <RouterLink to="/cms/prepare" class="neu-footer__link">В печать</RouterLink>
      </div>
      
      <div class="neu-footer__section">
        <h4 class="neu-footer__title">Контакты</h4>
        <a href="mailto:info@vtornik.online" class="neu-footer__link">info@vtornik.online</a>
        <span class="neu-footer__link">Москва</span>
        <div class="neu-footer__social">
          <a href="#" class="neu-footer__social-link" title="Telegram">
            <span class="iconify" data-icon="lucide:send"></span>
          </a>
          <a href="#" class="neu-footer__social-link" title="VK">
            <span class="iconify" data-icon="lucide:at-sign"></span>
          </a>
        </div>
      </div>
    </div>
    
    <div class="neu-footer__bottom">
      <p>© {{ currentYear }} Издательский дом «ВТОРНИК». Все права защищены.</p>
      <p class="neu-footer__disclaimer">
        Толстый зависимый* литературно-художественный журнал
      </p>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'

const currentYear = new Date().getFullYear()
</script>

<style scoped>
.neu-footer {
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  color: var(--neu-text-secondary);
  padding: var(--space-2xl) 0 var(--space-md);
  margin-top: auto;
  border-top: 1px solid var(--neu-shadow-dark);
  box-shadow:
    0 -4px 8px var(--neu-shadow-dark),
    0 2px 4px var(--neu-shadow-light);
}

.neu-footer__inner {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-lg);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-xl);
  margin-bottom: var(--space-xl);
}

.neu-footer__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.neu-footer__title {
  font-family: var(--fnr);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--neu-accent);
  margin-bottom: var(--space-xs);
  padding-bottom: var(--space-xs);
  border-bottom: 2px solid var(--neu-accent);
}

.neu-footer__link {
  font-size: 0.85rem;
  color: var(--neu-text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  margin-left: calc(-1 * var(--space-sm));
}

.neu-footer__link:hover {
  color: var(--neu-text-primary);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
}

.neu-footer__social {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

.neu-footer__social-link {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neu-text-primary);
  transition: all var(--transition-fast);
}

.neu-footer__social-link:hover {
  color: var(--neu-primary);
  box-shadow:
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
}

.neu-footer__bottom {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--neu-shadow-dark);
  text-align: center;
}

.neu-footer__bottom p {
  font-size: 0.8rem;
  color: var(--neu-text-muted);
  margin-bottom: var(--space-xs);
}

.neu-footer__disclaimer {
  font-size: 0.7rem;
  font-style: italic;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .neu-footer__inner {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .neu-footer {
    padding: var(--space-xl) 0 var(--space-md);
  }
}

@media (max-width: 480px) {
  .neu-footer__inner {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .neu-footer__social {
    justify-content: center;
  }
}
</style>
