import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/features/auth/AuthContext'
import WikiDetail from './WikiDetail'

const api = vi.hoisted(() => ({ getWikiDocuments: vi.fn(), getProblems: vi.fn(), getUserAnswers: vi.fn(), isCreatingProblems: vi.fn(), createProblems: vi.fn(), updateUserAnswer: vi.fn(), deleteProblem: vi.fn() }))
vi.mock('@/services/api', async (importOriginal) => ({ ...await importOriginal<typeof import('@/services/api')>(), ...api }))

beforeEach(() => {
  vi.clearAllMocks()
  api.getWikiDocuments.mockResolvedValue([{ owner_user_id: 'u1', owner_subject_id: 's1', wiki_document_id: 'w1', owned_problem_ids: ['p1'], wiki_document_content: '요약 전체 본문' }])
  api.getProblems.mockResolvedValue([{ owner_user_id: 'u1', owner_subject_id: 's1', owner_wiki_document_id: 'w1', problem_id: 'p1', owned_user_answer_id: 'a1', owned_grade_id: null, problem_type: 'short', problem_number: 1, problem_question: '핵심 개념?', problem_correct_answer: '회귀', problem_options: [] }])
  api.getUserAnswers.mockResolvedValue([{ owner_user_id: 'u1', owner_subject_id: 's1', owner_wiki_document_id: 'w1', owner_problem_id: 'p1', user_answer_id: 'a1', user_answer: '평균', user_answer_state: null }])
  api.isCreatingProblems.mockResolvedValue(false)
  api.updateUserAnswer.mockResolvedValue(undefined)
  api.deleteProblem.mockResolvedValue(undefined)
})

function renderWiki() {
  return render(<AuthContext.Provider value={{ isLoggedIn: true, userId: 'u1', login: vi.fn(), logout: vi.fn() }}><MemoryRouter initialEntries={['/subjects/s1/wiki/w1']}><Routes><Route path="/subjects/:subjectId/wiki/:wikiId" element={<WikiDetail />} /></Routes></MemoryRouter></AuthContext.Provider>)
}

describe('WikiDetail', () => {
  it('문항 수 합계를 검증하고 기존 답안을 problem_id로 연결해 수정한다', async () => {
    const user = userEvent.setup()
    renderWiki()
    expect(await screen.findByText('요약 전체 본문')).toBeInTheDocument()
    expect(screen.getByLabelText('단답형 답안')).toHaveValue('평균')
    await user.clear(screen.getByLabelText('전체 문항 수'))
    await user.type(screen.getByLabelText('전체 문항 수'), '2')
    await user.click(screen.getByRole('button', { name: '문제 생성 요청' }))
    expect(screen.getByRole('alert')).toHaveTextContent('합계')
    expect(api.createProblems).not.toHaveBeenCalled()
    await user.clear(screen.getByLabelText('단답형 답안'))
    await user.type(screen.getByLabelText('단답형 답안'), '회귀 분석')
    await user.click(screen.getByRole('button', { name: '답안 수정 저장' }))
    expect(api.updateUserAnswer).toHaveBeenCalledWith('u1', 's1', 'a1', '회귀 분석')
  })

  it('문제 삭제는 연쇄 삭제 안내 후 확인해야 호출한다', async () => {
    const user = userEvent.setup()
    renderWiki()
    await screen.findByText('핵심 개념?')
    await user.click(screen.getByRole('button', { name: '문제 삭제' }))
    expect(api.deleteProblem).not.toHaveBeenCalled()
    expect(screen.getByText(/연결된 답안과 채점 기록/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '문제 삭제 확인' }))
    expect(api.deleteProblem).toHaveBeenCalledWith('u1', 's1', 'p1')
  })

  it('수동 새로고침 중에도 저장하지 않은 답안을 보존한다', async () => {
    const user = userEvent.setup()
    renderWiki()
    const input = await screen.findByLabelText('단답형 답안')
    await user.clear(input)
    await user.type(input, '저장 전 답안')
    await user.click(screen.getByRole('button', { name: '문서·상태·문제 다시 불러오기' }))
    expect(await screen.findByDisplayValue('저장 전 답안')).toBeInTheDocument()
  })
})
