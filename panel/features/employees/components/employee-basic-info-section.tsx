'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { FormSection } from '@/components/shared/form-section'
import { getInitials } from '@/lib/permissions/permission-form-utils'
import type { EmployeeFormApi } from '@/features/employees/hooks/use-employee-form'

export function EmployeeBasicInfoSection({ form }: { form: EmployeeFormApi }) {
  const { values, errors, updateField } = form

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      <div className="flex flex-col items-center gap-2">
        <Avatar className="h-20 w-20">
          {values.avatarUrl ? (
            <AvatarImage src={values.avatarUrl} alt={values.fullName || 'Profil'} />
          ) : null}
          <AvatarFallback className="text-lg">
            {values.fullName ? getInitials(values.fullName) : '?'}
          </AvatarFallback>
        </Avatar>
        <p className="text-xs text-muted-foreground">Profil fotoğrafı (opsiyonel)</p>
      </div>

      <div className="grid flex-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fullName">Ad Soyad</Label>
          <Input
            id="fullName"
            placeholder="Örn. Ayşe Yılmaz"
            value={values.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
          />
          {errors.fullName ? (
            <p className="text-sm text-destructive">{errors.fullName}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            placeholder="ornek@socialart.com"
            value={values.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
          {errors.email ? (
            <p className="text-sm text-destructive">{errors.email}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Unvan</Label>
          <Input
            id="title"
            placeholder="Örn. Operasyon Uzmanı"
            value={values.title}
            onChange={(e) => updateField('title', e.target.value)}
          />
          {errors.title ? (
            <p className="text-sm text-destructive">{errors.title}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Kullanıcı Adı</Label>
          <Input
            id="username"
            placeholder="Örn: ayse"
            value={values.username ?? ''}
            onChange={(e) => updateField('username', e.target.value)}
          />
          {errors.username ? (
            <p className="text-sm text-destructive">{errors.username}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            type="text"
            placeholder="Şifre belirleyin..."
            value={values.password ?? ''}
            onChange={(e) => updateField('password', e.target.value)}
          />
          {errors.password ? (
            <p className="text-sm text-destructive">{errors.password}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="avatarUrl">Profil fotoğrafı URL (opsiyonel)</Label>
          <Input
            id="avatarUrl"
            placeholder="https://..."
            value={values.avatarUrl ?? ''}
            onChange={(e) => updateField('avatarUrl', e.target.value)}
          />
          {errors.avatarUrl ? (
            <p className="text-sm text-destructive">{errors.avatarUrl}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2 border-t border-neutral-900/40 pt-4 mt-2">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold text-foreground">Gelişmiş Takvim Erişimi</Label>
              <p className="text-xs text-muted-foreground">
                Bu yetki açık ise çalışanın sol menüsünde Takvim modülü görünür olur.
              </p>
            </div>
            <Switch
              checked={values.hasAdvancedCalendarAccess ?? false}
              onCheckedChange={(checked) => updateField('hasAdvancedCalendarAccess', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
