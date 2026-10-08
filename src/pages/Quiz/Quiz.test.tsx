import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockQuizQuestions } from '@/features/quiz/mockQuestions'
import AppRouter from '@/router/AppRouter'

function openAt(path: string) {
  window.history.replaceState({}, '', `/lecture-quiz-frontend/#${path}`)
  render(<AppRouter />)
}

async function signIn() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('아이디'), 'test1234')
  await user.type(screen.getByLabelText('비밀번호'), 'test1234')
  await user.click(screen.getByRole('button', { name: '로그인하고 시작하기' }))
  return user
}

beforeEach(() => {
  window.sessionStorage.clear()
  vi.stubGlobal('scrollTo', vi.fn())
})

describe('Quiz', () => {
  it('미로그인 접근을 보호하고 로그인 뒤 문제풀이 화면으로 복귀한다', async () => {
    openAt('/quiz')
    expect(window.location.hash).toBe('#/login')

    await signIn()

    expect(window.location.hash).toBe('#/quiz')
    expect(screen.getByRole('heading', { name: '핵심 개념을 문제로 확인해요.' })).toBeInTheDocument()
  })

  it('문제를 이동해도 선택한 답안을 유지하고 첫 미답변으로 안내한다', async () => {
    openAt('/quiz')
    const user = await signIn()
    const firstQuestion = mockQuizQuestions[0]
    const secondQuestion = mockQuizQuestions[1]

    await user.click(screen.getByRole('radio', { name: new RegExp(firstQuestion.options[0].label) }))
    await user.click(screen.getByRole('button', { name: '다음 문제' }))
    expect(screen.getByRole('heading', { name: secondQuestion.prompt })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /1번 문제, 답변 완료/ }))
    expect(screen.getByRole('radio', { name: new RegExp(firstQuestion.options[0].label) })).toBeChecked()

    await user.click(screen.getByRole('button', { name: '채점하기' }))
    const unansweredHeading = screen.getByRole('heading', { name: secondQuestion.prompt })
    expect(screen.getByRole('alert')).toHaveTextContent('2번 문제부터 답을 선택해 주세요.')
    await waitFor(() => expect(unansweredHeading).toHaveFocus())
  })

  it('모든 답을 채점해 점수·정답·해설을 보여주고 다시 풀 수 있다', async () => {
    openAt('/quiz')
    const user = await signIn()

    for (const [index, question] of mockQuizQuestions.entries()) {
      const optionId = index === mockQuizQuestions.length - 1
        ? question.options.find((option) => option.id !== question.correctOptionId)?.id
        : question.correctOptionId
      const option = question.options.find((item) => item.id === optionId)
      if (!option) throw new Error('테스트 답안을 찾을 수 없습니다.')
      await user.click(screen.getByRole('radio', { name: new RegExp(option.label) }))
      if (index < mockQuizQuestions.length - 1) {
        await user.click(screen.getByRole('button', { name: '다음 문제' }))
      }
    }

    await user.click(screen.getByRole('button', { name: '채점하기' }))

    expect(screen.getByRole('heading', { name: '오늘의 복습 결과예요.' })).toBeInTheDocument()
    expect(screen.getByText('80점')).toBeInTheDocument()
    expect(screen.getByText('4 / 5 정답')).toBeInTheDocument()
    expect(screen.getAllByText(/^내 답:/)).toHaveLength(5)
    expect(screen.getAllByText(/^정답:/)).toHaveLength(5)
    expect(screen.getAllByText(/^해설:/)).toHaveLength(5)

    await user.click(screen.getByRole('button', { name: '다시 풀기' }))
    expect(screen.getByRole('heading', { name: mockQuizQuestions[0].prompt })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: new RegExp(mockQuizQuestions[0].options[0].label) })).not.toBeChecked()
  })
})
