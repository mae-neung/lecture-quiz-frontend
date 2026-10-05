import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import AppRouter from './AppRouter'

function openAt(path: string) {
  window.history.replaceState({}, '', `/lecture-quiz-frontend/#${path}`)
  render(<AppRouter />)
}

async function signIn() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('아이디'), 'test1234')
  await user.type(screen.getByLabelText('비밀번호'), 'test1234')
  await user.click(screen.getByRole('button', { name: '로그인하고 자료 등록하기' }))
  return user
}

beforeEach(() => {
  window.sessionStorage.clear()
})

describe('AppRouter', () => {
  it('홈에서 데모 로그인 화면으로 이동할 수 있다', async () => {
    const user = userEvent.setup()
    openAt('/')

    expect(screen.getByRole('heading', { name: /강의 하나 넣으면/ })).toBeInTheDocument()
    expect(screen.getByText('아맞다시험')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'About' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: '데모로 먼저 써보기' }))
    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument()
  })

  it('미로그인 /upload 접근을 막고 로그인 후 원래 경로로 돌아온다', async () => {
    openAt('/upload?source=home')
    expect(window.location.hash).toBe('#/login')
    expect(screen.getByText(/아맞다시험 데모/)).toBeInTheDocument()

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('아이디'), 'wrong')
    await user.type(screen.getByLabelText('비밀번호'), 'wrong')
    await user.click(screen.getByRole('button', { name: '로그인하고 자료 등록하기' }))
    expect(screen.getByRole('alert')).toHaveTextContent('아이디 또는 비밀번호를 확인해 주세요.')
    expect(screen.getByLabelText('아이디')).toHaveAttribute('aria-describedby', expect.stringContaining('login-error'))
    expect(screen.getByLabelText('비밀번호')).toHaveAttribute('aria-describedby', expect.stringContaining('login-error'))
    expect(window.location.hash).toBe('#/login')

    await user.clear(screen.getByLabelText('아이디'))
    await user.clear(screen.getByLabelText('비밀번호'))
    await user.type(screen.getByLabelText('아이디'), 'test1234')
    await user.type(screen.getByLabelText('비밀번호'), 'test1234')
    await user.click(screen.getByRole('button', { name: '로그인하고 자료 등록하기' }))

    expect(window.location.hash).toBe('#/upload?source=home')
    expect(screen.getByRole('heading', { name: '이번 시험에 나올 강의 자료를 골라주세요.' })).toBeInTheDocument()
    expect(Object.values(window.sessionStorage)).not.toContain('test1234')
  })

  it('로그아웃하면 세션을 지우고 업로드 경로를 다시 보호한다', async () => {
    openAt('/login')
    const user = await signIn()
    expect(window.location.hash).toBe('#/upload')

    await user.click(screen.getByRole('button', { name: '로그아웃' }))
    expect(window.location.hash).toBe('#/login')
    expect(window.sessionStorage.length).toBe(0)

    await user.click(screen.getByRole('link', { name: '자료 등록' }))
    expect(window.location.hash).toBe('#/login')
  })

  it('빈 강의명·파일 및 잘못된 파일 형식을 안내한다', async () => {
    openAt('/login')
    const user = await signIn()

    await user.click(screen.getByRole('button', { name: '데모 등록 확인' }))
    expect(screen.getByText('강의명을 입력해 주세요.')).toBeInTheDocument()
    expect(screen.getByText('파일을 선택해 주세요.')).toBeInTheDocument()
    expect(screen.getByLabelText('강의명')).toHaveAttribute('aria-invalid', 'true')

    await user.type(screen.getByLabelText('강의명'), '테스트 강의')
    await user.upload(screen.getByLabelText('강의 영상 파일'), new File([], 'empty.mp4', { type: 'video/mp4' }))
    await user.click(screen.getByRole('button', { name: '데모 등록 확인' }))
    expect(screen.getByText('비어 있는 파일은 등록할 수 없습니다.')).toBeInTheDocument()
  })

  it('형식이 맞는 교안은 메타데이터 완료 카드로 표시하고 다시 등록할 수 있다', async () => {
    openAt('/login')
    const user = await signIn()
    await user.click(screen.getByRole('radio', { name: /강의 교안/ }))
    await user.type(screen.getByLabelText('강의명'), '  데이터 분석 1강  ')
    await user.upload(screen.getByLabelText('강의 교안 파일'), new File(['document'], 'lecture.pdf', { type: 'application/pdf' }))
    await user.click(screen.getByRole('button', { name: '데모 등록 확인' }))

    expect(screen.getByRole('status')).toHaveTextContent('데이터 분석 1강')
    expect(screen.getByRole('status')).toHaveTextContent('lecture.pdf')
    expect(screen.getByRole('status')).toHaveTextContent('실제 파일 전송·저장·분석은 진행되지 않으며, 문제 만들기 기능은 준비 중입니다.')

    await user.click(screen.getByRole('button', { name: '다른 자료 등록하기' }))
    expect(screen.getByLabelText('강의명')).toHaveValue('')
    expect(screen.getByRole('radio', { name: /강의 영상/ })).toBeChecked()
  })

  it('알 수 없는 경로에서 404 화면과 복귀 링크를 제공한다', () => {
    openAt('/missing-page')
    expect(screen.getByRole('heading', { name: '페이지를 찾을 수 없습니다.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '홈으로 돌아가기' })).toHaveAttribute('href', '#/')
  })
})
