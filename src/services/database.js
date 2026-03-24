// Конфигурация для локального PostgREST (без JWT)
const API_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:3004'

// Прямой fetch для локальной разработки
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers
    }
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || response.statusText)
  }
  
  return response.json()
}

/**
 * Проверка подключения к БД
 */
export async function checkDatabaseConnection() {
  try {
    const data = await apiRequest('/issues?select=count')
    return { connected: true, demo: false }
  } catch (error) {
    console.error('Database connection error:', error)
    return { connected: false, demo: false, error }
  }
}

// ══════════════════════════════════════════════════
//  ISSUES (Номера журнала)
// ══════════════════════════════════════════════════

export async function fetchIssues() {
  const data = await apiRequest('/issues?select=*&order=year.desc,serial.desc')
  return data.map(issue => ({
    ...issue,
    coverImageUrl: issue.cover_image_url,
    coverVideoUrl: issue.cover_video_url,
    status: issue.status || 'draft'
  }))
}

export async function fetchIssueById(id) {
  const data = await apiRequest(`/issues?id=eq.${id}`)
  const issue = data[0]
  if (!issue) return null
  return {
    ...issue,
    coverImageUrl: issue.cover_image_url,
    coverVideoUrl: issue.cover_video_url
  }
}

export async function createIssue(issue) {
  const dbIssue = {
    num: issue.num,
    serial: issue.serial,
    month: issue.month,
    year: issue.year,
    theme: issue.theme,
    editor: issue.editor,
    description: issue.description,
    cover_image_url: issue.coverImageUrl,
    cover_video_url: issue.coverVideoUrl,
    status: issue.status || 'draft'
  }
  const data = await apiRequest('/issues', {
    method: 'POST',
    body: JSON.stringify(dbIssue)
  })
  return data[0]
}

export async function updateIssue(id, updates) {
  const dbUpdates = {}
  if (updates.num !== undefined) dbUpdates.num = updates.num
  if (updates.serial !== undefined) dbUpdates.serial = updates.serial
  if (updates.month !== undefined) dbUpdates.month = updates.month
  if (updates.year !== undefined) dbUpdates.year = updates.year
  if (updates.theme !== undefined) dbUpdates.theme = updates.theme
  if (updates.editor !== undefined) dbUpdates.editor = updates.editor
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.coverImageUrl !== undefined) dbUpdates.cover_image_url = updates.coverImageUrl
  if (updates.coverVideoUrl !== undefined) dbUpdates.cover_video_url = updates.coverVideoUrl
  if (updates.status !== undefined) dbUpdates.status = updates.status

  const data = await apiRequest(`/issues?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dbUpdates)
  })
  return data[0]
}

export async function deleteIssue(id) {
  await apiRequest(`/issues?id=eq.${id}`, { method: 'DELETE' })
  return true
}

// ══════════════════════════════════════════════════
//  AUTHORS (Авторы)
// ══════════════════════════════════════════════════

export async function fetchAuthors() {
  return apiRequest('/authors?select=*&order=name.asc')
}

export async function fetchAuthorById(id) {
  const data = await apiRequest(`/authors?id=eq.${id}`)
  return data[0] || null
}

export async function createAuthor(author) {
  const data = await apiRequest('/authors', {
    method: 'POST',
    body: JSON.stringify(author)
  })
  return data[0]
}

export async function updateAuthor(id, updates) {
  const data = await apiRequest(`/authors?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  })
  return data[0]
}

export async function deleteAuthor(id) {
  await apiRequest(`/authors?id=eq.${id}`, { method: 'DELETE' })
  return true
}

// ══════════════════════════════════════════════════
//  ARTICLES (Статьи)
// ══════════════════════════════════════════════════

export async function fetchArticles() {
  return apiRequest('/articles?select=*,authors(name),issues(num,serial)&order=created_at.desc')
}

export async function fetchArticleById(id) {
  const data = await apiRequest(`/articles?id=eq.${id}`)
  return data[0] || null
}

export async function createArticle(article) {
  const dbArticle = {
    title: article.title,
    subtitle: article.subtitle,
    body: article.body,
    author_id: article.authorId,
    issue_id: article.issueId,
    section_id: article.section,
    rubric: article.rubric,
    genre_id: article.genreId,
    custom_genre: article.customGenre,
    sort_order: article.sortOrder
  }
  const data = await apiRequest('/articles', {
    method: 'POST',
    body: JSON.stringify(dbArticle)
  })
  return data[0]
}

export async function updateArticle(id, updates) {
  const dbUpdates = {}
  if (updates.title !== undefined) dbUpdates.title = updates.title
  if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle
  if (updates.body !== undefined) dbUpdates.body = updates.body
  if (updates.authorId !== undefined) dbUpdates.author_id = updates.authorId
  if (updates.issueId !== undefined) dbUpdates.issue_id = updates.issueId
  if (updates.section !== undefined) dbUpdates.section_id = updates.section
  if (updates.rubric !== undefined) dbUpdates.rubric = updates.rubric
  if (updates.genre !== undefined) dbUpdates.genre_id = updates.genre
  if (updates.customGenre !== undefined) dbUpdates.custom_genre = updates.customGenre
  if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder
  
  const data = await apiRequest(`/articles?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dbUpdates)
  })
  return data[0]
}

export async function deleteArticle(id) {
  await apiRequest(`/articles?id=eq.${id}`, { method: 'DELETE' })
  return true
}

export async function fetchArticlesByAuthor(authorId) {
  const data = await apiRequest(`/articles?author_id=eq.${authorId}&select=*,issues(num,serial)`)
  return data
}

export async function fetchArticlesByIssue(issueId) {
  const data = await apiRequest(`/articles?issue_id=eq.${issueId}&select=*,authors(name)`)
  return data
}
