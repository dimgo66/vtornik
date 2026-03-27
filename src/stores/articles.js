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
import { useUIStore } from './ui'

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
        const uiStore = useUIStore()
        uiStore.showError('Не удалось загрузить статьи')
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
      const uiStore = useUIStore()
      try {
        const newArticle = await createArticle(article)
        this.articles.unshift(newArticle)
        uiStore.showSuccess('Статья успешно создана')
        return newArticle
      } catch (error) {
        console.error('Failed to create article:', error)
        uiStore.showError('Не удалось создать статью')
        throw error
      }
    },

    async updateArticle(id, updates) {
      const uiStore = useUIStore()
      try {
        const updated = await updateArticle(id, updates)
        const index = this.articles.findIndex(a => a.id === id)
        if (index !== -1) {
          this.articles[index] = updated
        }
        uiStore.showSuccess('Статья обновлена')
        return updated
      } catch (error) {
        console.error('Failed to update article:', error)
        uiStore.showError('Не удалось обновить статью')
        throw error
      }
    },

    async deleteArticle(id) {
      const uiStore = useUIStore()
      try {
        await deleteArticle(id)
        this.articles = this.articles.filter(a => a.id !== id)
        uiStore.showSuccess('Статья удалена')
      } catch (error) {
        console.error('Failed to delete article:', error)
        uiStore.showError('Не удалось удалить статью')
        throw error
      }
    }
  }
})
