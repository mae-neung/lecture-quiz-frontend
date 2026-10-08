import type { QuizAnswers, QuizQuestion } from './types'

export function getCorrectCount(questions: QuizQuestion[], answers: QuizAnswers) {
  return questions.reduce(
    (count, question) => count + (answers[question.id] === question.correctOptionId ? 1 : 0),
    0,
  )
}

export function getQuizScore(questions: QuizQuestion[], answers: QuizAnswers) {
  if (questions.length === 0) return 0
  return Math.round((getCorrectCount(questions, answers) / questions.length) * 100)
}

export function getFirstUnansweredIndex(questions: QuizQuestion[], answers: QuizAnswers) {
  return questions.findIndex((question) => !answers[question.id])
}
