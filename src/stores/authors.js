import { defineStore } from 'pinia'
import { 
  fetchAuthors, 
  fetchAuthorById, 
  createAuthor, 
  updateAuthor, 
  deleteAuthor 
} from '@/services/database'

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
      } finally {
        this.loading = false
      }
    },

    async addAuthor(author) {
      try {
        const newAuthor = await createAuthor(author)
        this.authors.push(newAuthor)
        return newAuthor
      } catch (error) {
        console.error('Failed to create author:', error)
        throw error
      }
    },

    async updateAuthor(id, updates) {
      try {
        const updated = await updateAuthor(id, updates)
        const index = this.authors.findIndex(a => a.id === id)
        if (index !== -1) {
          this.authors[index] = updated
        }
        return updated
      } catch (error) {
        console.error('Failed to update author:', error)
        throw error
      }
    },

    async deleteAuthor(id) {
      try {
        await deleteAuthor(id)
        this.authors = this.authors.filter(a => a.id !== id)
      } catch (error) {
        console.error('Failed to delete author:', error)
        throw error
      }
    }
  }
})
