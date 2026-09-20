import StatusBadge from '@/features/workflows/components/StatusBadge'
import { useWorkflows } from '@/features/workflows/context/WorkflowContext'
import './Runs.css'

function Runs() {
  const { runs, workflows } = useWorkflows()
  return (
    <section className="page">
      <p className="page__eyebrow">Runs</p>
      <h1 className="page__title">실행 기록</h1>
      <p className="page__description">각 워크플로우가 언제, 어떤 결과로 실행됐는지 확인합니다.</p>
      <div className="run-list" role="list">
        {runs.map((run) => {
          const workflow = workflows.find((item) => item.id === run.workflowId)

          return (
            <article className="run-list__item" key={run.id} role="listitem">
              <div>
                <h2>{workflow?.title ?? '삭제된 워크플로우'}</h2>
                <p>{run.id}</p>
              </div>
              <time>{run.startedAt}</time>
              <span>{run.duration}</span>
              <StatusBadge status={run.status} />
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default Runs
