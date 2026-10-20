import { ApiError, expectId, expectRecord } from '@/services/api'
import type { QuizQuestion } from '@/features/quiz/types'

export function mapApiProblems(value: unknown): QuizQuestion[] {
  if (!Array.isArray(value) || value.length !== 5) throw new ApiError('객관식 문제가 5개 생성되지 않았습니다. 다시 시도해 주세요.')
  const mapped = value.map((raw): QuizQuestion => {
    const item = expectRecord(raw, '문제')
    if (item.problem_type !== 'select' || typeof item.problem_question !== 'string' || !item.problem_question.trim() ||
      !Array.isArray(item.problem_options) || item.problem_options.length < 2 ||
      !item.problem_options.every((option) => typeof option === 'string' && option.trim())) {
      throw new ApiError('생성된 객관식 문제를 해석할 수 없습니다.')
    }
    const options = item.problem_options as string[]
    if (new Set(options.map((option) => option.trim())).size !== options.length) throw new ApiError('문제 선택지가 중복되어 정답을 연결할 수 없습니다.')
    const correct = item.problem_correct_answer
    const match = typeof correct === 'string' ? options.findIndex((option) => option.trim() === correct.trim()) : -1
    if (match < 0) throw new ApiError('문제의 정답을 선택지에 연결할 수 없습니다.')
    return {
      id: expectId(item.problem_id, '문제'), prompt: item.problem_question.trim(),
      options: options.map((label, index) => ({ id: String(index), label })),
      correctOptionId: String(match), explanation: '서버에서 해설을 제공하지 않았습니다.',
    }
  })
  if (new Set(mapped.map((question) => question.id)).size !== 5) throw new ApiError('문제 식별자가 중복되었습니다.')
  return mapped
}
