import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSavedSet, readLibrary } from '@/features/library/libraryStorage'
import AppRouter from '@/router/AppRouter'

function openAt(path: string) {
  window.history.replaceState({}, '', `/lecture-quiz-frontend/#${path}`)
  render(<AppRouter />)
}

async function signIn() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('아이디'), 'test1234')
  await user.type(screen.getByLabelText('비밀번호'), 'test1234')
  await user.click(screen.getByRole('button', { name: '로그인하고 시작하기' }))
  return user
}

beforeEach(() => {
  window.sessionStorage.clear()
  window.localStorage.clear()
  vi.stubGlobal('scrollTo', vi.fn())
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.setAttribute('open', '') } })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.removeAttribute('open') } })
})

describe('Library flow', () => {
  it('보호된 보관함에서 로그인 후 복귀하고, 저장 세트를 검색·정렬한다', async () => {
    createSavedSet({ title: '기초 통계', materialType: 'material', fileName: 'a.pdf', fileSize: 100 })
    createSavedSet({ title: '알고리즘', materialType: 'video', fileName: 'b.mp4', fileSize: 200 })
    openAt('/library')
    expect(window.location.hash).toBe('#/login')
    const user = await signIn()
    expect(window.location.hash).toBe('#/library')
    expect(screen.getByRole('heading', { name: '내 문제 모아보기' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    await user.type(screen.getByRole('searchbox'), '통계')
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByRole('heading', { name: '기초 통계' })).toBeInTheDocument()
    await user.clear(screen.getByRole('searchbox'))
    await user.selectOptions(screen.getByLabelText('정렬'), 'name')
    expect(within(screen.getAllByRole('listitem')[0]).getByRole('heading', { name: '기초 통계' })).toBeInTheDocument()
  })

  it('상세에서 이름을 변경하고 삭제 전 확인할 수 있다', async () => {
    const saved = createSavedSet({ title: '통계학', materialType: 'material', fileName: 'a.pdf', fileSize: 100 })
    if (!saved.ok) throw new Error(saved.error)
    openAt(`/library/${saved.value.id}`)
    const user = await signIn()
    await user.click(screen.getByRole('button', { name: '이름 변경' }))
    const input = screen.getByLabelText('새 강의명')
    await user.clear(input)
    await user.type(input, '중간고사 통계')
    await user.click(screen.getByRole('button', { name: '저장' }))
    expect(screen.getByRole('heading', { level: 1, name: '중간고사 통계' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '삭제' }))
    expect(screen.getByText(/복구할 수 없어요/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '취소' }))
    expect(readLibrary()).toMatchObject({ ok: true, value: [{ title: '중간고사 통계' }] })
    await user.click(screen.getByRole('button', { name: '삭제' }))
    await user.click(screen.getByRole('button', { name: '삭제하기' }))
    expect(window.location.hash).toBe('#/library')
    expect(screen.getByRole('status')).toHaveTextContent('문제 세트를 삭제했어요.')
    expect(readLibrary()).toEqual({ ok: true, value: [] })
  })

  it('저장된 세트의 풀이 화면과 시험지 옵션에 접근한다', async () => {
    const saved = createSavedSet({ title: '경제학', materialType: 'video', fileName: 'a.mp4', fileSize: 100 })
    if (!saved.ok) throw new Error(saved.error)
    openAt(`/library/${saved.value.id}`)
    const user = await signIn()
    await user.click(screen.getByRole('button', { name: '시험지 저장' }))
    expect(screen.getByRole('checkbox', { name: '정답·해설 포함하기' })).not.toBeChecked()
    expect(screen.getByText(/경제학-시험지.html/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '취소' }))
    await user.click(screen.getByRole('button', { name: '문제 풀기' }))
    expect(window.location.hash).toBe(`#/quiz/${saved.value.id}`)
    expect(screen.getByRole('heading', { name: '경제학 문제 풀기' })).toBeInTheDocument()
  })
})
