import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Issue from '@/pages/Issue.vue'
import Article from '@/pages/Article.vue'
import Authors from '@/pages/Authors.vue'
import AuthorDetail from '@/pages/AuthorDetail.vue'
import About from '@/pages/About.vue'

// CMS pages
import CMS from '@/pages/cms/CMS.vue'
import CMSIssues from '@/pages/cms/CMSIssues.vue'
import CMSArticles from '@/pages/cms/CMSArticles.vue'
import CMSAuthors from '@/pages/cms/CMSAuthors.vue'
import CMSPrepare from '@/pages/cms/CMSPrepare.vue'
import CMSSpine from '@/pages/cms/CMSSpine.vue'
import CMSMedia from '@/pages/cms/CMSMedia.vue'
import CMSEditor from '@/pages/cms/CMSEditor.vue'
import SimpleEditor from '@/pages/cms/SimpleEditor.vue'
import TestEditor from '@/pages/cms/TestEditor.vue'

const routes = [
  // Main pages
  { path: '/', name: 'home', component: Home },
  { path: '/issue/:id', name: 'issue', component: Issue },
  { path: '/article/:id', name: 'article', component: Article },
  { path: '/authors', name: 'authors', component: Authors },
  { path: '/authors/:id', name: 'author-detail', component: AuthorDetail },
  { path: '/about', name: 'about', component: About },
  
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
  }
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

export default router
