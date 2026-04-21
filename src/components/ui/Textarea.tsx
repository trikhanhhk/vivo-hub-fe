import { type TextareaHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const areaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={areaId} className="text-sm font-medium text-surface-200">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          className={clsx(
            'w-full rounded-md border bg-surface-800 px-3 py-2 text-sm text-surface-100',
            'placeholder:text-surface-500 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
            'disabled:opacity-40 disabled:pointer-events-none transition-colors duration-150',
            error ? 'border-red-500/60' : 'border-surface-600',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
