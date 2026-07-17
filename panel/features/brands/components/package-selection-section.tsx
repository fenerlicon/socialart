'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BRAND_PACKAGES } from '@/features/brands/data/package-seeds'
import type { BrandFormApi } from '@/features/brands/hooks/use-brand-form'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export function PackageSelectionSection({ form }: { form: BrandFormApi }) {
  const { values, changePackage } = form

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {BRAND_PACKAGES.map((pkg) => {
        const isSelected = values.selectedPackageId === pkg.id
        return (
          <Card
            key={pkg.id}
            className={cn(
              'relative cursor-pointer p-5 transition-all duration-300 hover:shadow-md select-none border-2 flex flex-col justify-between min-h-[160px]',
              isSelected
                ? 'border-primary bg-card shadow-sm ring-1 ring-primary'
                : 'border-muted hover:border-muted-foreground/30 bg-muted/10'
            )}
            onClick={() => changePackage(pkg.id)}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-foreground">{pkg.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pkg.description}
                  </p>
                </div>
                {isSelected && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-muted/50 flex items-center justify-between">
              <Badge variant={isSelected ? 'default' : 'outline'} className="text-[10px] uppercase tracking-wider font-semibold">
                {pkg.priceLabel}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {pkg.items.length} Kalem İçerik
              </span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
