import type { SavedQuizSet } from './libraryStorage'

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character)
}

export function getExamFileName(title: string): string {
  const safe = title.normalize('NFKC').replace(/[\\/:*?"<>|]/g, ' ').split('').map((character) => character.charCodeAt(0) < 32 ? ' ' : character).join('').replace(/\s+/g, ' ').replace(/^[. ]+|[. ]+$/g, '').trim().slice(0, 80)
  const base = !safe || /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(safe) ? '시험지' : safe
  return `${base}-시험지.html`
}

export function buildExamHtml(set: SavedQuizSet, includeAnswers = false): string {
  const questions = set.questions.map((question, index) => `
    <section class="question">
      <h2>${index + 1}. ${escapeHtml(question.prompt)}</h2>
      <ol type="A">${question.options.map((option) => `<li>${escapeHtml(option.label)}</li>`).join('')}</ol>
      <p class="answer-line">답: __________</p>
    </section>`).join('')
  const answerSheet = includeAnswers ? `
    <section class="answer-sheet">
      <h2>정답 및 해설</h2>
      ${set.questions.map((question, index) => {
        const optionIndex = question.options.findIndex((option) => option.id === question.correctOptionId)
        return `<article><h3>${index + 1}번 · ${String.fromCharCode(65 + optionIndex)}</h3><p>${escapeHtml(question.explanation)}</p></article>`
      }).join('')}
    </section>` : ''
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(set.title)} · 시험지</title>
<style>
  *{box-sizing:border-box}body{font-family:system-ui,-apple-system,"Malgun Gothic",sans-serif;color:#28263f;max-width:850px;margin:0 auto;padding:40px 32px;line-height:1.65}
  header{border-bottom:3px solid #4b4696;padding-bottom:18px;margin-bottom:32px}h1{font-size:28px;margin:0 0 8px}header p{margin:0;color:#67627a}.student{margin-top:20px}
  .question{break-inside:avoid;margin:0 0 28px;padding:18px 0;border-bottom:1px solid #dcd7e7}.question h2{font-size:19px;margin:0 0 12px}.question ol{margin:0;padding-left:30px}.question li{padding:4px 0}.answer-line{margin:16px 0 0}
  .answer-sheet{break-before:page;margin-top:48px;border-top:3px solid #4b4696;padding-top:20px}.answer-sheet h2{font-size:24px}.answer-sheet article{break-inside:avoid;margin:20px 0}.answer-sheet h3{font-size:17px;margin:0}.answer-sheet p{margin:5px 0}
  @media print{body{max-width:none;padding:0}@page{size:A4;margin:18mm}}
</style></head><body>
<header><h1>${escapeHtml(set.title)} · 시험지</h1><p>총 ${set.questions.length}문제</p><p class="student">이름: ____________________ &nbsp; 날짜: ____________________</p></header>
${questions}${answerSheet}
</body></html>`
}

export function downloadExam(set: SavedQuizSet, includeAnswers: boolean): void {
  const blob = new Blob([buildExamHtml(set, includeAnswers)], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = getExamFileName(set.title)
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
