import { cn } from '@/lib/utils'
import type { PermissionSource } from '@/types/domain'

const SOURCE_LABELS: Record<PermissionSource, string> = {
  role_package: 'Rol Paketi',
  override: 'Manuel',
  team_suggestion: 'Takım Önerisi',
}

const SOURCE_STYLES: Record<PermissionSource, string> = {
  role_package: 'bg-blue-50 text-blue-700 border-blue-200',
  override: 'bg-amber-50 text-amber-700 border-amber-200',
  team_suggestion: 'bg-purple-50 text-purple-700 border-purple-200',
}

export function PermissionSourceBadge({
  source,
  className,
}: {
  source: PermissionSource
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        SOURCE_STYLES[source],
        className,
      )}
    >
      {SOURCE_LABELS[source]}
    </span>
  )
}

export function PermissionSourceBadges({
  sources,
}: {
  sources: PermissionSource[]
}) {
  const unique = Array.from(new Set(sources))

  return (
    <div className="flex flex-wrap gap-1">
      {unique.map((source) => (
        <PermissionSourceBadge key={source} source={source} />
      ))}
    </div>
  )
}
