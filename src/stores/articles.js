import { defineStore } from 'pinia'
import { 
  fetchArticles, 
  fetchArticleById,
  fetchArticlesByIssue,
  fetchArticlesByAuthor,
  createArticle, 
  updateArticle, 
  deleteArticle 
} from '@/services/database'

export const useArticlesStore = defineStore('articles', {
  state: () => ({
    articles: [],
    loading: false,
    error: null
  }),

  getters: {
    allArticles: (state) => state.articles,
    
    getArticleById: (state) => (id) => {
      return state.articles.find(article => article.id === id)
    },

    getArticlesByIssue: (state) => (issueId) => {
      return state.articles.filter(article => article.issueId === issueId)
    },

    getArticlesByAuthor: (state) => (authorId) => {
      return state.articles.filter(article => article.authorId === authorId)
    },

    articlesCount: (state) => state.articles.length
  },

  actions: {
    async fetchArticles() {
      this.loading = true
      this.error = null
      try {
        const articles = await fetchArticles()
        this.articles = articles
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch articles:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchArticlesByIssue(issueId) {
      try {
        const articles = await fetchArticlesByIssue(issueId)
        return articles
      } catch (error) {
        console.error('Failed to fetch articles by issue:', error)
        throw error
      }
    },

    async fetchArticlesByAuthor(authorId) {
      try {
        const articles = await fetchArticlesByAuthor(authorId)
        return articles
      } catch (error) {
        console.error('Failed to fetch articles by author:', error)
        throw error
      }
    },

    async addArticle(article) {
      try {
        const newArticle = await createArticle(article)
        this.articles.unshift(newArticle)
        return newArticle
      } catch (error) {
        console.error('Failed to create article:', error)
        throw error
      }
    },

    async updateArticle(id, updates) {
      try {
        const updated = await updateArticle(id, updates)
        const index = this.articles.findIndex(a => a.id === id)
        if (index !== -1) {
          this.articles[index] = updated
        }
        return updated
      } catch (error) {
        console.error('Failed to update article:', error)
        throw error
      }
    },

    async deleteArticle(id) {
      try {
        await deleteArticle(id)
        this.articles = this.articles.filter(a => a.id !== id)
      } catch (error) {
        console.error('Failed to delete article:', error)
        throw error
      }
    }
  }
})
