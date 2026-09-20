import StatusBadge from '@/features/workflows/components/StatusBadge'
import { useWorkflows } from '@/features/workflows/context/WorkflowContext'
import './Settings.css'

function Settings() {
  const { agents } = useWorkflows()

  return (
    <section className="page">
      <p className="page__eyebrow">Settings</p>
      <h1 className="page__title">에이전트 설정</h1>
      <p className="page__description">워크플로우 단계에 배정할 기본 에이전트 목록입니다.</p>

      <div className="agent-list">
        {agents.map((agent) => (
          <article className="agent-list__item" key={agent.id}>
            <div>
              <h2>{agent.name}</h2>
              <p>{agent.description}</p>
            </div>
            <div className="agent-list__meta">
              <span>{agent.role}</span>
              <StatusBadge status={agent.status === 'working' ? 'running' : agent.status === 'error' ? 'failed' : 'waiting'} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Settings
