import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '@/components/Button/Button'
import { signupApi } from '@/services/api'
import '@/pages/Login/Login.css'

type SignupErrors = { email?: string; password?: string; passwordCheck?: string }

function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordCheck, setPasswordCheck] = useState('')
  const [errors, setErrors] = useState<SignupErrors>({})
  const [serverError, setServerError] = useState('')
  const [isPending, setPending] = useState(false)
  const submitting = useRef(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const passwordCheckRef = useRef<HTMLInputElement>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const next: SignupErrors = {}
    if (!email.trim()) next.email = '이메일을 입력해 주세요.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = '올바른 이메일 주소를 입력해 주세요.'
    if (!password) next.password = '비밀번호를 입력해 주세요.'
    if (!passwordCheck) next.passwordCheck = '비밀번호 확인을 입력해 주세요.'
    else if (password && passwordCheck !== password) next.passwordCheck = '비밀번호가 일치하지 않습니다.'
    setErrors(next)
    setServerError('')
    if (next.email || next.password || next.passwordCheck) {
      if (next.email) emailRef.current?.focus()
      else if (next.password) passwordRef.current?.focus()
      else passwordCheckRef.current?.focus()
      return
    }
    submitting.current = true
    setPending(true)
    try {
      await signupApi(email.trim(), password, passwordCheck)
      navigate('/signup/check-email', { replace: true, state: { email: email.trim() } })
    } catch (caught) {
      setServerError(caught instanceof Error ? caught.message : '가입 요청에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  return (
    <section className="login-page">
      <div className="login-page__intro">
        <p className="page__eyebrow">새로운 시작</p>
        <h1>시험 준비를<br />한곳에 모아보세요.</h1>
        <p>이메일로 계정을 만들고, 받은 인증 메일을 확인해 주세요.</p>
      </div>
      <form className="login-card" onSubmit={submit} noValidate>
        <div className="login-card__heading"><h2>계정 만들기</h2><p>가입에 사용할 이메일과 비밀번호를 입력해 주세요.</p></div>
        <div className="form-field">
          <label htmlFor="signup-email">이메일</label>
          <input id="signup-email" ref={emailRef} autoComplete="email" type="email" value={email} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'signup-email-error' : undefined} onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: undefined })); setServerError('') }} />
          {errors.email && <p className="form-error" id="signup-email-error">{errors.email}</p>}
        </div>
        <div className="form-field">
          <label htmlFor="signup-password">비밀번호</label>
          <input id="signup-password" ref={passwordRef} autoComplete="new-password" type="password" value={password} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'signup-password-error' : undefined} onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: undefined })); setServerError('') }} />
          {errors.password && <p className="form-error" id="signup-password-error">{errors.password}</p>}
        </div>
        <div className="form-field">
          <label htmlFor="signup-password-check">비밀번호 확인</label>
          <input id="signup-password-check" ref={passwordCheckRef} autoComplete="new-password" type="password" value={passwordCheck} aria-invalid={Boolean(errors.passwordCheck)} aria-describedby={errors.passwordCheck ? 'signup-password-check-error' : undefined} onChange={(event) => { setPasswordCheck(event.target.value); setErrors((current) => ({ ...current, passwordCheck: undefined })); setServerError('') }} />
          {errors.passwordCheck && <p className="form-error" id="signup-password-check-error">{errors.passwordCheck}</p>}
        </div>
        {serverError && <p className="form-error" role="alert">{serverError}</p>}
        {isPending && <p role="status" aria-live="polite">계정을 만들고 있습니다.</p>}
        <Button type="submit" className="login-card__submit" disabled={isPending}>{isPending ? '가입 중…' : '계정 만들기'}</Button>
        <p className="login-card__note">이미 계정이 있나요? <Link to="/login">로그인</Link></p>
      </form>
    </section>
  )
}

export default Signup
