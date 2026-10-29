import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/features/auth/AuthContext'
import { libraryKey } from '@/features/library/libraryStorage'
import { apiLibraryScope } from '@/services/apiStorage'
import Account from './Account'

const api = vi.hoisted(() => ({ deleteUser: vi.fn() }))
vi.mock('@/services/api', async (importOriginal) => ({ ...await importOriginal<typeof import('@/services/api')>(), ...api }))

beforeEach(() => { vi.clearAllMocks(); window.localStorage.clear() })

describe('Account', () => {
  it('현재 계정에 대해 문구 입력과 두 단계 확인 후에만 삭제하고 로컬 범위를 정리한다', async () => {
    api.deleteUser.mockResolvedValue(undefined)
    const logout = vi.fn()
    window.localStorage.setItem(libraryKey(apiLibraryScope('u1')), 'saved')
    const user = userEvent.setup()
    render(<AuthContext.Provider value={{ isLoggedIn: true, userId: 'u1', login: vi.fn(), logout }}><MemoryRouter initialEntries={['/account']}><Routes><Route path="/account" element={<Account />} /><Route path="/login" element={<p>로그인 화면</p>} /></Routes></MemoryRouter></AuthContext.Provider>)
    expect(screen.getByText(/현재 로그인한 사용자 ID/)).toHaveTextContent('u1')
    expect(api.deleteUser).not.toHaveBeenCalled()
    await user.type(screen.getByLabelText(/확인을 위해/), '탈퇴')
    await user.click(screen.getByRole('button', { name: '탈퇴 확인 단계로' }))
    expect(api.deleteUser).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '현재 계정 최종 탈퇴' }))
    expect(api.deleteUser).toHaveBeenCalledWith('u1')
    expect(await screen.findByText('로그인 화면')).toBeInTheDocument()
    expect(window.localStorage.getItem(libraryKey(apiLibraryScope('u1')))).toBeNull()
    expect(logout).toHaveBeenCalled()
  })
})
