import { useEffect, useRef, useState } from 'react'
import { createSubject, deleteSubject, getSubjects, updateSubject } from '@/services/api'
import type { ApiSubject } from '@/services/api'

export function useSubjects(userId: string | null) {
  const [subjects, setSubjects] = useState<ApiSubject[]>([])
  const [isLoading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [title, setTitle] = useState('')
  const [createError, setCreateError] = useState('')
  const [createStatus, setCreateStatus] = useState('')
  const [isCreating, setCreating] = useState(false)
  const [pendingSubjectId, setPendingSubjectId] = useState<string | null>(null)
  const [createBlocked, setCreateBlocked] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [actionPending, setActionPending] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [status, setStatus] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleteUnknownId, setDeleteUnknownId] = useState<string | null>(null)
  const creating = useRef(false)
  const acting = useRef(false)

  useEffect(() => {
    let active = true
    if (!userId) return
    getSubjects(userId).then((items) => {
      if (!active) return
      setSubjects(items)
      setLoadError('')
      setLoading(false)
    }).catch((caught: unknown) => {
      if (!active) return
      setLoadError(caught instanceof Error ? caught.message : '과목 목록을 불러오지 못했습니다.')
      setLoading(false)
    })
    return () => { active = false }
  }, [userId])

  async function reload() {
    if (!userId) return
    setLoading(true)
    setLoadError('')
    try {
      setSubjects(await getSubjects(userId))
      setDeleteUnknownId(null)
      setActionError('')
    } catch (caught) {
      setLoadError(caught instanceof Error ? caught.message : '과목 목록을 불러오지 못했습니다.')
    } finally { setLoading(false) }
  }

  async function create() {
    if (!userId || creating.current || createBlocked) return
    if (!title.trim()) { setCreateError('과목명을 입력해 주세요.'); return }
    creating.current = true
    setCreating(true)
    setCreateError('')
    setCreateStatus(pendingSubjectId ? '과목명을 다시 설정하고 있습니다.' : '과목을 만들고 있습니다.')
    let subjectId = pendingSubjectId
    try {
      if (!subjectId) {
        try {
          subjectId = await createSubject(userId)
          setPendingSubjectId(subjectId)
        } catch (caught) {
          setCreateBlocked(true)
          throw new Error(`과목 생성 결과를 확인할 수 없어 재요청을 중단했습니다. 목록을 확인한 뒤 페이지를 새로고침해 주세요. ${caught instanceof Error ? caught.message : ''}`)
        }
      }
      setCreateStatus('과목명을 설정하고 있습니다.')
      await updateSubject(userId, subjectId, title.trim())
      setPendingSubjectId(null)
      setTitle('')
      setCreateStatus('과목을 만들었습니다.')
      await reload()
    } catch (caught) {
      setCreateStatus('')
      setCreateError(caught instanceof Error ? caught.message : '과목을 만들지 못했습니다.')
    } finally { creating.current = false; setCreating(false) }
  }

  function changeTitle(value: string) { setTitle(value); setCreateError('') }

  function beginRename(subject: ApiSubject) {
    setEditingId(subject.subjectId)
    setDraftName(subject.subjectName)
    setActionError('')
    setStatus('')
    setConfirmDeleteId(null)
  }

  function changeDraftName(value: string) { setDraftName(value); setActionError('') }
  function cancelRename() { setEditingId(null); setActionError('') }

  async function saveRename(subjectId: string) {
    if (!userId || acting.current) return
    if (!draftName.trim()) { setActionError('과목명을 입력해 주세요.'); return }
    acting.current = true
    setActionPending(subjectId)
    setActionError('')
    try {
      await updateSubject(userId, subjectId, draftName.trim())
      setSubjects((current) => current.map((subject) => subject.subjectId === subjectId ? { ...subject, subjectName: draftName.trim() } : subject))
      setEditingId(null)
      setStatus('과목명을 변경했습니다.')
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : '과목명을 변경하지 못했습니다.')
    } finally { acting.current = false; setActionPending(null) }
  }

  function beginDelete(subjectId: string) {
    setConfirmDeleteId(subjectId)
    setActionError(deleteUnknownId === subjectId ? '삭제 결과를 확인할 수 없습니다. 목록을 다시 불러와 확인해 주세요.' : '')
    setStatus('')
  }

  function cancelDelete() { setConfirmDeleteId(null); setActionError('') }

  async function remove(subjectId: string) {
    if (!userId || acting.current || deleteUnknownId === subjectId) return
    acting.current = true
    setActionPending(subjectId)
    setActionError('')
    try {
      await deleteSubject(userId, subjectId)
      setSubjects((current) => current.filter((subject) => subject.subjectId !== subjectId))
      setConfirmDeleteId(null)
      setStatus('과목을 삭제했습니다.')
    } catch (caught) {
      setDeleteUnknownId(subjectId)
      setActionError(`삭제 결과를 확인할 수 없습니다. 목록을 다시 불러와 확인해 주세요. ${caught instanceof Error ? caught.message : ''}`)
    } finally { acting.current = false; setActionPending(null) }
  }

  return {
    subjects, isLoading, loadError, title, createError, createStatus, isCreating, pendingSubjectId, createBlocked,
    editingId, draftName, actionPending, actionError, status, confirmDeleteId, deleteUnknownId,
    reload, create, changeTitle, beginRename, changeDraftName, cancelRename, saveRename, beginDelete, cancelDelete, remove,
  }
}
