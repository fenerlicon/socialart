'use client'

import { useMemo, useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getStoredEmployees } from '@/lib/storage/local-employee-store'
import type { BrandFormApi } from '@/features/brands/hooks/use-brand-form'
import { BRAND_STATUS_LABELS } from '@/types/domain'
import type { Employee } from '@/types/domain'

export function BrandBasicInfoSection({ form }: { form: BrandFormApi }) {
  const { values, errors, updateField } = form
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    async function load() {
      const stored = await getStoredEmployees()
      setEmployees(stored)
    }
    load()
  }, [])

  // Fetch employees as options for manager
  const managers = useMemo(() => {
    if (employees.length > 0) {
      return employees.map((emp) => ({
        id: emp.id,
        name: emp.fullName,
        title: emp.title,
      }))
    }
    // Fallback Mock managers if store is empty
    return [
      { id: 'mock-1', name: 'Arda Furkan Aslanbaş', title: 'Operasyon Yöneticisi' },
      { id: 'mock-2', name: 'Ayşe Yılmaz', title: 'Kreatif Yönetici' },
      { id: 'mock-3', name: 'Mehmet Demir', title: 'Operasyon Yöneticisi' },
    ]
  }, [employees])

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="name">Marka Adı</Label>
        <Input
          id="name"
          placeholder="Örn. Social Art Digital"
          value={values.name}
          onChange={(e) => updateField('name', e.target.value)}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="instagram">Instagram</Label>
        <Input
          id="instagram"
          placeholder="Örn. @socialartbase"
          value={values.instagram ?? ''}
          onChange={(e) => updateField('instagram', e.target.value)}
        />
        {errors.instagram && <p className="text-sm text-destructive">{errors.instagram}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          placeholder="Örn. https://socialartbase.com"
          value={values.website ?? ''}
          onChange={(e) => updateField('website', e.target.value)}
        />
        {errors.website && <p className="text-sm text-destructive">{errors.website}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPerson">Yetkili Kişi</Label>
        <Input
          id="contactPerson"
          placeholder="Örn. Can Sabancı"
          value={values.contactPerson}
          onChange={(e) => updateField('contactPerson', e.target.value)}
        />
        {errors.contactPerson && <p className="text-sm text-destructive">{errors.contactPerson}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefon</Label>
        <Input
          id="phone"
          placeholder="Örn. 0555 123 4567"
          value={values.phone}
          onChange={(e) => updateField('phone', e.target.value)}
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-posta</Label>
        <Input
          id="email"
          type="email"
          placeholder="Örn. iletisim@marka.com"
          value={values.email}
          onChange={(e) => updateField('email', e.target.value)}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="operationManagerId">Sorumlu Operasyon Yöneticisi</Label>
        <Select
          value={values.operationManagerId}
          onValueChange={(val) => updateField('operationManagerId', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Yönetici seçin" />
          </SelectTrigger>
          <SelectContent>
            {managers.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name} ({m.title})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.operationManagerId && <p className="text-sm text-destructive">{errors.operationManagerId}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate">Başlangıç Tarihi</Label>
        <Input
          id="startDate"
          type="date"
          value={values.startDate}
          onChange={(e) => updateField('startDate', e.target.value)}
        />
        {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="status">Durum</Label>
        <Select
          value={values.status}
          onValueChange={(val) => updateField('status', val as 'active' | 'inactive')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Durum seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{BRAND_STATUS_LABELS.active}</SelectItem>
            <SelectItem value="inactive">{BRAND_STATUS_LABELS.inactive}</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
      </div>
    </div>
  )
}
