'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import type { Brand, Employee } from '@/types/domain'
import { EMPLOYEE_STATUS_LABELS } from '@/types/domain'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, ArrowRight, BarChart3, Film, Share2, AlertCircle, Trophy, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

interface RecentItemsCardProps {
  brands: Brand[]
  employees: Employee[]
}

interface LeadRow {
  id: string
  service?: string
  stage?: string
  status?: string
}

export function RecentItemsCard({ brands, employees }: RecentItemsCardProps) {
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [loadingLeads, setLoadingLeads] = useState(true)

  useEffect(() => {
    async function fetchLeads() {
      try {
        const { data, error } = await supabase.from('leads').select('id, service, stage, status')
        if (!error && data) {
          setLeads(data)
        }
      } catch (err) {
        console.error('Failed to fetch CRM leads for dashboard metrics:', err)
      } finally {
        setLoadingLeads(false)
      }
    }
    fetchLeads()
  }, [])

  // Calculate CRM Lead Metrics
  const metrics = useMemo(() => {
    let prodWaiting = 0
    let smWaiting = 0
    let uncontacted = 0
    let won = 0

    leads.forEach((l) => {
      const stage = (l.stage || l.status || '').toUpperCase()
      const service = (l.service || '').toLowerCase()
      const isProd = service.includes('prodük') || service.includes('video') || service.includes('çekim') || service.includes('production')

      if (stage === 'NEW') {
        uncontacted++
      }
      if (stage === 'WAITING' || stage === 'PROPOSAL_SENT') {
        if (isProd) prodWaiting++
        else smWaiting++
      }
      if (stage === 'WON') {
        won++
      }
    })

    return {
      total: leads.length,
      prodWaiting,
      smWaiting,
      uncontacted,
      won,
    }
  }, [leads])

  // Sort and get recent 5 employees
  const recentEmployees = useMemo(() => {
    return [...employees]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [employees])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* CRM & Lead Metrikleri (Replaced Son Eklenen Markalar) */}
      <Card className="rounded-2xl border bg-card/40 shadow-sm backdrop-blur-md overflow-hidden hover:border-neutral-800 transition-colors">
        <CardHeader className="border-b border-neutral-800/40 pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="text-indigo-400 h-4 w-4" />
            CRM & Lead Metrikleri
          </CardTitle>
          <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-extrabold">
            Canlı CRM
          </Badge>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {loadingLeads ? (
            <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
              Lead verileri yükleniyor...
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* Prodüksiyon Teklif Bekleyenler */}
              <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                    <Film className="w-3 h-3 text-indigo-400" />
                    Prodüksiyon
                  </span>
                  <Badge className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black border-none px-1.5 py-0">
                    {metrics.prodWaiting}
                  </Badge>
                </div>
                <p className="text-xs font-bold text-foreground mt-1">Teklif Bekleyenler</p>
                <p className="text-[9px] text-muted-foreground">Karar veya onay aşamasında</p>
              </div>

              {/* Sosyal Medya Teklif Bekleyenler */}
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/15 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                    <Share2 className="w-3 h-3 text-purple-400" />
                    Sosyal Medya
                  </span>
                  <Badge className="bg-purple-500/20 text-purple-300 text-[10px] font-black border-none px-1.5 py-0">
                    {metrics.smWaiting}
                  </Badge>
                </div>
                <p className="text-xs font-bold text-foreground mt-1">Teklif Bekleyenler</p>
                <p className="text-[9px] text-muted-foreground">Paket / bütçe incelemede</p>
              </div>

              {/* Temasa Geçilmeyen Lead'ler */}
              <div className={cn("p-3 rounded-xl border space-y-1 transition-all", metrics.uncontacted > 0 ? "bg-rose-500/10 border-rose-500/30 animate-pulse" : "bg-neutral-900/40 border-neutral-800")}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-400" />
                    Temassız Lead
                  </span>
                  <Badge className="bg-rose-500/30 text-rose-200 text-[10px] font-black border-none px-1.5 py-0">
                    {metrics.uncontacted}
                  </Badge>
                </div>
                <p className="text-xs font-bold text-rose-300 mt-1">Görüşülmeyen Adaylar</p>
                <p className="text-[9px] text-rose-300/80">Acil iletişim kurulmalı</p>
              </div>

              {/* Kazanılan Müşteriler & Toplam */}
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-emerald-400" />
                    Kazanılan
                  </span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black border-none px-1.5 py-0">
                    {metrics.won}
                  </Badge>
                </div>
                <p className="text-xs font-bold text-foreground mt-1">Sözleşmeli Müşteri</p>
                <p className="text-[9px] text-muted-foreground">Toplam Lead: {metrics.total}</p>
              </div>
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
