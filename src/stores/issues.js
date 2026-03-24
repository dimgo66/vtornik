import { defineStore } from 'pinia'
import { 
  fetchIssues, 
  fetchIssueById, 
  createIssue, 
  updateIssue, 
  deleteIssue 
} from '@/services/database'

export const useIssuesStore = defineStore('issues', {
  state: () => ({
    issues: [],
    loading: false,
    error: null
  }),

  getters: {
    allIssues: (state) => state.issues,

    getIssueById: (state) => (id) => {
      return state.issues.find(issue => issue.id === id)
    },

    getLatestIssue: (state) => {
      const published = state.issues.filter(issue => issue.status === 'published')
      return published[0] || null
    },

    issuesCount: (state) => state.issues.length
  },

  actions: {
    async fetchIssues() {
      this.loading = true
      this.error = null
      try {
        const issues = await fetchIssues()
        this.issues = issues
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch issues:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchIssueById(id) {
      try {
        const issue = await fetchIssueById(id)
        return issue
      } catch (error) {
        console.error('Failed to fetch issue:', error)
        throw error
      }
    },

    async addIssue(issue) {
      try {
        const newIssue = await createIssue(issue)
        this.issues.unshift(newIssue)
        return newIssue
      } catch (error) {
        console.error('Failed to create issue:', error)
        throw error
      }
    },

    async updateIssue(id, updates) {
      try {
        const updated = await updateIssue(id, updates)
        const index = this.issues.findIndex(i => i.id === id)
        if (index !== -1) {
          this.issues[index] = updated
        }
        return updated
      } catch (error) {
        console.error('Failed to update issue:', error)
        throw error
      }
    },

    async deleteIssue(id) {
      try {
        await deleteIssue(id)
        this.issues = this.issues.filter(i => i.id !== id)
      } catch (error) {
        console.error('Failed to delete issue:', error)
        throw error
      }
    }
  }
})
