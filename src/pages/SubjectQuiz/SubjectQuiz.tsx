import { Box, Text } from '@devup-ui/react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '@/components/Button/Button'
import QuizView from '@/pages/Quiz/QuizView'
import { useAuth } from '@/features/auth/useAuth'
import { useSubjectQuiz } from '@/features/subjectQuiz/useSubjectQuiz'

const linkStyle = { color: 'var(--color-accent)', fontWeight: 800 }

function SubjectQuizContent({ subjectId }: { subjectId?: string }) {
  const navigate = useNavigate()
  const { userId } = useAuth()
  const model = useSubjectQuiz(userId, subjectId)

  if (model.isLoading) return (
    <Box as="section" maxW="960px" mx="auto" px="20px" py="56px">
      <Text as="h1" color="$text">문제를 불러오고 있어요</Text>
      <Text as="p" color="$muted" role="status">과목의 문제를 불러오고 있습니다.</Text>
    </Box>
  )

  if (model.loadError) return (
    <Box as="section" maxW="960px" mx="auto" px="20px" py="56px">
      <Text as="h1" color="$text">문제를 열 수 없어요</Text>
      <Text as="p" color="$danger" role="alert">{model.loadError}</Text>
      <Button onClick={model.reload} variant="secondary" mt="18px">다시 시도</Button>
      <Box mt="18px"><Link style={linkStyle} to="/subjects">← 내 과목으로 돌아가기</Link></Box>
    </Box>
  )

  if (model.isEmpty) return (
    <Box as="section" maxW="960px" mx="auto" px="20px" py="56px">
      <Text as="h1" color="$text">아직 풀 문제가 없어요</Text>
      <Text as="p" color="$muted" lineHeight={1.7}>이 과목에는 생성된 문제가 없습니다. 과목 상세에서 요약 문서를 만들고 문제를 생성해 주세요.</Text>
      <Box mt="18px">{subjectId
        ? <Link style={linkStyle} to={`/subjects/${subjectId}`}>과목 상세로 가기</Link>
        : <Link style={linkStyle} to="/subjects">내 과목으로 가기</Link>}</Box>
    </Box>
  )

  return (
    <QuizView
      questions={model.questions}
      heading={`${model.subjectName || '과목'} 문제 풀기`}
      sourceLabel="서버 생성"
      resultActions={<>
        {subjectId && <Button onClick={() => navigate(`/subjects/${subjectId}`)} variant="secondary">과목 상세로</Button>}
        <Button onClick={() => navigate('/subjects')} variant="secondary">내 과목으로</Button>
      </>}
    />
  )
}

function SubjectQuiz() {
  const { subjectId } = useParams()
  return <SubjectQuizContent subjectId={subjectId} key={subjectId} />
}

export default SubjectQuiz
