import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSavedSet, deleteSavedSet, LIBRARY_KEY, readLibrary, renameSavedSet } from './libraryStorage'

const input = { title: '통계학 1강', materialType: 'material' as const, fileName: 'lecture.pdf', fileSize: 1234 }

beforeEach(() => {
  window.localStorage.clear()
  vi.restoreAllMocks()
})

describe('libraryStorage', () => {
  it('문제 세트를 저장, 이름 변경, 삭제하며 원본 파일 내용은 보관하지 않는다', () => {
    const created = createSavedSet(input)
    expect(created.ok).toBe(true)
    if (!created.ok) return
    expect(readLibrary()).toMatchObject({ ok: true, value: [{ id: created.value.id, title: input.title }] })
    expect(window.localStorage.getItem(LIBRARY_KEY)).not.toContain('document-content')
    expect(created.value.questions).toHaveLength(5)

    const renamed = renameSavedSet(created.value.id, '통계학 중간고사')
    expect(renamed.ok && renamed.value.title).toBe('통계학 중간고사')
    expect(deleteSavedSet(created.value.id)).toEqual({ ok: true, value: null })
    expect(readLibrary()).toEqual({ ok: true, value: [] })
  })

  it('손상된 저장 데이터를 덮어쓰지 않는다', () => {
    window.localStorage.setItem(LIBRARY_KEY, '{broken')
    expect(readLibrary()).toMatchObject({ ok: false })
    expect(createSavedSet(input)).toMatchObject({ ok: false })
    expect(window.localStorage.getItem(LIBRARY_KEY)).toBe('{broken')
  })

  it('구조가 잘못된 문제나 버전은 거부한다', () => {
    window.localStorage.setItem(LIBRARY_KEY, JSON.stringify({ version: 2, sets: [] }))
    expect(readLibrary()).toMatchObject({ ok: false })
    window.localStorage.setItem(LIBRARY_KEY, JSON.stringify({ version: 1, sets: [{ id: 'bad' }] }))
    expect(readLibrary()).toMatchObject({ ok: false })
  })

  it('저장소 접근 차단과 용량 초과를 안내하고 기존 항목을 유지한다', () => {
    const created = createSavedSet(input)
    expect(created.ok).toBe(true)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('full', 'QuotaExceededError') })
    const failed = createSavedSet({ ...input, title: '새 자료' })
    expect(failed).toMatchObject({ ok: false, error: expect.stringContaining('공간') })
    expect(readLibrary()).toMatchObject({ ok: true, value: [{ title: input.title }] })
    vi.restoreAllMocks()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('blocked', 'SecurityError') })
    expect(readLibrary()).toMatchObject({ ok: false, error: expect.stringContaining('접근') })
  })
})
