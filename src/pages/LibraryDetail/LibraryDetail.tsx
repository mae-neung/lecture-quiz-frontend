import { Box, Flex, Grid, Text } from '@devup-ui/react'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '@/components/Button/Button'
import { downloadExam, getExamFileName } from '@/features/library/exportExam'
import { deleteSavedSet, readLibrary, renameSavedSet } from '@/features/library/libraryStorage'
import type { SavedQuizSet } from '@/features/library/libraryStorage'

type DialogName = 'rename' | 'delete' | 'export' | null

const dialogStyle = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 18, color: 'var(--color-text)', maxHeight: 'calc(100vh - 32px)', maxWidth: 520, overflowY: 'auto' as const, padding: 28, width: 'calc(100% - 32px)' }
const fieldStyle = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--color-text)', font: 'inherit', minHeight: 44, padding: '10px 14px', width: '100%' }

function LibraryDetailContent({ id }: { id?: string }) {
  const navigate = useNavigate()
  const [library, setLibrary] = useState(readLibrary)
  const [set, setSet] = useState<SavedQuizSet | undefined>(() => library.ok ? library.value.find((item) => item.id === id) : undefined)
  const [dialogName, setDialogName] = useState<DialogName>(null)
  const [title, setTitle] = useState(set?.title ?? '')
  const [includeAnswers, setIncludeAnswers] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const renameRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (dialogName) {
      if (!dialog.open) dialog.showModal()
      requestAnimationFrame(() => (dialogName === 'rename' ? renameRef.current : cancelRef.current)?.focus())
    } else {
      if (dialog.open) dialog.close()
      triggerRef.current?.focus()
    }
  }, [dialogName])

  function openDialog(name: Exclude<DialogName, null>, trigger: HTMLElement) {
    triggerRef.current = trigger
    setError('')
    if (name === 'rename') setTitle(set?.title ?? '')
    if (name === 'export') setIncludeAnswers(false)
    setDialogName(name)
  }

  function rename(event: FormEvent) {
    event.preventDefault()
    if (!id) return
    const result = renameSavedSet(id, title)
    if (!result.ok) { setError(result.error); return }
    setSet(result.value)
    setLibrary(readLibrary())
    setMessage('강의명을 변경했어요.')
    setDialogName(null)
  }

  function remove() {
    if (!id) return
    const result = deleteSavedSet(id)
    if (!result.ok) { setError(result.error); return }
    setDialogName(null)
    navigate('/library', { replace: true, state: { notice: '문제 세트를 삭제했어요.' } })
  }

  if (!library.ok) return (
    <Box as="section" maxW="960px" mx="auto" px="20px" py="56px"><Text as="h1" color="$text">자료를 열 수 없어요</Text><Text as="p" color="$danger" role="alert">{library.error}</Text><Link to="/library">보관함으로 돌아가기</Link></Box>
  )
  if (!set) return (
    <Box as="section" maxW="960px" mx="auto" px="20px" py="56px"><Text as="h1" color="$text">문제 세트를 찾을 수 없어요</Text><Text as="p" color="$muted">삭제되었거나 주소가 달라졌을 수 있어요.</Text><Link to="/library">보관함으로 돌아가기</Link></Box>
  )

  return (
    <Box as="section" maxW="1000px" mx="auto" px={["16px", "24px"]} py={["40px", "64px"]}>
      <Link style={{ color: 'var(--color-accent)', fontWeight: 800 }} to="/library">← 보관함</Link>
      <Text as="p" color="$accent" fontSize="13px" fontWeight={900} letterSpacing="0.08em" mb={0} mt="32px">SAVED QUIZ · 세트 관리</Text>
      <Text as="h1" color="$text" fontSize={["34px", "48px"]} letterSpacing="-0.05em" lineHeight={1.2} mb="12px" mt="10px" overflowWrap="anywhere">{set.title}</Text>
      <Text as="p" color="$muted" lineHeight={1.7} m={0}>{set.materialType === 'video' ? '강의 영상' : '강의 교안'} · {set.questions.length}문제 · {new Date(set.createdAt).toLocaleDateString('ko-KR')} 등록</Text>
      {message && <Text as="p" bg="$surfaceMuted" borderRadius="12px" color="$text" mt="20px" p="12px" role="status">{message}</Text>}
      <Grid gap="20px" gridTemplateColumns={["1fr", "minmax(0, 1.6fr) minmax(260px, 1fr)"]} mt="32px">
        <Box bg="$surface" borderColor="$border" borderRadius="20px" borderStyle="solid" borderWidth="1px" p={["22px", "28px"]}>
          <Text as="h2" color="$text" fontSize="22px" mt={0}>이 세트로 공부하기</Text>
          <Text as="p" color="$muted" lineHeight={1.7}>문제를 다시 풀거나 인쇄하기 좋은 시험지 파일로 저장해 보세요.</Text>
          <Flex flexWrap="wrap" gap="10px" mt="24px">
            <Button onClick={() => navigate(`/quiz/${set.id}`)}>문제 풀기</Button>
            <Button onClick={(event) => openDialog('export', event.currentTarget)} variant="secondary">시험지 저장</Button>
          </Flex>
        </Box>
        <Box bg="$surfaceMuted" borderColor="$border" borderRadius="20px" borderStyle="solid" borderWidth="1px" p={["22px", "28px"]}>
          <Text as="h2" color="$text" fontSize="20px" mt={0}>자료 정보</Text>
          <Text as="p" color="$muted" fontSize="14px" lineHeight={1.6} overflowWrap="anywhere">원본 파일명: {set.fileName}</Text>
          <Text as="p" color="$muted" fontSize="14px" lineHeight={1.6}>파일 크기: {(set.fileSize / 1024 / 1024).toFixed(2)} MB</Text>
          <Text as="p" color="$muted" fontSize="13px" lineHeight={1.6}>원본 파일 자체는 저장되지 않았어요.</Text>
          <Flex flexWrap="wrap" gap="8px" mt="20px">
            <Button onClick={(event) => openDialog('rename', event.currentTarget)} variant="secondary">이름 변경</Button>
            <Button onClick={(event) => openDialog('delete', event.currentTarget)} variant="danger">삭제</Button>
          </Flex>
        </Box>
      </Grid>
      <Box mt="48px">
        <Text as="h2" color="$text" fontSize="26px" letterSpacing="-0.04em">문항 미리보기</Text>
        <Grid as="ol" gap="12px" listStyleType="none" m={0} p={0}>
          {set.questions.map((question, index) => (
            <Box as="li" bg="$surface" borderColor="$border" borderRadius="16px" borderStyle="solid" borderWidth="1px" key={question.id} p="20px">
              <Text as="h3" color="$text" fontSize="18px" lineHeight={1.5} m={0}>{index + 1}. {question.prompt}</Text>
              <Text as="p" color="$muted" fontSize="14px" mb={0} mt="8px">객관식 {question.options.length}지선다</Text>
            </Box>
          ))}
        </Grid>
      </Box>

      <dialog aria-labelledby="library-dialog-title" onCancel={() => setDialogName(null)} ref={dialogRef} style={dialogStyle}>
        {dialogName === 'rename' && <form onSubmit={rename}>
          <h2 id="library-dialog-title" style={{ marginTop: 0 }}>강의명 변경</h2>
          <label htmlFor="saved-title" style={{ display: 'block', fontWeight: 800, marginBottom: 8 }}>새 강의명</label>
          <input id="saved-title" onChange={(event) => setTitle(event.target.value)} ref={renameRef} style={fieldStyle} value={title} />
          {error && <p role="alert" style={{ color: 'var(--color-danger)' }}>{error}</p>}
          <Flex flexWrap="wrap" gap="10px" justifyContent="flex-end" mt="24px"><Button onClick={() => setDialogName(null)} ref={cancelRef} variant="secondary">취소</Button><Button type="submit">저장</Button></Flex>
        </form>}
        {dialogName === 'delete' && <div>
          <h2 id="library-dialog-title" style={{ marginTop: 0 }}>이 세트를 삭제할까요?</h2>
          <p style={{ lineHeight: 1.7 }}>‘{set.title}’ 세트와 문제가 이 브라우저에서 삭제됩니다. 삭제 후에는 복구할 수 없어요.</p>
          {error && <p role="alert" style={{ color: 'var(--color-danger)' }}>{error}</p>}
          <Flex flexWrap="wrap" gap="10px" justifyContent="flex-end" mt="24px"><Button onClick={() => setDialogName(null)} ref={cancelRef} variant="secondary">취소</Button><Button onClick={remove} variant="danger">삭제하기</Button></Flex>
        </div>}
        {dialogName === 'export' && <div>
          <h2 id="library-dialog-title" style={{ marginTop: 0 }}>시험지 파일 저장</h2>
          <p style={{ lineHeight: 1.7 }}>HTML 파일로 내려받습니다. 브라우저에서 열어 인쇄 메뉴의 ‘PDF로 저장’을 선택할 수 있어요.</p>
          <p style={{ overflowWrap: 'anywhere' }}><strong>파일명:</strong> {getExamFileName(set.title)}</p>
          <label style={{ alignItems: 'center', display: 'flex', gap: 10, minHeight: 44 }}><input checked={includeAnswers} onChange={(event) => setIncludeAnswers(event.target.checked)} type="checkbox" /> 정답·해설 포함하기</label>
          <p style={{ color: 'var(--color-muted)', fontSize: 13, lineHeight: 1.6 }}>파일을 공유하기 전에는 강의 자료의 저작권과 포함된 내용을 확인해 주세요.</p>
          <Flex flexWrap="wrap" gap="10px" justifyContent="flex-end" mt="24px"><Button onClick={() => setDialogName(null)} ref={cancelRef} variant="secondary">취소</Button><Button onClick={() => { downloadExam(set, includeAnswers); setMessage('시험지 파일을 다운로드했어요.'); setDialogName(null) }}>HTML 다운로드</Button></Flex>
        </div>}
      </dialog>
    </Box>
  )
}

function LibraryDetail() {
  const { id } = useParams()
  return <LibraryDetailContent id={id} key={id} />
}

export default LibraryDetail
