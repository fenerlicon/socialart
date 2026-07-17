import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  iconColorClass?: string
  onClick?: () => void
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  iconColorClass = 'text-blue-500',
  onClick,
}: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "rounded-2xl border bg-card/40 shadow-sm backdrop-blur-md overflow-hidden hover:border-neutral-800 transition-all",
        onClick && "cursor-pointer select-none active:scale-[0.98]"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColorClass}`} />
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-[10px] text-muted-foreground leading-normal">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
