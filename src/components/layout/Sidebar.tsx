import { Link, useLocation } from 'react-router-dom'
import { Film, Home, Layers, Music } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/projects', icon: Film, label: 'Projects' },
  { to: '/merge-jobs', icon: Layers, label: 'Merge Jobs' },
  { to: '/tts', icon: Music, label: 'TTS Audio' },
]

export function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="flex h-full w-14 flex-col items-center border-r border-surface-800 bg-surface-900 py-3">
      {/* Logo */}
      <div className="mb-5 flex size-9 items-center justify-center rounded-lg bg-brand-600">
        <Film className="size-5 text-white" />
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              title={label}
              className={clsx(
                'flex size-10 items-center justify-center rounded-lg transition-colors duration-150',
                active
                  ? 'bg-brand-600/20 text-brand-400'
                  : 'text-surface-400 hover:bg-surface-800 hover:text-surface-100',
              )}
            >
              <Icon className="size-5" />
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
