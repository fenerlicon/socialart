'use client'

import { useState } from 'react'
import type { Employee, EmploymentType } from '@/types/domain'
import { EMPLOYMENT_TYPES } from '@/types/domain'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Briefcase, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export const DISPLAY_EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  null: 'Belirtilmedi',
  full_time: 'Tam Zamanlı',
  freelance: 'Freelance',
  contractor: 'Sözleşmeli',
  part_time: 'Yarı Zamanlı',
}

export function formatEmploymentTypeLabel(type: EmploymentType | null | undefined): string {
  if (!type) return 'Belirtilmedi'
  return DISPLAY_EMPLOYMENT_TYPE_LABELS[type] || 'Belirtilmedi'
}

interface EmploymentTypeSectionProps {
  employee: Employee
  canManage: boolean
  onUpdated?: (newType: EmploymentType | null) => void
}

export function EmploymentTypeSection({
  employee,
  canManage,
  onUpdated,
}: EmploymentTypeSectionProps) {
  const currentEmploymentType = employee.employmentType || null
  const [selectedType, setSelectedType] = useState<string>(
    currentEmploymentType || 'null'
  )
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const isSameValue = (selectedType === 'null' ? null : selectedType) === currentEmploymentType

  const handleSave = async () => {
    if (isSameValue || isSaving) return

    setIsSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const targetType: EmploymentType | null =
      selectedType === 'null' ? null : (selectedType as EmploymentType)

    // DB1 Employee ID is canonical authority for the mutation API
    const targetEmployeeId = employee.db1EmployeeId || employee.id

    try {
      const res = await fetch('/api/auth-update-employee-employment-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: targetEmployeeId,
          employmentType: targetType,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.ok) {
        const errMsg =
          data.error ||
          (data.criticalInconsistency
            ? 'Kritik senkronizasyon uyuşmazlığı: İşlem tamamlanamadı ve geri alındı.'
            : data.auditFailed
            ? 'Denetim günlüğü kaydı başarısız oldu. Değişiklikler geri alındı.'
            : 'Çalışma tipi güncellenirken bir hata oluştu.')
        setErrorMessage(errMsg)
        toast.error(errMsg)
        return
      }

      const confirmedType: EmploymentType | null = data.employmentType ?? null
      setSelectedType(confirmedType || 'null')
      setSuccessMessage('Çalışma tipi başarıyla güncellendi ve denetim kaydı oluşturuldu.')
      toast.success('Çalışma tipi başarıyla güncellendi.')

      if (onUpdated) {
        onUpdated(confirmedType)
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Sunucu bağlantı hatası oluştu.'
      setErrorMessage(errMsg)
      toast.error(errMsg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-semibold text-foreground">Çalışma Tipi</Label>
            <Badge
              variant="outline"
              className={`text-[11px] font-medium ${
                currentEmploymentType === 'freelance'
                  ? 'border-purple-500/30 bg-purple-500/10 text-purple-300'
                  : currentEmploymentType === 'full_time'
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                  : currentEmploymentType
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                  : 'border-neutral-700 bg-neutral-800/40 text-neutral-400'
              }`}
            >
              {formatEmploymentTypeLabel(currentEmploymentType)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Çalışanın istihdam ve hakediş modelini belirler (Tam Zamanlı, Freelance, vb.). Hesap aktiflik durumundan bağımsızdır.
          </p>
        </div>
      </div>

      {canManage ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Yeni Çalışma Tipi Seçin</Label>
              <Select
                value={selectedType}
                onValueChange={(val) => {
                  setSelectedType(val)
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
                disabled={isSaving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Çalışma tipi seçin" />
                </SelectTrigger>
                <SelectContent className="z-[99999]">
                  <SelectItem value="null">
                    Belirtilmedi
                  </SelectItem>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {DISPLAY_EMPLOYMENT_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSameValue || isSaving}
                className="w-full gap-2 font-medium"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Briefcase className="h-4 w-4" />
                    Çalışma Tipini Güncelle
                  </>
                )}
              </Button>
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 bg-muted/10 border rounded-xl">
          <p className="text-xs text-muted-foreground">
            Mevcut Çalışma Tipi: <strong className="text-foreground">{formatEmploymentTypeLabel(currentEmploymentType)}</strong>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Çalışma tipini düzenlemek için <code className="text-neutral-400">employees.manage</code> veya yönetici yetkisi gereklidir.
          </p>
        </div>
      )}
    </div>
  )
}