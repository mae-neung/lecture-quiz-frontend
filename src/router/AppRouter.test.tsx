import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import AppRouter from './AppRouter'

describe('AppRouter', () => {
  it('Home에서 About으로 이동하고 페이지 내용을 렌더링한다', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/')

    render(<AppRouter />)

    expect(screen.getByRole('heading', { name: '프론트엔드 작업을 시작하는 기본 템플릿' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'About' }))

    expect(screen.getByRole('heading', { name: '기본 폴더 구조' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/about')
  })

  it('알 수 없는 경로에서 404 화면과 복귀 링크를 제공한다', () => {
    window.history.pushState({}, '', '/missing-page')

    render(<AppRouter />)

    expect(screen.getByRole('heading', { name: '페이지를 찾을 수 없습니다.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home으로 돌아가기' })).toHaveAttribute('href', '/')
  })
})
