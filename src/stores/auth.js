/**
 * Auth Store — управление аутентификацией
 */

import { defineStore } from 'pinia'
import {
  supabase,
  getCurrentSession,
  getCurrentUser,
  signInWithEmail,
  signOut,
  onAuthStateChange
} from '@/services/supabase'
import { useUIStore } from './ui'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    loading: false,
    error: null,
    initialized: false
  }),

  getters: {
    /**
     * Авторизован ли пользователь
     */
    isAuthenticated: (state) => !!state.session,

    /**
     * Email текущего пользователя
     */
    userEmail: (state) => state.user?.email || null,

    /**
     * ID текущего пользователя
     */
    userId: (state) => state.user?.id || null,

    /**
     * Проверка на администратора
     */
    isAdmin: (state) => {
      // Можно расширить проверкой метаданных пользователя
      return state.user?.user_metadata?.role === 'admin'
    }
  },

  actions: {
    /**
     * Инициализация аутентификации
     * Вызывается при загрузке приложения
     */
    async init() {
      if (this.initialized) return

      this.loading = true
      this.error = null

      try {
        // Получаем текущую сессию
        this.session = await getCurrentSession()
        
        if (this.session) {
          this.user = await getCurrentUser()
        }

        // Подписываемся на изменения аутентификации
        onAuthStateChange((event, session) => {
          this.session = session
          this.user = session?.user ?? null

          const uiStore = useUIStore()
          
          switch (event) {
            case 'SIGNED_IN':
              uiStore.showSuccess('Вход выполнен')
              break
            case 'SIGNED_OUT':
              uiStore.showInfo('Выход выполнен')
              break
            case 'TOKEN_REFRESHED':
              // Тихое обновление токена
              break
            case 'USER_UPDATED':
              uiStore.showInfo('Данные пользователя обновлены')
              break
          }
        })

        this.initialized = true
      } catch (error) {
        console.error('Auth init error:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * Вход по email/password
     */
    async login(email, password) {
      this.loading = true
      this.error = null
      const uiStore = useUIStore()

      try {
        console.log('Auth store login called with:', { email })
        const { user, session } = await signInWithEmail(email, password)
        console.log('Auth store login success:', { user, session })

        this.user = user
        this.session = session

        uiStore.showSuccess('Вход выполнен успешно')
        return { success: true }
      } catch (error) {
        console.error('Login error:', error)
        this.error = error.message

        let message = 'Ошибка входа'
        if (error.message.includes('Invalid login credentials')) {
          message = 'Неверный email или пароль'
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Email не подтверждён'
        }

        uiStore.showError(message)
        return { success: false, error: message }
      } finally {
        console.log('Auth store login finally, loading = false')
        this.loading = false
      }
    },

    /**
     * Выход из системы
     */
    async logout() {
      const uiStore = useUIStore()
      
      try {
        await signOut()
        this.user = null
        this.session = null
        return { success: true }
      } catch (error) {
        console.error('Logout error:', error)
        uiStore.showError('Ошибка выхода')
        return { success: false, error: error.message }
      }
    },

    /**
     * Проверка сессии (для router guards)
     */
    async checkSession() {
      if (!this.initialized) {
        await this.init()
      }
      return !!this.session
    },

    /**
     * Очистка состояния
     */
    reset() {
      this.user = null
      this.session = null
      this.error = null
      this.loading = false
    }
  }
})
