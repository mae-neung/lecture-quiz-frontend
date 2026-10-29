import { Box, Text } from '@devup-ui/react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button/Button'
import { useAuth } from '@/features/auth/useAuth'
import { libraryKey } from '@/features/library/libraryStorage'
import { deleteUser } from '@/services/api'
import { apiLibraryScope } from '@/services/apiStorage'

const fieldStyle = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--color-text)', font: 'inherit', minHeight: 44, padding: '10px 14px', width: '100%' }

function Account() {
  const { userId, logout } = useAuth()
  const navigate = useNavigate()
  const [confirmation, setConfirmation] = useState('')
  const [isConfirming, setConfirming] = useState(false)
  const [isPending, setPending] = useState(false)
  const [unknownOutcome, setUnknownOutcome] = useState(false)
  const [error, setError] = useState('')
  const deleting = useRef(false)
  const confirmationRef = useRef<HTMLInputElement>(null)

  async function removeAccount() {
    if (!userId || confirmation !== '탈퇴' || !isConfirming || deleting.current || unknownOutcome) return
    deleting.current = true
    setPending(true)
    setError('')
    try {
      await deleteUser(userId)
      let notice = '계정 탈퇴가 완료되었습니다.'
      try { window.localStorage.removeItem(libraryKey(apiLibraryScope(userId))) }
      catch { notice += ' 브라우저의 문제 세트는 직접 삭제해 주세요.' }
      logout()
      navigate('/login', { replace: true, state: { notice } })
    } catch (caught) {
      setUnknownOutcome(true)
      setError(`탈퇴 처리 여부를 확인할 수 없어 재요청을 중단했습니다. 계정 상태를 확인해 주세요. ${caught instanceof Error ? caught.message : ''}`)
    } finally { deleting.current = false; setPending(false) }
  }

  return <Box as="section" maxW="860px" mx="auto" px={["16px", "24px"]} py={["40px", "64px"]}>
    <Text as="p" color="$accent" fontSize="13px" fontWeight={900} letterSpacing="0.08em" m={0}>ACCOUNT · 계정 관리</Text>
    <Text as="h1" color="$text" fontSize={["36px", "52px"]} mb="12px" mt="12px">계정 관리</Text>
    <Text as="p" color="$muted" lineHeight={1.7}>현재 로그인한 사용자 ID: <strong>{userId}</strong></Text>
    <Box bg="$surface" borderColor="$danger" borderRadius="18px" borderStyle="solid" borderWidth="1px" mt="36px" p={["22px", "30px"]}>
      <Text as="h2" color="$danger" fontSize="25px" m={0}>계정 탈퇴</Text>
      <Text as="p" color="$text" lineHeight={1.7}>현재 로그인한 계정을 삭제합니다. 서버 데이터는 복구할 수 없으며, 현재 브라우저의 이 계정 문제 세트도 정리됩니다.</Text>
      <label htmlFor="delete-confirmation" style={{ display: 'block', fontWeight: 800, marginBottom: 8 }}>확인을 위해 ‘탈퇴’를 입력하세요</label>
      <input id="delete-confirmation" ref={confirmationRef} style={fieldStyle} value={confirmation} disabled={isPending || unknownOutcome} aria-invalid={Boolean(error)} aria-describedby={error ? 'account-delete-error' : undefined} onChange={(event) => { setConfirmation(event.target.value); setConfirming(false); setError('') }} />
      {!isConfirming ? <Button variant="danger" disabled={confirmation !== '탈퇴' || isPending || unknownOutcome} mt="18px" onClick={() => { if (confirmation !== '탈퇴') { confirmationRef.current?.focus(); return } setConfirming(true) }}>탈퇴 확인 단계로</Button> : <Box bg="$surfaceMuted" borderRadius="12px" mt="18px" p="18px">
        <Text as="p" color="$text" lineHeight={1.7} m={0}>정말 현재 계정을 탈퇴할까요? 이 작업은 되돌릴 수 없습니다.</Text>
        <Box display="flex" flexWrap="wrap" gap="10px" mt="14px"><Button variant="secondary" disabled={isPending} onClick={() => setConfirming(false)}>취소</Button><Button variant="danger" disabled={isPending || unknownOutcome} onClick={removeAccount}>{isPending ? '처리 중…' : '현재 계정 최종 탈퇴'}</Button></Box>
      </Box>}
      {isPending && <Text as="p" color="$muted" mt="12px" role="status">계정 탈퇴를 요청하고 있습니다.</Text>}
      {error && <Text as="p" color="$danger" id="account-delete-error" mt="12px" role="alert">{error}</Text>}
    </Box>
  </Box>
}

export default Account
