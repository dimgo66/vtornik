import { defineStore } from 'pinia'
import {
  fetchAuthors,
  fetchAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor
} from '@/services/database'
import { useUIStore } from './ui'

export const useAuthorsStore = defineStore('authors', {
  state: () => ({
    authors: [],
    loading: false,
    error: null
  }),

  getters: {
    allAuthors: (state) => state.authors,

    getAuthorById: (state) => (id) => {
      return state.authors.find(author => author.id === id)
    },

    authorsCount: (state) => state.authors.length
  },

  actions: {
    async fetchAuthors() {
      this.loading = true
      this.error = null
      try {
        const authors = await fetchAuthors()
        this.authors = authors
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch authors:', error)
        const uiStore = useUIStore()
        uiStore.showError('Не удалось загрузить авторов')
      } finally {
        this.loading = false
      }
    },

    async addAuthor(author) {
      const uiStore = useUIStore()
      try {
        const newAuthor = await createAuthor(author)
        this.authors.push(newAuthor)
        uiStore.showSuccess('Автор успешно добавлен')
        return newAuthor
      } catch (error) {
        console.error('Failed to create author:', error)
        uiStore.showError('Не удалось добавить автора')
        throw error
      }
    },

    async updateAuthor(id, updates) {
      const uiStore = useUIStore()
      try {
        const updated = await updateAuthor(id, updates)
        const index = this.authors.findIndex(a => a.id === id)
        if (index !== -1) {
          this.authors[index] = updated
        }
        uiStore.showSuccess('Автор обновлён')
        return updated
      } catch (error) {
        console.error('Failed to update author:', error)
        uiStore.showError('Не удалось обновить автора')
        throw error
      }
    },

    async deleteAuthor(id) {
      const uiStore = useUIStore()
      try {
        await deleteAuthor(id)
        this.authors = this.authors.filter(a => a.id !== id)
        uiStore.showSuccess('Автор удалён')
      } catch (error) {
        console.error('Failed to delete author:', error)
        uiStore.showError('Не удалось удалить автора')
        throw error
      }
    }
  }
})
