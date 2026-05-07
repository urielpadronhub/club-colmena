import { cn } from '@/lib/utils'

interface BeeIconProps {
  className?: string
}

export function BeeIcon({ className }: BeeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('w-6 h-6', className)}
    >
      {/* Cuerpo de la abeja */}
      <ellipse cx="12" cy="14" rx="5" ry="6" />
      {/* Rayas del cuerpo */}
      <line x1="7" y1="12" x2="17" y2="12" strokeWidth="2" />
      <line x1="7" y1="15" x2="17" y2="15" strokeWidth="2" />
      {/* Cabeza */}
      <circle cx="12" cy="6" r="3" />
      {/* Antenas */}
      <line x1="10" y1="3" x2="9" y2="1" />
      <line x1="14" y1="3" x2="15" y2="1" />
      {/* Alas */}
      <ellipse cx="7" cy="10" rx="3" ry="4" fill="currentColor" opacity="0.2" stroke="currentColor" />
      <ellipse cx="17" cy="10" rx="3" ry="4" fill="currentColor" opacity="0.2" stroke="currentColor" />
    </svg>
  )
}
