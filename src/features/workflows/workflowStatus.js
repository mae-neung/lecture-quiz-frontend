export const workflowStatusMeta = {
  waiting: { label: '대기', tone: 'waiting' },
  running: { label: '진행 중', tone: 'running' },
  completed: { label: '완료', tone: 'completed' },
  failed: { label: '실패', tone: 'failed' },
}

export function getWorkflowStatusMeta(status) {
  return workflowStatusMeta[status] ?? { label: '알 수 없음', tone: 'unknown' }
}
