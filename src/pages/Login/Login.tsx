import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Button from '@/components/Button/Button'
import { useAuth } from '@/features/auth/useAuth'
import { isApiMode } from '@/services/api'
import './Login.css'

function Login() {
  const { isLoggedIn, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isPending, setPending] = useState(false)
  const state: unknown = location.state
  const from = typeof state === 'object' && state !== null && 'from' in state &&
    typeof state.from === 'string' && /^\/(?:upload|account|subjects(?:\/[A-Za-z0-9_-]+(?:\/wiki\/[A-Za-z0-9_-]+)?)?|quiz(?:\/[A-Za-z0-9_-]+)?|library(?:\/[A-Za-z0-9_-]+)?)(?:[?#]|$)/.test(state.from)
    ? state.from
    : '/upload'

  if (isLoggedIn) return <Navigate to={from} replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isPending) return
    setPending(true)
    setError('')
    try {
      if (await login(username, password)) navigate(from, { replace: true })
      else setError('아이디 또는 비밀번호를 확인해 주세요.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '로그인 중 오류가 발생했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="login-page">
      <div className="login-page__intro">
        <p className="page__eyebrow">아맞다, 공부해야지!</p>
        <h1>시험 범위 정리,<br />강의 자료부터 가볍게.</h1>
        <p>{isApiMode ? '계정으로 로그인하고 강의 자료 처리 흐름을 시작해 보세요.' : '데모 계정으로 로그인하고 자료 등록 흐름을 미리 체험해 보세요.'}</p>
      </div>

      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <div className="login-card__heading">
          <h2>로그인</h2>
          <p>{isApiMode ? '아맞다시험 계정으로 로그인합니다.' : '대학생을 위한 아맞다시험 데모에 오신 걸 환영해요.'}</p>
        </div>
        {!isApiMode && <p className="login-card__demo" id="demo-account">
          체험 계정 <strong>test1234</strong> / 비밀번호 <strong>test1234</strong>
        </p>}
        <div className="form-field">
          <label htmlFor="login-username">{isApiMode ? '이메일' : '아이디'}</label>
          <input
            id="login-username"
            autoComplete="username"
            type={isApiMode ? 'email' : 'text'}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${isApiMode ? '' : 'demo-account ' }login-error` : isApiMode ? undefined : 'demo-account'}
            onChange={(event) => { setUsername(event.target.value); setError('') }}
            value={username}
          />
        </div>
        <div className="form-field">
          <label htmlFor="login-password">비밀번호</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${isApiMode ? '' : 'demo-account ' }login-error` : isApiMode ? undefined : 'demo-account'}
            onChange={(event) => { setPassword(event.target.value); setError('') }}
            value={password}
          />
        </div>
        {error && <p className="form-error" id="login-error" role="alert">{error}</p>}
        {typeof state === 'object' && state !== null && 'notice' in state && typeof state.notice === 'string' && <p role="status">{state.notice}</p>}
        {isApiMode && isPending && <p role="status" aria-live="polite">서버에 로그인 요청 중입니다.</p>}
        <Button type="submit" className="login-card__submit" disabled={isPending}>{isPending ? '로그인 중…' : '로그인하고 시작하기'}</Button>
        {isApiMode && <p className="login-card__note">아직 계정이 없나요? <Link to="/signup">계정 만들기</Link></p>}
        <p className="login-card__note">{isApiMode ? '로그인 후 문제 세트는 현재 브라우저에 저장됩니다.' : '데모 전용 화면입니다. 실제 계정 인증과 파일 전송은 제공하지 않습니다. 문제 세트는 현재 브라우저에 저장됩니다.'}</p>
      </form>
    </section>
  )
}

export default Login
