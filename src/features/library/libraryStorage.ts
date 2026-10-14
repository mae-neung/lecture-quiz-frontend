import { mockQuizQuestions } from '@/features/quiz/mockQuestions'
import type { QuizQuestion } from '@/features/quiz/types'
import type { LectureType } from '@/features/upload/validateLecture'

export const LIBRARY_KEY = 'amattasihum.quiz-library.v1'

export type SavedQuizSet = {
  id: string
  title: string
  materialType: LectureType
  fileName: string
  fileSize: number
  createdAt: string
  updatedAt: string
  questions: QuizQuestion[]
}

type LibraryData = { version: 1; sets: SavedQuizSet[] }
export type LibraryResult<T> = { ok: true; value: T } | { ok: false; error: string }

const invalidData = '저장된 자료를 읽을 수 없어요. 브라우저 저장 데이터가 손상되었을 수 있습니다. 기존 자료를 덮어쓰지 않으니 브라우저 데이터를 확인해 주세요.'
const storageBlocked = '브라우저 저장소에 접근할 수 없어요. 저장소 차단 설정 또는 시크릿 모드를 확인해 주세요.'
const storageFull = '브라우저 저장 공간이 부족해 자료를 저장하지 못했어요. 저장 공간을 확보한 뒤 다시 시도해 주세요.'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isQuestion(value: unknown): value is QuizQuestion {
  if (!isObject(value) || typeof value.id !== 'string' || typeof value.prompt !== 'string' ||
    typeof value.explanation !== 'string' || typeof value.correctOptionId !== 'string' ||
    !Array.isArray(value.options) || value.options.length < 2) return false
  const options = value.options
  return options.every((option) => isObject(option) && typeof option.id === 'string' && typeof option.label === 'string') &&
    options.some((option) => option.id === value.correctOptionId) &&
    new Set(options.map((option) => option.id)).size === options.length
}

function isSavedSet(value: unknown): value is SavedQuizSet {
  if (!isObject(value)) return false
  return typeof value.id === 'string' && /^[A-Za-z0-9_-]+$/.test(value.id) &&
    typeof value.title === 'string' && value.title.trim().length > 0 &&
    (value.materialType === 'video' || value.materialType === 'material') &&
    typeof value.fileName === 'string' && typeof value.fileSize === 'number' && Number.isFinite(value.fileSize) && value.fileSize >= 0 &&
    typeof value.createdAt === 'string' && !Number.isNaN(Date.parse(value.createdAt)) &&
    typeof value.updatedAt === 'string' && !Number.isNaN(Date.parse(value.updatedAt)) &&
    Array.isArray(value.questions) && value.questions.length > 0 && value.questions.every(isQuestion) &&
    new Set(value.questions.map((question) => question.id)).size === value.questions.length
}

function isLibraryData(value: unknown): value is LibraryData {
  return isObject(value) && value.version === 1 && Array.isArray(value.sets) &&
    value.sets.every(isSavedSet) && new Set(value.sets.map((set) => set.id)).size === value.sets.length
}

function writeLibrary(sets: SavedQuizSet[]): LibraryResult<SavedQuizSet[]> {
  try {
    window.localStorage.setItem(LIBRARY_KEY, JSON.stringify({ version: 1, sets }))
    window.dispatchEvent(new Event('quiz-library-change'))
    return { ok: true, value: sets }
  } catch (error) {
    const isQuota = error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22)
    return { ok: false, error: isQuota ? storageFull : storageBlocked }
  }
}

export function readLibrary(): LibraryResult<SavedQuizSet[]> {
  try {
    const raw = window.localStorage.getItem(LIBRARY_KEY)
    if (raw === null) return { ok: true, value: [] }
    const parsed: unknown = JSON.parse(raw)
    return isLibraryData(parsed) ? { ok: true, value: parsed.sets } : { ok: false, error: invalidData }
  } catch (error) {
    return { ok: false, error: error instanceof SyntaxError ? invalidData : storageBlocked }
  }
}

export function createSavedSet(input: Pick<SavedQuizSet, 'title' | 'materialType' | 'fileName' | 'fileSize'>): LibraryResult<SavedQuizSet> {
  const existing = readLibrary()
  if (!existing.ok) return existing
  const now = new Date().toISOString()
  const id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const set: SavedQuizSet = { ...input, id, createdAt: now, updatedAt: now, questions: structuredClone(mockQuizQuestions) }
  const written = writeLibrary([set, ...existing.value])
  return written.ok ? { ok: true, value: set } : written
}

export function renameSavedSet(id: string, title: string): LibraryResult<SavedQuizSet> {
  const existing = readLibrary()
  if (!existing.ok) return existing
  const set = existing.value.find((item) => item.id === id)
  if (!set) return { ok: false, error: '해당 문제 세트를 찾을 수 없어요.' }
  const trimmed = title.trim()
  if (!trimmed) return { ok: false, error: '강의명을 입력해 주세요.' }
  const updated = { ...set, title: trimmed, updatedAt: new Date().toISOString() }
  const written = writeLibrary(existing.value.map((item) => item.id === id ? updated : item))
  return written.ok ? { ok: true, value: updated } : written
}

export function deleteSavedSet(id: string): LibraryResult<null> {
  const existing = readLibrary()
  if (!existing.ok) return existing
  if (!existing.value.some((item) => item.id === id)) return { ok: false, error: '해당 문제 세트를 찾을 수 없어요.' }
  const written = writeLibrary(existing.value.filter((item) => item.id !== id))
  return written.ok ? { ok: true, value: null } : written
}
