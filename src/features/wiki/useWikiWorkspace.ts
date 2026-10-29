import { useCallback, useEffect, useRef, useState } from 'react'
import { createProblems, deleteProblem, getProblems, getUserAnswers, getWikiDocuments, isCreatingProblems, updateUserAnswer, validateGenerateRule } from '@/services/api'
import type { ApiProblem, ApiUserAnswer, ApiWikiDocument, GenerateRule } from '@/services/api'
import { DEFAULT_GENERATE_RULE } from '@/services/api'

export function useWikiWorkspace(userId: string | null, subjectId: string | undefined, wikiId: string | undefined) {
  const [document, setDocument] = useState<ApiWikiDocument | null>(null)
  const [problems, setProblems] = useState<ApiProblem[]>([])
  const [answers, setAnswers] = useState<ApiUserAnswer[]>([])
  const [creating, setCreating] = useState<boolean | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [rule, setRule] = useState<GenerateRule>({ ...DEFAULT_GENERATE_RULE, problem_type_counts: { ...DEFAULT_GENERATE_RULE.problem_type_counts } })
  const [generationPending, setGenerationPending] = useState(false)
  const [generationUnknown, setGenerationUnknown] = useState(false)
  const [generationError, setGenerationError] = useState('')
  const [status, setStatus] = useState('')
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleteUnknownId, setDeleteUnknownId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [actionErrorId, setActionErrorId] = useState<string | null>(null)
  const generationBusy = useRef(false)
  const actionBusy = useRef(false)
  const dirtyProblemIds = useRef(new Set<string>())

  const refresh = useCallback(async () => {
    if (!userId || !subjectId || !wikiId) return
    setLoading(true)
    setLoadError('')
    try {
      const [documents, foundProblems, foundAnswers] = await Promise.all([
        getWikiDocuments(userId, subjectId), getProblems(userId, subjectId, wikiId), getUserAnswers(userId, subjectId, wikiId),
      ])
      let isCreating: boolean | null = null
      try { isCreating = await isCreatingProblems(userId, subjectId, wikiId) } catch { /* 상태 미확인은 문서·문제 조회를 막지 않는다. */ }
      const found = documents.find((item) => item.wiki_document_id === wikiId)
      if (!found || found.owner_user_id !== userId || found.owner_subject_id !== subjectId) throw new Error('요약 문서를 찾을 수 없습니다.')
      if (foundProblems.some((item) => item.owner_user_id !== userId || item.owner_subject_id !== subjectId || item.owner_wiki_document_id !== wikiId) ||
        foundAnswers.some((item) => item.owner_user_id !== userId || item.owner_subject_id !== subjectId || item.owner_wiki_document_id !== wikiId)) {
        throw new Error('서버가 다른 과목의 문제 또는 답안을 반환했습니다.')
      }
      setDocument(found)
      setProblems(foundProblems)
      setAnswers(foundAnswers)
      setCreating(isCreating)
      setDrafts((current) => Object.fromEntries(foundAnswers.map((answer) => [
        answer.owner_problem_id,
        dirtyProblemIds.current.has(answer.owner_problem_id) ? current[answer.owner_problem_id] ?? answer.user_answer : answer.user_answer,
      ])))
      setDeleteUnknownId(null)
    } catch (caught) {
      setLoadError(caught instanceof Error ? caught.message : '문서와 문제를 불러오지 못했습니다.')
    } finally { setLoading(false) }
  }, [userId, subjectId, wikiId])

  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh() }, 0)
    return () => window.clearTimeout(timer)
  }, [refresh])

  function setCount(type: keyof GenerateRule['problem_type_counts'], value: number) {
    setRule((current) => ({ ...current, problem_type_counts: { ...current.problem_type_counts, [type]: value } }))
    setGenerationError('')
  }

  async function generate() {
    if (!userId || !subjectId || !wikiId || generationBusy.current || generationUnknown) return
    const validation = validateGenerateRule(rule)
    if (validation) { setGenerationError(validation); return }
    generationBusy.current = true
    setGenerationPending(true)
    setGenerationError('')
    setStatus('문제 생성을 요청하고 있습니다.')
    try {
      await createProblems(userId, subjectId, wikiId, rule)
      setStatus('문제 생성 요청이 접수되었습니다. 목록과 상태를 다시 확인해 주세요.')
      await refresh()
    } catch (caught) {
      setGenerationUnknown(true)
      setStatus('')
      setGenerationError(`처리 여부를 확인할 수 없어 같은 생성 요청을 다시 보내지 않습니다. 상태와 목록을 확인해 주세요. ${caught instanceof Error ? caught.message : ''}`)
    } finally { generationBusy.current = false; setGenerationPending(false) }
  }

  function changeDraft(problemId: string, value: string) { dirtyProblemIds.current.add(problemId); setDrafts((current) => ({ ...current, [problemId]: value })); if (actionErrorId === problemId) { setActionError(''); setActionErrorId(null) } }

  async function saveAnswer(problemId: string) {
    if (!userId || !subjectId || actionBusy.current) return
    const answer = answers.find((item) => item.owner_problem_id === problemId)
    if (!answer) { setActionErrorId(problemId); setActionError('저장된 답안이 없어 수정할 수 없습니다.'); return }
    actionBusy.current = true
    setSavingId(problemId)
    setActionError('')
    setActionErrorId(null)
    try {
      await updateUserAnswer(userId, subjectId, answer.user_answer_id, drafts[problemId] ?? answer.user_answer)
      dirtyProblemIds.current.delete(problemId)
      setStatus('답안을 저장했습니다. 채점은 별도로 제공되지 않습니다.')
      await refresh()
    } catch (caught) {
      setActionErrorId(problemId)
      setActionError(caught instanceof Error ? caught.message : '답안을 저장하지 못했습니다.')
    } finally { actionBusy.current = false; setSavingId(null) }
  }

  async function remove(problemId: string) {
    if (!userId || !subjectId || actionBusy.current || deleteUnknownId === problemId) return
    actionBusy.current = true
    setSavingId(problemId)
    setActionError('')
    setActionErrorId(null)
    try {
      await deleteProblem(userId, subjectId, problemId)
      dirtyProblemIds.current.delete(problemId)
      setConfirmDeleteId(null)
      setStatus('문제를 삭제했습니다.')
      await refresh()
    } catch (caught) {
      setDeleteUnknownId(problemId)
      setActionErrorId(problemId)
      setActionError(`삭제 결과를 확인할 수 없습니다. 목록을 다시 불러와 확인해 주세요. ${caught instanceof Error ? caught.message : ''}`)
    } finally { actionBusy.current = false; setSavingId(null) }
  }

  return {
    document, problems, answers, creating, isLoading, loadError, refresh, rule, setRule, setCount,
    generationPending, generationUnknown, generationError, setGenerationError, generate, status,
    drafts, changeDraft, savingId, saveAnswer, confirmDeleteId, setConfirmDeleteId, deleteUnknownId, actionError, actionErrorId, setActionError, remove,
  }
}
