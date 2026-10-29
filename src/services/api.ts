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

function isEmptyCollectionError(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 400) return false
  const message = error.message.toLowerCase()
  return message === 'owner user id not found' ||
    message === 'owner user id or owner subject id not found' ||
    message === 'owner user id or owner subject id or owner wiki document id not found'
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

export async function deleteUser(userId: string): Promise<void> {
  expectNull(await deleteRequest('/users/delete', { user_id: userId }), '계정 탈퇴')
}

// 전역 관리자 작업: 일반 UI에서는 호출하지 않는다.
export async function deleteUnverifiedUsers(elapsedSecond: number): Promise<void> {
  if (!Number.isFinite(elapsedSecond) || elapsedSecond < 0) throw new ApiError('정리 기준 시간이 올바르지 않습니다.')
  expectNull(await apiRequest('/users/delete-unverified', { elapsed_second: elapsedSecond }), '미인증 계정 정리')
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

export async function uploadLectureUrls(userId: string, subjectId: string, urls: string[]): Promise<string[]> {
  const payload = expectRecord(await apiRequest('/lecture-materials/upload-urls', { user_id: userId, subject_id: subjectId, urls }), 'URL 업로드')
  if (!Array.isArray(payload.failed_urls) || !payload.failed_urls.every((value) => typeof value === 'string')) throw new ApiError('URL 업로드 응답 형식이 올바르지 않습니다.')
  return payload.failed_urls
}

function expectBooleanData(value: unknown, key: string, label: string): boolean {
  const payload = expectRecord(value, label)
  if (typeof payload[key] !== 'boolean') throw new ApiError(`${label} 응답 형식이 올바르지 않습니다.`)
  return payload[key]
}

export async function isUploading(userId: string, subjectId: string): Promise<boolean> {
  return expectBooleanData(await apiRequest('/lecture-materials/is-uploading', { user_id: userId, subject_id: subjectId }), 'is_uploading', '업로드 상태')
}

export async function summarizeLecture(userId: string, subjectId: string): Promise<void> {
  expectNull(await apiRequest('/lecture-materials/summarize', { user_id: userId, subject_id: subjectId }), '요약')
}

export async function isSummarized(userId: string, subjectId: string): Promise<boolean> {
  return expectBooleanData(await apiRequest('/lecture-materials/is-summarized', { user_id: userId, subject_id: subjectId }), 'is_summarized', '요약 상태')
}

export type ApiWikiDocument = {
  owner_user_id: string
  owner_subject_id: string
  wiki_document_id: string
  owned_problem_ids: string[]
  wiki_document_content: string
}

function parseWikiDocument(value: unknown): ApiWikiDocument {
  const item = expectRecord(value, '요약 문서')
  if (typeof item.wiki_document_content !== 'string' || !Array.isArray(item.owned_problem_ids) ||
    !item.owned_problem_ids.every((id) => typeof id === 'string')) throw new ApiError('요약 문서 응답 형식이 올바르지 않습니다.')
  return {
    owner_user_id: expectId(item.owner_user_id, '요약 문서 사용자'),
    owner_subject_id: expectId(item.owner_subject_id, '요약 문서 과목'),
    wiki_document_id: expectId(item.wiki_document_id, '요약 문서'),
    owned_problem_ids: item.owned_problem_ids,
    wiki_document_content: item.wiki_document_content,
  }
}

export async function getWikiDocuments(userId: string, subjectId: string): Promise<ApiWikiDocument[]> {
  let raw: unknown
  try { raw = await apiRequest('/wiki-documents/get-all', { user_id: userId, subject_id: subjectId }) }
  catch (error) { if (isEmptyCollectionError(error)) return []; throw error }
  const data = expectRecord(raw, '요약 문서 조회')
  if (!Array.isArray(data.wiki_documents)) throw new ApiError('요약 문서 목록 응답 형식이 올바르지 않습니다.')
  const documents = data.wiki_documents.map(parseWikiDocument)
  if (new Set(documents.map((item) => item.wiki_document_id)).size !== documents.length) throw new ApiError('요약 문서 식별자가 중복되었습니다.')
  return documents
}

export async function firstWikiId(userId: string, subjectId: string): Promise<string> {
  const documents = await getWikiDocuments(userId, subjectId)
  if (documents.length === 0) throw new ApiError('요약 문서가 아직 생성되지 않았습니다. 잠시 뒤 다시 시도해 주세요.')
  return documents[0].wiki_document_id
}

export type GenerateRule = {
  total_count: number
  problem_type_counts: { ox: number; select: number; short: number; long: number }
  difficulty: 'easy' | 'medium' | 'hard'
  focus_keywords: string[]
  coverage: 'balanced' | 'focused'
}

export const DEFAULT_GENERATE_RULE: GenerateRule = {
  total_count: 5,
  problem_type_counts: { ox: 0, select: 5, short: 0, long: 0 },
  difficulty: 'medium', focus_keywords: [], coverage: 'balanced',
}

export function validateGenerateRule(rule: GenerateRule): string | null {
  const counts = Object.values(rule.problem_type_counts)
  if (!Number.isSafeInteger(rule.total_count) || rule.total_count < 1 ||
    counts.some((count) => !Number.isSafeInteger(count) || count < 0) ||
    counts.reduce((sum, count) => sum + count, 0) !== rule.total_count) return '문항 수의 합계가 전체 문항 수와 같아야 합니다.'
  if (!['easy', 'medium', 'hard'].includes(rule.difficulty) || !['balanced', 'focused'].includes(rule.coverage) ||
    !Array.isArray(rule.focus_keywords) || !rule.focus_keywords.every((keyword) => typeof keyword === 'string')) return '문제 생성 규칙이 올바르지 않습니다.'
  return null
}

export async function createProblems(userId: string, subjectId: string, wikiId: string, rule: GenerateRule = DEFAULT_GENERATE_RULE): Promise<void> {
  const ruleError = validateGenerateRule(rule)
  if (ruleError) throw new ApiError(ruleError)
  expectNull(await apiRequest('/problems/create', {
    user_id: userId, subject_id: subjectId, wiki_document_id: wikiId,
    generate_rule: rule,
  }), '문제 생성')
}

export async function isCreatingProblems(userId: string, subjectId: string, wikiId: string): Promise<boolean> {
  return expectBooleanData(await apiRequest('/problems/is-creating', { user_id: userId, subject_id: subjectId, wiki_document_id: wikiId }), 'is_creating', '문제 생성 상태')
}

export type ApiProblem = {
  owner_user_id: string
  owner_subject_id: string
  owner_wiki_document_id: string
  problem_id: string
  owned_user_answer_id: string | null
  owned_grade_id: string | null
  problem_type: 'ox' | 'select' | 'short' | 'long'
  problem_number: number
  problem_question: string
  problem_correct_answer: string
  problem_options: string[]
}

function nullableId(value: unknown, label: string): string | null { return value === null ? null : expectId(value, label) }

function parseProblem(value: unknown): ApiProblem {
  const item = expectRecord(value, '문제')
  if (typeof item.problem_type !== 'string' || !['ox', 'select', 'short', 'long'].includes(item.problem_type) ||
    typeof item.problem_number !== 'number' || !Number.isFinite(item.problem_number) ||
    typeof item.problem_question !== 'string' || typeof item.problem_correct_answer !== 'string' ||
    !Array.isArray(item.problem_options) || !item.problem_options.every((option) => typeof option === 'string')) {
    throw new ApiError('문제 응답 형식이 올바르지 않습니다.')
  }
  return {
    owner_user_id: expectId(item.owner_user_id, '문제 사용자'), owner_subject_id: expectId(item.owner_subject_id, '문제 과목'),
    owner_wiki_document_id: expectId(item.owner_wiki_document_id, '문제 문서'), problem_id: expectId(item.problem_id, '문제'),
    owned_user_answer_id: nullableId(item.owned_user_answer_id, '답안'), owned_grade_id: nullableId(item.owned_grade_id, '채점'),
    problem_type: item.problem_type as ApiProblem['problem_type'], problem_number: item.problem_number,
    problem_question: item.problem_question, problem_correct_answer: item.problem_correct_answer, problem_options: item.problem_options,
  }
}

export async function getProblems(userId: string, subjectId: string, wikiId: string): Promise<ApiProblem[]> {
  let raw: unknown
  try { raw = await apiRequest('/problems/get-all', { user_id: userId, subject_id: subjectId, wiki_document_id: wikiId }) }
  catch (error) { if (isEmptyCollectionError(error)) return []; throw error }
  const data = expectRecord(raw, '문제 조회')
  if (!Array.isArray(data.problems)) throw new ApiError('문제 목록 응답 형식이 올바르지 않습니다.')
  const problems = data.problems.map(parseProblem)
  if (new Set(problems.map((item) => item.problem_id)).size !== problems.length) throw new ApiError('문제 식별자가 중복되었습니다.')
  return problems
}

export type ApiUserAnswer = {
  owner_user_id: string
  owner_subject_id: string
  owner_wiki_document_id: string
  owner_problem_id: string
  user_answer_id: string
  user_answer: string
  user_answer_state: string | null
}

function parseUserAnswer(value: unknown): ApiUserAnswer {
  const item = expectRecord(value, '답안')
  if (typeof item.user_answer !== 'string' || (item.user_answer_state !== null && typeof item.user_answer_state !== 'string')) {
    throw new ApiError('답안 응답 형식이 올바르지 않습니다.')
  }
  return {
    owner_user_id: expectId(item.owner_user_id, '답안 사용자'), owner_subject_id: expectId(item.owner_subject_id, '답안 과목'),
    owner_wiki_document_id: expectId(item.owner_wiki_document_id, '답안 문서'), owner_problem_id: expectId(item.owner_problem_id, '답안 문제'),
    user_answer_id: expectId(item.user_answer_id, '답안'), user_answer: item.user_answer, user_answer_state: item.user_answer_state,
  }
}

export async function getUserAnswers(userId: string, subjectId: string, wikiId: string): Promise<ApiUserAnswer[]> {
  let raw: unknown
  try { raw = await apiRequest('/problems/get-all-user-answers', { user_id: userId, subject_id: subjectId, wiki_document_id: wikiId }) }
  catch (error) { if (isEmptyCollectionError(error)) return []; throw error }
  const data = expectRecord(raw, '답안 조회')
  if (!Array.isArray(data.user_answers)) throw new ApiError('답안 목록 응답 형식이 올바르지 않습니다.')
  const answers = data.user_answers.map(parseUserAnswer)
  if (new Set(answers.map((item) => item.user_answer_id)).size !== answers.length) throw new ApiError('답안 식별자가 중복되었습니다.')
  if (new Set(answers.map((item) => item.owner_problem_id)).size !== answers.length) throw new ApiError('문제에 연결된 답안이 중복되었습니다.')
  return answers
}

export async function updateUserAnswer(userId: string, subjectId: string, answerId: string, answer: string): Promise<void> {
  expectNull(await patchRequest('/problems/user-answers/update', { user_id: userId, subject_id: subjectId, user_answer_id: answerId, new_datas: { user_answer: answer } }), '답안 저장')
}

export async function deleteProblem(userId: string, subjectId: string, problemId: string): Promise<void> {
  expectNull(await deleteRequest('/problems/delete', { user_id: userId, subject_id: subjectId, problem_id: problemId }), '문제 삭제')
}
