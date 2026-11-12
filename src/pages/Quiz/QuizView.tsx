import { Box, Flex, Grid, Text } from '@devup-ui/react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Button from '@/components/Button/Button'
import { getCorrectCount, getFirstUnansweredIndex, getGradableCount, getQuizScore, isAnswered, isCorrect } from '@/features/quiz/scoreQuiz'
import { isChoiceQuestion, isGradableQuestion, QUESTION_TYPE_LABEL, type QuizAnswers, type QuizQuestion } from '@/features/quiz/types'

function TypeBadge({ question }: { question: QuizQuestion }) {
  return (
    <Text as="span" bg="$surfaceMuted" borderRadius="999px" color="$accent" fontSize="12px" fontWeight={900} px="10px" py="3px">
      {QUESTION_TYPE_LABEL[question.type]}
    </Text>
  )
}

// 문제 세트의 데이터 소스(목업·서버)와 무관하게 풀이·채점 UI를 담당한다.
function QuizView({ questions, heading, sourceLabel, resultActions }: {
  questions: QuizQuestion[]
  heading: string
  sourceLabel: string
  resultActions?: ReactNode
}) {
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const questionHeading = useRef<HTMLHeadingElement>(null)
  const resultHeading = useRef<HTMLHeadingElement>(null)
  const question = questions[currentIndex]
  const answeredCount = questions.filter((item) => isAnswered(item, answers)).length
  const gradableCount = getGradableCount(questions)
  const hasLongAnswer = questions.some((item) => !isGradableQuestion(item))

  useEffect(() => {
    if (isComplete) resultHeading.current?.focus()
  }, [isComplete])

  function moveTo(index: number) {
    setCurrentIndex(index)
    setSubmitError('')
    requestAnimationFrame(() => questionHeading.current?.focus())
  }

  function setAnswer(value: string) {
    setAnswers((current) => ({ ...current, [question.id]: value }))
    setSubmitError('')
  }

  function gradeQuiz() {
    const firstUnanswered = getFirstUnansweredIndex(questions, answers)
    if (firstUnanswered >= 0) {
      setCurrentIndex(firstUnanswered)
      setSubmitError(`${firstUnanswered + 1}번 문제부터 답을 입력해 주세요.`)
      requestAnimationFrame(() => questionHeading.current?.focus())
      return
    }
    setIsComplete(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function restartQuiz() {
    setAnswers({})
    setCurrentIndex(0)
    setSubmitError('')
    setIsComplete(false)
    requestAnimationFrame(() => questionHeading.current?.focus())
  }

  if (isComplete) {
    const correctCount = getCorrectCount(questions, answers)
    const score = getQuizScore(questions, answers)

    return (
      <Box as="section" maxW="1000px" mx="auto" px={["16px", "24px"]} py={["40px", "64px"]}>
        <Text as="p" color="$accent" fontSize="13px" fontWeight={900} letterSpacing="0.08em" m={0}>채점 완료 · {sourceLabel}</Text>
        <Text as="h1" color="$text" fontSize={["36px", "52px"]} letterSpacing="-0.055em" lineHeight={1.15} mb="12px" mt="12px" ref={resultHeading} tabIndex={-1}>오늘의 복습 결과예요.</Text>
        <Text as="p" color="$muted" lineHeight={1.7} m={0}>페이지를 새로고침하면 풀이 기록이 초기화돼요.{hasLongAnswer ? ' 서술형은 자동 채점 대상이 아니라 모범답안으로 스스로 점검해요.' : ''}</Text>

        <Grid aria-live="polite" bg="$accent" borderRadius="22px" color="$onAccent" gap="12px" gridTemplateColumns={["1fr", "1.4fr 1fr"]} mt="36px" p={["24px", "36px"]}>
          <Box>
            <Text as="p" fontSize="14px" fontWeight={800} m={0} opacity={0.82}>100점 환산{hasLongAnswer ? ' · 자동 채점 문항 기준' : ''}</Text>
            <Text as="p" fontSize={["54px", "72px"]} fontWeight={900} letterSpacing="-0.06em" lineHeight={1} mb={0} mt="8px">{score}점</Text>
          </Box>
          <Flex alignItems={["flex-start", "center"]} borderLeft={["0", "1px solid"]} borderTop={["1px solid", "0"]} borderColor="$focusRing" flexDirection="column" justifyContent="center" pl={[0, "30px"]} pt={["18px", 0]}>
            <Text as="p" fontSize="24px" fontWeight={900} m={0}>{correctCount} / {gradableCount} 정답</Text>
            <Text as="p" lineHeight={1.6} mb={0} mt="6px" opacity={0.82}>틀린 문제의 해설을 확인하고 다시 도전해 보세요.</Text>
          </Flex>
        </Grid>

        <Flex flexWrap="wrap" gap="10px" mt="20px">
          <Button onClick={restartQuiz}>다시 풀기</Button>
          {resultActions}
        </Flex>

        <Box mt="52px">
          <Text as="h2" color="$text" fontSize="28px" letterSpacing="-0.04em" mb="20px" mt={0}>문항별 해설</Text>
          <Grid gap="14px">
            {questions.map((item, index) => {
              const gradable = isGradableQuestion(item)
              const correct = gradable && isCorrect(item, answers)
              const answerValue = answers[item.id] ?? ''
              const myAnswerLabel = isChoiceQuestion(item)
                ? (item.options.find((option) => option.id === answerValue)?.label ?? '(미응답)')
                : (answerValue.trim() || '(미응답)')
              const correctLabel = isChoiceQuestion(item)
                ? (item.options.find((option) => option.id === item.correctOptionId)?.label ?? item.correctAnswer)
                : item.correctAnswer
              const borderColor = !gradable ? '$border' : correct ? '$accent' : '$danger'
              const statusColor = !gradable ? '$muted' : correct ? '$accent' : '$danger'
              const statusLabel = !gradable ? '채점 제외' : correct ? '정답' : '오답'
              return (
                <Box bg="$surface" borderColor={borderColor} borderRadius="18px" borderStyle="solid" borderWidth="1px" key={item.id} p={["20px", "26px"]}>
                  <Flex alignItems="center" gap="10px" justifyContent="space-between">
                    <Flex alignItems="center" gap="10px">
                      <TypeBadge question={item} />
                      <Text as="h3" color="$text" fontSize="18px" lineHeight={1.5} m={0}>{index + 1}. {item.prompt}</Text>
                    </Flex>
                    <Text as="span" color={statusColor} fontSize="13px" fontWeight={900} whiteSpace="nowrap">{statusLabel}</Text>
                  </Flex>
                  <Grid gap="7px" mt="16px">
                    <Text as="p" color="$muted" lineHeight={1.6} m={0}><strong>내 답:</strong> {myAnswerLabel}</Text>
                    <Text as="p" color="$text" lineHeight={1.6} m={0}><strong>{item.type === 'long' ? '모범답안:' : '정답:'}</strong> {correctLabel}</Text>
                    <Text as="p" bg="$surfaceMuted" borderRadius="10px" color="$muted" lineHeight={1.7} mb={0} mt="5px" p="13px"><strong>해설:</strong> {item.explanation}</Text>
                  </Grid>
                </Box>
              )
            })}
          </Grid>
        </Box>
      </Box>
    )
  }

  const answerValue = answers[question.id] ?? ''

  return (
    <Box as="section" maxW="1000px" mx="auto" px={["16px", "24px"]} py={["40px", "64px"]}>
      <Text as="p" color="$accent" fontSize="13px" fontWeight={900} letterSpacing="0.08em" m={0}>STEP 02 · 문제 풀이</Text>
      <Text as="h1" color="$text" fontSize={["36px", "52px"]} letterSpacing="-0.055em" lineHeight={1.15} mb="12px" mt="12px">{heading}</Text>
      <Text as="p" color="$muted" lineHeight={1.7} m={0}>{questions.length}개의 {sourceLabel} 문제입니다. 답안은 이동해도 유지되지만 새로고침하면 초기화돼요.</Text>

      <Grid alignItems="start" gap="20px" gridTemplateColumns={["1fr", "220px minmax(0, 1fr)"]} mt="36px">
        <Box as="aside" bg="$surfaceMuted" borderColor="$border" borderRadius="18px" borderStyle="solid" borderWidth="1px" p="20px">
          <Flex alignItems="center" justifyContent="space-between">
            <Text as="h2" color="$text" fontSize="16px" m={0}>문제 이동</Text>
            <Text as="span" color="$muted" fontSize="13px">{answeredCount}/{questions.length} 답변</Text>
          </Flex>
          <Grid aria-label="문제 바로가기" gap="8px" gridTemplateColumns="repeat(3, minmax(0, 1fr))" mt="16px" role="navigation">
            {questions.map((item, index) => (
              <Button
                aria-current={index === currentIndex ? 'step' : undefined}
                aria-label={`${index + 1}번 문제${isAnswered(item, answers) ? ', 답변 완료' : ''}`}
                key={item.id}
                onClick={() => moveTo(index)}
                style={{ minWidth: 0, paddingInline: 4, width: '100%' }}
                variant={index === currentIndex || isAnswered(item, answers) ? 'primary' : 'secondary'}
              >
                {index + 1}{isAnswered(item, answers) ? '✓' : ''}
              </Button>
            ))}
          </Grid>
          <Text as="p" color="$muted" fontSize="13px" lineHeight={1.6} mb={0} mt="16px">답변한 문제는 버튼의 접근성 이름에서 확인할 수 있어요.</Text>
        </Box>

        <Box bg="$surface" borderColor="$border" borderRadius="22px" borderStyle="solid" borderWidth="1px" p={["22px", "34px"]}>
          <Flex alignItems="center" gap="10px" justifyContent="space-between">
            <Text as="p" color="$accent" fontSize="13px" fontWeight={900} m={0}>QUESTION {currentIndex + 1} / {questions.length}</Text>
            <TypeBadge question={question} />
          </Flex>
          <Text as="h2" color="$text" fontSize={["23px", "28px"]} letterSpacing="-0.035em" lineHeight={1.45} mb="26px" mt="10px" ref={questionHeading} tabIndex={-1}>{question.prompt}</Text>

          {isChoiceQuestion(question) ? (
            <Grid as="fieldset" border={0} gap="10px" m={0} p={0}>
              <legend className="sr-only">{currentIndex + 1}번 문제 답 선택</legend>
              {question.options.map((option, index) => {
                const isSelected = answerValue === option.id
                return (
                  <Box
                    alignItems="flex-start"
                    as="label"
                    bg={isSelected ? '$surfaceMuted' : '$surface'}
                    borderColor={isSelected ? '$accent' : '$border'}
                    borderRadius="13px"
                    borderStyle="solid"
                    borderWidth={isSelected ? '2px' : '1px'}
                    color="$text"
                    cursor="pointer"
                    display="flex"
                    gap="12px"
                    key={option.id}
                    lineHeight={1.6}
                    p="15px"
                  >
                    <input
                      checked={isSelected}
                      name={`answer-${question.id}`}
                      onChange={() => setAnswer(option.id)}
                      style={{ accentColor: 'var(--color-accent)', height: 18, marginTop: 3, width: 18 }}
                      type="radio"
                      value={option.id}
                    />
                    <span>{question.type === 'select' ? <strong>{String.fromCharCode(65 + index)}.</strong> : null} {option.label}</span>
                  </Box>
                )
              })}
            </Grid>
          ) : question.type === 'short' ? (
            <Box>
              <Text as="label" color="$text" display="block" fontWeight={800} htmlFor={`answer-${question.id}`} mb="10px">정답을 입력해 주세요</Text>
              <input
                id={`answer-${question.id}`}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="예: 중앙값"
                style={{ border: '1px solid var(--color-border)', borderRadius: 13, color: 'var(--color-text)', background: 'var(--color-surface)', fontSize: 16, padding: '14px 16px', width: '100%' }}
                type="text"
                value={answerValue}
              />
              <Text as="p" color="$muted" fontSize="13px" lineHeight={1.6} mb={0} mt="10px">띄어쓰기와 대소문자 차이는 채점에서 무시돼요.</Text>
            </Box>
          ) : (
            <Box>
              <Text as="label" color="$text" display="block" fontWeight={800} htmlFor={`answer-${question.id}`} mb="10px">답안을 서술해 주세요</Text>
              <textarea
                id={`answer-${question.id}`}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="핵심 근거를 두 가지 이상 포함해 작성해 보세요."
                rows={6}
                style={{ border: '1px solid var(--color-border)', borderRadius: 13, color: 'var(--color-text)', background: 'var(--color-surface)', fontFamily: 'inherit', fontSize: 16, lineHeight: 1.6, padding: '14px 16px', resize: 'vertical', width: '100%' }}
                value={answerValue}
              />
              <Text as="p" color="$muted" fontSize="13px" lineHeight={1.6} mb={0} mt="10px">서술형은 자동 채점 대상이 아니에요. 채점 후 모범답안과 비교해 스스로 점검해요.</Text>
            </Box>
          )}

          {submitError && <Text as="p" color="$danger" fontWeight={800} id="quiz-submit-error" mb={0} mt="18px" role="alert">{submitError}</Text>}
          <Flex flexWrap="wrap" gap="10px" justifyContent="space-between" mt="28px">
            <Button disabled={currentIndex === 0} onClick={() => moveTo(currentIndex - 1)} variant="secondary">이전 문제</Button>
            <Flex flexWrap="wrap" gap="10px">
              {currentIndex < questions.length - 1 && <Button onClick={() => moveTo(currentIndex + 1)}>다음 문제</Button>}
              <Button aria-describedby={submitError ? 'quiz-submit-error' : undefined} onClick={gradeQuiz} variant={currentIndex === questions.length - 1 ? 'primary' : 'secondary'}>채점하기</Button>
            </Flex>
          </Flex>
        </Box>
      </Grid>
    </Box>
  )
}

export default QuizView
