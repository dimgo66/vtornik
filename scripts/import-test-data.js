/**
 * Скрипт импорта тестовых данных
 * Создаёт тестовые номера, авторов и статьи
 */

import { SECTIONS, GENRES } from './import-dictionaries.js'

const API_URL = ''

async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
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

// ═══════════════════════════════════════════════════════════════
//  ТЕСТОВЫЕ ДАННЫЕ
// ═══════════════════════════════════════════════════════════════

const TEST_AUTHORS = [
  {
    name: 'Александр Пушкин',
    tagline: 'Поэт, прозаик',
    bio: 'Великий русский поэт, прозаик, драматург. Основоположник современного русского литературного языка.',
    photo_url: '',
    sort_order: 1
  },
  {
    name: 'Лев Толстой',
    tagline: 'Писатель, философ',
    bio: 'Один из крупнейших русских писателей и мыслителей. Автор романов «Война и мир» и «Анна Каренина».',
    photo_url: '',
    sort_order: 2
  },
  {
    name: 'Антон Чехов',
    tagline: 'Писатель, драматург',
    bio: 'Классик мировой литературы. Мастер короткого рассказа и пьес.',
    photo_url: '',
    sort_order: 3
  },
  {
    name: 'Иван Бунин',
    tagline: 'Поэт, прозаик',
    bio: 'Первый русский лауреат Нобелевской премии по литературе. Мастер лирической прозы.',
    photo_url: '',
    sort_order: 4
  },
  {
    name: 'Владимир Набоков',
    tagline: 'Писатель, поэт',
    bio: 'Русско-американский писатель, поэт, переводчик. Автор романа «Лолита».',
    photo_url: '',
    sort_order: 5
  }
]

const TEST_ISSUES = [
  {
    num: 1,
    serial: 105,
    month: 'январь',
    year: 2026,
    theme: 'Новогодние каникулы',
    editor: 'Иван Петров',
    print_count: 500,
    status: 'published',
    description: 'Первый номер нового года'
  },
  {
    num: 2,
    serial: 106,
    month: 'февраль',
    year: 2026,
    theme: 'Зимние вечера',
    editor: 'Иван Петров',
    print_count: 500,
    status: 'published',
    description: 'Февральский номер'
  },
  {
    num: 3,
    serial: 107,
    month: 'март',
    year: 2026,
    theme: 'Весеннее пробуждение',
    editor: 'Иван Петров',
    print_count: 500,
    status: 'published',
    description: 'Мартовский номер'
  }
]

const TEST_ARTICLES = [
  {
    title: 'ЗИМНЕЕ УТРО',
    subtitle: 'Стихотворение',
    section: 'poetry',
    rubric: 'Отдел поэзии',
    body: '<p>Мороз и солнце; день чудесный!<br>Еще ты дремлешь, друг прелестный —<br>Пора, красавица, проснись...</p>',
    custom_genre: 'Стихотворение',
    sort_order: 1
  },
  {
    title: 'ТОЛСТЫЙ И ТОНКИЙ',
    subtitle: 'Рассказ',
    section: 'prose',
    rubric: 'Отдел прозы',
    body: '<p>На вокзале Николаевской железной дороги встретились два приятеля: один толстый, другой тонкий...</p>',
    custom_genre: 'Рассказ',
    sort_order: 2
  },
  {
    title: 'О ЧЁМ ГОВОРЯТ ПИСАТЕЛИ',
    subtitle: 'Эссе о современной литературе',
    section: 'essays',
    rubric: '',
    body: '<p>Современная литература — это зеркало, в котором отражаются наши мечты и страхи...</p>',
    custom_genre: 'Эссе',
    sort_order: 3
  }
]

// ═══════════════════════════════════════════════════════════════
//  ФУНКЦИИ ИМПОРТА
// ═══════════════════════════════════════════════════════════════

async function importAuthors() {
  console.log('✍️  Импорт авторов...')
  const results = { success: 0, skipped: 0, error: 0 }
  const authorIds = []

  for (const author of TEST_AUTHORS) {
    try {
      const existing = await apiRequest(`/authors?name=eq.${encodeURIComponent(author.name)}`)
      if (existing.length > 0) {
        console.log(`  ⏭️  Пропущен: ${author.name}`)
        authorIds.push(existing[0].id)
        results.skipped++
        continue
      }

      const created = await apiRequest('/authors', {
        method: 'POST',
        body: JSON.stringify(author)
      })
      console.log(`  ✅ Добавлен: ${author.name}`)
      authorIds.push(created[0].id)
      results.success++
    } catch (error) {
      console.error(`  ❌ Ошибка: ${author.name} - ${error.message}`)
      results.error++
    }
  }

  console.log(`\n✅ Авторы: ${results.success} добавлено, ${results.skipped} пропущено\n`)
  return { authorIds, results }
}

async function importIssues() {
  console.log('📚 Импорт номеров...')
  const results = { success: 0, skipped: 0, error: 0 }
  const issueIds = []

  for (const issue of TEST_ISSUES) {
    try {
      const existing = await apiRequest(`/issues?serial=eq.${issue.serial}`)
      if (existing.length > 0) {
        console.log(`  ⏭️  Пропущен: №${issue.num} (${issue.month} ${issue.year})`)
        issueIds.push(existing[0].id)
        results.skipped++
        continue
      }

      const created = await apiRequest('/issues', {
        method: 'POST',
        body: JSON.stringify(issue)
      })
      console.log(`  ✅ Добавлен: №${issue.num} (${issue.month} ${issue.year})`)
      issueIds.push(created[0].id)
      results.success++
    } catch (error) {
      console.error(`  ❌ Ошибка: №${issue.num} - ${error.message}`)
      results.error++
    }
  }

  console.log(`\n✅ Номера: ${results.success} добавлено, ${results.skipped} пропущено\n`)
  return { issueIds, results }
}

async function importArticles(authorIds, issueIds) {
  console.log('📄 Импорт статей...')
  const results = { success: 0, skipped: 0, error: 0 }

  // Распределяем статьи по авторам и номерам
  for (let i = 0; i < TEST_ARTICLES.length; i++) {
    const article = TEST_ARTICLES[i]
    const authorId = authorIds[i % authorIds.length]
    const issueId = issueIds[i % issueIds.length]

    try {
      const articleData = {
        ...article,
        author_id: authorId,
        issue_id: issueId
      }

      const created = await apiRequest('/articles', {
        method: 'POST',
        body: JSON.stringify(articleData)
      })
      console.log(`  ✅ Добавлена: "${article.title}" — ${TEST_AUTHORS[i % TEST_AUTHORS.length].name}`)
      results.success++
    } catch (error) {
      console.error(`  ❌ Ошибка: "${article.title}" - ${error.message}`)
      results.error++
    }
  }

  console.log(`\n✅ Статьи: ${results.success} добавлено, ${results.error} ошибок\n`)
  return results
}

async function checkData() {
  console.log('🔍 Проверка данных...\n')

  try {
    const sections = await apiRequest('/sections')
    const genres = await apiRequest('/genres')
    const authors = await apiRequest('/authors')
    const issues = await apiRequest('/issues?order=serial.desc')
    const articles = await apiRequest('/articles')

    console.log(`📚 Справочники:`)
    console.log(`   Разделы: ${sections.length}`)
    console.log(`   Жанры: ${genres.length}`)
    console.log(`\n✍️  Авторы: ${authors.length}`)
    console.log(`📚 Номера: ${issues.length}`)
    console.log(`📄 Статьи: ${articles.length}`)

    return { sections, genres, authors, issues, articles }
  } catch (error) {
    console.error('❌ Ошибка проверки:', error.message)
    return null
  }
}

async function importAllTestData() {
  console.log('\n═══════════════════════════════════════════════════')
  console.log('  ИМПОРТ ТЕСТОВЫХ ДАННЫХ')
  console.log('═══════════════════════════════════════════════════\n')

  const data = await checkData()
  if (data && data.authors.length > 0 && data.issues.length > 0) {
    console.log('\n⚠️  Данные уже существуют. Пропускаем импорт.\n')
    return
  }

  console.log('')
  const { authorIds } = await importAuthors()
  const { issueIds } = await importIssues()
  await importArticles(authorIds, issueIds)

  console.log('═══════════════════════════════════════════════════')
  console.log('  ✅ ИМПОРТ ЗАВЕРШЁН')
  console.log('═══════════════════════════════════════════════════\n')

  await checkData()
}

// Запуск при импорте
if (typeof window === 'undefined') {
  importAllTestData().catch(console.error)
}

export default {
  importAuthors,
  importIssues,
  importArticles,
  checkData,
  importAllTestData
}
