import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-600 hover:bg-brand-500 text-white border border-brand-600 hover:border-brand-500',
  secondary:
    'bg-surface-700 hover:bg-surface-600 text-surface-100 border border-surface-600 hover:border-surface-500',
  ghost:
    'bg-transparent hover:bg-surface-800 text-surface-300 hover:text-surface-100 border border-transparent',
  danger:
    'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 hover:border-red-600/50',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      loading = false,
      icon,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center rounded-md font-medium transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/50',
          'disabled:opacity-40 disabled:pointer-events-none',
          'cursor-pointer select-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
      </button>
    )
  },
)

Button.displayName = 'Button'
