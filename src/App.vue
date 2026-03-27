<template>
  <div id="app">
    <template v-if="!isCmsPage">
      <Header />
      <main class="main-content">
        <RouterView />
      </main>
      <Footer />
    </template>
    <template v-else>
      <RouterView />
    </template>
    <ToastNotifications />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import ToastNotifications from '@/components/ui/ToastNotifications.vue'

const route = useRoute()

const isCmsPage = computed(() => {
  return route.path.startsWith('/cms')
})
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
  transition: background 0.5s ease;
}

.main-content {
  flex: 1;
}
</style>
