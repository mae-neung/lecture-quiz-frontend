import StatusBadge from '@/features/workflows/components/StatusBadge'
import { useWorkflows } from '@/features/workflows/context/WorkflowContext'
import { Link } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  const { agents, runs, workflows } = useWorkflows()
  const waitingSteps = workflows.flatMap((workflow) => workflow.steps)
    .filter((step) => step.status === 'waiting').length
  const summaryCards = [
    { label: '전체 워크플로우', value: workflows.length, hint: '관리 중인 작업 흐름' },
    { label: '진행 중', value: workflows.filter((workflow) => workflow.status === 'running').length, hint: '현재 실행 중인 작업' },
    { label: '대기 단계', value: waitingSteps, hint: '이전 단계를 기다리는 작업' },
    { label: '실패한 실행', value: runs.filter((run) => run.status === 'failed').length, hint: '확인이 필요한 실행' },
  ]

  return (
    <section className="page dashboard-page">
      <div className="dashboard-page__heading">
        <div>
          <p className="page__eyebrow">Overview</p>
          <h1 className="page__title">대시보드</h1>
          <p className="page__description">오케스트레이션 작업의 현재 흐름을 확인하세요.</p>
        </div>
        <p className="dashboard-page__date">2026년 9월 20일</p>
      </div>

      <div className="summary-grid" aria-label="작업 요약">
        {summaryCards.map((card) => (
          <article className="summary-card" key={card.label}>
            <p>{card.label}</p>
            <strong>{card.value}</strong>
            <span>{card.hint}</span>
          </article>
        ))}
      </div>

      <section className="dashboard-section" aria-labelledby="recent-workflows-title">
        <div className="dashboard-section__heading">
          <h2 id="recent-workflows-title">최근 워크플로우</h2>
          <span>{workflows.length}개 작업</span>
        </div>

        <div className="workflow-card-list">
          {workflows.map((workflow) => {
            const completedSteps = workflow.steps.filter((step) => step.status === 'completed').length
            const activeStep = workflow.steps.find((step) => step.status === 'running')
            const activeAgent = agents.find((agent) => agent.id === activeStep?.agentId)

            return (
              <article className="workflow-card" key={workflow.id}>
                <div className="workflow-card__main">
                  <div className="workflow-card__title-row">
                    <h3><Link to={`/workflows/${workflow.id}`}>{workflow.title}</Link></h3>
                    <StatusBadge status={workflow.status} />
                  </div>
                  <p>{workflow.description}</p>
                </div>
                <div className="workflow-card__meta">
                  <span>{activeAgent?.name ?? '대기 중'}</span>
                  <span>{completedSteps} / {workflow.steps.length} 단계 완료</span>
                  <time>{workflow.updatedAt}</time>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </section>
  )
}

export default Dashboard
