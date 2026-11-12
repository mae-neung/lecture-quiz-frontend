import { describe, expect, it } from 'vitest'
import { mapApiProblems } from './mapApiProblems'

const selects = Array.from({ length: 5 }, (_, index) => ({
  problem_id: index + 1, problem_type: 'select', problem_question: `질문 ${index + 1}`,
  problem_options: ['첫째', '둘째'], problem_correct_answer: '둘째',
}))

describe('API 문제 매핑', () => {
  it('객관식을 로컬 문제로 변환한다', () => {
    const mapped = mapApiProblems(selects)
    expect(mapped).toHaveLength(5)
    expect(mapped[0].type).toBe('select')
    expect(mapped[0].correctOptionId).toBe('1')
    expect(mapped[0].explanation).toContain('해설을 제공하지 않았습니다')
  })

  it('서버가 준 개수만큼, OX·단답형·서술형을 포함해 변환한다', () => {
    expect(mapApiProblems(selects.slice(0, 3))).toHaveLength(3)

    const mixed = [
      { problem_id: 10, problem_type: 'ox', problem_question: 'OX 질문', problem_options: [], problem_correct_answer: 'O' },
      { problem_id: 11, problem_type: 'short', problem_question: '단답 질문', problem_options: [], problem_correct_answer: '중앙값' },
      { problem_id: 12, problem_type: 'long', problem_question: '서술 질문', problem_options: [], problem_correct_answer: '모범답안' },
    ]
    const mapped = mapApiProblems(mixed)
    expect(mapped.map((question) => question.type)).toEqual(['ox', 'short', 'long'])
    expect(mapped[0].options.map((option) => option.label)).toEqual(['O', 'X'])
    expect(mapped[0].correctOptionId).toBe('0')
    expect(mapped[1].correctAnswer).toBe('중앙값')
    expect(mapped[2].options).toHaveLength(0)
    expect(mapped[2].correctAnswer).toBe('모범답안')
  })

  it('빈 결과와 매핑 불가능한 정답을 성공으로 취급하지 않는다', () => {
    expect(() => mapApiProblems([])).toThrow('생성')
    expect(() => mapApiProblems([{ ...selects[0], problem_correct_answer: '없는 답' }])).toThrow('정답')
  })
})
