import { Box, Grid, Text } from '@devup-ui/react'
import { useRef } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '@/components/Button/Button'
import { useAuth } from '@/features/auth/useAuth'
import { useSubjectHub } from '@/features/subjectHub/useSubjectHub'

const fieldStyle = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--color-text)', font: 'inherit', minHeight: 110, padding: '12px 14px', width: '100%' }
const linkStyle = { color: 'var(--color-accent)', fontWeight: 800 }

function activity(value: boolean | null, active: string): string {
  if (value === null) return '확인할 문서 없음'
  return value ? active : '현재 진행 중 아님 · 완료 여부는 자료 목록에서 확인'
}

function SubjectHub() {
  const { subjectId } = useParams()
  const { userId } = useAuth()
  const model = useSubjectHub(userId, subjectId)
  const urlInput = useRef<HTMLTextAreaElement>(null)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!model.urlText.trim()) urlInput.current?.focus()
    void model.submitUrls()
  }

  return (
    <Box as="section" maxW="1080px" mx="auto" px={["16px", "24px"]} py={["40px", "64px"]}>
      <Link style={linkStyle} to="/subjects">← 내 과목</Link>
      <Text as="p" color="$accent" fontSize="13px" fontWeight={900} letterSpacing="0.08em" mb={0} mt="30px">SUBJECT HUB · 과목 상세</Text>
      <Text as="h1" color="$text" fontSize={["34px", "48px"]} lineHeight={1.2} mb="12px" mt="10px" overflowWrap="anywhere">{model.subject?.subjectName || '과목 정보'}</Text>
      {model.subject && <Text as="p" color="$muted" m={0}>과목 번호 {model.subject.subjectNumber}</Text>}
      <Button onClick={model.refresh} variant="secondary" disabled={model.isLoading} mt="22px">상태와 문서 다시 불러오기</Button>
      {model.isLoading && <Text as="p" color="$muted" mt="20px" role="status">과목 정보를 불러오고 있습니다.</Text>}
      {model.loadError && <Text as="p" color="$danger" mt="20px" role="alert">{model.loadError}</Text>}
      {model.statusWarning && <Text as="p" color="$muted" mt="20px" role="status">{model.statusWarning}</Text>}
      {!model.isLoading && !model.loadError && <>
        <Grid gap="12px" gridTemplateColumns={["1fr", "repeat(3, minmax(0, 1fr))"]} mt="30px">
          {([
            ['파일 업로드', activity(model.progress.uploading, '업로드 진행 중')],
            ['자료 요약', model.progress.summarized ? '요약 완료 확인됨' : '요약 완료가 확인되지 않음'],
            ['문제 생성', activity(model.progress.creating, '문제 생성 진행 중')],
          ] as const).map(([label, value]) => <Box bg="$surface" borderColor="$border" borderRadius="16px" borderStyle="solid" borderWidth="1px" key={label} p="20px"><Text as="h2" color="$text" fontSize="17px" m={0}>{label}</Text><Text as="p" color="$muted" fontSize="14px" lineHeight={1.6} mb={0} mt="10px">{value}</Text></Box>)}
        </Grid>
        <Text as="p" color="$muted" fontSize="13px" lineHeight={1.7} mt="12px">상태 값이 ‘진행 중 아님’이어도 작업 완료를 증명하지는 않습니다.</Text>
      </>}

      {model.subject?.subjectId === subjectId && !model.isLoading && !model.loadError && <><Box as="form" bg="$surface" borderColor="$border" borderRadius="18px" borderStyle="solid" borderWidth="1px" mt="34px" onSubmit={submit} p={["22px", "28px"]}>
        <Text as="h2" color="$text" fontSize="24px" m={0}>URL로 자료 등록</Text>
        <Text as="p" color="$muted" fontSize="14px" lineHeight={1.7}>URL을 한 줄에 하나씩 입력해 주세요. 등록하지 못한 URL이 있으면 입력을 유지한 채 오류를 보여드립니다.</Text>
        <label htmlFor="subject-urls" style={{ display: 'block', fontWeight: 800, marginBottom: 8 }}>자료 URL</label>
        <textarea id="subject-urls" ref={urlInput} style={fieldStyle} value={model.urlText} disabled={model.isSubmitting} aria-invalid={Boolean(model.uploadError)} aria-describedby={model.uploadError ? 'subject-urls-error' : undefined} onChange={(event) => { model.setUrlText(event.target.value); model.setUploadError('') }} placeholder="https://example.com/lecture" />
        {model.uploadError && <Text as="p" color="$danger" id="subject-urls-error" mt="12px" role="alert">{model.uploadError}</Text>}
        {model.uploadStatus && <Text as="p" color="$muted" mt="12px" role="status">{model.uploadStatus}</Text>}
        <Button type="submit" disabled={model.isSubmitting} mt="18px">{model.isSubmitting ? '요청 중…' : 'URL 업로드 요청'}</Button>
      </Box>

      <Box mt="42px">
        <Text as="h2" color="$text" fontSize="26px" m={0}>요약 문서</Text>
        {!model.isLoading && !model.loadError && !model.documentsUnavailable && model.documents.length === 0 && <Text as="p" color="$muted" lineHeight={1.7}>아직 요약 문서가 없습니다. 나중에 상태를 다시 확인해 주세요.</Text>}
        {!model.isLoading && !model.loadError && model.documentsUnavailable && <Text as="p" color="$danger" lineHeight={1.7}>요약 문서 목록을 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요.</Text>}
        {!model.isLoading && !model.loadError && model.documents.length > 0 && <Grid as="ul" gap="14px" gridTemplateColumns={["1fr", "repeat(2, minmax(0, 1fr))"]} listStyleType="none" mt="20px" p={0}>
          {model.documents.map((document, index) => <Box as="li" bg="$surface" borderColor="$border" borderRadius="18px" borderStyle="solid" borderWidth="1px" key={document.wiki_document_id} minW={0} p="22px">
            <Text as="h3" color="$text" fontSize="20px" m={0}>요약 문서 {index + 1}</Text>
            <Text as="p" color="$muted" fontSize="14px" lineHeight={1.7} mt="12px" overflowWrap="anywhere" whiteSpace="pre-wrap">{document.wiki_document_content.slice(0, 180) || '본문이 비어 있습니다.'}{document.wiki_document_content.length > 180 ? '…' : ''}</Text>
            <Link style={linkStyle} to={`/subjects/${subjectId}/wiki/${document.wiki_document_id}`}>문서와 문제 보기</Link>
          </Box>)}
        </Grid>}
      </Box></>}
    </Box>
  )
}

export default SubjectHub
