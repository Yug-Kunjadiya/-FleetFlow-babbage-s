import { cn, getStatusColor } from '@/lib/utils'

export function Badge({ children, className, variant }) {
  const statusColor = variant ? getStatusColor(variant) : ''
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        statusColor,
        className
      )}
    >
      {children}
    </span>
  )
}
export default Badge