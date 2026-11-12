import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/features/auth/AuthContext'
import SubjectQuiz from './SubjectQuiz'

const api = vi.hoisted(() => ({ getSubjects: vi.fn(), getWikiDocuments: vi.fn(), getProblems: vi.fn() }))
vi.mock('@/services/api', async (importOriginal) => ({ ...await importOriginal<typeof import('@/services/api')>(), ...api }))

function renderAt(subjectId: string) {
  return render(<AuthContext.Provider value={{ isLoggedIn: true, userId: 'u1', login: vi.fn(), logout: vi.fn() }}><MemoryRouter initialEntries={[`/subjects/${subjectId}/quiz`]}><Routes><Route path="/subjects/:subjectId/quiz" element={<SubjectQuiz />} /></Routes></MemoryRouter></AuthContext.Provider>)
}

beforeEach(() => {
  vi.clearAllMocks()
  api.getSubjects.mockResolvedValue([{ subjectId: 's1', subjectName: '통계학', subjectNumber: 1 }])
})

describe('SubjectQuiz', () => {
  it('과목의 모든 요약 문서 문제를 합쳐 풀이 화면을 보여준다', async () => {
    api.getWikiDocuments.mockResolvedValue([
      { owner_user_id: 'u1', owner_subject_id: 's1', wiki_document_id: 'w1', owned_problem_ids: ['p1'], wiki_document_content: '본문1' },
      { owner_user_id: 'u1', owner_subject_id: 's1', wiki_document_id: 'w2', owned_problem_ids: ['p2'], wiki_document_content: '본문2' },
    ])
    api.getProblems.mockImplementation((_userId: string, _subjectId: string, wikiId: string) => Promise.resolve([
      { owner_user_id: 'u1', owner_subject_id: 's1', owner_wiki_document_id: wikiId, problem_id: wikiId === 'w1' ? 'p1' : 'p2', owned_user_answer_id: null, owned_grade_id: null, problem_type: 'select', problem_number: 1, problem_question: `${wikiId} 질문`, problem_correct_answer: '둘째', problem_options: ['첫째', '둘째'] },
    ]))
    renderAt('s1')
    expect(await screen.findByRole('heading', { name: '통계학 문제 풀기' })).toBeInTheDocument()
    expect(api.getProblems).toHaveBeenCalledTimes(2)
    expect(screen.getByText('w1 질문')).toBeInTheDocument()
  })

  it('문제가 없으면 안내 문구와 과목 상세 링크를 보여준다', async () => {
    api.getWikiDocuments.mockResolvedValue([])
    renderAt('s1')
    expect(await screen.findByRole('heading', { name: '아직 풀 문제가 없어요' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '과목 상세로 가기' })).toHaveAttribute('href', '/subjects/s1')
    expect(api.getProblems).not.toHaveBeenCalled()
  })

  it('조회 실패 시 오류와 다시 시도를 제공한다', async () => {
    api.getWikiDocuments.mockRejectedValue(new Error('network error'))
    renderAt('s1')
    expect(await screen.findByRole('alert')).toHaveTextContent('network error')
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument()
  })
})
