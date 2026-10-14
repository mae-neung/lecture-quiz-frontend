import { describe, expect, it } from 'vitest'
import { mockQuizQuestions } from '@/features/quiz/mockQuestions'
import type { SavedQuizSet } from './libraryStorage'
import { buildExamHtml, getExamFileName } from './exportExam'

const set: SavedQuizSet = {
  id: 'test', title: '<script>alert(1)</script>', materialType: 'material', fileName: 'lecture.pdf', fileSize: 50,
  createdAt: '2026-10-14T00:00:00.000Z', updatedAt: '2026-10-14T00:00:00.000Z', questions: mockQuizQuestions,
}

describe('exportExam', () => {
  it('기본 시험지에는 정답과 해설이 없고 HTML 메타 텍스트를 이스케이프한다', () => {
    const html = buildExamHtml(set)
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('정답 및 해설')
    expect(html).not.toContain(mockQuizQuestions[0].explanation)
    expect(html).toContain('총 5문제')
  })

  it('요청할 때만 별도 정답 섹션에 정답과 해설을 포함한다', () => {
    const html = buildExamHtml(set, true)
    expect(html).toContain('class="answer-sheet"')
    expect(html).toContain(mockQuizQuestions[0].explanation)
  })

  it('다운로드 파일명에서 경로 문자와 예약명을 제거한다', () => {
    expect(getExamFileName('../강의: 1/2')).not.toMatch(/[\\/:*?"<>|]/)
    expect(getExamFileName('CON')).toBe('시험지-시험지.html')
  })
})
