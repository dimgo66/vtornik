<template>
  <div class="authors-page">
    <main class="main">
      <div class="container">
        <h1 class="font-journal text-2xl text-cr mb-5">Авторы</h1>
        
        <div class="grid-authors">
          <AuthorCard 
            v-for="author in authors" 
            :key="author.id" 
            :author="author" 
          />
        </div>
        
        <div v-if="authors.length === 0" class="text-center text-gray p-5">
          <p>Авторы пока не добавлены</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthorsStore } from '@/stores/authors'
import AuthorCard from '@/components/cards/AuthorCard.vue'

const authorsStore = useAuthorsStore()
const authors = computed(() => authorsStore.allAuthors)
</script>
