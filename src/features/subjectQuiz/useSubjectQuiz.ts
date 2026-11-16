import { useCallback, useEffect, useState } from 'react'
import { getGrades, getProblems, getSubjects, getWikiDocuments, gradeProblems, isGrading, updateUserAnswer } from '@/services/api'
import type { ApiProblem } from '@/services/api'
import { mapApiProblems } from '@/features/upload/mapApiProblems'
import { isChoiceQuestion, type QuizAnswers, type QuizGrades, type QuizQuestion } from '@/features/quiz/types'

// 문항(problem_id) → 소속 위키 문서와 답안 식별자. 답안 저장과 위키 문서별 채점 호출에 쓴다.
type AnswerLink = { wikiId: string; userAnswerId: string | null }

// 서버 채점이 이미 진행 중일 때(프로세스 단위 플래그) 끝날 때까지 대기한다.
async function waitForGrading(userId: string, subjectId: string, wikiId: string): Promise<void> {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (!await isGrading(userId, subjectId, wikiId)) return
    await new Promise((resolve) => window.setTimeout(resolve, 1000))
  }
  throw new Error('채점이 오래 걸리고 있어요. 잠시 뒤 다시 시도해 주세요.')
}

function isGradingInProgressError(error: unknown): boolean {
  return error instanceof Error && error.message.includes('채점이 이미 진행중')
}

// 과목에 속한 모든 요약 문서의 문제를 합쳐 Quiz 풀이용 문항으로 변환한다.
export function useSubjectQuiz(userId: string | null, subjectId: string | undefined) {
  const [subjectName, setSubjectName] = useState('')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answerLinks, setAnswerLinks] = useState<Record<string, AnswerLink>>({})
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
      const links: Record<string, AnswerLink> = {}
      for (const document of documents) {
        if (document.owned_problem_ids.length === 0) continue
        const documentProblems = await getProblems(userId, subjectId, document.wiki_document_id)
        for (const problem of documentProblems) {
          links[problem.problem_id] = { wikiId: document.wiki_document_id, userAnswerId: problem.owned_user_answer_id }
        }
        problems.push(...documentProblems)
      }
      setSubjectName(found.subjectName)
      if (problems.length === 0) {
        setQuestions([])
        setAnswerLinks({})
        setEmpty(true)
        return
      }
      setQuestions(mapApiProblems(problems))
      setAnswerLinks(links)
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

  // 답안을 서버에 저장하고 위키 문서별로 채점한 뒤, 문항 id 기준 채점 결과를 돌려준다.
  const submitAndGrade = useCallback(async (answers: QuizAnswers): Promise<QuizGrades> => {
    if (!userId || !subjectId) throw new Error('로그인이 필요합니다.')
    // 1. 입력한 답안을 서버에 저장한다(서버 채점은 저장된 답안을 읽는다).
    // 선택형은 보기 id가 아니라 보기 라벨 텍스트로 저장한다. 서버 정답(problem_correct_answer)과
    // 기존 답안 저장 경로(WikiDetail)가 모두 라벨 텍스트를 쓰므로 포맷을 맞춰야 정오 채점이 된다.
    for (const [problemId, value] of Object.entries(answers)) {
      const link = answerLinks[problemId]
      if (!link?.userAnswerId) continue
      const question = questions.find((item) => item.id === problemId)
      const stored = question && isChoiceQuestion(question)
        ? (question.options.find((option) => option.id === value)?.label ?? value)
        : value
      await updateUserAnswer(userId, subjectId, link.userAnswerId, stored)
    }
    // 2. 문제가 있는 위키 문서마다 채점을 요청한다(동기 완료).
    const wikiIds = [...new Set(Object.values(answerLinks).map((link) => link.wikiId))]
    for (const wikiId of wikiIds) {
      try {
        await gradeProblems(userId, subjectId, wikiId)
      } catch (error) {
        if (!isGradingInProgressError(error)) throw error
        await waitForGrading(userId, subjectId, wikiId)
      }
    }
    // 3. 채점 결과를 모아 문항 id 기준 맵으로 만든다.
    const grades: QuizGrades = {}
    for (const wikiId of wikiIds) {
      for (const grade of await getGrades(userId, subjectId, wikiId)) {
        grades[grade.owner_problem_id] = { state: grade.grade_state, explanation: grade.explanation }
      }
    }
    return grades
  }, [userId, subjectId, answerLinks, questions])

  return { subjectName, questions, isLoading, loadError, isEmpty, reload: load, submitAndGrade }
}
