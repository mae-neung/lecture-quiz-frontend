import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/features/auth/AuthContext'
import Subjects from './Subjects'

const api = vi.hoisted(() => ({ getSubjects: vi.fn(), createSubject: vi.fn(), updateSubject: vi.fn(), deleteSubject: vi.fn() }))
vi.mock('@/services/api', async (importOriginal) => ({ ...await importOriginal<typeof import('@/services/api')>(), ...api }))

function renderSubjects() {
  return render(<AuthContext.Provider value={{ isLoggedIn: true, userId: 'u1', login: vi.fn(), logout: vi.fn() }}><MemoryRouter><Subjects /></MemoryRouter></AuthContext.Provider>)
}

beforeEach(() => vi.clearAllMocks())

describe('Subjects', () => {
  it('생성 후 이름 설정 실패 시 같은 과목에 PATCH만 다시 보낸다', async () => {
    api.getSubjects.mockResolvedValueOnce([]).mockResolvedValueOnce([{ subjectId: 's1', subjectName: '통계학', subjectNumber: 1 }])
    api.createSubject.mockResolvedValue('s1')
    api.updateSubject.mockRejectedValueOnce(new Error('이름 설정 실패')).mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    renderSubjects()
    await screen.findByText('아직 만든 과목이 없어요. 첫 과목을 만들어 보세요.')
    await user.type(screen.getByLabelText('과목명'), '통계학')
    await user.click(screen.getByRole('button', { name: '과목 만들기' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('이름 설정 실패')
    expect(screen.getByRole('button', { name: '과목명 설정 다시 시도' })).toBeInTheDocument()
    expect(screen.getByLabelText('과목명')).toHaveValue('통계학')
    await user.click(screen.getByRole('button', { name: '과목명 설정 다시 시도' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: '통계학' })).toBeInTheDocument())
    expect(api.createSubject).toHaveBeenCalledTimes(1)
    expect(api.updateSubject).toHaveBeenCalledTimes(2)
    expect(api.updateSubject).toHaveBeenCalledWith('u1', 's1', '통계학')
  })

  it('선택한 과목을 확인한 뒤에만 DELETE를 보낸다', async () => {
    api.getSubjects.mockResolvedValue([{ subjectId: 's1', subjectName: '통계학', subjectNumber: 1 }])
    api.deleteSubject.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderSubjects()
    await screen.findByRole('heading', { name: '통계학' })
    await user.click(screen.getByRole('button', { name: '과목 삭제' }))
    expect(api.deleteSubject).not.toHaveBeenCalled()
    expect(screen.getByText(/통계학.*과목을 삭제할까요/)).toBeInTheDocument()
    expect(screen.getByText(/서버에 저장된.*요약, 문제와 풀이·채점 기록은 모두 영구 삭제/)).toBeInTheDocument()
    expect(screen.getByText(/이 브라우저의 보관함 문제 세트는 별도로 남/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '과목 삭제 확인' }))
    await waitFor(() => expect(api.deleteSubject).toHaveBeenCalledWith('u1', 's1'))
    expect(screen.queryByRole('heading', { name: '통계학' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '내 과목' })).toHaveFocus()
  })
})
