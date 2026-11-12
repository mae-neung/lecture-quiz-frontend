import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button/Button'
import QuizView from './QuizView'
import { mockQuizQuestions } from '@/features/quiz/mockQuestions'

// 데모(목업) 문제 풀이 화면. 서버 문제는 /subjects/:subjectId/quiz 에서 푼다.
function Quiz() {
  const navigate = useNavigate()

  return (
    <QuizView
      questions={mockQuizQuestions}
      heading="핵심 개념을 문제로 확인해요."
      sourceLabel="목업"
      resultActions={<Button onClick={() => navigate('/upload')} variant="secondary">자료 등록으로 돌아가기</Button>}
    />
  )
}

export default Quiz
