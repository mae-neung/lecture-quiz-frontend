import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/features/auth/AuthContext'
import SubjectHub from './SubjectHub'

const api = vi.hoisted(() => ({ getSubjects: vi.fn(), getWikiDocuments: vi.fn(), isUploading: vi.fn(), isSummarized: vi.fn(), isCreatingProblems: vi.fn(), uploadLectureUrls: vi.fn() }))
vi.mock('@/services/api', async (importOriginal) => ({ ...await importOriginal<typeof import('@/services/api')>(), ...api }))

beforeEach(() => {
  vi.clearAllMocks()
  api.getSubjects.mockResolvedValue([{ subjectId: 's1', subjectName: '통계학', subjectNumber: 1 }])
  api.getWikiDocuments.mockResolvedValue([{ owner_user_id: 'u1', owner_subject_id: 's1', wiki_document_id: 'w1', owned_problem_ids: [], wiki_document_content: '요약 본문' }])
  api.isUploading.mockResolvedValue(false)
  api.isSummarized.mockResolvedValue(true)
  api.isCreatingProblems.mockResolvedValue(false)
})

describe('SubjectHub', () => {
  it('새 과목의 상태 API가 실패해도 과목과 빈 문서 화면을 보여준다', async () => {
    api.isUploading.mockRejectedValue(new Error('subject state not found'))
    api.isSummarized.mockRejectedValue(new Error('subject state not found'))
    api.getWikiDocuments.mockResolvedValue([])
    render(<AuthContext.Provider value={{ isLoggedIn: true, userId: 'u1', login: vi.fn(), logout: vi.fn() }}><MemoryRouter initialEntries={['/subjects/s1']}><Routes><Route path="/subjects/:subjectId" element={<SubjectHub />} /></Routes></MemoryRouter></AuthContext.Provider>)
    expect(await screen.findByRole('heading', { name: '통계학' })).toBeInTheDocument()
    expect(screen.getByText(/일부 진행 상태/)).toBeInTheDocument()
    expect(screen.getByText(/아직 요약 문서가 없습니다/)).toBeInTheDocument()
  })

  it('문서 조회 실패를 빈 문서로 오인하지 않는다', async () => {
    api.getWikiDocuments.mockRejectedValue(new Error('network error'))
    render(<AuthContext.Provider value={{ isLoggedIn: true, userId: 'u1', login: vi.fn(), logout: vi.fn() }}><MemoryRouter initialEntries={['/subjects/s1']}><Routes><Route path="/subjects/:subjectId" element={<SubjectHub />} /></Routes></MemoryRouter></AuthContext.Provider>)
    expect(await screen.findByRole('heading', { name: '통계학' })).toBeInTheDocument()
    expect(screen.getByText(/요약 문서 목록을 불러오지 못했습니다/)).toBeInTheDocument()
    expect(screen.queryByText(/아직 요약 문서가 없습니다/)).not.toBeInTheDocument()
  })

  it('존재하지 않는 과목에서는 자료 등록 동작을 숨긴다', async () => {
    api.getSubjects.mockResolvedValue([])
    render(<AuthContext.Provider value={{ isLoggedIn: true, userId: 'u1', login: vi.fn(), logout: vi.fn() }}><MemoryRouter initialEntries={['/subjects/missing']}><Routes><Route path="/subjects/:subjectId" element={<SubjectHub />} /></Routes></MemoryRouter></AuthContext.Provider>)
    expect(await screen.findByRole('alert')).toHaveTextContent('과목을 찾을 수 없습니다')
    expect(screen.queryByRole('button', { name: 'URL 업로드 요청' })).not.toBeInTheDocument()
  })

  it('상태 false를 완료로 오해하지 않고 미구현 URL 오류를 입력과 함께 보여준다', async () => {
    api.uploadLectureUrls.mockRejectedValue(new Error('아직 구현되지 않았습니다'))
    const user = userEvent.setup()
    render(<AuthContext.Provider value={{ isLoggedIn: true, userId: 'u1', login: vi.fn(), logout: vi.fn() }}><MemoryRouter initialEntries={['/subjects/s1']}><Routes><Route path="/subjects/:subjectId" element={<SubjectHub />} /></Routes></MemoryRouter></AuthContext.Provider>)
    expect(await screen.findByRole('heading', { name: '통계학' })).toBeInTheDocument()
    expect(screen.getAllByText(/완료 여부는/).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: '문서와 문제 보기' })).toHaveAttribute('href', '/subjects/s1/wiki/w1')
    await user.type(screen.getByLabelText('자료 URL'), 'https://example.com/lecture')
    await user.click(screen.getByRole('button', { name: 'URL 업로드 요청' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('아직 구현되지 않았습니다')
    expect(screen.getByLabelText('자료 URL')).toHaveValue('https://example.com/lecture')
  })
})
