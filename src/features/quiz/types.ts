export type QuizOption = {
  id: string
  label: string
}

export type QuizQuestionType = 'ox' | 'select' | 'short' | 'long'

export type QuizQuestion = {
  id: string
  type: QuizQuestionType
  prompt: string
  options: QuizOption[]
  correctOptionId: string
  correctAnswer: string
  explanation: string
}

export type QuizAnswers = Record<string, string>

// 선택형(객관식·OX)은 보기를 고르는 방식으로 자동 채점한다.
export const CHOICE_TYPES: readonly QuizQuestionType[] = ['ox', 'select']

export function isChoiceQuestion(question: QuizQuestion): boolean {
  return CHOICE_TYPES.includes(question.type)
}

// 서술형(long)은 자동 정오 채점 대상이 아니며 모범답안만 제공한다.
export function isGradableQuestion(question: QuizQuestion): boolean {
  return question.type !== 'long'
}

export const QUESTION_TYPE_LABEL: Record<QuizQuestionType, string> = {
  ox: 'OX',
  select: '객관식',
  short: '단답형',
  long: '서술형',
}
