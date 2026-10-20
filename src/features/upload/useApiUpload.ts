import { useRef, useState } from 'react'
import { createSubject, createProblems, firstWikiId, getProblems, summarizeLecture, updateSubject, uploadLecture } from '@/services/api'
import { mapApiProblems } from './mapApiProblems'
import { saveApiSet } from '@/features/library/libraryStorage'
import { apiLibraryScope } from '@/services/apiStorage'
import type { LectureType } from './validateLecture'
import type { SavedQuizSet } from '@/features/library/libraryStorage'
import type { QuizQuestion } from '@/features/quiz/types'

type Stage = 'subject' | 'rename' | 'upload' | 'summary' | 'wiki' | 'generate' | 'problems' | 'save'
type Checkpoint = { key: string; subjectId?: string; wikiId?: string; questions?: QuizQuestion[]; next: Stage | 'blocked' }

const unsafeToRetry = new Set<Stage>(['subject', 'upload', 'summary', 'generate'])

const stageMessage: Record<Stage, string> = {
  subject: '과목 생성 중', rename: '강의명 설정 중', upload: '파일 업로드 중', summary: '자료 요약 중',
  wiki: '요약 문서 확인 중', generate: '문제 생성 중', problems: '문제 확인 중', save: '보관함 저장 중',
}

export function useApiUpload(userId: string | null) {
  const checkpoint = useRef<Checkpoint | null>(null)
  const busy = useRef(false)
  const [isPending, setPending] = useState(false)
  const [checkpointStatus, setCheckpointStatus] = useState<'none' | 'retryable' | 'blocked'>('none')
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')

  function reset() {
    if (checkpoint.current) return
    setCheckpointStatus('none')
    setProgress('')
    setError('')
  }

  async function submit(title: string, type: LectureType, file: File): Promise<SavedQuizSet | null> {
    if (busy.current) return null
    if (!userId) { setError('로그인이 필요합니다. 다시 로그인해 주세요.'); return null }
    if (checkpoint.current?.next === 'blocked') return null
    const fileType = file.name.split('.').pop()?.toLowerCase()
    if (fileType !== 'pdf' && fileType !== 'mp3' && fileType !== 'mp4') { setError('PDF, MP3, MP4 파일만 업로드할 수 있습니다.'); return null }
    const key = `${userId}:${title}:${type}:${file.name}:${file.size}:${file.lastModified}`
    if (checkpoint.current && checkpoint.current.key !== key) {
      setError('진행 중인 자료와 입력이 다릅니다. 현재 처리 상태를 확인한 뒤 페이지를 새로고침해 주세요.')
      return null
    }
    if (!checkpoint.current) checkpoint.current = { key, next: 'subject' }
    const state = checkpoint.current
    busy.current = true
    setPending(true)
    setError('')
    try {
      if (state.next === 'subject') {
        setProgress(stageMessage.subject)
        state.subjectId = await createSubject(userId)
        state.next = 'rename'
      }
      const subjectId = state.subjectId
      if (!subjectId) throw new Error('과목 생성 결과가 없습니다.')
      if (state.next === 'rename') { setProgress(stageMessage.rename); await updateSubject(userId, subjectId, title); state.next = 'upload' }
      if (state.next === 'upload') { setProgress(stageMessage.upload); await uploadLecture(userId, subjectId, file, fileType); state.next = 'summary' }
      if (state.next === 'summary') { setProgress(stageMessage.summary); await summarizeLecture(userId, subjectId); state.next = 'wiki' }
      if (state.next === 'wiki') { setProgress(stageMessage.wiki); state.wikiId = await firstWikiId(userId, subjectId); state.next = 'generate' }
      const wikiId = state.wikiId
      if (!wikiId) throw new Error('요약 문서 결과가 없습니다.')
      if (state.next === 'generate') { setProgress(stageMessage.generate); await createProblems(userId, subjectId, wikiId); state.next = 'problems' }
      if (state.next === 'problems') { setProgress(stageMessage.problems); state.questions = mapApiProblems(await getProblems(userId, subjectId, wikiId)); state.next = 'save' }
      if (!state.questions) throw new Error('문제 조회 결과가 없습니다.')
      setProgress(stageMessage.save)
      const result = saveApiSet({ title, materialType: type, fileName: file.name, fileSize: file.size, questions: state.questions, remote: { subjectId, wikiId } }, apiLibraryScope(userId))
      if (!result.ok) throw new Error(result.error)
      checkpoint.current = null
      setCheckpointStatus('none')
      setProgress('문제 세트 저장 완료')
      return result.value
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : '요청에 실패했습니다.'
      const failedStage = state.next
      if (failedStage !== 'blocked' && unsafeToRetry.has(failedStage)) {
        state.next = 'blocked'
        setCheckpointStatus('blocked')
        setError(`${stageMessage[failedStage]} 단계에서 멈췄습니다. 서버가 요청을 처리했는지 확인할 수 없어 자동 재시도를 중단했습니다. 백엔드 상태를 확인한 뒤 페이지를 새로고침해 주세요. ${message}`)
      } else {
        setCheckpointStatus('retryable')
        setError(`${failedStage === 'blocked' ? '처리' : stageMessage[failedStage]} 단계에서 멈췄습니다. 다시 시도하면 이 단계부터 이어집니다. ${message}`)
      }
      setProgress('처리 중단')
      return null
    } finally { busy.current = false; setPending(false) }
  }

  const hasCheckpoint = checkpointStatus !== 'none'
  const isBlocked = checkpointStatus === 'blocked'
  return { submit, reset, isPending, progress, error, hasCheckpoint, canRetry: checkpointStatus === 'retryable' && !isPending, isBlocked }
}
