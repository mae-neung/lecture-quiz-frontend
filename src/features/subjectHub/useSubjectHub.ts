import { useCallback, useEffect, useRef, useState } from 'react'
import { getSubjects, getWikiDocuments, isCreatingProblems, isSummarized, isUploading, uploadLectureUrls } from '@/services/api'
import type { ApiSubject, ApiWikiDocument } from '@/services/api'

type Progress = { uploading: boolean | null; summarized: boolean | null; creating: boolean | null }

export function useSubjectHub(userId: string | null, subjectId: string | undefined) {
  const [subject, setSubject] = useState<ApiSubject | null>(null)
  const [documents, setDocuments] = useState<ApiWikiDocument[]>([])
  const [documentsUnavailable, setDocumentsUnavailable] = useState(false)
  const [progress, setProgress] = useState<Progress>({ uploading: null, summarized: null, creating: null })
  const [isLoading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [statusWarning, setStatusWarning] = useState('')
  const [urlText, setUrlText] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploadStatus, setUploadStatus] = useState('')
  const [isSubmitting, setSubmitting] = useState(false)
  const submitting = useRef(false)

  const refresh = useCallback(async () => {
    if (!userId || !subjectId) return
    setLoading(true)
    setLoadError('')
    setStatusWarning('')
    try {
      const allSubjects = await getSubjects(userId)
      const found = allSubjects.find((item) => item.subjectId === subjectId)
      if (!found) throw new Error('과목을 찾을 수 없습니다. 목록에서 다시 선택해 주세요.')
      const [uploadingResult, summarizedResult, documentsResult] = await Promise.allSettled([
        isUploading(userId, subjectId), isSummarized(userId, subjectId), getWikiDocuments(userId, subjectId),
      ])
      const allDocuments = documentsResult.status === 'fulfilled' ? documentsResult.value : []
      let creating: boolean | null = null
      let creatingFailed = false
      if (allDocuments.length) {
        try { creating = await isCreatingProblems(userId, subjectId, allDocuments[0].wiki_document_id) }
        catch { creatingFailed = true }
      }
      setSubject(found)
      setDocuments(allDocuments)
      setDocumentsUnavailable(documentsResult.status === 'rejected')
      setProgress({
        uploading: uploadingResult.status === 'fulfilled' ? uploadingResult.value : null,
        summarized: summarizedResult.status === 'fulfilled' ? summarizedResult.value : null,
        creating,
      })
      if (uploadingResult.status === 'rejected' || summarizedResult.status === 'rejected' || documentsResult.status === 'rejected' || creatingFailed) {
        setStatusWarning('일부 진행 상태나 요약 문서를 확인하지 못했습니다. 새 과목에는 아직 작업 이력이 없어 상태 조회가 실패할 수 있습니다.')
      }
    } catch (caught) {
      setLoadError(caught instanceof Error ? caught.message : '과목 정보를 불러오지 못했습니다.')
    } finally { setLoading(false) }
  }, [userId, subjectId])

  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh() }, 0)
    return () => window.clearTimeout(timer)
  }, [refresh])

  async function submitUrls() {
    if (!userId || !subjectId || submitting.current) return
    const urls = urlText.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
    if (!urls.length || urls.some((item) => { try { const url = new URL(item); return !['http:', 'https:'].includes(url.protocol) } catch { return true } })) {
      setUploadError('http 또는 https URL을 한 줄에 하나씩 입력해 주세요.')
      return
    }
    submitting.current = true
    setSubmitting(true)
    setUploadError('')
    setUploadStatus('URL 업로드를 요청하고 있습니다.')
    try {
      const failed = await uploadLectureUrls(userId, subjectId, urls)
      setUploadStatus(failed.length ? `${failed.length}개 URL을 처리하지 못했습니다: ${failed.join(', ')}` : 'URL 업로드 요청을 받았습니다. 처리 상태를 다시 확인해 주세요.')
      if (!failed.length) setUrlText('')
      await refresh()
    } catch (caught) {
      setUploadStatus('')
      setUploadError(caught instanceof Error ? caught.message : 'URL 업로드 요청에 실패했습니다.')
    } finally { submitting.current = false; setSubmitting(false) }
  }

  return { subject, documents, documentsUnavailable, progress, isLoading, loadError, statusWarning, refresh, urlText, setUrlText, uploadError, setUploadError, uploadStatus, isSubmitting, submitUrls }
}
