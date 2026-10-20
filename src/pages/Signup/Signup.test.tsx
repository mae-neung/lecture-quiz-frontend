import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Signup from './Signup'
import SignupCheckEmail from '@/pages/SignupCheckEmail/SignupCheckEmail'

const api = vi.hoisted(() => ({ signupApi: vi.fn(), resendEmailVerificationApi: vi.fn() }))
vi.mock('@/services/api', async (importOriginal) => ({ ...await importOriginal<typeof import('@/services/api')>(), ...api }))

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}{location.search}</output>
}

beforeEach(() => { vi.clearAllMocks(); window.sessionStorage.clear(); window.localStorage.clear() })

describe('Signup', () => {
  it('입력을 검증하고 비밀번호가 일치할 때만 가입 요청한다', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter initialEntries={['/signup']}><Routes><Route path="/signup" element={<Signup />} /></Routes></MemoryRouter>)
    await user.click(screen.getByRole('button', { name: '계정 만들기' }))
    expect(screen.getByText('이메일을 입력해 주세요.')).toBeInTheDocument()
    expect(api.signupApi).not.toHaveBeenCalled()
    await user.type(screen.getByLabelText('이메일'), 'student@example.com')
    await user.type(screen.getByLabelText('비밀번호', { exact: true }), 'secret')
    await user.type(screen.getByLabelText('비밀번호 확인'), 'different')
    await user.click(screen.getByRole('button', { name: '계정 만들기' }))
    expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument()
    expect(api.signupApi).not.toHaveBeenCalled()
  })

  it('서버 실패 시 입력을 보존하고 성공 시 이메일만 다음 화면에 전달한다', async () => {
    api.signupApi.mockRejectedValueOnce(new Error('가입 실패')).mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    render(<MemoryRouter initialEntries={['/signup']}><LocationProbe /><Routes><Route path="/signup" element={<Signup />} /><Route path="/signup/check-email" element={<SignupCheckEmail />} /></Routes></MemoryRouter>)
    await user.type(screen.getByLabelText('이메일'), 'student@example.com')
    await user.type(screen.getByLabelText('비밀번호', { exact: true }), 'secret')
    await user.type(screen.getByLabelText('비밀번호 확인'), 'secret')
    await user.click(screen.getByRole('button', { name: '계정 만들기' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('가입 실패')
    expect(screen.getByLabelText('비밀번호', { exact: true })).toHaveValue('secret')
    await user.click(screen.getByRole('button', { name: '계정 만들기' }))
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/signup/check-email'))
    expect(screen.getByLabelText('이메일')).toHaveValue('student@example.com')
    expect(window.sessionStorage.length).toBe(0)
    expect(window.localStorage.length).toBe(0)
    expect(screen.getByTestId('location')).not.toHaveTextContent('secret')
  })
})
