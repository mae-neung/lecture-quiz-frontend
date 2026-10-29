import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, createProblems, deleteProblem, deleteSubject, deleteUnverifiedUsers, deleteUser, getProblems, getSubjects, getUserAnswers, getWikiDocuments, isCreatingProblems, isSummarized, isUploading, loginApi, resendEmailVerificationApi, signupApi, updateUserAnswer, uploadLecture, uploadLectureUrls } from './api'

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

  it('URL 업로드의 실패 목록과 미구현 400을 그대로 표시할 수 있다', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, message: 'ok', data: { failed_urls: ['https://bad.example'] } }) })
      .mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ success: false, message: '아직 구현되지 않았습니다', data: null }) })
    vi.stubGlobal('fetch', fetchMock)
    expect(await uploadLectureUrls('u1', 's1', ['https://bad.example'])).toEqual(['https://bad.example'])
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ user_id: 'u1', subject_id: 's1', urls: ['https://bad.example'] })
    await expect(uploadLectureUrls('u1', 's1', ['https://x.example'])).rejects.toThrow('아직 구현되지 않았습니다')
  })

  it('서버 진행 상태의 boolean을 검증하며 false를 그대로 반환한다', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, message: 'ok', data: { is_uploading: false } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, message: 'ok', data: { is_summarized: true } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, message: 'ok', data: { is_creating: false } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, message: 'ok', data: { is_uploading: 'false' } }) })
    vi.stubGlobal('fetch', fetchMock)
    expect(await isUploading('u1', 's1')).toBe(false)
    expect(await isSummarized('u1', 's1')).toBe(true)
    expect(await isCreatingProblems('u1', 's1', 'w1')).toBe(false)
    await expect(isUploading('u1', 's1')).rejects.toThrow('응답 형식')
  })

  it('전체 위키·문제·답안을 타입 검증하고 잘못된 필드는 거부한다', async () => {
    const wiki = { owner_user_id: 'u1', owner_subject_id: 's1', wiki_document_id: 'w1', owned_problem_ids: ['p1'], wiki_document_content: '요약' }
    const problem = { owner_user_id: 'u1', owner_subject_id: 's1', owner_wiki_document_id: 'w1', problem_id: 'p1', owned_user_answer_id: 'a1', owned_grade_id: null, problem_type: 'short', problem_number: 1, problem_question: '질문', problem_correct_answer: '답', problem_options: [] }
    const answer = { owner_user_id: 'u1', owner_subject_id: 's1', owner_wiki_document_id: 'w1', owner_problem_id: 'p1', user_answer_id: 'a1', user_answer: '내 답', user_answer_state: null }
    const envelope = (data: unknown) => ({ ok: true, json: async () => ({ success: true, message: 'ok', data }) })
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(envelope({ wiki_documents: [wiki] }))
      .mockResolvedValueOnce(envelope({ problems: [problem] }))
      .mockResolvedValueOnce(envelope({ user_answers: [answer] }))
      .mockResolvedValueOnce(envelope({ wiki_documents: [{ ...wiki, owned_problem_ids: [1] }] })))
    expect(await getWikiDocuments('u1', 's1')).toEqual([wiki])
    expect(await getProblems('u1', 's1', 'w1')).toEqual([problem])
    expect(await getUserAnswers('u1', 's1', 'w1')).toEqual([answer])
    expect(vi.mocked(fetch).mock.calls[2][0]).toContain('/problems/get-all-user-answers')
    await expect(getWikiDocuments('u1', 's1')).rejects.toThrow('응답 형식')
  })

  it('백엔드가 빈 컬렉션을 400 not found로 반환하면 빈 목록으로 정규화한다', async () => {
    const missing = { ok: false, status: 400, json: async () => ({ success: false, message: 'owner user id or owner subject id not found', data: null }) }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(missing))
    await expect(getWikiDocuments('u1', 's1')).resolves.toEqual([])
    await expect(getProblems('u1', 's1', 'w1')).resolves.toEqual([])
    await expect(getUserAnswers('u1', 's1', 'w1')).resolves.toEqual([])
  })

  it('설정한 생성 규칙과 답안 수정·문제 삭제·계정 관리 계약을 전송한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, message: 'ok', data: null }) })
    vi.stubGlobal('fetch', fetchMock)
    const rule = { total_count: 2, problem_type_counts: { ox: 1, select: 0, short: 1, long: 0 }, difficulty: 'hard' as const, focus_keywords: ['회귀'], coverage: 'focused' as const }
    await createProblems('u1', 's1', 'w1', rule)
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).generate_rule).toEqual(rule)
    await expect(createProblems('u1', 's1', 'w1', { ...rule, total_count: 3 })).rejects.toThrow('합계')
    await updateUserAnswer('u1', 's1', 'a1', '수정 답안')
    expect(fetchMock.mock.calls[1][0]).toContain('/problems/user-answers/update')
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ user_id: 'u1', subject_id: 's1', user_answer_id: 'a1', new_datas: { user_answer: '수정 답안' } })
    await deleteProblem('u1', 's1', 'p1')
    expect(fetchMock.mock.calls[2][1].method).toBe('DELETE')
    await deleteUser('u1')
    expect(JSON.parse(fetchMock.mock.calls[3][1].body)).toEqual({ user_id: 'u1' })
    await deleteUnverifiedUsers(3600)
    expect(JSON.parse(fetchMock.mock.calls[4][1].body)).toEqual({ elapsed_second: 3600 })
    expect(fetchMock.mock.calls[4][0]).toContain('/users/delete-unverified')
  })
})
