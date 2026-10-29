import { Box, Flex, Grid, Text } from '@devup-ui/react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '@/components/Button/Button'
import { useAuth } from '@/features/auth/useAuth'
import { useWikiWorkspace } from '@/features/wiki/useWikiWorkspace'
import type { ApiProblem, GenerateRule } from '@/services/api'

const fieldStyle = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--color-text)', font: 'inherit', minHeight: 44, padding: '10px 14px', width: '100%' }
const linkStyle = { color: 'var(--color-accent)', fontWeight: 800 }
const typeLabel: Record<ApiProblem['problem_type'], string> = { ox: 'OX', select: '객관식', short: '단답형', long: '서술형' }

function AnswerInput({ problem, value, disabled, onChange }: { problem: ApiProblem; value: string; disabled: boolean; onChange: (value: string) => void }) {
  if (problem.problem_type === 'ox' || problem.problem_type === 'select') {
    const options = problem.problem_type === 'ox' ? (problem.problem_options.length ? problem.problem_options : ['O', 'X']) : problem.problem_options
    return <Grid as="fieldset" border={0} gap="8px" m={0} p={0}>
      <legend style={{ fontWeight: 800, marginBottom: 8 }}>답 선택</legend>
      {options.length === 0 && <Text as="p" color="$muted" m={0}>선택지가 제공되지 않았습니다.</Text>}
      {options.map((option, index) => <label key={`${index}-${option}`} style={{ alignItems: 'center', display: 'flex', gap: 10, minHeight: 44 }}>
        <input type="radio" name={`answer-${problem.problem_id}`} value={option} checked={value === option} disabled={disabled} onChange={() => onChange(option)} />
        <span>{option}</span>
      </label>)}
    </Grid>
  }
  if (problem.problem_type === 'long') return <label style={{ display: 'block', fontWeight: 800 }}>
    서술 답안
    <textarea style={{ ...fieldStyle, display: 'block', minHeight: 120, marginTop: 8 }} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
  </label>
  return <label style={{ display: 'block', fontWeight: 800 }}>
    단답형 답안
    <input style={{ ...fieldStyle, display: 'block', marginTop: 8 }} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
  </label>
}

function WikiDetail() {
  const { subjectId, wikiId } = useParams()
  const { userId } = useAuth()
  const model = useWikiWorkspace(userId, subjectId, wikiId)
  const [keywords, setKeywords] = useState('')

  function submitGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void model.generate()
  }

  function setRuleField<K extends keyof GenerateRule>(key: K, value: GenerateRule[K]) {
    model.setRule((current) => ({ ...current, [key]: value }))
    model.setGenerationError('')
  }

  return (
    <Box as="section" maxW="1080px" mx="auto" px={["16px", "24px"]} py={["40px", "64px"]}>
      <Link style={linkStyle} to={`/subjects/${subjectId}`}>← 과목으로 돌아가기</Link>
      <Text as="p" color="$accent" fontSize="13px" fontWeight={900} letterSpacing="0.08em" mb={0} mt="30px">WIKI DOCUMENT · 요약 문서</Text>
      <Text as="h1" color="$text" fontSize={["34px", "48px"]} lineHeight={1.2} mb="12px" mt="10px">요약과 문제 관리</Text>
      <Text as="p" color="$muted" lineHeight={1.7} m={0}>요약을 읽고 문제를 만든 뒤 답안을 저장할 수 있습니다. 자동 채점은 제공하지 않습니다.</Text>
      <Button onClick={model.refresh} variant="secondary" disabled={model.isLoading} mt="22px">문서·상태·문제 다시 불러오기</Button>
      {model.isLoading && <Text as="p" color="$muted" mt="20px" role="status">문서와 문제를 불러오고 있습니다.</Text>}
      {model.loadError && <Text as="p" color="$danger" mt="20px" role="alert">{model.loadError}</Text>}
      {model.document && !model.loadError && <Box bg="$surface" borderColor="$border" borderRadius="18px" borderStyle="solid" borderWidth="1px" mt="30px" p={["22px", "30px"]}>
        <Text as="h2" color="$text" fontSize="25px" mt={0}>요약 본문</Text>
        <Text as="p" color="$text" lineHeight={1.8} m={0} overflowWrap="anywhere" whiteSpace="pre-wrap">{model.document.wiki_document_content || '본문이 비어 있습니다.'}</Text>
      </Box>}

      {model.document && !model.loadError && <>
        <Box as="form" bg="$surface" borderColor="$border" borderRadius="18px" borderStyle="solid" borderWidth="1px" mt="30px" onSubmit={submitGenerate} p={["22px", "30px"]}>
          <Text as="h2" color="$text" fontSize="25px" mt={0}>문제 생성 규칙</Text>
          <Text as="p" color="$muted" fontSize="14px" lineHeight={1.7}>문항 유형별 수의 합계가 전체 문항 수와 같아야 합니다.</Text>
          <Grid gap="12px" gridTemplateColumns={["1fr", "repeat(2, minmax(0, 1fr))"]}>
            <label style={{ fontWeight: 800 }}>전체 문항 수<input style={{ ...fieldStyle, display: 'block', marginTop: 8 }} type="number" min="1" value={model.rule.total_count} onChange={(event) => setRuleField('total_count', Number(event.target.value))} /></label>
            <label style={{ fontWeight: 800 }}>난이도<select style={{ ...fieldStyle, display: 'block', marginTop: 8 }} value={model.rule.difficulty} onChange={(event) => setRuleField('difficulty', event.target.value as GenerateRule['difficulty'])}><option value="easy">쉬움</option><option value="medium">보통</option><option value="hard">어려움</option></select></label>
          </Grid>
          <Grid gap="12px" gridTemplateColumns={["repeat(2, minmax(0, 1fr))", "repeat(4, minmax(0, 1fr))"]} mt="18px">
            {(['ox', 'select', 'short', 'long'] as const).map((type) => <label key={type} style={{ fontWeight: 800 }}>{typeLabel[type]}<input style={{ ...fieldStyle, display: 'block', marginTop: 8 }} type="number" min="0" value={model.rule.problem_type_counts[type]} onChange={(event) => model.setCount(type, Number(event.target.value))} /></label>)}
          </Grid>
          <Grid gap="12px" gridTemplateColumns={["1fr", "repeat(2, minmax(0, 1fr))"]} mt="18px">
            <label style={{ fontWeight: 800 }}>중점 키워드 (쉼표로 구분)<input style={{ ...fieldStyle, display: 'block', marginTop: 8 }} value={keywords} onChange={(event) => { const value = event.target.value; setKeywords(value); setRuleField('focus_keywords', value.split(',').map((item) => item.trim()).filter(Boolean)) }} /></label>
            <label style={{ fontWeight: 800 }}>범위<select style={{ ...fieldStyle, display: 'block', marginTop: 8 }} value={model.rule.coverage} onChange={(event) => setRuleField('coverage', event.target.value as GenerateRule['coverage'])}><option value="balanced">고르게</option><option value="focused">키워드 중심</option></select></label>
          </Grid>
          <Text as="p" color="$muted" fontSize="14px" lineHeight={1.7} mt="18px">생성 상태: {model.creating === null ? '확인 전' : model.creating ? '진행 중' : '현재 진행 중 아님 (완료 증거는 아님)'}</Text>
          {model.generationError && <Text as="p" color="$danger" mt="12px" role="alert">{model.generationError}</Text>}
          {model.status && <Text as="p" color="$muted" mt="12px" role="status">{model.status}</Text>}
          <Button type="submit" disabled={model.generationPending || model.generationUnknown} mt="16px">{model.generationPending ? '요청 중…' : model.generationUnknown ? '생성 결과 확인 필요' : '문제 생성 요청'}</Button>
        </Box>

        <Box mt="42px">
          <Text as="h2" color="$text" fontSize="26px" m={0}>문제와 답안</Text>
          <Text as="p" color="$muted" fontSize="14px" lineHeight={1.7}>이미 생성된 답안을 수정할 수 있습니다. 새 답안 추가와 자동 채점은 제공하지 않습니다.</Text>
          {model.problems.length === 0 && <Text as="p" color="$muted">아직 생성된 문제가 없습니다. 서버 상태와 목록을 다시 확인해 주세요.</Text>}
          <Grid as="ol" gap="16px" listStyleType="none" m={0} mt="20px" p={0}>
            {model.problems.map((problem) => {
              const answer = model.answers.find((item) => item.owner_problem_id === problem.problem_id)
              const draft = model.drafts[problem.problem_id] ?? answer?.user_answer ?? ''
              return <Box as="li" bg="$surface" borderColor="$border" borderRadius="18px" borderStyle="solid" borderWidth="1px" key={problem.problem_id} p={["20px", "26px"]}>
                <Text as="p" color="$accent" fontSize="13px" fontWeight={900} m={0}>{typeLabel[problem.problem_type]} · {problem.problem_number}번</Text>
                <Text as="h3" color="$text" fontSize="20px" lineHeight={1.5} mb="18px" mt="10px">{problem.problem_question}</Text>
                <AnswerInput problem={problem} value={draft} disabled={!answer || model.savingId === problem.problem_id} onChange={(value) => model.changeDraft(problem.problem_id, value)} />
                {!answer && <Text as="p" color="$muted" fontSize="14px">연결된 답안이 없어 새 답안을 저장할 수 없습니다.</Text>}
                {answer && <Text as="p" color="$muted" fontSize="13px" mt="10px">{answer.user_answer ? '저장된 답안이 있습니다.' : '아직 저장된 답안이 없습니다.'}</Text>}
                <details style={{ marginTop: 14 }}><summary style={{ cursor: 'pointer', fontWeight: 800 }}>정답 보기</summary><p style={{ overflowWrap: 'anywhere' }}>{problem.problem_correct_answer}</p></details>
                <Flex flexWrap="wrap" gap="10px" mt="20px"><Button disabled={!answer || model.savingId === problem.problem_id} onClick={() => model.saveAnswer(problem.problem_id)}>답안 수정 저장</Button><Button variant="danger" onClick={() => { model.setConfirmDeleteId(problem.problem_id); model.setActionError('') }}>문제 삭제</Button></Flex>
                {model.confirmDeleteId === problem.problem_id && <Box bg="$surfaceMuted" borderRadius="12px" mt="16px" p="16px">
                  <Text as="p" color="$text" lineHeight={1.7} m={0}>이 문제를 삭제할까요? 연결된 답안과 채점 기록도 서버에서 함께 삭제됩니다.</Text>
                  <Flex flexWrap="wrap" gap="10px" mt="12px"><Button autoFocus variant="secondary" onClick={() => model.setConfirmDeleteId(null)}>취소</Button><Button variant="danger" disabled={model.savingId === problem.problem_id || model.deleteUnknownId === problem.problem_id} onClick={() => model.remove(problem.problem_id)}>문제 삭제 확인</Button></Flex>
                </Box>}
                {model.actionError && model.actionErrorId === problem.problem_id && <Text as="p" color="$danger" mt="12px" role="alert">{model.actionError}</Text>}
              </Box>
            })}
          </Grid>
        </Box>
      </>}
    </Box>
  )
}

export default WikiDetail
