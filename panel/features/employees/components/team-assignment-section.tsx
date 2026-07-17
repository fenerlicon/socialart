'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { PERMISSIONS, type PermissionKey } from '@/config/permissions'
import { TEAM_SEEDS } from '@/features/teams/data/team-seeds'
import type { EmployeeFormApi } from '@/features/employees/hooks/use-employee-form'
import type { TeamId, RolePackageId } from '@/types/domain'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { buildDefaultPermissionSet } from '@/lib/permissions/resolve-permissions'
import { toast } from 'sonner'

export function TeamAssignmentSection({ form }: { form: EmployeeFormApi }) {
  const { values, toggleTeam, updateField } = form

  const selectedTeams = TEAM_SEEDS.filter((team) =>
    values.teamIds.includes(team.id),
  )

  const handleApplyTeamSuggestions = (teamPermissions: PermissionKey[]) => {
    const nextOverrides = { ...values.permissionOverrides }
    const defaults = buildDefaultPermissionSet({ rolePackageId: values.rolePackageId as RolePackageId })
    let appliedCount = 0

    teamPermissions.forEach((key) => {
      if (defaults.has(key)) {
        // Eğer yetki zaten rol paketinde varsayılan olarak açık ama kullanıcı manuel kapatmışsa, override'ı silerek tekrar açıyoruz
        if (nextOverrides[key] === false) {
          delete nextOverrides[key]
          appliedCount++
        }
      } else {
        // Eğer yetki rol paketinde kapalıysa, manuel açık override ekliyoruz
        if (nextOverrides[key] !== true) {
          nextOverrides[key] = true
          appliedCount++
        }
      }
    })

    if (appliedCount > 0) {
      updateField('permissionOverrides', nextOverrides)
      toast.success('Takım önerileri uygulandı', {
        description: `${appliedCount} yetki manuel override olarak aktif hale getirildi.`,
      })
    } else {
      toast.info('Tüm yetkiler zaten aktif', {
        description: 'Bu takımın önerdiği tüm yetkiler zaten kullanıcının yetki setinde açık durumda.',
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {TEAM_SEEDS.map((team) => {
          const selected = values.teamIds.includes(team.id)
          return (
            <Button
              key={team.id}
              type="button"
              variant={selected ? 'default' : 'outline'}
              className={cn(
                'h-auto justify-start px-4 py-3 text-left',
                selected && 'ring-2 ring-primary ring-offset-2',
              )}
              onClick={() => toggleTeam(team.id as TeamId)}
            >
              <div className="flex w-full items-start gap-2">
                <span
                  className={cn(
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border',
                    selected
                      ? 'border-primary-foreground bg-primary-foreground text-primary'
                      : 'border-muted-foreground/40',
                  )}
                >
                  {selected ? <Check className="h-3 w-3" /> : null}
                </span>
                <span>
                  <span className="block font-medium">{team.name}</span>
                  <span
                    className={cn(
                      'mt-0.5 block text-xs',
                      selected
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground',
                    )}
                  >
                    {team.description}
                  </span>
                </span>
              </div>
            </Button>
          )
        })}
      </div>

      {selectedTeams.length > 0 ? (
        <Accordion type="multiple" className="rounded-lg border px-4">
          {selectedTeams.map((team) => (
            <AccordionItem key={team.id} value={team.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2 text-left">
                  <span className="font-medium">{team.name}</span>
                  <Badge variant="outline">
                    {team.teamPermissions.length} önerilen yetki
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <p className="text-xs text-muted-foreground leading-normal">
                      {team.description} <span className="text-foreground font-semibold">Not:</span> Takım eşleştirmeleri doğrudan yetki kazandırmaz; sadece önerilen yetki seti üretir. Aktif etmek için "Önerileri Uygula" butonuna basınız.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {team.teamPermissions.map((key) => {
                        const defaults = buildDefaultPermissionSet({ rolePackageId: values.rolePackageId as RolePackageId })
                        const isDefault = defaults.has(key)
                        const isOverride = Object.prototype.hasOwnProperty.call(values.permissionOverrides, key)
                        const isGranted = isOverride ? values.permissionOverrides[key] === true : isDefault

                        return (
                          <Badge
                            key={key}
                            variant={isGranted ? 'secondary' : 'outline'}
                            className={cn(
                              'text-[10px] font-normal px-2 py-0.5',
                              !isGranted && 'text-muted-foreground border-dashed bg-muted/5'
                            )}
                          >
                            {PERMISSIONS[key]?.label} {isGranted ? '✓' : '(Aktif Değil)'}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0 text-xs h-8 self-end sm:self-start"
                    onClick={() => handleApplyTeamSuggestions(team.teamPermissions)}
                  >
                    Önerileri Uygula
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="text-sm text-muted-foreground">
          Henüz takım seçilmedi. Takım seçildiğinde önerilen yetki listesi burada gösterilir.
        </p>
      )}
    </div>
  )
}
