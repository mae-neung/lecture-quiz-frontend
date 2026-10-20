import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, createProblems, deleteSubject, getSubjects, loginApi, resendEmailVerificationApi, signupApi, uploadLecture } from './api'

afterEach(() => vi.unstubAllGlobals())

describe('Amadda API', () => {
  it('공통 성공 응답과 로그인 user_id를 검증한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, message: 'ok', data: { user_id: 42 } }) })
    vi.stubGlobal('fetch', fetchMock)
    expect(await loginApi('a@example.com', 'secret')).toBe('42')
    expect(fetchMock.mock.calls[0][0]).toContain('/users/login')
    expect(fetchMock.mock.calls[0][1].body).toContain('a@example.com')
  })

  it('400과 422 오류 메시지를 구분한다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ success: false, message: '계정 오류', data: null }) })
      .mockResolvedValueOnce({ ok: false, status: 422, json: async () => ({ detail: [{ loc: ['body'] }] }) }))
    await expect(apiRequest('/test', {})).rejects.toThrow('계정 오류')
    await expect(apiRequest('/test', {})).rejects.toThrow('422')
  })

  it('네트워크 장애와 비정상 응답을 거부한다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ ok: true, json: async () => ({ data: null }) }))
    await expect(apiRequest('/test', {})).rejects.toThrow('연결할 수 없습니다')
    await expect(apiRequest('/test', {})).rejects.toThrow('응답 형식')
  })

  it('multipart 필드와 고정 문제 생성 규칙을 전송한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, message: 'ok', data: null }) })
    vi.stubGlobal('fetch', fetchMock)
    await uploadLecture('u1', 's1', new File(['x'], 'lesson.pdf', { type: 'application/pdf' }), 'pdf')
    const body = fetchMock.mock.calls[0][1].body as FormData
    expect(body.get('file_types')).toBe('pdf')
    expect(body.get('files')).toBeInstanceOf(File)
    expect(fetchMock.mock.calls[0][1].headers).toBeUndefined()
    await createProblems('u1', 's1', 'w1')
    const rule = JSON.parse(fetchMock.mock.calls[1][1].body).generate_rule
    expect(rule).toEqual({ total_count: 5, problem_type_counts: { ox: 0, select: 5, short: 0, long: 0 }, difficulty: 'medium', focus_keywords: [], coverage: 'balanced' })
  })

  it('가입과 인증 메일 재발송은 계약 필드를 보내고 null 응답을 확인한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, message: 'ok', data: null }) })
    vi.stubGlobal('fetch', fetchMock)
    await signupApi('user@example.com', 'secret', 'secret')
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ email: 'user@example.com', password: 'secret', password_check: 'secret' })
    await resendEmailVerificationApi('user@example.com')
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ email: 'user@example.com' })
  })

  it('과목 목록은 정확한 소유자 없음 400만 빈 목록으로 보정한다', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ success: false, message: 'owner user id not found', data: null }) })
      .mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ success: false, message: 'other error', data: null }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, message: 'ok', data: { subjects: [{ subject_id: 3, subject_name: '통계학', subject_number: 2 }] } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, message: 'ok', data: { subjects: [{ subject_id: 3, subject_name: '통계학' }] } }) })
    vi.stubGlobal('fetch', fetchMock)
    expect(await getSubjects('u1')).toEqual([])
    await expect(getSubjects('u1')).rejects.toThrow('other error')
    expect(await getSubjects('u1')).toEqual([{ subjectId: '3', subjectName: '통계학', subjectNumber: 2 }])
    await expect(getSubjects('u1')).rejects.toThrow('과목 응답 형식')
  })

  it('과목 삭제는 DELETE 본문을 전송하고 null 응답을 확인한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, message: 'ok', data: null }) })
    vi.stubGlobal('fetch', fetchMock)
    await deleteSubject('u1', 's1')
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE')
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ user_id: 'u1', subject_id: 's1' })
  })
})
