import { getWorkflowStatusMeta } from '@/features/workflows/workflowStatus'
import './StatusBadge.css'

function StatusBadge({ status }) {
  const { label, tone } = getWorkflowStatusMeta(status)

  return <span className={`status-badge status-badge--${tone}`}>{label}</span>
}

export default StatusBadge
