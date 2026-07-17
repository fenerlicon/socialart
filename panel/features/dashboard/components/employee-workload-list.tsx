'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import type { Employee, Brand } from '@/types/domain'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Shield, ArrowRight } from 'lucide-react'

interface EmployeeWorkloadListProps {
  employees: Employee[]
  brands: Brand[]
}

const ROLE_PACKAGE_LABELS: Record<string, string> = {
  'operasyon-yonetimi': 'Operasyon Yönetimi',
  'strateji-musteri-yonetimi': 'Strateji & Müşteri Yönetimi',
  'dijital-pazarlama': 'Dijital Pazarlama',
  'sosyal-medya-yonetimi': 'Sosyal Medya Yönetimi',
  'kreatif-yonetim': 'Kreatif Yönetim',
  'kreatif-direktor': 'Kreatif Direktör',
  'grafik-tasarim': 'Grafik Tasarım',
  'video-kurgu': 'Video Kurgu',
  'fotograf-uretimi': 'Fotoğraf Üretimi',
  'video-uretimi': 'Video Üretimi',
}

export function EmployeeWorkloadList({ employees, brands }: EmployeeWorkloadListProps) {
  // Calculate brand assignment count for each employee
  const getBrandAssignmentCount = (empId: string) => {
    let count = 0
    brands.forEach((brand) => {
      if (brand.brandAssignments) {
        brand.brandAssignments.forEach((assignment) => {
          if (assignment.employeeId === empId) {
            count++
          }
        })
      }
    })
    return count
  }

  // Busiest employees (top 5 by brand assignment count)
  const busiestEmployees = useMemo(() => {
    const list = employees.map((emp) => ({
      ...emp,
      assignmentCount: getBrandAssignmentCount(emp.id),
    }))
    return list.sort((a, b) => b.assignmentCount - a.assignmentCount).slice(0, 5)
  }, [employees, brands])

  // Role package distribution
  const roleDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    employees.forEach((emp) => {
      const roleId = emp.rolePackageId
      counts[roleId] = (counts[roleId] || 0) + 1
    })

    return Object.entries(counts).map(([roleId, count]) => ({
      roleId,
      name: ROLE_PACKAGE_LABELS[roleId] || roleId,
      count,
    })).sort((a, b) => b.count - a.count)
  }, [employees])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* En Yoğun Çalışanlar */}
      <Card className="rounded-2xl border bg-card/40 shadow-sm backdrop-blur-md overflow-hidden hover:border-neutral-800 transition-colors">
        <CardHeader className="border-b border-neutral-800/40 pb-3">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="text-purple-500 h-4 w-4" />
            En Yoğun Çalışanlar (İlk 5)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 divide-y divide-neutral-800/40">
          {busiestEmployees.map((emp) => (
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
                  {emp.title || 'Ünvansız'}
                </span>
              </div>
              <span className="text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                {emp.assignmentCount} Marka Ataması
              </span>
            </div>
          ))}
          {busiestEmployees.length === 0 && (
            <div className="text-center py-6 text-xs text-muted-foreground">
              Gösterilecek veri bulunamadı.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rol Dağılımı */}
      <Card className="rounded-2xl border bg-card/40 shadow-sm backdrop-blur-md overflow-hidden hover:border-neutral-800 transition-colors">
        <CardHeader className="border-b border-neutral-800/40 pb-3">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Shield className="text-blue-500 h-4 w-4" />
            Rol Paketlerine Göre Çalışan Dağılımı
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 divide-y divide-neutral-800/40">
          {roleDistribution.map((role) => (
            <div key={role.roleId} className="py-3 flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-foreground">
                {role.name}
              </span>
              <span className="text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                {role.count} Kişi
              </span>
            </div>
          ))}
          {roleDistribution.length === 0 && (
            <div className="text-center py-6 text-xs text-muted-foreground">
              Gösterilecek veri bulunamadı.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
