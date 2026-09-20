import Button from '@/components/Button/Button'
import { useWorkflows } from '@/features/workflows/context/WorkflowContext'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './WorkflowCreate.css'

const emptyStep = () => ({ title: '', agentId: '' })

function WorkflowCreate() {
  const navigate = useNavigate()
  const { agents, createWorkflow } = useWorkflows()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [steps, setSteps] = useState([emptyStep()])
  const [error, setError] = useState('')

  const updateStep = (index, field, value) => {
    setSteps((currentSteps) => currentSteps.map((step, stepIndex) => (
      stepIndex === index ? { ...step, [field]: value } : step
    )))
  }

  const addStep = () => setSteps((currentSteps) => [...currentSteps, emptyStep()])

  const removeStep = (index) => {
    setSteps((currentSteps) => currentSteps.filter((_, stepIndex) => stepIndex !== index))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!title.trim() || !description.trim()) {
      setError('워크플로우 제목과 설명을 입력해 주세요.')
      return
    }

    if (steps.length === 0 || steps.some((step) => !step.title.trim() || !step.agentId)) {
      setError('각 Step의 제목과 담당 Agent를 모두 선택해 주세요.')
      return
    }

    const workflowId = createWorkflow({ title, description, steps })
    navigate(`/workflows/${workflowId}`)
  }

  return (
    <section className="page workflow-create">
      <Link className="workflow-create__back" to="/workflows">← 워크플로우 목록</Link>
      <p className="page__eyebrow">New workflow</p>
      <h1 className="page__title">새 워크플로우 만들기</h1>
      <p className="page__description">작업의 목표와 순서 있는 Step, 담당 Agent를 설정합니다.</p>

      <form className="workflow-create__form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="workflow-title">워크플로우 제목</label>
          <input id="workflow-title" onChange={(event) => setTitle(event.target.value)} placeholder="예: 관리자 대시보드 제작" value={title} />
        </div>

        <div className="form-field">
          <label htmlFor="workflow-description">설명</label>
          <textarea id="workflow-description" onChange={(event) => setDescription(event.target.value)} placeholder="이 작업에서 만들 결과를 간단히 설명하세요." rows="4" value={description} />
        </div>

        <section className="workflow-create__steps" aria-labelledby="create-steps-title">
          <div className="workflow-create__steps-heading">
            <div>
              <h2 id="create-steps-title">실행 Step</h2>
              <p>위에서 아래 순서로 실행됩니다.</p>
            </div>
            <Button onClick={addStep} type="button" variant="secondary">Step 추가</Button>
          </div>

          <ol>
            {steps.map((step, index) => (
              <li key={index}>
                <span className="workflow-create__step-number">{index + 1}</span>
                <div className="workflow-create__step-fields">
                  <label>
                    Step 제목
                    <input onChange={(event) => updateStep(index, 'title', event.target.value)} placeholder="예: 화면 구조 설계" value={step.title} />
                  </label>
                  <label>
                    담당 Agent
                    <select onChange={(event) => updateStep(index, 'agentId', event.target.value)} value={step.agentId}>
                      <option value="">Agent 선택</option>
                      {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                    </select>
                  </label>
                </div>
                <Button disabled={steps.length === 1} onClick={() => removeStep(index)} type="button" variant="secondary">삭제</Button>
              </li>
            ))}
          </ol>
        </section>

        {error && <p className="workflow-create__error" role="alert">{error}</p>}

        <div className="workflow-create__actions">
          <Link to="/workflows">취소</Link>
          <Button type="submit">워크플로우 생성</Button>
        </div>
      </form>
    </section>
  )
}

export default WorkflowCreate
