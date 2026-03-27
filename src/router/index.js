import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Home from '@/pages/Home.vue'
import Issue from '@/pages/Issue.vue'
import Article from '@/pages/Article.vue'
import Authors from '@/pages/Authors.vue'
import AuthorDetail from '@/pages/AuthorDetail.vue'
import About from '@/pages/About.vue'
import NotFound from '@/pages/NotFound.vue'

// CMS pages (lazy loaded)
const CMS = () => import('@/pages/cms/CMS.vue')
const CMSIssues = () => import('@/pages/cms/CMSIssues.vue')
const CMSArticles = () => import('@/pages/cms/CMSArticles.vue')
const CMSAuthors = () => import('@/pages/cms/CMSAuthors.vue')
const CMSPrepare = () => import('@/pages/cms/CMSPrepare.vue')
const CMSSpine = () => import('@/pages/cms/CMSSpine.vue')
const CMSMedia = () => import('@/pages/cms/CMSMedia.vue')
const CMSEditor = () => import('@/pages/cms/CMSEditor.vue')
const SimpleEditor = () => import('@/pages/cms/SimpleEditor.vue')
const TestEditor = () => import('@/pages/cms/TestEditor.vue')
const CMSLogin = () => import('@/pages/cms/CMSLogin.vue')

const routes = [
  // Main pages
  { path: '/', name: 'home', component: Home },
  { path: '/issue/:id', name: 'issue', component: Issue },
  { path: '/article/:id', name: 'article', component: Article },
  { path: '/authors', name: 'authors', component: Authors },
  { path: '/authors/:id', name: 'author-detail', component: AuthorDetail },
  { path: '/about', name: 'about', component: About },

  // Login page
  { path: '/cms/login', name: 'cms-login', component: CMSLogin },

  // Editor pages (MUST be before /cms to take precedence)
  { path: '/cms/article/new', name: 'cms-article-new', component: CMSEditor },
  { path: '/cms/article/:id/edit', name: 'cms-article-edit', component: CMSEditor },
  { path: '/cms/author/new', name: 'cms-author-new', component: CMSEditor },
  { path: '/cms/author/:id/edit', name: 'cms-author-edit', component: CMSEditor },
  { path: '/cms/issue/new', name: 'cms-issue-new', component: CMSEditor },
  { path: '/cms/issue/:id/edit', name: 'cms-issue-edit', component: CMSEditor },
  { path: '/cms/test/:id', name: 'cms-test', component: TestEditor },

  // CMS pages with children
  {
    path: '/cms',
    name: 'cms',
    component: CMS,
    children: [
      { path: '', redirect: '/cms/issues' },
      { path: 'issues', name: 'cms-issues', component: CMSIssues },
      { path: 'articles', name: 'cms-articles', component: CMSArticles },
      { path: 'authors', name: 'cms-authors', component: CMSAuthors },
      { path: 'media', name: 'cms-media', component: CMSMedia },
      { path: 'prepare', name: 'cms-prepare', component: CMSPrepare },
      { path: 'spine', name: 'cms-spine', component: CMSSpine }
    ]
  },

  // 404 page - MUST be last
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

/**
 * Router guards для защиты CMS маршрутов
 */
router.beforeEach(async (to, from, next) => {
  // Проверяем, требует ли маршрут авторизации
  const requiresAuth = to.path.startsWith('/cms') && to.path !== '/cms/login'
  
  if (requiresAuth) {
    // Получаем auth store
    const authStore = useAuthStore()
    
    // Инициализируем, если ещё не инициализирован
    if (!authStore.initialized) {
      await authStore.init()
    }
    
    // Проверяем сессию
    const isAuthenticated = await authStore.checkSession()
    
    if (!isAuthenticated) {
      // Редирект на страницу входа с сохранением текущего URL
      next({
        name: 'cms-login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }
  
  // Если пользователь авторизован и идёт на /cms/login — редирект на CMS
  if (to.path === '/cms/login') {
    const authStore = useAuthStore()
    if (authStore.isAuthenticated) {
      next('/cms')
      return
    }
  }
  
  next()
})

export default router
