import { createContext, useContext, useEffect, useState } from 'react'
import { agents as initialAgents, logs as initialLogs, runs as initialRuns, workflows as initialWorkflows } from '@/features/workflows/data/mockWorkflows'

const WorkflowContext = createContext(null)
const storageKey = 'orchestra-workflows-v2'

function getWorkflowStatus(steps) {
  if (steps.some((step) => step.status === 'failed')) return 'failed'
  if (steps.every((step) => step.status === 'completed')) return 'completed'
  if (steps.some((step) => step.status === 'running')) return 'running'

  return 'waiting'
}

function getInitialState() {
  try {
    const savedState = window.localStorage.getItem(storageKey)

    if (savedState) return JSON.parse(savedState)
  } catch {
    // 저장 데이터가 손상된 경우, 기본 목업 데이터로 안전하게 시작합니다.
  }

  return { agents: initialAgents, workflows: initialWorkflows, runs: initialRuns, logs: initialLogs }
}

function createLog(runId, stepId, level, message) {
  return { id: `log-${Date.now()}`, runId, stepId, level, message, createdAt: '방금 전' }
}

function updateAgentStatuses(agents, statusById) {
  return agents.map((agent) => (
    statusById[agent.id] ? { ...agent, status: statusById[agent.id] } : agent
  ))
}

export function WorkflowProvider({ children }) {
  const [state, setState] = useState(getInitialState)

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state))
  }, [state])

  const createWorkflow = ({ description, steps: draftSteps, title }) => {
    const timestamp = Date.now()
    const workflowId = `workflow-${timestamp}`
    const steps = draftSteps.map((step, index) => ({
      id: `step-${timestamp}-${index + 1}`,
      order: index + 1,
      title: step.title.trim(),
      agentId: step.agentId,
      status: 'waiting',
      input: null,
      output: null,
      retryCount: 0,
    }))

    setState((currentState) => ({
      ...currentState,
      workflows: [{
        id: workflowId,
        title: title.trim(),
        description: description.trim(),
        status: 'waiting',
        createdAt: new Date().toISOString(),
        updatedAt: '방금 전',
        steps,
      }, ...currentState.workflows],
    }))

    return workflowId
  }

  const startWorkflow = (workflowId) => {
    setState((currentState) => {
      const workflow = currentState.workflows.find((item) => item.id === workflowId)
      const firstWaitingStepIndex = workflow?.steps.findIndex((step) => step.status === 'waiting')

      if (!workflow || firstWaitingStepIndex === -1 || workflow.status !== 'waiting') return currentState

      const activeStep = workflow.steps[firstWaitingStepIndex]
      const steps = workflow.steps.map((step, index) => (
        index === firstWaitingStepIndex ? { ...step, status: 'running' } : step
      ))
      const run = { id: `run-${Date.now()}`, workflowId, status: 'running', startedAt: '방금 전', completedAt: null, duration: '진행 중' }

      return {
        ...currentState,
        agents: updateAgentStatuses(currentState.agents, { [activeStep.agentId]: 'working' }),
        workflows: currentState.workflows.map((item) => (
          item.id === workflowId ? { ...item, steps, status: 'running', updatedAt: '방금 전' } : item
        )),
        runs: [run, ...currentState.runs],
        logs: [createLog(run.id, activeStep.id, 'info', `${activeStep.title} 단계를 시작했습니다.`), ...currentState.logs],
      }
    })
  }

  const advanceWorkflow = (workflowId) => {
    setState((currentState) => {
      const workflow = currentState.workflows.find((item) => item.id === workflowId)
      const activeStepIndex = workflow?.steps.findIndex((step) => step.status === 'running')

      if (!workflow || activeStepIndex === -1) return currentState

      const activeStep = workflow.steps[activeStepIndex]
      const nextStepIndex = workflow.steps.findIndex((step, index) => index > activeStepIndex && step.status === 'waiting')
      const nextStep = workflow.steps[nextStepIndex]
      const steps = workflow.steps.map((step, index) => {
        if (index === activeStepIndex) return { ...step, status: 'completed', output: `${step.title} 결과` }
        if (index === nextStepIndex) return { ...step, status: 'running' }

        return step
      })
      const status = getWorkflowStatus(steps)
      const activeRun = currentState.runs.find((run) => run.workflowId === workflowId && run.status === 'running')
      const logs = [
        ...(nextStep ? [createLog(activeRun?.id, nextStep.id, 'info', `${nextStep.title} 단계를 시작했습니다.`)] : []),
        createLog(activeRun?.id, activeStep.id, 'info', `${activeStep.title} 단계를 완료했습니다.`),
        ...currentState.logs,
      ]

      return {
        ...currentState,
        agents: updateAgentStatuses(currentState.agents, {
          [activeStep.agentId]: 'idle',
          ...(nextStep ? { [nextStep.agentId]: 'working' } : {}),
        }),
        workflows: currentState.workflows.map((item) => (
          item.id === workflowId ? { ...item, steps, status, updatedAt: '방금 전' } : item
        )),
        runs: currentState.runs.map((run) => (
          run.id === activeRun?.id ? { ...run, status, completedAt: status === 'completed' ? '방금 전' : null, duration: status === 'completed' ? '방금 완료' : '진행 중' } : run
        )),
        logs,
      }
    })
  }

  const failWorkflow = (workflowId) => {
    setState((currentState) => {
      const workflow = currentState.workflows.find((item) => item.id === workflowId)
      const activeStepIndex = workflow?.steps.findIndex((step) => step.status === 'running')

      if (!workflow || activeStepIndex === -1) return currentState

      const activeStep = workflow.steps[activeStepIndex]
      const activeRun = currentState.runs.find((run) => run.workflowId === workflowId && run.status === 'running')
      const steps = workflow.steps.map((step, index) => (
        index === activeStepIndex ? { ...step, status: 'failed' } : step
      ))

      return {
        ...currentState,
        agents: updateAgentStatuses(currentState.agents, { [activeStep.agentId]: 'error' }),
        workflows: currentState.workflows.map((item) => (
          item.id === workflowId ? { ...item, steps, status: 'failed', updatedAt: '방금 전' } : item
        )),
        runs: currentState.runs.map((run) => (
          run.id === activeRun?.id ? { ...run, status: 'failed', completedAt: '방금 전', duration: '실패 처리됨' } : run
        )),
        logs: [createLog(activeRun?.id, activeStep.id, 'error', `${activeStep.title} 단계가 실패했습니다.`), ...currentState.logs],
      }
    })
  }

  const retryFailedStep = (workflowId) => {
    setState((currentState) => {
      const workflow = currentState.workflows.find((item) => item.id === workflowId)
      const failedStepIndex = workflow?.steps.findIndex((step) => step.status === 'failed')

      if (!workflow || failedStepIndex === -1) return currentState

      const failedStep = workflow.steps[failedStepIndex]
      const retryCount = failedStep.retryCount ?? 0

      if (retryCount >= 2) return currentState

      const steps = workflow.steps.map((step, index) => (
        index === failedStepIndex ? { ...step, status: 'running', retryCount: retryCount + 1 } : step
      ))
      const run = { id: `run-${Date.now()}`, workflowId, status: 'running', startedAt: '방금 전', completedAt: null, duration: '재시도 중' }

      return {
        ...currentState,
        agents: updateAgentStatuses(currentState.agents, { [failedStep.agentId]: 'working' }),
        workflows: currentState.workflows.map((item) => (
          item.id === workflowId ? { ...item, steps, status: 'running', updatedAt: '방금 전' } : item
        )),
        runs: [run, ...currentState.runs],
        logs: [createLog(run.id, failedStep.id, 'info', `${failedStep.title} 단계를 재시도합니다.`), ...currentState.logs],
      }
    })
  }

  const value = {
    ...state,
    advanceWorkflow,
    createWorkflow,
    failWorkflow,
    retryFailedStep,
    startWorkflow,
  }

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
}

export function useWorkflows() {
  const context = useContext(WorkflowContext)

  if (!context) throw new Error('useWorkflows는 WorkflowProvider 안에서 사용해야 합니다.')

  return context
}
