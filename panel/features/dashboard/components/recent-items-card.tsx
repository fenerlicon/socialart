'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import type { Brand, Employee } from '@/types/domain'
import { EMPLOYEE_STATUS_LABELS } from '@/types/domain'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, ArrowRight, BarChart3, Film, Share2, AlertCircle, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabaseLeads } from '@/lib/supabase/client'

interface RecentItemsCardProps {
  brands: Brand[]
  employees: Employee[]
}

interface LeadItem {
  id: string | number
  name?: string
  pipeline?: string
  service?: string
  stage?: string
  status?: string
  durum?: string
  created_at?: string
}

export function RecentItemsCard({ employees }: RecentItemsCardProps) {
  const [leads, setLeads] = useState<LeadItem[]>([])
  const [loadingLeads, setLoadingLeads] = useState(true)

  useEffect(() => {
    async function fetchLeads() {
      try {
        const { data, error } = await supabaseLeads
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          setLeads(data)
        } else {
          // Fallback to localStorage if offline
          try {
            const stored = localStorage.getItem('ajans_leads') || localStorage.getItem('socialart_crm_leads')
            if (stored) {
              setLeads(JSON.parse(stored))
            }
          } catch (e) {
            console.warn('LocalStorage parse error for leads:', e)
          }
        }
      } catch (err) {
        console.error('Failed to fetch CRM leads for dashboard metrics:', err)
      } finally {
        setLoadingLeads(false)
      }
    }
    fetchLeads()
  }, [])

  // Calculate CRM Lead Metrics from Real DB
  const metrics = useMemo(() => {
    let prodWaiting = 0
    let smWaiting = 0
    let uncontacted = 0
    let won = 0

    const activeLeads = leads.filter(l => l.status !== 'ARŞİV' && l.stage !== 'ARCHIVED')

    activeLeads.forEach((l) => {
      const rawStage = String(l.stage || '').trim().toUpperCase()
      const rawStatus = String(l.status || l.durum || '').trim()
      const pipelineUpper = String(l.pipeline || '').toUpperCase()
      const serviceLower = String(l.service || '').toLowerCase()

      const isProd =
        pipelineUpper === 'PRODUCTION' ||
        serviceLower.includes('prodük') ||
        serviceLower.includes('video') ||
        serviceLower.includes('çekim') ||
        serviceLower.includes('production')

      // 1. Temassız Lead (Yeni gelenler)
      if (
        rawStage === 'NEW' ||
        rawStage === 'HOT' ||
        rawStatus === 'Geldi (Yeni Lead)' ||
        rawStatus === 'Yeni' ||
        rawStatus === 'Sıcak'
      ) {
        uncontacted++
      }

      // 2. Teklif Bekleyenler / Teklif İletildi
      if (
        rawStage === 'WAITING' ||
        rawStage === 'PROPOSAL_SENT' ||
        rawStatus.includes('Teklif') ||
        rawStatus.includes('Katalog') ||
        rawStatus.includes('Bekliyor')
      ) {
        if (isProd) prodWaiting++
        else smWaiting++
      }

      // 3. Kazanılan Müşteriler
      if (
        rawStage === 'WON' ||
        rawStatus.includes('Anlaş') ||
        rawStatus.includes('Kazanıldı') ||
        rawStatus.includes('Aktif')
      ) {
        won++
      }
    })

    return {
      total: activeLeads.length,
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
    <div className="space-y-6">
      {/* HALA TEMASA GEÇİLMEYEN MÜŞTERİLER VAR ALARMI */}
      {!loadingLeads && metrics.uncontacted > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-900/80 via-red-900/60 to-amber-900/80 border border-rose-500/40 shadow-lg shadow-rose-950/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <AlertCircle className="w-6 h-6 text-rose-400 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-rose-200 tracking-wide uppercase flex items-center gap-2">
                🚨 HALA TEMASA GEÇİLMEYEN MÜŞTERİLER VAR!
              </h4>
              <p className="text-xs text-rose-300/90 mt-0.5">
                Sistemde henüz iletişime geçilmemiş <strong className="text-white underline">{metrics.uncontacted} Adet Yeni Müşteri (Lead)</strong> bekliyor! Lütfen en kısa sürede iletişime geçin.
              </p>
            </div>
          </div>
          <a
            href="/admin/crm?tab=potansiyel&filter=new"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
          >
            Müşterileri İncele ({metrics.uncontacted}) <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* CRM & Lead Metrikleri */}
        <Card className="rounded-2xl border bg-card/40 shadow-sm backdrop-blur-md overflow-hidden hover:border-neutral-800 transition-colors">
          <CardHeader className="border-b border-neutral-800/40 pb-3 flex flex-row items-center justify-between">
            <a
              href="/admin/crm?tab=potansiyel"
              className="flex items-center gap-2 group cursor-pointer"
            >
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 group-hover:text-indigo-400 transition-colors">
                <BarChart3 className="text-indigo-400 h-4 w-4" />
                CRM & Lead Metrikleri
              </CardTitle>
            </a>
            <a
              href="/admin/crm?tab=potansiyel"
              className="cursor-pointer"
            >
              <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-extrabold hover:bg-indigo-500/20 transition-colors">
                Canlı CRM →
              </Badge>
            </a>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {loadingLeads ? (
              <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
                Lead verileri yükleniyor...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* Prodüksiyon Teklif Bekleyenler */}
                <a
                  href="/admin/crm?tab=potansiyel&pipeline=PRODUCTION&filter=proposal"
                  className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 space-y-1 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer block group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                      <Film className="w-3 h-3 text-indigo-400" />
                      Prodüksiyon
                    </span>
                    <Badge className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black border-none px-1.5 py-0 group-hover:bg-indigo-500/30">
                      {metrics.prodWaiting}
                    </Badge>
                  </div>
                  <p className="text-xs font-bold text-foreground mt-1 flex items-center justify-between">
                    Teklif Bekleyenler
                    <ArrowRight className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-[9px] text-muted-foreground">Karar veya onay aşamasında</p>
                </a>

                {/* Sosyal Medya Teklif Bekleyenler */}
                <a
                  href="/admin/crm?tab=potansiyel&pipeline=SOCIAL_MEDIA&filter=proposal"
                  className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/15 space-y-1 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all cursor-pointer block group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                      <Share2 className="w-3 h-3 text-purple-400" />
                      Sosyal Medya
                    </span>
                    <Badge className="bg-purple-500/20 text-purple-300 text-[10px] font-black border-none px-1.5 py-0 group-hover:bg-purple-500/30">
                      {metrics.smWaiting}
                    </Badge>
                  </div>
                  <p className="text-xs font-bold text-foreground mt-1 flex items-center justify-between">
                    Teklif Bekleyenler
                    <ArrowRight className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-[9px] text-muted-foreground">Paket / bütçe incelemede</p>
                </a>

                {/* Temasa Geçilmeyen Lead'ler */}
                <a
                  href="/admin/crm?tab=potansiyel&filter=new"
                  className={cn(
                    "p-3 rounded-xl border space-y-1 transition-all cursor-pointer block group",
                    metrics.uncontacted > 0
                      ? "bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50"
                      : "bg-neutral-900/40 border-neutral-800 hover:border-neutral-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                      Temassız Lead
                    </span>
                    <Badge className="bg-rose-500/30 text-rose-200 text-[10px] font-black border-none px-1.5 py-0 group-hover:bg-rose-500/40">
                      {metrics.uncontacted}
                    </Badge>
                  </div>
                  <p className="text-xs font-bold text-rose-300 mt-1 flex items-center justify-between">
                    Görüşülmeyen Adaylar
                    <ArrowRight className="w-3 h-3 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-[9px] text-rose-300/80">Acil iletişim kurulmalı</p>
                </a>

                {/* Kazanılan Müşteriler & Toplam */}
                <a
                  href="/admin/crm?tab=potansiyel&filter=won"
                  className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-1 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all cursor-pointer block group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-emerald-400" />
                      Kazanılan
                    </span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black border-none px-1.5 py-0 group-hover:bg-emerald-500/30">
                      {metrics.won}
                    </Badge>
                  </div>
                  <p className="text-xs font-bold text-foreground mt-1 flex items-center justify-between">
                    Sözleşmeli Müşteri
                    <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-[9px] text-muted-foreground">Toplam Aktif Lead: {metrics.total}</p>
                </a>
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
    </div>
  )
}
