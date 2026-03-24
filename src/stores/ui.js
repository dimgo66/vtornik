import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    modals: {
      article: { open: false, data: null },
      author: { open: false, data: null }
    },
    notifications: [],
    sidebarOpen: false
  }),

  getters: {
    isArticleModalOpen: (state) => state.modals.article.open,
    isAuthorModalOpen: (state) => state.modals.author.open
  },

  actions: {
    openArticleModal(article) {
      this.modals.article = { open: true, data: article }
    },

    closeArticleModal() {
      this.modals.article = { open: false, data: null }
    },

    openAuthorModal(author) {
      this.modals.author = { open: true, data: author }
    },

    closeAuthorModal() {
      this.modals.author = { open: false, data: null }
    },

    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },

    closeSidebar() {
      this.sidebarOpen = false
    },

    showNotification(message, type = 'info') {
      const id = Date.now()
      this.notifications.push({ id, message, type })
      setTimeout(() => {
        this.removeNotification(id)
      }, 3000)
    },

    removeNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id)
    }
  }
})
