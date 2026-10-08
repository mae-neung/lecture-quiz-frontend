import type { QuizQuestion } from './types'

export const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: '자료 분석을 시작하기 전에 가장 먼저 확인해야 할 것은 무엇인가요?',
    options: [
      { id: 'a', label: '자료의 출처와 수집 목적' },
      { id: 'b', label: '그래프의 색상' },
      { id: 'c', label: '발표 슬라이드 수' },
      { id: 'd', label: '파일 이름의 길이' },
    ],
    correctOptionId: 'a',
    explanation: '자료의 출처와 수집 목적을 알아야 데이터의 맥락과 신뢰도를 올바르게 판단할 수 있어요.',
  },
  {
    id: 'q2',
    prompt: '평균값이 극단값의 영향을 크게 받을 때 함께 살펴보기 좋은 값은 무엇인가요?',
    options: [
      { id: 'a', label: '최댓값' },
      { id: 'b', label: '중앙값' },
      { id: 'c', label: '표본의 이름' },
      { id: 'd', label: '단위 표기' },
    ],
    correctOptionId: 'b',
    explanation: '중앙값은 자료를 크기순으로 놓았을 때 가운데 값이라 극단값의 영향을 비교적 적게 받아요.',
  },
  {
    id: 'q3',
    prompt: '두 변수 사이에 상관관계가 있다는 설명으로 옳은 것은 무엇인가요?',
    options: [
      { id: 'a', label: '한 변수가 다른 변수의 원인임이 확정된다.' },
      { id: 'b', label: '두 변수의 값이 일정한 방식으로 함께 변한다.' },
      { id: 'c', label: '두 변수의 평균이 항상 같다.' },
      { id: 'd', label: '모든 표본에서 같은 결과가 나온다.' },
    ],
    correctOptionId: 'b',
    explanation: '상관관계는 두 변수가 함께 변하는 경향을 뜻하지만, 그 자체로 인과관계를 증명하지는 않아요.',
  },
  {
    id: 'q4',
    prompt: '표본을 이용해 모집단의 특성을 추론하는 이유로 가장 적절한 것은 무엇인가요?',
    options: [
      { id: 'a', label: '모집단 전체 조사가 어렵거나 비용이 크기 때문에' },
      { id: 'b', label: '표본에는 오차가 전혀 없기 때문에' },
      { id: 'c', label: '표본이 항상 모집단보다 크기 때문에' },
      { id: 'd', label: '모집단의 정의가 필요 없기 때문에' },
    ],
    correctOptionId: 'a',
    explanation: '현실에서는 시간과 비용의 제약 때문에 대표성 있는 표본을 조사해 모집단의 특성을 추론해요.',
  },
  {
    id: 'q5',
    prompt: '분석 결과를 해석할 때 가장 바람직한 태도는 무엇인가요?',
    options: [
      { id: 'a', label: '가설과 다른 결과는 제외한다.' },
      { id: 'b', label: '수치가 크면 무조건 중요한 결과로 본다.' },
      { id: 'c', label: '한계와 오차 가능성을 함께 설명한다.' },
      { id: 'd', label: '표본 수와 관계없이 일반화한다.' },
    ],
    correctOptionId: 'c',
    explanation: '분석의 조건, 표본, 측정 오차 같은 한계를 함께 밝혀야 결과를 과도하게 일반화하지 않을 수 있어요.',
  },
]
