import StatusBadge from '@/features/workflows/components/StatusBadge'
import { useWorkflows } from '@/features/workflows/context/WorkflowContext'
import Button from '@/components/Button/Button'
import { Link, useParams } from 'react-router-dom'
import './WorkflowDetail.css'

function WorkflowDetail() {
  const { workflowId } = useParams()
  const { advanceWorkflow, agents, failWorkflow, logs, retryFailedStep, runs, startWorkflow, workflows } = useWorkflows()
  const workflow = workflows.find((item) => item.id === workflowId)

  if (!workflow) {
    return (
      <section className="page">
        <p className="page__eyebrow">Not found</p>
        <h1 className="page__title">워크플로우를 찾을 수 없습니다.</h1>
        <Link className="page__link" to="/workflows">워크플로우 목록으로 돌아가기</Link>
      </section>
    )
  }

  const activeStep = workflow.steps.find((step) => step.status === 'running')
  const failedStep = workflow.steps.find((step) => step.status === 'failed')
  const activeAgent = agents.find((agent) => agent.id === activeStep?.agentId)
  const workflowRunIds = new Set(runs.filter((run) => run.workflowId === workflow.id).map((run) => run.id))
  const workflowLogs = logs.filter((log) => workflowRunIds.has(log.runId))

  return (
    <section className="page workflow-detail">
      <Link className="workflow-detail__back" to="/workflows">← 워크플로우 목록</Link>
      <div className="workflow-detail__heading">
        <div>
          <p className="page__eyebrow">Workflow detail</p>
          <h1 className="page__title">{workflow.title}</h1>
          <p className="page__description">{workflow.description}</p>
        </div>
        <StatusBadge status={workflow.status} />
      </div>
      <dl className="workflow-detail__meta">
        <div><dt>현재 담당 Agent</dt><dd>{activeAgent?.name ?? '대기 중'}</dd></div>
        <div><dt>마지막 업데이트</dt><dd>{workflow.updatedAt}</dd></div>
        <div><dt>전체 단계</dt><dd>{workflow.steps.length}개</dd></div>
      </dl>

      <section className="workflow-detail__controls" aria-labelledby="workflow-controls-title">
        <div>
          <h2 id="workflow-controls-title">실행 제어</h2>
          <p>이 버튼들은 실제 API 대신 현재 브라우저 상태를 변경합니다.</p>
        </div>
        <div className="workflow-detail__actions">
          {workflow.status === 'waiting' && (
            <Button onClick={() => startWorkflow(workflow.id)}>실행 시작</Button>
          )}
          {workflow.status === 'running' && (
            <>
              <Button onClick={() => advanceWorkflow(workflow.id)}>
                {activeStep?.name} 완료 처리
              </Button>
              <Button onClick={() => failWorkflow(workflow.id)} variant="danger">실패 처리</Button>
            </>
          )}
          {workflow.status === 'completed' && <p className="workflow-detail__result">모든 단계가 완료됐습니다.</p>}
          {workflow.status === 'failed' && (
            <Button
              disabled={(failedStep?.retryCount ?? 0) >= 2}
              onClick={() => retryFailedStep(workflow.id)}
              variant="secondary"
            >
              {(failedStep?.retryCount ?? 0) >= 2 ? '재시도 한도 도달' : `실패 단계 재시도 (${failedStep?.retryCount ?? 0}/2)`}
            </Button>
          )}
        </div>
      </section>
      <section className="workflow-detail__steps" aria-labelledby="workflow-steps-title">
        <h2 id="workflow-steps-title">실행 단계</h2>
        <ol>
          {workflow.steps.map((step, index) => (
            <li key={step.id}>
              <span className="workflow-detail__step-number">{index + 1}</span>
              <span className="workflow-detail__step-name">
                {step.title}
                <small>{agents.find((agent) => agent.id === step.agentId)?.name}</small>
              </span>
              <StatusBadge status={step.status} />
            </li>
          ))}
        </ol>
      </section>

      <section className="workflow-detail__logs" aria-labelledby="workflow-logs-title">
        <h2 id="workflow-logs-title">실행 로그</h2>
        {workflowLogs.length > 0 ? (
          <ol>
            {workflowLogs.map((log) => (
              <li className={`workflow-detail__log workflow-detail__log--${log.level}`} key={log.id}>
                <time>{log.createdAt}</time>
                <span>{log.message}</span>
              </li>
            ))}
          </ol>
        ) : <p>아직 기록된 실행 로그가 없습니다.</p>}
      </section>
    </section>
  )
}

export default WorkflowDetail
