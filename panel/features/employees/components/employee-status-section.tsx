'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  EMPLOYEE_STATUSES,
  EMPLOYEE_STATUS_LABELS,
  WORK_LOCATION_STATUSES,
  WORK_LOCATION_STATUS_LABELS,
} from '@/types/domain'
import type { EmployeeFormApi } from '@/features/employees/hooks/use-employee-form'

export function EmployeeStatusSection({ form }: { form: EmployeeFormApi }) {
  const { values, updateField } = form

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Çalışan Durumu</Label>
        <Select
          value={values.employeeStatus}
          onValueChange={(value) =>
            updateField(
              'employeeStatus',
              value as typeof values.employeeStatus,
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Durum seçin" />
          </SelectTrigger>
          <SelectContent>
            {EMPLOYEE_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {EMPLOYEE_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Çalışma Konumu</Label>
        <Select
          value={values.workLocationStatus}
          onValueChange={(value) =>
            updateField(
              'workLocationStatus',
              value as typeof values.workLocationStatus,
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Konum seçin" />
          </SelectTrigger>
          <SelectContent>
            {WORK_LOCATION_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {WORK_LOCATION_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
