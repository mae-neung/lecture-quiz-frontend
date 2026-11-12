import { describe, expect, it } from 'vitest'
import { mockQuizQuestions } from './mockQuestions'
import { getCorrectCount, getFirstUnansweredIndex, getGradableCount, getQuizScore } from './scoreQuiz'

// 자동 채점 가능한 문항(서술형 제외) 수.
const gradable = mockQuizQuestions.filter((question) => question.type !== 'long').length

describe('quiz score helpers', () => {
  it('유형별 정답을 채점하고 서술형을 제외한 100점 환산을 계산한다', () => {
    const answers = Object.fromEntries(mockQuizQuestions.map((question) => [
      question.id,
      question.type === 'ox' || question.type === 'select' ? question.correctOptionId : question.correctAnswer,
    ]))

    expect(getGradableCount(mockQuizQuestions)).toBe(gradable)
    expect(getCorrectCount(mockQuizQuestions, answers)).toBe(gradable)
    expect(getQuizScore(mockQuizQuestions, answers)).toBe(100)
  })

  it('단답형은 공백·대소문자 차이를 무시하고 서술형은 채점에서 제외한다', () => {
    const short = mockQuizQuestions.find((question) => question.type === 'short')!
    const long = mockQuizQuestions.find((question) => question.type === 'long')!
    const answers = { [short.id]: `  ${short.correctAnswer.toUpperCase()}  `, [long.id]: '아무 서술이나 입력' }

    // 단답형 1개만 정답 처리, 서술형은 정답/오답 어느 쪽으로도 세지 않는다.
    expect(getCorrectCount([short, long], answers)).toBe(1)
    expect(getGradableCount([short, long])).toBe(1)
    expect(getQuizScore([short, long], answers)).toBe(100)
  })

  it('첫 번째 미답변 문항을 찾고 빈 퀴즈는 0점으로 처리한다', () => {
    expect(getFirstUnansweredIndex(mockQuizQuestions, { q1: 'a', q3: 'b' })).toBe(1)
    expect(getQuizScore([], {})).toBe(0)
  })
})
