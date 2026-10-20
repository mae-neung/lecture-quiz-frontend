import { describe, expect, it } from 'vitest'
import { mapApiProblems } from './mapApiProblems'

const problems = Array.from({ length: 5 }, (_, index) => ({
  problem_id: index + 1, problem_type: 'select', problem_question: `질문 ${index + 1}`,
  problem_options: ['첫째', '둘째'], problem_correct_answer: '둘째',
}))

describe('API 문제 매핑', () => {
  it('실제 객관식 5개를 로컬 문제로 변환한다', () => {
    const mapped = mapApiProblems(problems)
    expect(mapped).toHaveLength(5)
    expect(mapped[0].correctOptionId).toBe('1')
    expect(mapped[0].explanation).toContain('해설을 제공하지 않았습니다')
  })

  it('문항 부족과 매핑 불가능한 정답을 성공으로 취급하지 않는다', () => {
    expect(() => mapApiProblems(problems.slice(0, 4))).toThrow('5개')
    expect(() => mapApiProblems([{ ...problems[0], problem_correct_answer: '없는 답' }, ...problems.slice(1)])).toThrow('정답')
  })
})
