export const agents = [
  { id: 'agent-planning', name: '기획 에이전트', role: 'planning', description: '요구사항을 분석하고 작업 범위를 정리합니다.', status: 'idle' },
  { id: 'agent-design', name: '디자인 에이전트', role: 'design', description: '화면 구조와 사용자 흐름을 설계합니다.', status: 'idle' },
  { id: 'agent-frontend', name: '프론트엔드 에이전트', role: 'frontend', description: 'React 화면과 스타일을 구현합니다.', status: 'working' },
  { id: 'agent-review', name: '리뷰 에이전트', role: 'review', description: '품질과 반응형 동작을 검토합니다.', status: 'idle' },
  { id: 'agent-support', name: '지원 에이전트', role: 'support', description: '고객 문의를 분류하고 배정합니다.', status: 'error' },
]

export const workflows = [
  {
    id: 'workflow-landing-page',
    title: '신규 서비스 랜딩 페이지 제작',
    description: '요구사항을 바탕으로 반응형 랜딩 페이지를 제작합니다.',
    status: 'running',
    createdAt: '2026-09-20T14:00:00',
    updatedAt: '2분 전',
    steps: [
      { id: 'step-brief', order: 1, title: '요구사항 분석', agentId: 'agent-planning', status: 'completed', input: '프로젝트 요청서', output: '요구사항 요약' },
      { id: 'step-design', order: 2, title: '화면 구조 설계', agentId: 'agent-design', status: 'completed', input: '요구사항 요약', output: '화면 구조' },
      { id: 'step-implementation', order: 3, title: 'React 화면 구현', agentId: 'agent-frontend', status: 'running', input: '화면 구조', output: null },
      { id: 'step-review', order: 4, title: '반응형 검토', agentId: 'agent-review', status: 'waiting', input: '구현 결과', output: null },
    ],
  },
  {
    id: 'workflow-content-brief',
    title: '주간 콘텐츠 브리프 생성',
    description: '이번 주 채널별 콘텐츠 주제와 초안을 정리합니다.',
    status: 'completed',
    createdAt: '2026-09-20T13:00:00',
    updatedAt: '35분 전',
    steps: [
      { id: 'step-research', order: 1, title: '자료 조사', agentId: 'agent-planning', status: 'completed', input: '주간 이슈', output: '조사 결과' },
      { id: 'step-outline', order: 2, title: '목차 작성', agentId: 'agent-planning', status: 'completed', input: '조사 결과', output: '콘텐츠 목차' },
      { id: 'step-draft', order: 3, title: '초안 생성', agentId: 'agent-planning', status: 'completed', input: '콘텐츠 목차', output: '초안' },
    ],
  },
  {
    id: 'workflow-support-triage',
    title: '고객 문의 분류',
    description: '접수된 고객 문의를 유형별로 나누고 담당자를 배정합니다.',
    status: 'failed',
    createdAt: '2026-09-20T12:00:00',
    updatedAt: '1시간 전',
    steps: [
      { id: 'step-collect', order: 1, title: '문의 수집', agentId: 'agent-support', status: 'completed', input: '고객 문의', output: '수집된 문의' },
      { id: 'step-classify', order: 2, title: '문의 분류', agentId: 'agent-support', status: 'failed', input: '수집된 문의', output: null },
      { id: 'step-assign', order: 3, title: '담당자 배정', agentId: 'agent-support', status: 'waiting', input: '분류 결과', output: null },
    ],
  },
]

export const runs = [
  { id: 'run-003', workflowId: 'workflow-landing-page', status: 'running', startedAt: '오늘 14:24', completedAt: null, duration: '8분 경과' },
  { id: 'run-002', workflowId: 'workflow-content-brief', status: 'completed', startedAt: '오늘 13:51', completedAt: '오늘 13:57', duration: '6분 12초' },
  { id: 'run-001', workflowId: 'workflow-support-triage', status: 'failed', startedAt: '오늘 13:18', completedAt: '오늘 13:20', duration: '1분 43초' },
]

export const logs = [
  { id: 'log-001', runId: 'run-003', stepId: 'step-implementation', level: 'info', message: '프론트엔드 에이전트가 React 화면 구현을 시작했습니다.', createdAt: '오늘 14:24' },
  { id: 'log-002', runId: 'run-002', stepId: 'step-draft', level: 'info', message: '모든 단계를 완료했습니다.', createdAt: '오늘 13:57' },
  { id: 'log-003', runId: 'run-001', stepId: 'step-classify', level: 'error', message: '문의 분류 단계에서 실행이 중단됐습니다.', createdAt: '오늘 13:20' },
]
