'use client'

import { useMemo, useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { PermissionSourceBadges } from '@/components/shared/permission-source-badge'
import { MODULES, PROTOTYPE_MODULES, type ModuleId } from '@/config/modules'
import {
  getPermissionsByModule,
  PERMISSIONS,
  PROTOTYPE_PERMISSION_KEYS,
} from '@/config/permissions'
import { ROLE_PACKAGE_SEEDS } from '@/features/role-packages/data/role-package-seeds'
import { buildDefaultPermissionSet } from '@/lib/permissions/resolve-permissions'
import { getPermissionRowStates } from '@/lib/permissions/permission-form-utils'
import type { EmployeeFormApi } from '@/features/employees/hooks/use-employee-form'
import type { RolePackageId, TeamId } from '@/types/domain'

export const ROLE_PACKAGE_DEFAULT_TEAMS: Record<RolePackageId, TeamId[]> = {
  'operasyon-yonetimi': ['merkezi-operasyon'],
  'kreatif-yonetim': ['grafik-studyo', 'post-produksiyon', 'fotograf-studyo', 'video-produksiyon', 'kreatif-koordinasyon'],
  'kreatif-direktor': ['grafik-studyo', 'post-produksiyon', 'fotograf-studyo', 'video-produksiyon', 'kreatif-koordinasyon'],
  'strateji-musteri-yonetimi': ['strateji-musteri'],
  'dijital-pazarlama': ['dijital-pazarlama'],
  'sosyal-medya-yonetimi': ['sosyal-medya'],
  'grafik-tasarim': ['grafik-studyo'],
  'video-kurgu': ['post-produksiyon'],
  'fotograf-uretimi': ['fotograf-studyo'],
  'video-uretimi': ['video-produksiyon'],
}

export function RolePackageSection({ form }: { form: EmployeeFormApi }) {
  const { values, errors, updateField, togglePermission, resetOverrides } = form

  const selectedPackage = ROLE_PACKAGE_SEEDS.find(
    (pkg) => pkg.id === values.rolePackageId,
  )

  // Modüllere göre gruplanmış yetkiler
  const permissionsByModule = useMemo(
    () => getPermissionsByModule([...PROTOTYPE_MODULES]),
    []
  )

  // Satır bazında yetki durumları (kullanıcı override'larını ve kaynaklarını içerir)
  const rowStates = useMemo(
    () =>
      getPermissionRowStates({
        rolePackageId: values.rolePackageId as RolePackageId,
        teamIds: values.teamIds as TeamId[],
        permissionOverrides: values.permissionOverrides,
        permissionKeys: [...PROTOTYPE_PERMISSION_KEYS],
      }),
    [values.rolePackageId, values.teamIds, values.permissionOverrides]
  )

  const rowStateByKey = useMemo(
    () => new Map(rowStates.map((row) => [row.key, row])),
    [rowStates]
  )

  // Varsayılan yetki seti (kaynak takibi için)
  const defaultPermissionSet = useMemo(
    () =>
      buildDefaultPermissionSet({
        rolePackageId: values.rolePackageId as RolePackageId,
        teamIds: values.teamIds as TeamId[],
      }),
    [values.rolePackageId, values.teamIds]
  )

  // Varsayılan olarak izin olmayan modüllerin kullanıcı tarafından "eklenip" eklenmediğini tutan lokal state
  const [manuallyActiveModules, setManuallyActiveModules] = useState<Record<string, boolean>>({})

  // Rol paketi değiştiğinde lokal ekleme durumlarını sıfırla
  useEffect(() => {
    setManuallyActiveModules({})
  }, [values.rolePackageId])

  // Modüllerin aktiflik durumunu belirleme
  const isModuleActive = (moduleId: ModuleId) => {
    const modulePermissions = permissionsByModule[moduleId] ?? []
    
    // 1. Modülün varsayılan izinlerinden en az biri rol paketi/takımdan açık mı?
    const hasDefaultPermissions = modulePermissions.some((p) =>
      defaultPermissionSet.has(p.key)
    )

    if (hasDefaultPermissions) {
      // Varsayılan olarak açık olan bir modülün tüm varsayılan yetkileri kapatılmışsa aktif değildir
      const allDefaultPermsOff = modulePermissions
        .filter((p) => defaultPermissionSet.has(p.key))
        .every((p) => rowStateByKey.get(p.key)?.granted === false)

      return !allDefaultPermsOff
    }

    // 2. Varsayılan olarak kapalı olan modüllerin aktifliği: en az bir yetkisi manuel açılmışsa veya lokal switch açık ise
    const hasOverrideActive = modulePermissions.some(
      (p) => rowStateByKey.get(p.key)?.granted === true
    )

    return hasOverrideActive || !!manuallyActiveModules[moduleId]
  }

  // Modül switch'i tetiklendiğinde çalışacak fonksiyon
  const handleModuleToggle = (moduleId: ModuleId, active: boolean) => {
    const modulePermissions = permissionsByModule[moduleId] ?? []
    
    // Modülün varsayılan yetkilerden en az birine sahip olup olmadığı
    const hasDefaultPermissions = modulePermissions.some((p) =>
      defaultPermissionSet.has(p.key)
    )

    const nextOverrides = { ...values.permissionOverrides }

    if (active) {
      if (!hasDefaultPermissions) {
        // Varsayılan olmayan modülü manuel ekle
        setManuallyActiveModules((prev) => ({ ...prev, [moduleId]: true }))
      } else {
        // Varsayılan modül açıldığında, o modüle ait tüm false override'ları kaldır (varsayılana dönsün)
        modulePermissions.forEach((p) => {
          if (defaultPermissionSet.has(p.key)) {
            delete nextOverrides[p.key]
          }
        })
        updateField('permissionOverrides', nextOverrides)
      }
    } else {
      // Kapatıldığında
      if (hasDefaultPermissions) {
        // Rol paketi veya takımdan açık gelen modül kapatılıyorsa, tüm varsayılan yetkilerini kapalı override yap
        modulePermissions.forEach((p) => {
          if (defaultPermissionSet.has(p.key)) {
            nextOverrides[p.key] = false
          }
        })
        updateField('permissionOverrides', nextOverrides)
      } else {
        // Manuel eklenmiş modül kapatılıyorsa, o modülün tüm override'larını temizle (hepsi kapalıya geri döner)
        modulePermissions.forEach((p) => {
          delete nextOverrides[p.key]
        })
        updateField('permissionOverrides', nextOverrides)
        setManuallyActiveModules((prev) => ({ ...prev, [moduleId]: false }))
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Rol Paketi Seçimi */}
      <div className="space-y-2">
        <Label>Rol Paketi</Label>
        <Select
          value={values.rolePackageId || ''}
          onValueChange={(value) => {
            const nextPkg = value as RolePackageId
            updateField('rolePackageId', nextPkg)
            updateField('permissionOverrides', {})
            const matchingTeams = ROLE_PACKAGE_DEFAULT_TEAMS[nextPkg] || []
            updateField('teamIds', matchingTeams)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Rol paketi seçin (Tanımsız)" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_PACKAGE_SEEDS.map((pkg) => (
              <SelectItem key={pkg.id} value={pkg.id}>
                {pkg.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.rolePackageId ? (
          <p className="text-sm text-destructive">{errors.rolePackageId}</p>
        ) : null}
      </div>

      {/* Seçili Rol Paketi Bilgisi */}
      {selectedPackage ? (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold">{selectedPackage.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedPackage.description}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Varsayılan Yetkiler ({selectedPackage.defaultPermissions.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedPackage.defaultPermissions.map((key) => (
                <Badge key={key} variant="secondary" className="text-xs font-normal">
                  {PERMISSIONS[key]?.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Yetkileri Özelleştir Accordion Paneli */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="customize-permissions" className="border-b-0">
          <AccordionTrigger className="flex justify-between items-center rounded-lg border bg-muted/40 px-4 py-3 hover:no-underline hover:bg-muted/60 transition-colors">
            <span className="text-sm font-semibold">Yetkileri Özelleştir (Kullanıcı Override)</span>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Kullanıcı bazlı özel yetki kuralları belirleyin. Değişiklikler rol paketi ve takım yetkilerini ezer.
              </p>
              {Object.keys(values.permissionOverrides).length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetOverrides}
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 self-end sm:self-auto"
                >
                  Özelleştirmeleri Sıfırla
                </Button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {PROTOTYPE_MODULES.map((moduleId) => {
                const modulePermissions = permissionsByModule[moduleId]
                if (!modulePermissions?.length) return null

                const active = isModuleActive(moduleId)

                return (
                  <Card
                    key={moduleId}
                    className={`p-4 transition-all duration-200 ${
                      active
                        ? 'border-primary/30 bg-card shadow-sm'
                        : 'opacity-70 bg-muted/10 border-dashed'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold truncate">
                          {MODULES[moduleId].name}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {MODULES[moduleId].description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {active ? 'Modül Açık' : 'Modül Kapalı'}
                        </span>
                        <Switch
                          checked={active}
                          onCheckedChange={(checked) => handleModuleToggle(moduleId, checked)}
                          aria-label={`${MODULES[moduleId].name} modülünü etkinleştir`}
                        />
                      </div>
                    </div>

                    {/* Modül aktif olduğunda detay yetkileri accordion olarak göster */}
                    {active && (
                      <Accordion type="single" collapsible className="mt-3 border-t pt-2">
                        <AccordionItem value="module-details" className="border-b-0">
                          <AccordionTrigger className="py-1 text-xs font-semibold hover:no-underline text-primary/80 hover:text-primary justify-start gap-1">
                            Detay İzinleri ({modulePermissions.length})
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-0 space-y-2">
                            {modulePermissions.map((permission) => {
                              const row = rowStateByKey.get(permission.key)
                              if (!row) return null

                              return (
                                <div
                                  key={permission.key}
                                  className="flex items-center justify-between gap-3 rounded-md border bg-muted/10 p-2.5"
                                >
                                  <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <p className="text-xs font-semibold">
                                        {PERMISSIONS[permission.key].label}
                                      </p>
                                      <PermissionSourceBadges sources={row.displaySources} />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-normal">
                                      {PERMISSIONS[permission.key].description}
                                    </p>
                                  </div>
                                  <Switch
                                    checked={row.granted}
                                    onCheckedChange={(checked) =>
                                      togglePermission(permission.key, checked)
                                    }
                                    aria-label={PERMISSIONS[permission.key].label}
                                  />
                                </div>
                              )
                            })}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}
                  </Card>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
