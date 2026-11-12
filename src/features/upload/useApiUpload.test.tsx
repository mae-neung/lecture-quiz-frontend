import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useApiUpload } from './useApiUpload'

const services = vi.hoisted(() => ({
  createSubject: vi.fn(), updateSubject: vi.fn(), uploadLecture: vi.fn(), summarizeLecture: vi.fn(),
  firstWikiId: vi.fn(), createProblems: vi.fn(), getProblems: vi.fn(),
}))

vi.mock('@/services/api', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/services/api')>(), ...services,
}))

const problems = Array.from({ length: 5 }, (_, index) => ({
  problem_id: index + 1, problem_type: 'select', problem_number: index + 1, problem_question: `질문 ${index + 1}`,
  problem_options: ['첫째', '둘째'], problem_correct_answer: '둘째',
}))

beforeEach(() => {
  vi.clearAllMocks()
  services.createSubject.mockResolvedValue('s1')
  services.updateSubject.mockResolvedValue(undefined)
  services.uploadLecture.mockResolvedValue(undefined)
  services.summarizeLecture.mockResolvedValue(undefined)
  services.firstWikiId.mockResolvedValue('w1')
  services.createProblems.mockResolvedValue(undefined)
  services.getProblems.mockResolvedValue(problems)
})

describe('API 업로드 단계', () => {
  it('실패한 위키 조회 단계부터 재시도하고 과목 식별자를 반환한다', async () => {
    services.firstWikiId.mockRejectedValueOnce(new Error('일시 오류'))
    const { result } = renderHook(() => useApiUpload('user-1'))
    const file = new File(['contents'], 'lesson.pdf', { type: 'application/pdf' })
    let first: Awaited<ReturnType<typeof result.current.submit>> = null
    await act(async () => { first = await result.current.submit('통계학', 'material', file) })
    expect(first).toBeNull()
    expect(result.current.error).toContain('요약 문서 확인')
    expect(result.current.hasCheckpoint).toBe(true)
    expect(result.current.canRetry).toBe(true)
    let second: Awaited<ReturnType<typeof result.current.submit>> = null
    await act(async () => { second = await result.current.submit('통계학', 'material', file) })
    expect(services.createSubject).toHaveBeenCalledTimes(1)
    expect(services.uploadLecture).toHaveBeenCalledTimes(1)
    expect(services.summarizeLecture).toHaveBeenCalledTimes(1)
    expect(services.firstWikiId).toHaveBeenCalledTimes(2)
    expect(second).toEqual({ subjectId: 's1' })
    expect(result.current.hasCheckpoint).toBe(false)
  })

  it.each([
    ['subject', 'createSubject'],
    ['upload', 'uploadLecture'],
    ['summary', 'summarizeLecture'],
    ['generate', 'createProblems'],
  ] as const)('%s 단계 결과가 불명확하면 같은 요청을 다시 보내지 않는다', async (_stage, service) => {
    services[service].mockRejectedValueOnce(new Error('응답 유실'))
    const { result } = renderHook(() => useApiUpload('user-1'))
    const file = new File(['contents'], 'lesson.pdf', { type: 'application/pdf' })
    await act(async () => { await result.current.submit('통계학', 'material', file) })
    expect(result.current.isBlocked).toBe(true)
    expect(result.current.canRetry).toBe(false)
    expect(result.current.hasCheckpoint).toBe(true)
    expect(result.current.error).toContain('백엔드 상태를 확인한 뒤 페이지를 새로고침')
    let retry: Awaited<ReturnType<typeof result.current.submit>> = null
    await act(async () => { retry = await result.current.submit('통계학', 'material', file) })
    expect(retry).toBeNull()
    expect(services[service]).toHaveBeenCalledTimes(1)
  })
})
