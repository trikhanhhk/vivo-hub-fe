import { type InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-surface-200">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'h-9 w-full rounded-md border bg-surface-800 px-3 text-sm text-surface-100',
            'placeholder:text-surface-500',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
            'disabled:opacity-40 disabled:pointer-events-none',
            'transition-colors duration-150',
            error ? 'border-red-500/60' : 'border-surface-600',
            className,
          )}
          {...props}
        />
        {(error ?? hint) && (
          <p className={clsx('text-xs', error ? 'text-red-400' : 'text-surface-400')}>
            {error ?? hint}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
