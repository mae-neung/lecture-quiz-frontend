import StatusBadge from '@/features/workflows/components/StatusBadge'
import { useWorkflows } from '@/features/workflows/context/WorkflowContext'
import { Link } from 'react-router-dom'
import './Workflows.css'

function Workflows() {
  const { agents, workflows } = useWorkflows()
  return (
    <section className="page">
      <p className="page__eyebrow">Workflows</p>
      <div className="workflow-list__heading">
        <h1 className="page__title">워크플로우</h1>
        <Link className="workflow-list__create-link" to="/workflows/new">새 워크플로우</Link>
      </div>
      <p className="page__description">작업 흐름을 만들고 단계별 진행 상태를 관리합니다.</p>
      <div className="workflow-list">
        {workflows.map((workflow) => {
          const activeStep = workflow.steps.find((step) => step.status === 'running')
          const activeAgent = agents.find((agent) => agent.id === activeStep?.agentId)

          return (
            <article className="workflow-list__item" key={workflow.id}>
              <div>
                <h2><Link to={`/workflows/${workflow.id}`}>{workflow.title}</Link></h2>
                <p>{workflow.description}</p>
              </div>
              <div className="workflow-list__status">
                <StatusBadge status={workflow.status} />
                <span>{workflow.steps.length}개 단계 · {activeAgent?.name ?? '대기 중'}</span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default Workflows
