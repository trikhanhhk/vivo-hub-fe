import { clsx } from 'clsx'
import type { AudioMergeStatus, TtsAudioStatus } from '../../types'

type StatusType = AudioMergeStatus | TtsAudioStatus

const statusConfig: Record<StatusType, { label: string; classes: string }> = {
  Pending: { label: 'Pending', classes: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  Processing: { label: 'Processing', classes: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  Completed: { label: 'Completed', classes: 'bg-green-500/15 text-green-400 border-green-500/30' },
  Failed: { label: 'Failed', classes: 'bg-red-500/15 text-red-400 border-red-500/30' },
}

export function StatusBadge({ status }: { status: StatusType }) {
  const { label, classes } = statusConfig[status] ?? statusConfig.Pending
  return (
    <span className={clsx('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', classes)}>
      {status === 'Processing' && (
        <span className="mr-1.5 size-1.5 rounded-full bg-current animate-pulse" />
      )}
      {label}
    </span>
  )
}
