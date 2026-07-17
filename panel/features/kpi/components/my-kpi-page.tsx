'use client'

import { useState, useEffect, useMemo } from 'react'
import { KpiRepository } from '@/lib/repositories/KpiRepository'
import { EmployeeRepository } from '@/lib/repositories/EmployeeRepository'
import { ReportRepository } from '@/lib/repositories/ReportRepository'
import { extractAchievements } from '@/lib/kpi/kpi-engine'
import {
  getScoreTier,
  SCORE_TIER_LABELS,
  SCORE_TIER_COLORS,
  SCORE_TIER_BG,
  SCORE_TIER_BAR,
  SCORE_TIER_RING,
  MONTH_LABELS,
} from '@/lib/kpi/kpi-labels'
import type { KpiCard, Employee } from '@/types/domain'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Star,
  Award,
  CheckCircle2,
  AlertTriangle,
  Target,
  Lightbulb,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Donut Grafiği
// ---------------------------------------------------------------------------
function ScoreDonut({ score, size = 120 }: { score: number; size?: number }) {
  const tier = getScoreTier(score)
  const r = (size - 12) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={8} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={8}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('transition-all duration-700', SCORE_TIER_RING[tier])}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn('font-black text-3xl leading-none', SCORE_TIER_COLORS[tier])}>{score}</span>
        <span className="text-[9px] text-neutral-500 font-mono mt-0.5">/ 100</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Boyut Satırı
// ---------------------------------------------------------------------------
function DimensionRow({ icon, label, score, isAuto }: { icon: string; label: string; score: number | undefined; isAuto: boolean }) {
  if (score === undefined) return null
  const tier = getScoreTier(score)
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 text-base text-center shrink-0">{icon}</span>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-neutral-400 font-semibold">{label}</span>
          <div className="flex items-center gap-1.5">
            {!isAuto && (
              <span className="text-[8px] text-amber-500 font-bold font-mono bg-amber-500/10 px-1.5 rounded">YÖNETİCİ</span>
            )}
            <span className={cn('font-black font-mono text-xs', SCORE_TIER_COLORS[tier])}>{score}</span>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-neutral-900 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-700', SCORE_TIER_BAR[tier])}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Trend Hesabı
// ---------------------------------------------------------------------------
function getTrendInfo(cards: KpiCard[], currentCard: KpiCard) {
  const sorted = [...cards].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return (b.month ?? 0) - (a.month ?? 0)
  })
  const currentIdx = sorted.findIndex(c => c.id === currentCard.id)
  const prev = sorted[currentIdx + 1]
  if (!prev) return null
  const diff = currentCard.overallScore - prev.overallScore
  return { diff, prevScore: prev.overallScore, prevMonth: prev.month, prevYear: prev.year }
}

// ---------------------------------------------------------------------------
// Ana Bileşen
// ---------------------------------------------------------------------------
export function MyKpiPage() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [cards, setCards] = useState<KpiCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const now = new Date()

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const activeId = EmployeeRepository.getActiveId()
        if (!activeId) return

        const [emps, myCards] = await Promise.all([
          EmployeeRepository.getAll(),
          KpiRepository.getCardsByEmployee(activeId),
        ])

        const emp = emps.find(e => e.id === activeId) || null
        setEmployee(emp)

        // Sadece yayınlananlar görünür
        const published = myCards.filter(c => c.status === 'published')
        setCards(published)

        // Son ayı varsayılan seç
        if (published.length > 0) {
          const latest = published.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year
            return (b.month ?? 0) - (a.month ?? 0)
          })[0]
          setSelectedCardId(latest.id)
        }
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const selectedCard = useMemo(
    () => cards.find(c => c.id === selectedCardId) || null,
    [cards, selectedCardId]
  )

  const trend = useMemo(
    () => (selectedCard ? getTrendInfo(cards, selectedCard) : null),
    [cards, selectedCard]
  )
  const [reportAchievements, setReportAchievements] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'events' | 'constitution'>('events')

  useEffect(() => {
    async function loadReports() {
      if (!selectedCard) return
      try {
        const allReports = await ReportRepository.getAll()
        const filtered = allReports.filter(r => 
          r.employeeId === selectedCard.employeeId && 
          (r.status === 'approved' || r.status === 'submitted') &&
          new Date(r.date).getFullYear() === selectedCard.year &&
          new Date(r.date).getMonth() + 1 === selectedCard.month
        )
        const achievementsList = filtered.flatMap(r => extractAchievements(r.content))
        const unique = Array.from(new Set(achievementsList.map(a => a.trim()))).filter(Boolean)
        setReportAchievements(unique)
      } catch (err) {
        console.error('Error loading report achievements:', err)
      }
    }
    loadReports()
  }, [selectedCard])
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 min-h-screen bg-neutral-950">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-850 flex items-center justify-center mx-auto">
            <Award className="h-8 w-8 text-neutral-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-300">Henüz KPI Karnen Yok</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Yöneticin henüz bu ay için bir karne oluşturmadı veya yayınlamadı. Biraz sabır!
            </p>
          </div>
        </div>
      </div>
    )
  }

  const tier = selectedCard ? getScoreTier(selectedCard.overallScore) : null

  return (
    <div className="min-h-screen bg-neutral-950 text-foreground p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Performans Karnem</div>
        <h1 className="text-xl font-black text-white">{employee?.fullName}</h1>
        <p className="text-xs text-muted-foreground">{employee?.title}</p>
      </div>

      {/* Dönem Seçici */}
      {cards.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {cards.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCardId(c.id)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border',
                selectedCardId === c.id
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-neutral-900 border-neutral-850 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300'
              )}
            >
              {MONTH_LABELS[c.month!]} {c.year}
            </button>
          ))}
        </div>
      )}

      {selectedCard && tier && (
        <>
          {/* Ana Skor Kartı */}
          <div className={cn('rounded-2xl border p-6 relative overflow-hidden', SCORE_TIER_BG[tier])}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              <ScoreDonut score={selectedCard.overallScore} size={130} />
              <div className="text-center sm:text-left">
                <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest font-mono mb-1">
                  {MONTH_LABELS[selectedCard.month!]} {selectedCard.year} • GENEL SKOR
                </div>
                <div className={cn('text-3xl font-black', SCORE_TIER_COLORS[tier])}>
                  {SCORE_TIER_LABELS[tier]}
                </div>

                {/* Trend */}
                {trend && (
                  <div className="flex items-center gap-2 mt-2">
                    {trend.diff > 0 ? (
                      <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                        <TrendingUp className="h-3.5 w-3.5" />
                        +{trend.diff} puan (geçen aya göre)
                      </div>
                    ) : trend.diff < 0 ? (
                      <div className="flex items-center gap-1 text-red-400 text-[10px] font-bold">
                        <TrendingDown className="h-3.5 w-3.5" />
                        {trend.diff} puan (geçen aya göre)
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-neutral-500 text-[10px] font-bold">
                        <Minus className="h-3.5 w-3.5" />
                        Aynı (geçen ay ile)
                      </div>
                    )}
                  </div>
                )}

                {/* Rozetler */}
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  {selectedCard.overallScore >= 90 && (
                    <Badge className="bg-purple-950/50 border border-purple-500/30 text-purple-300 text-[9px] font-bold rounded-xl px-3">
                      🏆 Üst Performans
                    </Badge>
                  )}
                  {selectedCard.metrics.onTimeRate >= 90 && (
                    <Badge className="bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-[9px] font-bold rounded-xl px-3">
                      ⚡ Hız Şampiyonu
                    </Badge>
                  )}
                  {selectedCard.metrics.firstApprovalRate >= 85 && (
                    <Badge className="bg-blue-950/50 border border-blue-500/30 text-blue-300 text-[9px] font-bold rounded-xl px-3">
                      ✨ Kalite Ustası
                    </Badge>
                  )}
                  {selectedCard.metrics.ideasConverted >= 1 && (
                    <Badge className="bg-amber-950/50 border border-amber-500/30 text-amber-300 text-[9px] font-bold rounded-xl px-3">
                      💡 Fikir Üreticisi
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Görünüm Seçici Tablar (Yaşanan Olaylar vs Rol Anayasası) */}
          <div className="flex bg-neutral-950 p-0.5 rounded-xl border border-neutral-900 gap-1">
            <button
              onClick={() => setViewMode('events')}
              className={cn(
                "flex-1 text-center py-1.5 text-[10px] font-bold rounded-lg transition-all",
                viewMode === 'events'
                  ? "bg-purple-600 text-white"
                  : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/40"
              )}
            >
              Bu Ay Yaşanan Olaylar (Canlı Özet)
            </button>
            <button
              onClick={() => setViewMode('constitution')}
              className={cn(
                "flex-1 text-center py-1.5 text-[10px] font-bold rounded-lg transition-all",
                viewMode === 'constitution'
                  ? "bg-purple-600 text-white"
                  : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/40"
              )}
            >
              Rol Anayasası (Tüm Kurallar)
            </button>
          </div>

          {viewMode === 'constitution' ? (
            <div className="rounded-2xl border border-neutral-850 bg-neutral-950/80 p-5 space-y-4">
              <h3 className="text-[9px] font-black text-neutral-500 uppercase tracking-widest font-mono">
                ROL ANAYASASI (TÜM KPI KURALLARIN)
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar text-[11px]">
                {selectedCard.deductions?.map(d => {
                  const isNegative = d.points < 0
                  return (
                    <div key={d.id} className="flex items-start justify-between py-2 border-b border-neutral-900/40 last:border-0 gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-bold", d.applied ? (isNegative ? "text-red-400" : "text-emerald-400") : "text-neutral-300")}>
                            {d.title}
                          </span>
                          <span className="text-[8px] px-1 bg-neutral-950 border border-neutral-850 text-neutral-500 rounded font-mono">
                            {d.source === 'auto' ? 'Sistem' : 'Yönetici'}
                          </span>
                        </div>
                        <p className="text-[9px] text-neutral-500 mt-0.5">{d.description}</p>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <span className={cn("font-black font-mono", isNegative ? "text-red-400/80" : "text-emerald-400/80")}>
                          {d.points > 0 ? `+${d.points}` : d.points}
                        </span>
                        <span className={cn(
                          "text-[8px] font-bold px-1.5 py-0.5 rounded-full font-mono",
                          d.applied 
                            ? (isNegative ? "bg-red-950/40 text-red-400 border border-red-900/20" : "bg-emerald-950/40 text-emerald-400 border border-emerald-900/20")
                            : (isNegative ? "bg-emerald-950/10 text-emerald-500 border border-emerald-900/10" : "bg-neutral-900 text-neutral-500")
                        )}>
                          {d.applied 
                            ? (isNegative ? "Uygulandı" : "Kazanıldı")
                            : (isNegative ? "Uygulanmadı" : "Aktif Değil")
                          }
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <>
              {/* Puan Gerekçeleri (Audit Log) */}
              <div className="rounded-2xl border border-neutral-850 bg-neutral-950/80 p-5 space-y-4">
                <h3 className="text-[9px] font-black text-neutral-500 uppercase tracking-widest font-mono">
                  PUAN KESİNTİLERİ / HATA LOGU
                </h3>
                <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar text-[11px]">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 border-b border-neutral-900 pb-1.5 font-mono">
                    <span>Eylem / Durum</span>
                    <span>Puan Etkisi</span>
                  </div>

                  <div className="flex items-center justify-between font-bold text-neutral-300 py-1 border-b border-neutral-900/40">
                    <span className="flex items-center gap-1.5">🏁 Başlangıç Puanı</span>
                    <span className="font-mono text-neutral-400">100</span>
                  </div>

                  {!selectedCard.deductions || selectedCard.deductions.filter(d => d.applied && d.points < 0).length === 0 ? (
                    <div className="text-[10px] text-emerald-400 py-2 font-medium flex items-center gap-1.5">
                      ✓ Tebrikler! Bu dönem hiçbir hata kesintisi bulunmuyor.
                    </div>
                  ) : (
                    selectedCard.deductions.filter(d => d.applied && d.points < 0).map(d => (
                      <div key={d.id} className="flex items-center justify-between py-1 border-b border-neutral-900/30">
                        <div className="flex flex-col min-w-0">
                          <span className="text-neutral-400 flex items-center gap-2 truncate font-semibold">
                            <span>🔴</span>
                            <span className="truncate">{d.title}</span>
                          </span>
                          <span className="text-[9px] text-neutral-600 pl-5 truncate">{d.description}</span>
                        </div>
                        <span className="font-black font-mono shrink-0 text-red-400">
                          {d.points}
                        </span>
                      </div>
                    ))
                  )}

                  <div className="flex items-center justify-between font-black border-t border-neutral-900 pt-2.5 text-white mt-1">
                    <span>FİNAL KPI SKORUN</span>
                    <span className={cn("font-mono text-base", SCORE_TIER_COLORS[tier])}>{selectedCard.overallScore}</span>
                  </div>
                </div>
              </div>

              {/* Pozitif Gelişmeler ve Kazanımlar */}
              {selectedCard.deductions && selectedCard.deductions.filter(d => d.applied && d.points > 0).length > 0 && (
                <div className="rounded-2xl border border-neutral-850 bg-emerald-950/5 p-5 space-y-4">
                  <h3 className="text-[9px] font-black text-emerald-400 uppercase tracking-widest font-mono">
                    POZİTİF GELİŞMELER & KAZANIMLAR (Puanı etkilemez)
                  </h3>
                  <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar text-[11px]">
                    {selectedCard.deductions.filter(d => d.applied && d.points > 0).map(d => (
                      <div key={d.id} className="flex items-start gap-2.5 py-1 border-b border-neutral-900/10 last:border-0">
                        <span className="text-emerald-400 shrink-0">🟢</span>
                        <div className="flex-1 text-neutral-300">
                          <span className="font-bold">{d.title}</span>
                          <span className="text-neutral-600 text-[10px] ml-1.5">({d.description})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Performans Boyutları */}
          <div className="rounded-2xl border border-neutral-850 bg-neutral-950/80 p-5 space-y-4">
            <h3 className="text-[9px] font-black text-neutral-500 uppercase tracking-widest font-mono">PERFORMANS BOYUTLARI</h3>
            <div className="space-y-3.5">
              <DimensionRow icon="⏱" label="Disiplin" score={selectedCard.disciplineScore} isAuto />
              <DimensionRow icon="✨" label="Kalite" score={selectedCard.qualityScore} isAuto />
              <DimensionRow icon="⚙" label="Operasyon" score={selectedCard.operationScore} isAuto />
              <DimensionRow icon="💡" label="Katkı" score={selectedCard.contributionScore} isAuto />
            </div>
          </div>

          {/* Ham Metrikler — Şeffaflık */}
          <div className="rounded-2xl border border-neutral-850 bg-neutral-950/80 p-5 space-y-4">
            <h3 className="text-[9px] font-black text-neutral-500 uppercase tracking-widest font-mono">DETAY METRİKLER</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Tamamlanan', value: selectedCard.metrics.totalStepsCompleted, unit: 'görev', good: true },
                { label: 'Zamanında', value: `${selectedCard.metrics.onTimeRate}%`, unit: '', good: selectedCard.metrics.onTimeRate >= 80 },
                { label: 'İlk Onay', value: `${selectedCard.metrics.firstApprovalRate}%`, unit: '', good: selectedCard.metrics.firstApprovalRate >= 75 },
                { label: 'Revize', value: selectedCard.metrics.revisionCount, unit: 'adet', good: selectedCard.metrics.revisionCount <= 2 },
                { label: 'Handoff', value: selectedCard.metrics.handoffsSent, unit: 'paslandı', good: selectedCard.metrics.handoffsSent === 0 },
                { label: 'Fikir', value: selectedCard.metrics.ideasSubmitted, unit: 'üretildi', good: true },
                { label: 'Raporlama', value: `${selectedCard.metrics.reportComplianceRate}%`, unit: 'uyum', good: selectedCard.metrics.reportComplianceRate >= 85 },
                { label: 'Ortalama', value: `${selectedCard.metrics.avgCompletionHours}s`, unit: 'süre', good: true },
              ].map((m, i) => (
                <div key={i} className={cn(
                  'rounded-xl p-3 text-center border',
                  m.good ? 'bg-neutral-900/30 border-neutral-900' : 'bg-red-950/10 border-red-500/10'
                )}>
                  <div className="text-base font-black text-foreground">{m.value}</div>
                  <div className="text-[8px] text-neutral-500 font-semibold uppercase tracking-wider font-mono">{m.label}</div>
                  {m.unit && <div className="text-[8px] text-neutral-600 font-mono">{m.unit}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Rapor Başarı Analizi */}
          {reportAchievements.length > 0 && (
            <div className="rounded-2xl border border-neutral-850 bg-neutral-950/80 p-5 space-y-4">
              <h3 className="text-[9px] font-black text-neutral-500 uppercase tracking-widest font-mono">
                RAPORLARDAN AYIKLANAN OPERASYONEL BAŞARILARIN
              </h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar text-[11px]">
                {reportAchievements.map((achievement, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 py-2 border-b border-neutral-900/40 last:border-0">
                    <span className="text-emerald-400 shrink-0 mt-0.5">🚀</span>
                    <span className="text-neutral-300 leading-relaxed font-medium">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yönetici Notu (Quarterly Review) */}
          {selectedCard.managerReview && (
            <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.03] p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400" />
                <h3 className="text-[9px] font-black text-amber-400 uppercase tracking-widest font-mono">YÖNETİCİ DEĞERLENDİRMESİ</h3>
              </div>

              {selectedCard.managerReview.strengths.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider font-mono mb-2">GÜÇLÜ YÖNLERIN</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCard.managerReview.strengths.map((s, i) => (
                      <Badge key={i} className="bg-emerald-950/30 border border-emerald-500/15 text-emerald-300 text-[9px] font-semibold rounded-lg px-2">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedCard.managerReview.growthAreas.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider font-mono mb-2">GELİŞİM ALANLARIN</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCard.managerReview.growthAreas.map((g, i) => (
                      <Badge key={i} className="bg-amber-950/30 border border-amber-500/15 text-amber-300 text-[9px] font-semibold rounded-lg px-2">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedCard.managerReview.managerNote && (
                <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-3 text-[10px] text-muted-foreground italic leading-relaxed">
                  &ldquo;{selectedCard.managerReview.managerNote}&rdquo;
                </div>
              )}

              {selectedCard.managerReview.goals.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider font-mono mb-2">
                    <Target className="h-3 w-3 inline mr-1" />
                    HEDEFLER
                  </p>
                  <ul className="space-y-1">
                    {selectedCard.managerReview.goals.map((g, i) => (
                      <li key={i} className="flex items-start gap-2 text-[10px] text-neutral-400">
                        <span className="text-purple-500 font-bold shrink-0 mt-0.5">→</span>
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 flex-wrap pt-1">
                {selectedCard.managerReview.bonusEligible && (
                  <Badge className="bg-purple-950/40 border border-purple-500/25 text-purple-300 text-[9px] font-bold rounded-xl px-3">
                    🎁 Bonus Uygun
                  </Badge>
                )}
                {selectedCard.managerReview.promotionFlag && (
                  <Badge className="bg-amber-950/40 border border-amber-500/25 text-amber-300 text-[9px] font-bold rounded-xl px-3">
                    ⭐ Terfi Değerlendirmesi
                  </Badge>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
