/**
 * Скрипт импорта справочников (sections, genres)
 * Запускается через Node.js или в браузере
 */

// ═══════════════════════════════════════════════════════════════
//  ДАННЫЕ ДЛЯ ИМПОРТА
// ═══════════════════════════════════════════════════════════════

/**
 * Разделы журнала
 */
export const SECTIONS = [
  { id: 'prose', name: 'Отдел прозы', css_class: 'sp', color: '#8B1A1A', sort_order: 1 },
  { id: 'poetry', name: 'Отдел поэзии', css_class: 'po', color: '#1A408B', sort_order: 2 },
  { id: 'profundis', name: 'De Profundis', css_class: 'pr', color: '#1A6B3C', sort_order: 3 },
  { id: 'cinema', name: 'Город кино', css_class: 'ci', color: '#7A3C1A', sort_order: 4 },
  { id: 'interview', name: 'Интервью', css_class: 'in', color: '#4A1A8B', sort_order: 5 },
  { id: 'reading', name: 'Домашнее чтение', css_class: 'rd', color: '#6B6B1A', sort_order: 6 },
  { id: 'essays', name: 'Эссе', css_class: 'es', color: '#7A1515', sort_order: 7 },
  { id: 'books', name: 'Книги', css_class: 'bk', color: '#5A5A5A', sort_order: 8 },
  { id: 'audio', name: 'Аудиокниги', css_class: 'au', color: '#1A8B6B', sort_order: 9 },
  { id: 'radio', name: 'Радио', css_class: 'ra', color: '#8B4A1A', sort_order: 10 },
  { id: 'culture', name: 'И о культуре...', css_class: 'cu', color: '#6B1A8B', sort_order: 11 }
]

/**
 * Жанры
 */
export const GENRES = [
  { name: 'Роман', sort_order: 1 },
  { name: 'Рассказ', sort_order: 2 },
  { name: 'Повесть', sort_order: 3 },
  { name: 'Стихотворения', sort_order: 4 },
  { name: 'Поэма', sort_order: 5 },
  { name: 'Эссе', sort_order: 6 },
  { name: 'Статья', sort_order: 7 },
  { name: 'Интервью', sort_order: 8 },
  { name: 'Рецензия', sort_order: 9 },
  { name: 'Репортаж', sort_order: 10 },
  { name: 'Очерк', sort_order: 11 },
  { name: 'Критика', sort_order: 12 },
  { name: 'Травелог', sort_order: 13 },
  { name: 'Исторический экскурс', sort_order: 14 },
  { name: 'Редакционное слово', sort_order: 15 }
]

// ═══════════════════════════════════════════════════════════════
//  ФУНКЦИИ ИМПОРТА
// ═══════════════════════════════════════════════════════════════

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

/**
 * Импорт разделов
 */
export async function importSections() {
  console.log('📚 Импорт разделов...')
  const results = { success: 0, skipped: 0, error: 0 }

  for (const section of SECTIONS) {
    try {
      // Проверяем существование
      const existing = await apiRequest(`/sections?id=eq.${section.id}`)
      if (existing.length > 0) {
        console.log(`  ⏭️  Пропущен: ${section.name}`)
        results.skipped++
        continue
      }

      // Создаём
      await apiRequest('/sections', {
        method: 'POST',
        body: JSON.stringify(section)
      })
      console.log(`  ✅ Добавлен: ${section.name}`)
      results.success++
    } catch (error) {
      console.error(`  ❌ Ошибка: ${section.name} - ${error.message}`)
      results.error++
    }
  }

  console.log(`\n✅ Разделы: ${results.success} добавлено, ${results.skipped} пропущено, ${results.error} ошибок\n`)
  return results
}

/**
 * Импорт жанров
 */
export async function importGenres() {
  console.log('📑 Импорт жанров...')
  const results = { success: 0, skipped: 0, error: 0 }

  for (const genre of GENRES) {
    try {
      // Проверяем существование по имени
      const existing = await apiRequest(`/genres?name=eq.${genre.name}`)
      if (existing.length > 0) {
        console.log(`  ⏭️  Пропущен: ${genre.name}`)
        results.skipped++
        continue
      }

      // Создаём
      await apiRequest('/genres', {
        method: 'POST',
        body: JSON.stringify(genre)
      })
      console.log(`  ✅ Добавлен: ${genre.name}`)
      results.success++
    } catch (error) {
      console.error(`  ❌ Ошибка: ${genre.name} - ${error.message}`)
      results.error++
    }
  }

  console.log(`\n✅ Жанры: ${results.success} добавлено, ${results.skipped} пропущено, ${results.error} ошибок\n`)
  return results
}

/**
 * Проверка состояния справочников
 */
export async function checkDictionaries() {
  console.log('🔍 Проверка справочников...\n')

  try {
    const sections = await apiRequest('/sections')
    const genres = await apiRequest('/genres')

    console.log(`📚 Разделы: ${sections.length}`)
    sections.forEach(s => console.log(`   - ${s.name} (${s.id})`))

    console.log(`\n📑 Жанры: ${genres.length}`)
    genres.forEach((g, i) => console.log(`   ${i + 1}. ${g.name}`))

    return { sections: sections.length, genres: genres.length }
  } catch (error) {
    console.error('❌ Ошибка проверки:', error.message)
    return { sections: 0, genres: 0, error: error.message }
  }
}

/**
 * Полный импорт справочников
 */
export async function importAllDictionaries() {
  console.log('\n═══════════════════════════════════════════════════')
  console.log('  ИМПОРТ СПРАВОЧНИКОВ')
  console.log('═══════════════════════════════════════════════════\n')

  await checkDictionaries()
  console.log('')
  await importSections()
  await importGenres()

  console.log('═══════════════════════════════════════════════════')
  console.log('  ✅ ИМПОРТ ЗАВЕРШЁН')
  console.log('═══════════════════════════════════════════════════\n')
}

// ═══════════════════════════════════════════════════════════════
//  ЭКСПОРТ ДЛЯ NODE.JS
// ═══════════════════════════════════════════════════════════════

if (typeof window === 'undefined') {
  // Node.js environment
  importAllDictionaries().catch(console.error)
}

export default {
  SECTIONS,
  GENRES,
  importSections,
  importGenres,
  checkDictionaries,
  importAllDictionaries
}
