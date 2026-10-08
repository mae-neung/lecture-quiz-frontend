import { describe, expect, it } from 'vitest'
import { mockQuizQuestions } from './mockQuestions'
import { getCorrectCount, getFirstUnansweredIndex, getQuizScore } from './scoreQuiz'

describe('quiz score helpers', () => {
  it('정답 수와 100점 환산 점수를 계산한다', () => {
    const answers = Object.fromEntries(mockQuizQuestions.map((question, index) => [
      question.id,
      index < 4 ? question.correctOptionId : 'wrong',
    ]))

    expect(getCorrectCount(mockQuizQuestions, answers)).toBe(4)
    expect(getQuizScore(mockQuizQuestions, answers)).toBe(80)
  })

  it('첫 번째 미답변 문항을 찾고 빈 퀴즈는 0점으로 처리한다', () => {
    expect(getFirstUnansweredIndex(mockQuizQuestions, { q1: 'a', q3: 'b' })).toBe(1)
    expect(getQuizScore([], {})).toBe(0)
  })
})
