'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import type { EmployeeFormApi } from '@/features/employees/hooks/use-employee-form'

interface EmployeeFormActionsProps {
  form: EmployeeFormApi
  isEdit?: boolean
}

export function EmployeeFormActions({ form, isEdit }: EmployeeFormActionsProps) {
  const { isSubmitting, submit } = form
  const router = useRouter()

  return (
    <div className="flex items-center justify-end gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <Button
        type="button"
        variant="outline"
        disabled={isSubmitting}
        onClick={() => router.push('/employees')}
      >
        İptal
      </Button>
      <Button type="button" onClick={submit} disabled={isSubmitting}>
        {isSubmitting
          ? 'Kaydediliyor...'
          : isEdit
          ? 'Değişiklikleri Kaydet'
          : 'Çalışanı Kaydet'}
      </Button>
    </div>
  )
}
