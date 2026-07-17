'use client'

import { Badge } from '@/components/ui/badge'
import { BRAND_PACKAGES } from '@/features/brands/data/package-seeds'
import type { BrandFormApi } from '@/features/brands/hooks/use-brand-form'
import { OPERATION_PLAN_ITEM_TYPE_LABELS } from '@/types/domain'
import { OPERATION_TEMPLATES } from '@/features/workflows/data/operation-template-seeds'

export function PackagePreviewSection({ form }: { form: BrandFormApi }) {
  const { values } = form

  const selectedPackage = BRAND_PACKAGES.find(
    (pkg) => pkg.id === values.selectedPackageId
  )

  if (!selectedPackage) return null

  return (
    <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-foreground">
          {selectedPackage.name} Şablon İçeriği
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Aşağıdaki kalemler seçilen pakete ait varsayılan şablondur. Marka oluşturulduğunda bu liste başlangıç planını oluşturacaktır.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {selectedPackage.items.map((item, index) => {
          const template = OPERATION_TEMPLATES.find((t) => t.id === item.operationTemplateId)
          const title = template ? template.title : 'Bilinmeyen Kalem'
          const type = template && template.type ? template.type : 'custom'

          return (
            <div
              key={index}
              className="flex items-center justify-between p-2.5 rounded-md border bg-card text-xs"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <p className="font-semibold truncate text-foreground">{title}</p>
                <Badge variant="secondary" className="text-[9px] font-normal px-1.5 py-0 shrink-0">
                  {OPERATION_PLAN_ITEM_TYPE_LABELS[type] || 'Özel'}
                </Badge>
              </div>
              <span className="font-bold text-primary ml-2 bg-primary/15 px-2.5 py-1 rounded text-[11px] shrink-0">
                Hedef: {item.targetCount}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
