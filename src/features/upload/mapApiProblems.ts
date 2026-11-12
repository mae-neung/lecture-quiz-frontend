import { ApiError, expectId, expectRecord } from '@/services/api'
import type { QuizQuestion, QuizQuestionType } from '@/features/quiz/types'

const PROBLEM_TYPES: readonly QuizQuestionType[] = ['ox', 'select', 'short', 'long']

function mapChoiceQuestion(item: Record<string, unknown>, id: string, prompt: string, type: 'ox' | 'select'): QuizQuestion {
  const rawOptions = Array.isArray(item.problem_options) ? item.problem_options : []
  const hasValidOptions = rawOptions.length > 0 && rawOptions.every((option) => typeof option === 'string' && option.trim())
  // 백엔드는 OX 문제의 보기를 빈 배열로 보내므로 O/X 보기를 기본 생성한다.
  const source = hasValidOptions ? (rawOptions as string[]) : type === 'ox' ? ['O', 'X'] : []
  if (source.length < 2) throw new ApiError('생성된 선택형 문제의 보기가 부족합니다.')
  const options = source.map((label) => label.trim())
  if (new Set(options).size !== options.length) throw new ApiError('문제 선택지가 중복되어 정답을 연결할 수 없습니다.')
  const correct = item.problem_correct_answer
  const match = typeof correct === 'string' ? options.findIndex((option) => option === correct.trim()) : -1
  if (match < 0) throw new ApiError('문제의 정답을 선택지에 연결할 수 없습니다.')
  return {
    id,
    type,
    prompt,
    options: options.map((label, index) => ({ id: String(index), label })),
    correctOptionId: String(match),
    correctAnswer: options[match],
    explanation: '서버에서 해설을 제공하지 않았습니다.',
  }
}

function mapTextQuestion(item: Record<string, unknown>, id: string, prompt: string, type: 'short' | 'long'): QuizQuestion {
  const correct = item.problem_correct_answer
  if (typeof correct !== 'string' || !correct.trim()) {
    throw new ApiError(type === 'short' ? '생성된 단답형 문제의 정답을 확인할 수 없습니다.' : '생성된 서술형 문제의 모범답안을 확인할 수 없습니다.')
  }
  return {
    id,
    type,
    prompt,
    options: [],
    correctOptionId: '',
    correctAnswer: correct.trim(),
    explanation: '서버에서 해설을 제공하지 않았습니다.',
  }
}

export function mapApiProblems(value: unknown): QuizQuestion[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ApiError('객관식 문제가 생성되지 않았습니다. 다시 시도해 주세요.')
  }
  const mapped = value.map((raw): QuizQuestion => {
    const item = expectRecord(raw, '문제')
    const rawType = item.problem_type
    if (typeof rawType !== 'string' || !PROBLEM_TYPES.includes(rawType as QuizQuestionType) ||
      typeof item.problem_question !== 'string' || !item.problem_question.trim()) {
      throw new ApiError('생성된 문제를 해석할 수 없습니다.')
    }
    const type = rawType as QuizQuestionType
    const id = expectId(item.problem_id, '문제')
    const prompt = item.problem_question.trim()
    if (type === 'ox' || type === 'select') return mapChoiceQuestion(item, id, prompt, type)
    return mapTextQuestion(item, id, prompt, type)
  })
  if (new Set(mapped.map((question) => question.id)).size !== mapped.length) {
    throw new ApiError('문제 식별자가 중복되었습니다.')
  }
  return mapped
}
