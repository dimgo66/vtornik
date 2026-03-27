/**
 * Аутентификация через PostgREST (без GoTrue)
 * Конфигурация для локальной разработки
 */

// Конфигурация из переменных окружения или значения по умолчанию
const apiBaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:3000'
const jwtSecret = import.meta.env.JWT_SECRET || 'your-super-secret-jwt-token-change-in-production'

/**
 * HTTP запрос к PostgREST API
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token')
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  }

  console.log('API Request:', {
    url: `${apiBaseUrl}${endpoint}`,
    method: options.method || 'GET',
    body: options.body
  })

  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    ...options,
    headers
  })

  console.log('API Response status:', response.status)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    console.error('API Error:', error)
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  const data = await response.json()
  console.log('API Response data:', data)
  return data
}

/**
 * Вход по email/password через RPC функцию login_user
 */
export async function signInWithEmail(email, password) {
  try {
    console.log('Login attempt:', { email, password: '***' })
    
    const result = await apiRequest('/rpc/login_user', {
      method: 'POST',
      body: JSON.stringify({
        email_input: email,
        password_input: password
      })
    })

    console.log('Login result:', result)

    if (!result || result.length === 0) {
      throw new Error('Invalid credentials')
    }

    const { user_id, user_email, user_role, token } = result[0]

    // Сохраняем токен
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify({
      id: user_id,
      email: user_email,
      role: user_role
    }))

    return {
      user: { id: user_id, email: user_email, role: user_role },
      session: {
        access_token: token,
        user: { id: user_id, email: user_email, user_metadata: { role: user_role } }
      }
    }
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

/**
 * Выход из системы
 */
export async function signOut() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
}

/**
 * Текущая сессия пользователя
 */
export async function getCurrentSession() {
  const token = localStorage.getItem('auth_token')
  const userStr = localStorage.getItem('auth_user')
  
  if (!token || !userStr) return null

  try {
    const user = JSON.parse(userStr)
    
    // Проверяем валидность токена (можно расширить проверкой exp)
    return {
      access_token: token,
      user: {
        ...user,
        user_metadata: { role: user.role }
      }
    }
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

/**
 * Текущий пользователь
 */
export async function getCurrentUser() {
  const userStr = localStorage.getItem('auth_user')
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr)
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

/**
 * Подписка на изменения аутентификации (упрощённая)
 */
export function onAuthStateChange(callback) {
  // Эмуляция события входа/выхода через storage
  window.addEventListener('storage', (e) => {
    if (e.key === 'auth_token') {
      const session = e.newValue ? getCurrentSession() : null
      callback(e.newValue ? 'SIGNED_IN' : 'SIGNED_OUT', session)
    }
  })

  // Проверка при загрузке
  setTimeout(async () => {
    const session = await getCurrentSession()
    if (session) {
      callback('SIGNED_IN', session)
    }
  }, 100)

  return { unsubscribe: () => {} }
}

/**
 * Проверка подключения к API
 */
export async function checkSupabaseConnection() {
  try {
    const response = await fetch(`${apiBaseUrl}/issues?limit=1`, {
      headers: { 'Accept': 'application/json' }
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return { connected: true, demo: false }
  } catch (error) {
    console.error('API connection error:', error)
    return { connected: false, demo: false, error }
  }
}

export const supabase = {
  auth: {
    signInWithPassword: signInWithEmail,
    signOut,
    getSession: getCurrentSession,
    getUser: getCurrentUser,
    onAuthStateChange
  },
  from: (table) => ({
    select: async (columns = '*') => {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${apiBaseUrl}/${table}?select=${columns}`, {
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }))
        return { data: null, error }
      }
      return { data: await response.json(), error: null }
    },
    insert: async (data) => {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${apiBaseUrl}/${table}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }))
        return { data: null, error }
      }
      return { data: await response.json(), error: null }
    }
  })
}

export default supabase
