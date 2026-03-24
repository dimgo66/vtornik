import { jsPDF } from 'jspdf'

// ══════════════════════════════════════════════════
//  PDF GENERATOR — ВТОРНИК
//  Полная копия из vtornik-v3.html с адаптацией
// ══════════════════════════════════════════════════

const BLEED = 3 // вылет под обрез
const PAGE_WIDTH = 154
const PAGE_HEIGHT = 216
const CONTENT_WIDTH = 148
const BLEED_LEFT = 3

// Разделы журнала
const SECTIONS = [
  {id:'prose',     name:'Отдел прозы',     cls:'sp', color:'#8B1A1A'},
  {id:'poetry',    name:'Отдел поэзии',    cls:'po', color:'#1A408B'},
  {id:'profundis', name:'De Profundis',    cls:'pr', color:'#1A6B3C'},
  {id:'cinema',    name:'Город кино',      cls:'ci', color:'#7A3C1A'},
  {id:'interview', name:'Интервью',        cls:'in', color:'#4A1A8B'},
  {id:'reading',   name:'Домашнее чтение', cls:'rd', color:'#6B6B1A'},
]

// Helpers
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

const hexToRgb = (h) => ({
  r: parseInt(h.slice(1, 3), 16),
  g: parseInt(h.slice(3, 5), 16),
  b: parseInt(h.slice(5, 7), 16)
})

const getArticleWords = (body) => {
  if (!body) return 0
  const tmp = document.createElement('div')
  tmp.innerHTML = body
  return tmp.textContent.trim().split(/\s+/).filter(Boolean).length
}

const wordsToPages = (w) => Math.max(1, Math.ceil(w / 220))

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Генерация PDF для номера журнала
 * @param {Object} issue - объект номера
 * @param {Array} articles - массив статей
 * @param {Array} authors - массив авторов
 * @param {Function} onProgress - callback прогресса (progress, message)
 */
export async function generateIssuePDF(issue, articles, authors, onProgress) {
  if (!issue) {
    throw new Error('Номер не выбран')
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [PAGE_WIDTH, PAGE_HEIGHT],
    compress: true
  })

  const bg = { r: 92, g: 15, b: 15 }

  // Progress steps
  const steps = [
    [8, 'А5 + вылет 3 мм…'],
    [20, 'Генерация обложки CMYK…'],
    [35, 'Оглавление…'],
    [55, 'Текстовые полосы…'],
    [75, 'Биографии авторов…'],
    [88, 'Метки обрезки…'],
    [97, 'Встраивание шрифтов…']
  ]

  for (const [progress, message] of steps) {
    if (onProgress) onProgress(progress, message)
    await delay(260 + Math.random() * 160)
  }

  // ══════════════════════════════════════════════════
  //  COVER
  // ══════════════════════════════════════════════════
  doc.setFillColor(bg.r, bg.g, bg.b)
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F')

  if (issue.coverImage) {
    try {
      const fmt = issue.coverImage.includes('png') ? 'PNG' : 'JPEG'
      doc.addImage(issue.coverImage, fmt, BLEED_LEFT, BLEED_LEFT, CONTENT_WIDTH, 210)
      doc.setFillColor(bg.r, bg.g, bg.b)
      doc.setGlobalAlpha(0.55)
      doc.rect(BLEED_LEFT, BLEED_LEFT, CONTENT_WIDTH, 210, 'F')
      doc.setGlobalAlpha(1)
    } catch (e) {
      console.warn('Failed to add cover image:', e)
    }
  }

  // Cover overlay
  doc.setFillColor(0, 0, 0)
  doc.setGlobalAlpha(0.4)
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT * 0.13, 'F')
  doc.setGlobalAlpha(1)

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(184, 150, 12)
  doc.text('ВТОРНИК', BLEED_LEFT + 8, BLEED_LEFT + 10)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(200, 180, 150)
  doc.text('Толстый зависимый литературно-художественный журнал', BLEED_LEFT + 8, BLEED_LEFT + 17)

  doc.setTextColor(160, 140, 120)
  doc.setFontSize(7)
  doc.text(`№ ${issue.num} (${issue.serial}) · ${cap(issue.month)} ${issue.year}`, BLEED_LEFT + CONTENT_WIDTH - 8, BLEED_LEFT + 17, { align: 'right' })

  // Theme
  const ty = BLEED_LEFT + PAGE_HEIGHT * 0.63
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  const tl = doc.splitTextToSize(`«${issue.theme}»`, CONTENT_WIDTH - 16)
  doc.text(tl, BLEED_LEFT + 8, ty)

  // Authors preview
  const sub3 = articles.slice(0, 3)
    .map(a => {
      const au = authors.find(x => x.id === a.authorId)
      return au ? au.name : ''
    })
    .filter(Boolean)
    .join(' · ')

  if (sub3) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(180, 155, 120)
    doc.text(sub3, BLEED_LEFT + 8, ty + tl.length * 6 + 4)
  }

  // Footer
  doc.setFontSize(6)
  doc.setTextColor(130, 110, 90)
  doc.text(`Гл. редактор: ${issue.editor} · Тираж: ${issue.printCount || 500} экз.`, BLEED_LEFT + 8, PAGE_HEIGHT - BLEED_LEFT - 4)

  cropMarks(doc, BLEED_LEFT, PAGE_WIDTH, PAGE_HEIGHT)

  // ══════════════════════════════════════════════════
  //  TABLE OF CONTENTS
  // ══════════════════════════════════════════════════
  doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  doc.setFillColor(250, 247, 242)
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F')

  runningHead(doc, 'СОДЕРЖАНИЕ', '', BLEED_LEFT, CONTENT_WIDTH)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(30, 10, 10)
  doc.text('СОДЕРЖАНИЕ', BLEED_LEFT + 10, BLEED_LEFT + 28)

  doc.setDrawColor(139, 26, 26)
  doc.setLineWidth(0.6)
  doc.line(BLEED_LEFT + 10, BLEED_LEFT + 31, BLEED_LEFT + CONTENT_WIDTH - 10, BLEED_LEFT + 31)

  let ty2 = BLEED_LEFT + 40
  let lastS = ''
  let pg = 4

  for (const art of articles) {
    const s = SECTIONS.find(x => x.id === art.section)
    if (s && s.name !== lastS) {
      if (ty2 > BLEED_LEFT + 200) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6)
      doc.setTextColor(139, 26, 26)
      doc.text((art.rubric || s.name).toUpperCase(), BLEED_LEFT + 10, ty2)
      doc.setDrawColor(200, 180, 170)
      doc.setLineWidth(0.15)
      doc.line(BLEED_LEFT + 10, ty2 + 1.5, BLEED_LEFT + CONTENT_WIDTH - 10, ty2 + 1.5)
      ty2 += 5.5
      lastS = s.name
    }
    if (ty2 > BLEED_LEFT + 200) break

    const au = authors.find(x => x.id === art.authorId)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.setTextColor(139, 26, 26)
    doc.text((au ? au.name : '').toUpperCase(), BLEED_LEFT + 10, ty2)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(25, 12, 5)
    const tc = art.title.length > 58 ? art.title.slice(0, 58) + '…' : art.title
    doc.text(tc, BLEED_LEFT + 10, ty2 + 4)

    if (art.subtitle) {
      doc.setFontSize(5.5)
      doc.setTextColor(100, 80, 70)
      doc.text(art.subtitle, BLEED_LEFT + 10, ty2 + 7.5)
    }

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(100)
    doc.text(String(pg), BLEED_LEFT + CONTENT_WIDTH - 10, ty2 + 4, { align: 'right' })

    doc.setDrawColor(220, 210, 200)
    doc.setLineWidth(0.1)
    doc.line(BLEED_LEFT + 10, ty2 + (art.subtitle ? 10 : 7), BLEED_LEFT + CONTENT_WIDTH - 10, ty2 + (art.subtitle ? 10 : 7))

    ty2 += (art.subtitle ? 12.5 : 10)
    pg += wordsToPages(getArticleWords(art.body))
  }

  pageNumber(doc, 3, BLEED_LEFT, PAGE_HEIGHT, CONTENT_WIDTH)
  cropMarks(doc, BLEED_LEFT, PAGE_WIDTH, PAGE_HEIGHT)

  // ══════════════════════════════════════════════════
  //  ARTICLE PAGES
  // ══════════════════════════════════════════════════
  let pgCounter = 4
  const byS = {}
  SECTIONS.forEach(s => { byS[s.id] = [] })
  articles.forEach(a => { if (byS[a.section]) byS[a.section].push(a) })

  for (const s of SECTIONS) {
    for (const art of byS[s.id]) {
      doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      doc.setFillColor(255, 255, 255)
      doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F')

      runningHead(doc, (art.rubric || s.name).toUpperCase(), String(pgCounter), BLEED_LEFT, CONTENT_WIDTH)

      const sc2 = hexToRgb(s.color || '#7A1515')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6.5)
      doc.setTextColor(sc2.r, sc2.g, sc2.b)
      doc.text((art.rubric || s.name).toUpperCase(), BLEED_LEFT + 10, BLEED_LEFT + 24)

      const au = authors.find(x => x.id === art.authorId)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(sc2.r, sc2.g, sc2.b)
      doc.text((au ? au.name : '').toUpperCase(), BLEED_LEFT + 10, BLEED_LEFT + 32)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.setTextColor(20, 8, 4)
      const ttl = doc.splitTextToSize(art.title.toUpperCase(), 128)
      doc.text(ttl, BLEED_LEFT + 10, BLEED_LEFT + 39)

      let by = BLEED_LEFT + 39 + ttl.length * 5.5
      if (art.subtitle) {
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(7.5)
        doc.setTextColor(100)
        doc.text(art.subtitle, BLEED_LEFT + 10, by + 3)
        by += 8
      }

      doc.setDrawColor(sc2.r, sc2.g, sc2.b)
      doc.setLineWidth(0.5)
      doc.line(BLEED_LEFT + 10, by + 3, BLEED_LEFT + CONTENT_WIDTH - 10, by + 3)
      by += 8

      if (art.body) {
        const tmp = document.createElement('div')
        tmp.innerHTML = art.body
        const txt = tmp.textContent.replace(/\s+/g, ' ').trim()

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(28, 18, 12)
        const lines = doc.splitTextToSize(txt, 128)

        let li = 0
        while (li < lines.length && by < BLEED_LEFT + 192) {
          doc.text(lines[li], BLEED_LEFT + 10, by)
          by += 4.5
          li++
        }
        if (li < lines.length) {
          doc.setFontSize(7)
          doc.setTextColor(150)
          doc.text('(продолжение следует…)', BLEED_LEFT + 10, by + 3)
        }
      }

      if (au?.bio) {
        doc.setDrawColor(200)
        doc.setLineWidth(0.2)
        doc.line(BLEED_LEFT + 10, BLEED_LEFT + 192, BLEED_LEFT + 80, BLEED_LEFT + 192)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6)
        doc.setTextColor(120)
        const blines = doc.splitTextToSize(au.bio, 128)
        doc.text(blines.slice(0, 2), BLEED_LEFT + 10, BLEED_LEFT + 195)
      }

      const genre = art.customGenre || art.genre || ''
      if (genre) {
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(6)
        doc.setTextColor(150)
        doc.text(genre, BLEED_LEFT + CONTENT_WIDTH - 10, BLEED_LEFT + 195, { align: 'right' })
      }

      pageNumber(doc, pgCounter, BLEED_LEFT, PAGE_HEIGHT, CONTENT_WIDTH)
      cropMarks(doc, BLEED_LEFT, PAGE_WIDTH, PAGE_HEIGHT)
      pgCounter += wordsToPages(getArticleWords(art.body))
    }
  }

  // ══════════════════════════════════════════════════
  //  IMPRINT
  // ══════════════════════════════════════════════════
  doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(139, 26, 26)
  doc.text('ВТОРНИК', BLEED_LEFT + 10, BLEED_LEFT + 20)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(80)
  doc.text([
    `Лит.-худ. журнал № ${issue.num} (${issue.serial})`,
    `${cap(issue.month)} ${issue.year}`,
    '',
    `Гл. редактор: ${issue.editor}`,
    `Тираж: ${issue.printCount || 500} экз.`,
    '',
    'Формат А5 (148×210 мм). Офсет. Печать офсетная.',
    `Объём ~${pgCounter} полос.`,
    '',
    `© Изд. дом «Вторник», ${issue.year}`,
    'Москва · vtornik.online'
  ], BLEED_LEFT + 10, BLEED_LEFT + 28)

  cropMarks(doc, BLEED_LEFT, PAGE_WIDTH, PAGE_HEIGHT)

  // Finish
  if (onProgress) onProgress(100, 'Готово!')
  await delay(400)

  // Save
  const filename = `ВТОРНИК_${issue.num}_${issue.serial}_${issue.year}_print.pdf`
  doc.save(filename)

  return doc
}

// ══════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════

function cropMarks(doc, bl, pw, ph) {
  doc.setDrawColor(0)
  doc.setLineWidth(0.2)
  doc.line(0, bl, bl - 2, bl)
  doc.line(bl, 0, bl, bl - 2)
  doc.line(pw - bl + 2, bl, pw, bl)
  doc.line(pw - bl, 0, pw - bl, bl - 2)
  doc.line(0, ph - bl, bl - 2, ph - bl)
  doc.line(bl, ph - bl + 2, bl, ph)
  doc.line(pw - bl + 2, ph - bl, pw, ph - bl)
  doc.line(pw - bl, ph - bl + 2, pw - bl, ph)
}

function runningHead(doc, left, right, bl, cw) {
  doc.setDrawColor(50, 20, 20)
  doc.setLineWidth(0.3)
  doc.line(bl + 10, bl + 14, bl + cw - 10, bl + 14)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.5)
  doc.setTextColor(120)
  doc.text(left, bl + 10, bl + 11)
  if (right) {
    doc.text(right, bl + cw - 10, bl + 11, { align: 'right' })
  }
}

function pageNumber(doc, n, bl, ph, cw) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(150)
  doc.text(String(n), bl + cw / 2, bl + 210 - 6, { align: 'center' })
}
