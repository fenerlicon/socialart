'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import type { Brand, Employee } from '@/types/domain'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'

interface BrandProgressListProps {
  brands: Brand[]
  employees: Employee[]
}

export function BrandProgressList({ brands, employees }: BrandProgressListProps) {
  // Helper to compute progress
  const getBrandProgress = (b: Brand) => {
    const plan = b.operationPlan || []
    if (!plan.length) return 0
    let totalTarget = 0
    let totalCompleted = 0
    plan.forEach((item) => {
      if (item.status !== 'cancelled') {
        totalTarget += item.target
        totalCompleted += Math.min(item.target, item.completed)
      }
    })
    return totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0
  }

  // Helper to get employee name
  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id)
    return emp ? emp.fullName : 'Atanmamış'
  }

  const packageLabels: Record<string, string> = {
    eko: 'Eko',
    business: 'Business',
    booster: 'Booster',
  }

  // Computed brand statistics and sorting
  const { topBrands, attentionBrands } = useMemo(() => {
    const brandData = brands.map((b) => ({
      ...b,
      progress: getBrandProgress(b),
    }))

    // Sort descending for top brands
    const sortedDesc = [...brandData].sort((a, b) => b.progress - a.progress)
    // Sort ascending for attention brands
    const sortedAsc = [...brandData].sort((a, b) => a.progress - b.progress)

    return {
      topBrands: sortedDesc.slice(0, 5),
      attentionBrands: sortedAsc.slice(0, 5),
    }
  }, [brands])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Dikkat Gerektiren Markalar */}
      <Card className="rounded-2xl border bg-card/40 shadow-sm backdrop-blur-md overflow-hidden hover:border-neutral-800 transition-colors">
        <CardHeader className="border-b border-neutral-800/40 bg-rose-500/5 pb-3">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <AlertCircle className="text-rose-500 h-4 w-4" />
            Dikkat Gerektiren Markalar (İlk 5)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 divide-y divide-neutral-800/40">
          {attentionBrands.map((brand) => (
            <div key={brand.id} className="py-3 flex flex-col gap-2 group">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/brands/${brand.id}`}
                      className="text-xs font-bold text-foreground hover:text-blue-400 flex items-center gap-1 transition-colors"
                    >
                      {brand.name}
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <Badge variant="outline" className="text-[9px] font-normal px-1 py-0 bg-neutral-800 text-neutral-400">
                      {packageLabels[brand.selectedPackageId] || brand.selectedPackageId}
                    </Badge>
                  </div>
                  <span className="block text-[10px] text-muted-foreground">
                    Sorumlu: <strong className="text-muted-foreground font-semibold">{getEmployeeName(brand.operationManagerId)}</strong>
                  </span>
                </div>
                <span className="text-xs font-extrabold text-rose-400">
                  %{brand.progress}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${brand.progress}%` }}
                />
              </div>
            </div>
          ))}
          {attentionBrands.length === 0 && (
            <div className="text-center py-6 text-xs text-muted-foreground">
              Gösterilecek veri bulunamadı.
            </div>
          )}
        </CardContent>
      </Card>

      {/* En İyi İlerleyen Markalar */}
      <Card className="rounded-2xl border bg-card/40 shadow-sm backdrop-blur-md overflow-hidden hover:border-neutral-800 transition-colors">
        <CardHeader className="border-b border-neutral-800/40 bg-emerald-500/5 pb-3">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <CheckCircle className="text-emerald-500 h-4 w-4" />
            En İyi İlerleyen Markalar (İlk 5)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 divide-y divide-neutral-800/40">
          {topBrands.map((brand) => (
            <div key={brand.id} className="py-3 flex flex-col gap-2 group">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/brands/${brand.id}`}
                      className="text-xs font-bold text-foreground hover:text-blue-400 flex items-center gap-1 transition-colors"
                    >
                      {brand.name}
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <Badge variant="outline" className="text-[9px] font-normal px-1 py-0 bg-neutral-800 text-neutral-400">
                      {packageLabels[brand.selectedPackageId] || brand.selectedPackageId}
                    </Badge>
                  </div>
                  <span className="block text-[10px] text-muted-foreground">
                    Sorumlu: <strong className="text-muted-foreground font-semibold">{getEmployeeName(brand.operationManagerId)}</strong>
                  </span>
                </div>
                <span className="text-xs font-extrabold text-emerald-400">
                  %{brand.progress}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${brand.progress}%` }}
                />
              </div>
            </div>
          ))}
          {topBrands.length === 0 && (
            <div className="text-center py-6 text-xs text-muted-foreground">
              Gösterilecek veri bulunamadı.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
