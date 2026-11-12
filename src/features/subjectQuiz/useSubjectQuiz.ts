import { useCallback, useEffect, useState } from 'react'
import { getProblems, getSubjects, getWikiDocuments } from '@/services/api'
import type { ApiProblem } from '@/services/api'
import { mapApiProblems } from '@/features/upload/mapApiProblems'
import type { QuizQuestion } from '@/features/quiz/types'

// 과목에 속한 모든 요약 문서의 문제를 합쳐 Quiz 풀이용 문항으로 변환한다.
export function useSubjectQuiz(userId: string | null, subjectId: string | undefined) {
  const [subjectName, setSubjectName] = useState('')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [isLoading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isEmpty, setEmpty] = useState(false)

  const load = useCallback(async () => {
    if (!userId || !subjectId) return
    setLoading(true)
    setLoadError('')
    setEmpty(false)
    try {
      const subjects = await getSubjects(userId)
      const found = subjects.find((item) => item.subjectId === subjectId)
      if (!found) throw new Error('과목을 찾을 수 없습니다. 목록에서 다시 선택해 주세요.')
      const documents = await getWikiDocuments(userId, subjectId)
      const problems: ApiProblem[] = []
      for (const document of documents) {
        if (document.owned_problem_ids.length === 0) continue
        problems.push(...await getProblems(userId, subjectId, document.wiki_document_id))
      }
      setSubjectName(found.subjectName)
      if (problems.length === 0) {
        setQuestions([])
        setEmpty(true)
        return
      }
      setQuestions(mapApiProblems(problems))
    } catch (caught) {
      setLoadError(caught instanceof Error ? caught.message : '문제를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [userId, subjectId])

  useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  return { subjectName, questions, isLoading, loadError, isEmpty, reload: load }
}
