import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SignupCheckEmail from './SignupCheckEmail'

const api = vi.hoisted(() => ({ resendEmailVerificationApi: vi.fn() }))
vi.mock('@/services/api', async (importOriginal) => ({ ...await importOriginal<typeof import('@/services/api')>(), ...api }))

beforeEach(() => vi.clearAllMocks())

describe('SignupCheckEmail', () => {
  it('직접 접근 시 이메일을 입력받아 재발송한다', async () => {
    api.resendEmailVerificationApi.mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<MemoryRouter><SignupCheckEmail /></MemoryRouter>)
    await user.click(screen.getByRole('button', { name: '인증 메일 다시 보내기' }))
    expect(screen.getByRole('alert')).toHaveTextContent('올바른 이메일')
    await user.type(screen.getByLabelText('이메일'), 'student@example.com')
    await user.click(screen.getByRole('button', { name: '인증 메일 다시 보내기' }))
    expect(await screen.findByRole('status')).toHaveTextContent('다시 보냈습니다')
    expect(api.resendEmailVerificationApi).toHaveBeenCalledWith('student@example.com')
    expect(screen.getByRole('link', { name: '로그인' })).toHaveAttribute('href', '/login')
  })
})
