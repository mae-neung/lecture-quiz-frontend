import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Button from './Button'

describe('Button', () => {
  it('기존 API와 기본 button 타입을 유지한다', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(
      <Button className="custom-button" onClick={handleClick} variant="secondary">
        저장
      </Button>,
    )

    const button = screen.getByRole('button', { name: '저장' })

    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('custom-button')
    expect(button).not.toHaveAttribute('variant')

    await user.click(button)
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('disabled native 동작을 전달한다', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button disabled onClick={handleClick}>삭제</Button>)

    const button = screen.getByRole('button', { name: '삭제' })
    expect(button).toBeDisabled()

    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('Tab 포커스와 Enter 및 Space 키보드 활성화를 지원한다', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>계속</Button>)

    const button = screen.getByRole('button', { name: '계속' })
    await user.tab()
    expect(button).toHaveFocus()

    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    expect(handleClick).toHaveBeenCalledTimes(2)
  })
})
