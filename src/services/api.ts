export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '')
export const isApiMode = API_BASE_URL.length > 0

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) { super(message) }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function expectRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) throw new ApiError(`${label} 응답 형식이 올바르지 않습니다.`)
  return value
}

export function expectId(value: unknown, label: string): string {
  if ((typeof value === 'string' && value.trim()) || (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0)) return String(value)
  throw new ApiError(`${label} 응답에 식별자가 없습니다.`)
}

function errorMessage(status: number, body: unknown): string {
  const record = isRecord(body) ? body : null
  if (status === 422) return '요청 값이 올바르지 않습니다. 입력 내용을 확인해 주세요. (422)'
  if (typeof record?.message === 'string' && record.message.trim()) return record.message
  if (status === 400) return '요청을 처리하지 못했습니다. 입력 내용을 확인해 주세요. (400)'
  return `서버 요청에 실패했습니다. (${status})`
}

async function requestJson(method: 'POST' | 'PATCH' | 'DELETE', path: string, body: Record<string, unknown> | FormData): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
      body: body instanceof FormData ? body : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('서버에 연결할 수 없습니다. 주소와 네트워크를 확인해 주세요.')
  }
  let parsed: unknown
  try { parsed = await response.json() } catch { throw new ApiError('서버 응답을 읽을 수 없습니다.') }
  if (!response.ok) throw new ApiError(errorMessage(response.status, parsed), response.status)
  const envelope = expectRecord(parsed, '서버')
  if (envelope.success !== true || typeof envelope.message !== 'string' || !('data' in envelope)) {
    throw new ApiError('서버 응답 형식이 올바르지 않습니다.')
  }
  return envelope.data
}

export function apiRequest(path: string, body: Record<string, unknown> | FormData): Promise<unknown> {
  return requestJson('POST', path, body)
}

export function patchRequest(path: string, body: Record<string, unknown>): Promise<unknown> {
  return requestJson('PATCH', path, body)
}

export function deleteRequest(path: string, body: Record<string, unknown>): Promise<unknown> {
  return requestJson('DELETE', path, body)
}

function expectNull(value: unknown, label: string): void {
  if (value !== null) throw new ApiError(`${label} 응답 형식이 올바르지 않습니다.`)
}

export async function loginApi(email: string, password: string): Promise<string> {
  const data = expectRecord(await apiRequest('/users/login', { email, password }), '로그인')
  return expectId(data.user_id, '로그인')
}

export async function logoutApi(userId: string): Promise<void> { await apiRequest('/users/logout', { user_id: userId }) }

export async function signupApi(email: string, password: string, passwordCheck: string): Promise<void> {
  expectNull(await apiRequest('/users/signup', { email, password, password_check: passwordCheck }), '회원가입')
}

export async function resendEmailVerificationApi(email: string): Promise<void> {
  expectNull(await apiRequest('/users/resend-email-verification', { email }), '인증 메일 재발송')
}

export type ApiSubject = { subjectId: string; subjectName: string; subjectNumber: number }

function parseSubject(value: unknown): ApiSubject {
  const subject = expectRecord(value, '과목')
  if (typeof subject.subject_name !== 'string' || typeof subject.subject_number !== 'number' || !Number.isFinite(subject.subject_number)) {
    throw new ApiError('과목 응답 형식이 올바르지 않습니다.')
  }
  return { subjectId: expectId(subject.subject_id, '과목'), subjectName: subject.subject_name, subjectNumber: subject.subject_number }
}

export async function getSubjects(userId: string): Promise<ApiSubject[]> {
  let data: unknown
  try {
    data = await apiRequest('/subjects/get-all', { user_id: userId })
  } catch (error) {
    if (error instanceof ApiError && error.status === 400 && error.message === 'owner user id not found') return []
    throw error
  }
  const payload = expectRecord(data, '과목 목록')
  if (!Array.isArray(payload.subjects)) throw new ApiError('과목 목록 응답 형식이 올바르지 않습니다.')
  const subjects = payload.subjects.map(parseSubject)
  if (new Set(subjects.map((subject) => subject.subjectId)).size !== subjects.length) throw new ApiError('과목 식별자가 중복되었습니다.')
  return subjects
}

export async function deleteSubject(userId: string, subjectId: string): Promise<void> {
  expectNull(await deleteRequest('/subjects/delete', { user_id: userId, subject_id: subjectId }), '과목 삭제')
}

export async function createSubject(userId: string): Promise<string> {
  const data = expectRecord(await apiRequest('/subjects/create', { user_id: userId }), '과목 생성')
  return parseSubject(data.subject).subjectId
}

export async function updateSubject(userId: string, subjectId: string, title: string): Promise<void> {
  expectNull(await patchRequest('/subjects/update', { user_id: userId, subject_id: subjectId, new_datas: { subject_name: title } }), '과목명 변경')
}

export async function uploadLecture(userId: string, subjectId: string, file: File, type: 'pdf' | 'mp3' | 'mp4'): Promise<void> {
  const data = new FormData()
  data.append('user_id', userId)
  data.append('subject_id', subjectId)
  data.append('files', file)
  data.append('file_types', type)
  await apiRequest('/lecture-materials/upload', data)
}

export async function summarizeLecture(userId: string, subjectId: string): Promise<void> {
  await apiRequest('/lecture-materials/summarize', { user_id: userId, subject_id: subjectId })
}

export async function firstWikiId(userId: string, subjectId: string): Promise<string> {
  const data = expectRecord(await apiRequest('/wiki-documents/get-all', { user_id: userId, subject_id: subjectId }), '위키 문서 조회')
  if (!Array.isArray(data.wiki_documents) || data.wiki_documents.length === 0) throw new ApiError('요약 문서가 아직 생성되지 않았습니다. 잠시 뒤 다시 시도해 주세요.')
  return expectId(expectRecord(data.wiki_documents[0], '위키 문서').wiki_document_id, '위키 문서')
}

export async function createProblems(userId: string, subjectId: string, wikiId: string): Promise<void> {
  await apiRequest('/problems/create', {
    user_id: userId, subject_id: subjectId, wiki_document_id: wikiId,
    generate_rule: { total_count: 5, problem_type_counts: { ox: 0, select: 5, short: 0, long: 0 }, difficulty: 'medium', focus_keywords: [], coverage: 'balanced' },
  })
}

export async function getProblems(userId: string, subjectId: string, wikiId: string): Promise<unknown> {
  const data = expectRecord(await apiRequest('/problems/get-all', { user_id: userId, subject_id: subjectId, wiki_document_id: wikiId }), '문제 조회')
  return data.problems
}
