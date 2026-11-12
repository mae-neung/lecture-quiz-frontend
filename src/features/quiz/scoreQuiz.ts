import { isGradableQuestion, type QuizAnswers, type QuizQuestion } from './types'

// 단답형 비교용 정규화: 앞뒤 공백 제거, 연속 공백 1칸, 유니코드 정규화, 소문자화.
function normalizeText(value: string): string {
  return value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase()
}

export function isAnswered(question: QuizQuestion, answers: QuizAnswers): boolean {
  const answer = answers[question.id]
  if (answer === undefined) return false
  return answer.trim().length > 0
}

export function isCorrect(question: QuizQuestion, answers: QuizAnswers): boolean {
  if (!isGradableQuestion(question)) return false
  const answer = answers[question.id]
  if (answer === undefined) return false
  if (question.type === 'short') {
    return normalizeText(answer) === normalizeText(question.correctAnswer)
  }
  return answer === question.correctOptionId
}

// 자동 채점 가능한 문항(서술형 제외) 수.
export function getGradableCount(questions: QuizQuestion[]): number {
  return questions.filter(isGradableQuestion).length
}

export function getCorrectCount(questions: QuizQuestion[], answers: QuizAnswers): number {
  return questions.reduce((count, question) => count + (isCorrect(question, answers) ? 1 : 0), 0)
}

// 100점 환산은 자동 채점 가능한 문항만 분모로 사용한다.
export function getQuizScore(questions: QuizQuestion[], answers: QuizAnswers): number {
  const gradable = getGradableCount(questions)
  if (gradable === 0) return 0
  return Math.round((getCorrectCount(questions, answers) / gradable) * 100)
}

export function getFirstUnansweredIndex(questions: QuizQuestion[], answers: QuizAnswers): number {
  return questions.findIndex((question) => !isAnswered(question, answers))
}
