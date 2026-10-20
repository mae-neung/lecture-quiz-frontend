import { Box, Flex, Grid, Text } from '@devup-ui/react'
import { useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import Button from '@/components/Button/Button'
import { useAuth } from '@/features/auth/useAuth'
import { useSubjects } from '@/features/subjects/useSubjects'

const fieldStyle = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--color-text)', font: 'inherit', minHeight: 44, padding: '10px 14px', width: '100%' }

function Subjects() {
  const { userId } = useAuth()
  const model = useSubjects(userId)
  const {
    subjects, isLoading, loadError, title, createError, createStatus, isCreating, pendingSubjectId, createBlocked,
    editingId, draftName, actionPending, actionError, status, confirmDeleteId, deleteUnknownId,
    reload, create, changeTitle, beginRename, changeDraftName, cancelRename, saveRename, beginDelete, cancelDelete, remove,
  } = model
  const titleRef = useRef<HTMLInputElement>(null)
  const renameRef = useRef<HTMLInputElement>(null)
  const cancelDeleteRef = useRef<HTMLButtonElement>(null)
  const subjectsHeadingRef = useRef<HTMLHeadingElement>(null)
  const actionHeadingRef = useRef<HTMLHeadingElement | null>(null)

  useEffect(() => { if (editingId) renameRef.current?.focus() }, [editingId])
  useEffect(() => { if (confirmDeleteId) cancelDeleteRef.current?.focus() }, [confirmDeleteId])
  useEffect(() => { if (status === '과목을 삭제했습니다.') subjectsHeadingRef.current?.focus() }, [status])

  function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) titleRef.current?.focus()
    void create()
  }

  function submitRename(event: FormEvent<HTMLFormElement>, subjectId: string) {
    event.preventDefault()
    if (!draftName.trim()) renameRef.current?.focus()
    void saveRename(subjectId)
  }

  function closeRename() {
    cancelRename()
    requestAnimationFrame(() => actionHeadingRef.current?.focus())
  }

  function closeDelete() {
    cancelDelete()
    requestAnimationFrame(() => actionHeadingRef.current?.focus())
  }

  return (
    <Box as="section" maxW="1100px" mx="auto" px={["16px", "24px"]} py={["40px", "64px"]}>
      <Text as="p" color="$accent" fontSize="13px" fontWeight={900} letterSpacing="0.08em" m={0}>MY SUBJECTS · 내 과목</Text>
      <Text as="h1" color="$text" fontSize={["36px", "52px"]} letterSpacing="-0.055em" lineHeight={1.15} mb="12px" mt="12px">공부할 과목을 정리해요.</Text>
      <Text as="p" color="$muted" lineHeight={1.7} m={0}>과목을 만들고 이름을 관리할 수 있어요.</Text>

      <Box as="form" bg="$surface" borderColor="$border" borderRadius="20px" borderStyle="solid" borderWidth="1px" mt="32px" onSubmit={submitCreate} p={["22px", "28px"]}>
        <Text as="h2" color="$text" fontSize="22px" m={0}>새 과목 만들기</Text>
        <Text as="p" color="$muted" fontSize="14px" lineHeight={1.6} mt="8px">기억하기 쉬운 과목명을 입력해 주세요.</Text>
        <Flex alignItems="flex-end" flexWrap="wrap" gap="10px" mt="20px">
          <Box flex="1 1 260px">
            <label htmlFor="new-subject-name" style={{ display: 'block', fontWeight: 800, marginBottom: 8 }}>과목명</label>
            <input id="new-subject-name" ref={titleRef} style={fieldStyle} value={title} disabled={isCreating || createBlocked} aria-invalid={Boolean(createError && !title.trim())} aria-describedby={createError ? 'create-subject-error' : undefined} onChange={(event) => changeTitle(event.target.value)} />
          </Box>
          <Button type="submit" disabled={isCreating || createBlocked}>{isCreating ? '처리 중…' : pendingSubjectId ? '과목명 설정 다시 시도' : '과목 만들기'}</Button>
        </Flex>
        {pendingSubjectId && !isCreating && <Text as="p" color="$muted" fontSize="14px" lineHeight={1.6} mb={0} mt="12px">과목은 생성됐습니다. 과목명 설정만 다시 시도할 수 있어요.</Text>}
        {createError && <Text as="p" color="$danger" id="create-subject-error" mb={0} mt="12px" role="alert">{createError}</Text>}
        {createStatus && <Text as="p" color="$muted" mb={0} mt="12px" role="status">{createStatus}</Text>}
      </Box>

      {status && <Text as="p" bg="$surfaceMuted" borderRadius="12px" color="$text" mt="24px" p="14px" role="status">{status}</Text>}
      <Flex alignItems="center" justifyContent="space-between" mt="44px">
        <Text as="h2" color="$text" fontSize="26px" m={0} ref={subjectsHeadingRef} tabIndex={-1}>내 과목</Text>
        <Button onClick={reload} variant="secondary" disabled={isLoading}>목록 다시 불러오기</Button>
      </Flex>
      {isLoading && <Text as="p" color="$muted" mt="20px" role="status">과목을 불러오고 있습니다.</Text>}
      {loadError && <Text as="p" color="$danger" mt="20px" role="alert">{loadError}</Text>}
      {!isLoading && !loadError && subjects.length === 0 && <Box bg="$surface" borderColor="$border" borderRadius="18px" borderStyle="solid" borderWidth="1px" mt="20px" p="28px"><Text as="p" color="$muted" m={0}>아직 만든 과목이 없어요. 첫 과목을 만들어 보세요.</Text></Box>}
      {!isLoading && !loadError && subjects.length > 0 && <Grid as="ul" gap="14px" gridTemplateColumns={["1fr", "repeat(2, minmax(0, 1fr))"]} listStyleType="none" m={0} mt="20px" p={0}>
        {subjects.map((subject) => <Box as="li" bg="$surface" borderColor="$border" borderRadius="18px" borderStyle="solid" borderWidth="1px" key={subject.subjectId} minW={0} p="24px">
          <Text as="h3" color="$text" fontSize="22px" lineHeight={1.4} m={0} overflowWrap="anywhere" tabIndex={-1}>{subject.subjectName || '이름 없는 과목'}</Text>
          {editingId === subject.subjectId ? <Box as="form" mt="18px" onSubmit={(event: FormEvent<HTMLFormElement>) => submitRename(event, subject.subjectId)}>
            <label htmlFor={`subject-name-${subject.subjectId}`} style={{ display: 'block', fontWeight: 800, marginBottom: 8 }}>새 과목명</label>
            <input id={`subject-name-${subject.subjectId}`} ref={renameRef} style={fieldStyle} value={draftName} disabled={actionPending === subject.subjectId} aria-invalid={Boolean(actionError)} aria-describedby={actionError ? `subject-action-error-${subject.subjectId}` : undefined} onChange={(event) => changeDraftName(event.target.value)} />
            {actionError && <Text as="p" color="$danger" id={`subject-action-error-${subject.subjectId}`} mt="10px" role="alert">{actionError}</Text>}
            <Flex flexWrap="wrap" gap="10px" mt="14px"><Button type="submit" disabled={actionPending === subject.subjectId}>저장</Button><Button variant="secondary" disabled={actionPending === subject.subjectId} onClick={closeRename}>취소</Button></Flex>
          </Box> : confirmDeleteId === subject.subjectId ? <Box mt="18px">
            <Text as="p" color="$text" lineHeight={1.6} m={0}>‘{subject.subjectName || '이름 없는 과목'}’ 과목을 삭제할까요?</Text>
            <Text as="p" color="$danger" fontSize="14px" lineHeight={1.6} mb={0} mt="8px">서버에 저장된 이 과목의 요약, 문제와 풀이·채점 기록은 모두 영구 삭제됩니다. 이 브라우저의 보관함 문제 세트는 별도로 남으며, 서버 삭제는 되돌릴 수 없습니다.</Text>
            {actionError && <Text as="p" color="$danger" mt="10px" role="alert">{actionError}</Text>}
            <Flex flexWrap="wrap" gap="10px" mt="16px"><Button ref={cancelDeleteRef} variant="secondary" disabled={actionPending === subject.subjectId} onClick={closeDelete}>취소</Button><Button variant="danger" disabled={actionPending === subject.subjectId || deleteUnknownId === subject.subjectId} onClick={() => remove(subject.subjectId)}>과목 삭제 확인</Button></Flex>
          </Box> : <Flex flexWrap="wrap" gap="10px" mt="20px"><Button variant="secondary" onClick={(event) => { actionHeadingRef.current = event.currentTarget.closest('li')?.querySelector('h3') ?? null; beginRename(subject) }}>과목명 변경</Button><Button variant="danger" onClick={(event) => { actionHeadingRef.current = event.currentTarget.closest('li')?.querySelector('h3') ?? null; beginDelete(subject.subjectId) }}>과목 삭제</Button></Flex>}
        </Box>)}
      </Grid>}
    </Box>
  )
}

export default Subjects
