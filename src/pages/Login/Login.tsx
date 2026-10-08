import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Button from '@/components/Button/Button'
import { useAuth } from '@/features/auth/useAuth'
import './Login.css'

function Login() {
  const { isLoggedIn, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const state: unknown = location.state
  const from = typeof state === 'object' && state !== null && 'from' in state &&
    typeof state.from === 'string' && /^\/(?:upload|quiz)(?:[?#]|$)/.test(state.from)
    ? state.from
    : '/upload'

  if (isLoggedIn) return <Navigate to={from} replace />

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (login(username, password)) {
      navigate(from, { replace: true })
    } else {
      setError('아이디 또는 비밀번호를 확인해 주세요.')
    }
  }

  return (
    <section className="login-page">
      <div className="login-page__intro">
        <p className="page__eyebrow">아맞다, 공부해야지!</p>
        <h1>시험 범위 정리,<br />강의 자료부터 가볍게.</h1>
        <p>데모 계정으로 로그인하고 자료 등록 흐름을 미리 체험해 보세요.</p>
      </div>

      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <div className="login-card__heading">
          <h2>로그인</h2>
          <p>대학생을 위한 아맞다시험 데모에 오신 걸 환영해요.</p>
        </div>
        <p className="login-card__demo" id="demo-account">
          체험 계정 <strong>test1234</strong> / 비밀번호 <strong>test1234</strong>
        </p>
        <div className="form-field">
          <label htmlFor="login-username">아이디</label>
          <input
            id="login-username"
            autoComplete="username"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'demo-account login-error' : 'demo-account'}
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
            aria-describedby={error ? 'demo-account login-error' : 'demo-account'}
            onChange={(event) => { setPassword(event.target.value); setError('') }}
            value={password}
          />
        </div>
        {error && <p className="form-error" id="login-error" role="alert">{error}</p>}
        <Button type="submit" className="login-card__submit">로그인하고 시작하기</Button>
        <p className="login-card__note">데모 전용 화면입니다. 실제 계정 인증, 파일 전송 및 자료 저장은 제공하지 않습니다.</p>
      </form>
    </section>
  )
}

export default Login
