'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import type { Brand, Employee } from '@/types/domain'
import { BRAND_STATUS_LABELS, EMPLOYEE_STATUS_LABELS } from '@/types/domain'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Folder, User, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecentItemsCardProps {
  brands: Brand[]
  employees: Employee[]
}

export function RecentItemsCard({ brands, employees }: RecentItemsCardProps) {
  // Sort and get recent 5 brands
  const recentBrands = useMemo(() => {
    return [...brands]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [brands])

  // Sort and get recent 5 employees
  const recentEmployees = useMemo(() => {
    return [...employees]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [employees])

  const packageLabels: Record<string, string> = {
    eko: 'Eko',
    business: 'Business',
    booster: 'Booster',
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Son Eklenen Markalar */}
      <Card className="rounded-2xl border bg-card/40 shadow-sm backdrop-blur-md overflow-hidden hover:border-neutral-800 transition-colors">
        <CardHeader className="border-b border-neutral-800/40 pb-3">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Folder className="text-blue-500 h-4 w-4" />
            Son Eklenen Markalar (İlk 5)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 divide-y divide-neutral-800/40">
          {recentBrands.map((brand) => (
            <div key={brand.id} className="py-3 flex items-center justify-between gap-4 group">
              <div className="space-y-0.5">
                <Link
                  href={`/brands/${brand.id}`}
                  className="text-xs font-bold text-foreground hover:text-blue-400 flex items-center gap-1 transition-colors"
                >
                  {brand.name}
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <span className="block text-[10px] text-muted-foreground">
                  Paket: {packageLabels[brand.selectedPackageId] || brand.selectedPackageId} • Kayıt: {new Date(brand.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <Badge
                variant={brand.status === 'active' ? 'default' : 'secondary'}
                className={cn(
                  'text-[9px] font-semibold px-2 py-0.5 border rounded-full',
                  brand.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
                )}
              >
                {BRAND_STATUS_LABELS[brand.status]}
              </Badge>
            </div>
          ))}
          {recentBrands.length === 0 && (
            <div className="text-center py-6 text-xs text-muted-foreground">
              Gösterilecek marka bulunamadı.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Son Eklenen Çalışanlar */}
      <Card className="rounded-2xl border bg-card/40 shadow-sm backdrop-blur-md overflow-hidden hover:border-neutral-800 transition-colors">
        <CardHeader className="border-b border-neutral-800/40 pb-3">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <User className="text-purple-500 h-4 w-4" />
            Son Eklenen Çalışanlar (İlk 5)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 divide-y divide-neutral-800/40">
          {recentEmployees.map((emp) => (
            <div key={emp.id} className="py-3 flex items-center justify-between gap-4 group">
              <div className="space-y-0.5">
                <Link
                  href={`/employees/${emp.id}`}
                  className="text-xs font-bold text-foreground hover:text-blue-400 flex items-center gap-1 transition-colors"
                >
                  {emp.fullName}
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <span className="block text-[10px] text-muted-foreground">
                  {emp.title || 'Ünvansız'} • Kayıt: {new Date(emp.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  'text-[9px] font-semibold px-2 py-0.5 border rounded-full',
                  emp.employeeStatus === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
                )}
              >
                {EMPLOYEE_STATUS_LABELS[emp.employeeStatus] || emp.employeeStatus}
              </Badge>
            </div>
          ))}
          {recentEmployees.length === 0 && (
            <div className="text-center py-6 text-xs text-muted-foreground">
              Gösterilecek çalışan bulunamadı.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
