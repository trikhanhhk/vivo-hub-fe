import { AlertCircle, Loader2 } from 'lucide-react'

export function Spinner({ className = 'size-6' }: { className?: string }) {
  return <Loader2 className={`${className} animate-spin text-brand-500`} />
}

export function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <Spinner className="size-8" />
    </div>
  )
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      <AlertCircle className="size-4 shrink-0" />
      {message}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon && <div className="text-surface-500">{icon}</div>}
      <h3 className="text-base font-medium text-surface-200">{title}</h3>
      {description && <p className="max-w-xs text-sm text-surface-400">{description}</p>}
      {action}
    </div>
  )
}
