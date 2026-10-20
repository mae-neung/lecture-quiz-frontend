import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from '@/components/Button/Button'
import { resendEmailVerificationApi } from '@/services/api'
import '@/pages/Login/Login.css'

function initialEmail(state: unknown): string {
  return typeof state === 'object' && state !== null && 'email' in state && typeof state.email === 'string' ? state.email : ''
}

function SignupCheckEmail() {
  const location = useLocation()
  const [email, setEmail] = useState(() => initialEmail(location.state))
  const [error, setError] = useState('')
  const [status, setStatus] = useState(initialEmail(location.state) ? '인증 메일을 보냈습니다. 받은편지함을 확인해 주세요.' : '')
  const [isPending, setPending] = useState(false)
  const submitting = useRef(false)
  const emailRef = useRef<HTMLInputElement>(null)

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('올바른 이메일 주소를 입력해 주세요.')
      setStatus('')
      emailRef.current?.focus()
      return
    }
    submitting.current = true
    setPending(true)
    setError('')
    setStatus('인증 메일을 다시 보내고 있습니다.')
    try {
      await resendEmailVerificationApi(email.trim())
      setStatus('인증 메일을 다시 보냈습니다. 받은편지함을 확인해 주세요.')
    } catch (caught) {
      setStatus('')
      setError(caught instanceof Error ? caught.message : '메일을 다시 보내지 못했습니다.')
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  return (
    <section className="login-page">
      <div className="login-page__intro">
        <p className="page__eyebrow">가입 확인</p>
        <h1>메일함에서<br />인증 링크를 확인해 주세요.</h1>
        <p>메일이 보이지 않으면 주소를 확인하고 다시 보내 보세요.</p>
      </div>
      <form className="login-card" onSubmit={resend} noValidate>
        <div className="login-card__heading"><h2>이메일 확인</h2><p>가입한 이메일로 전송된 인증 메일을 확인해 주세요.</p></div>
        <div className="form-field">
          <label htmlFor="check-email-address">이메일</label>
          <input id="check-email-address" ref={emailRef} type="email" autoComplete="email" value={email} aria-invalid={Boolean(error)} aria-describedby={error ? 'check-email-error' : undefined} onChange={(event) => { setEmail(event.target.value); setError(''); setStatus('') }} />
        </div>
        {error && <p id="check-email-error" className="form-error" role="alert">{error}</p>}
        {status && <p role="status" aria-live="polite">{status}</p>}
        <Button type="submit" className="login-card__submit" disabled={isPending}>{isPending ? '전송 중…' : '인증 메일 다시 보내기'}</Button>
        <p className="login-card__note">이메일 인증을 마쳤나요? <Link to="/login">로그인</Link></p>
      </form>
    </section>
  )
}

export default SignupCheckEmail
