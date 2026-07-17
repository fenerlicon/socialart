'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { KpiRepository } from '@/lib/repositories/KpiRepository'
import { WorkflowRepository } from '@/lib/repositories/WorkflowRepository'
import { ApprovalRepository } from '@/lib/repositories/ApprovalRepository'
import { HandoffRepository } from '@/lib/repositories/HandoffRepository'
import { IdeaRepository } from '@/lib/repositories/IdeaRepository'
import { ReportRepository } from '@/lib/repositories/ReportRepository'
import { EmployeeRepository } from '@/lib/repositories/EmployeeRepository'
import { generateKpiCard, computeAgencyScore, extractAchievements } from '@/lib/kpi/kpi-engine'
import {
  getScoreTier,
  SCORE_TIER_LABELS,
  SCORE_TIER_COLORS,
  SCORE_TIER_BG,
  SCORE_TIER_BAR,
  SCORE_TIER_RING,
  DIMENSION_LABELS,
  DIMENSION_ICONS,
  MONTH_LABELS,
} from '@/lib/kpi/kpi-labels'
import type { KpiCard, Employee, ManagerReview } from '@/types/domain'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  X,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Send,
  ChevronDown,
  CheckCircle2,
  Star,
  AlertTriangle,
  Loader2,
  BarChart3,
  Users,
  Award,
  Target,
  Lightbulb,
} from 'lucide-react'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Donut Skor Grafiği
// ---------------------------------------------------------------------------
function ScoreDonut({ score, size = 80 }: { score: number; size?: number }) {
  const tier = getScoreTier(score)
  const r = (size - 10) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('transition-all duration-700', SCORE_TIER_RING[tier])}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className={cn('font-black text-lg', SCORE_TIER_COLORS[tier])}>{score}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mini Boyut Bar
// ---------------------------------------------------------------------------
function DimensionBar({ label, icon, score }: { label: string; icon: string; score: number | undefined }) {
  const tier = getScoreTier(score ?? 0)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-neutral-400 font-semibold flex items-center gap-1">
          <span>{icon}</span>
          {label}
        </span>
        <span className={cn('font-black font-mono', score !== undefined ? SCORE_TIER_COLORS[tier] : 'text-neutral-600')}>
          {score !== undefined ? score : '—'}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-neutral-900 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', score !== undefined ? SCORE_TIER_BAR[tier] : 'bg-neutral-800')}
          style={{ width: `${score ?? 0}%` }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Ana Bileşen
// ---------------------------------------------------------------------------
export function KpiPage() {
  const now = new Date()
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [cards, setCards] = useState<KpiCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [showManagerForm, setShowManagerForm] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [kpiTableReady, setKpiTableReady] = useState(true)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  // Veri yükleme — çalışanlar ve KPI kartları ayrı ayrı yüklenir
  // KPI tablosu henüz oluşturulmamış olsa bile sayfa çalışır
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const emps = await EmployeeRepository.getAll()
      setEmployees(emps.filter(e => e.employeeStatus === 'active' && e.rolePackageId !== 'operasyon-yonetimi' && e.rolePackageId !== 'kreatif-yonetim'))
    } catch (e) {
      console.error('Çalışanlar yüklenemedi:', e)
      toast.error('Çalışan verisi yüklenemedi')
    }

    try {
      const allCards = await KpiRepository.getAllCards()
      setCards(allCards)
      setKpiTableReady(true)
    } catch (e: any) {
      // Tablo henüz oluşturulmamışsa veya schema cache güncel değilse
      const isTableMissing =
        e?.code === '42P01' ||
        e?.message?.includes('does not exist') ||
        e?.message?.includes('relation') ||
        e?.message?.includes('schema cache') ||
        e?.message?.includes('Could not find the table')
      setKpiTableReady(!isTableMissing)
      if (!isTableMissing) {
        console.error('KPI kartları yüklenemedi:', e)
        toast.error('KPI verileri yüklenemedi: ' + (e?.message || 'Bilinmeyen hata'))
      }
      setCards([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Seçili döneme ait kartlar
  const periodCards = useMemo(
    () => cards.filter(c => c.year === selectedYear && c.month === selectedMonth && c.period === 'monthly'),
    [cards, selectedYear, selectedMonth]
  )

  // Seçili kart
  const selectedCard = useMemo(
    () => periodCards.find(c => c.id === selectedCardId) || null,
    [periodCards, selectedCardId]
  )

  // Ajans skoru
  const agencyScore = useMemo(() => {
    const published = periodCards.filter(c => c.status === 'published')
    if (published.length === 0) return null
    return computeAgencyScore(published)
  }, [periodCards])

  // KPI Kartlarını Oluştur
  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const [steps, approvals, handoffs, ideas, reports] = await Promise.all([
        WorkflowRepository.getAllSteps(),
        ApprovalRepository.getAll(),
        HandoffRepository.getAll(),
        IdeaRepository.getAll(),
        ReportRepository.getAll(),
      ])

      let successCount = 0
      let failCount = 0

      for (const emp of employees) {
        try {
          const existing = await KpiRepository.getCardByEmployeeAndMonth(emp.id, selectedYear, selectedMonth)
          const card = generateKpiCard({
            employeeId: emp.id,
            year: selectedYear,
            month: selectedMonth,
            steps,
            approvals,
            handoffs,
            ideas,
            reports,
            existingCard: existing,
            rolePackageId: emp.rolePackageId,
          })
          await KpiRepository.saveCard(card)
          successCount++
        } catch (empErr: any) {
          console.error(`KPI hatası — ${emp.fullName}:`, empErr?.message || empErr)
          failCount++
        }
      }

      await loadData()

      if (failCount === 0) {
        toast.success(`${successCount} çalışan için KPI karnesi oluşturuldu`)
      } else if (successCount > 0) {
        toast.warning(`${successCount} karne oluşturuldu, ${failCount} çalışanda hata (console'u kontrol edin)`)
      } else {
        toast.error('Hiçbir karne oluşturulamadı — tarayıcı console\'unu açın (F12) ve hatayı kontrol edin')
      }
    } catch (e: any) {
      console.error('KPI veri yükleme hatası:', e?.message || e)
      toast.error('Veri yüklenemedi: ' + (e?.message || 'Bilinmeyen hata'))
    } finally {
      setIsGenerating(false)
    }
  }

  // Kartı Yayınla
  const handlePublish = async (cardId: string) => {
    try {
      await KpiRepository.publishCard(cardId)
      await loadData()
      toast.success('Karne yayınlandı — çalışan artık görebilir')
    } catch {
      toast.error('Yayınlama hatası')
    }
  }

  const getEmployee = (id: string) => employees.find(e => e.id === id)

  // Trend oku
  const getTrendIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-3 w-3 text-emerald-400" />
    if (score >= 60) return <Minus className="h-3 w-3 text-amber-400" />
    return <TrendingDown className="h-3 w-3 text-red-400" />
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-foreground p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
            <BarChart3 className="h-3.5 w-3.5 text-purple-500" />
            Agency Performance Engine
          </div>
          <h1 className="text-xl font-black text-white">KPI Değerlendirme</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Tüm çalışanların performans karnesi ve ajans skoru</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Dönem seçici */}
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-850 rounded-xl p-1">
            {[...Array(12)].map((_, i) => {
              const m = i + 1
              return (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all',
                    selectedMonth === m
                      ? 'bg-purple-600 text-white'
                      : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800'
                  )}
                >
                  {MONTH_LABELS[m].slice(0, 3)}
                </button>
              )
            })}
          </div>

          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="bg-neutral-900 border border-neutral-850 rounded-xl px-3 py-2 text-xs font-bold text-neutral-300 focus:outline-none focus:border-purple-500"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <Button
            onClick={() => setShowInfo(!showInfo)}
            variant="ghost"
            className={cn(
              "rounded-xl font-bold text-xs px-3.5 h-9 gap-1.5 border transition-all",
              showInfo 
                ? "bg-purple-950/40 border-purple-500/30 text-purple-300"
                : "border-neutral-850 hover:bg-neutral-900 text-neutral-400 hover:text-white"
            )}
          >
            <Lightbulb className={cn("h-3.5 w-3.5", showInfo ? "text-purple-400 fill-purple-400/20" : "text-neutral-500")} />
            Nasıl Hesaplanır?
          </Button>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || employees.length === 0}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs px-4 h-9 gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Karneleri Oluştur
          </Button>
        </div>
      </div>

      {/* KPI Bilgilendirme Paneli (Nasıl Hesaplanır?) */}
      {showInfo && (
        <div className="rounded-2xl border border-purple-500/20 bg-purple-950/[0.08] p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-purple-400 fill-purple-400/10" />
              100 Puan Eksiltme Tabanlı KPI Hesaplama Sistemi
            </h3>
            <button 
              onClick={() => setShowInfo(false)}
              className="text-[10px] font-bold text-neutral-500 hover:text-neutral-300"
            >
              Kapat
            </button>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed max-w-3xl">
            Social Art Base, çalışan performansını adil ve objektif değerlendirmek amacıyla <strong>100 puan başlangıçlı eksiltme ve kazanım sistemini</strong> kullanır. 
            Her çalışan dönem başında 100 tam puanla başlar ve iş akışındaki gecikmeler, revizeler veya hatalara göre puanı eksilir. Artı (pozitif) gelişmeler ise puanı artırmaz, çalışanın karnesinde **Kazanımlar** olarak ayrı gösterilir.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
            <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-3.5 space-y-1.5">
              <span className="text-xs">⏱</span>
              <h4 className="text-[10px] font-bold text-neutral-300 uppercase font-mono">Disiplin</h4>
              <p className="text-[9px] text-neutral-500 leading-normal">
                Genel görev gecikmeleri, raporlama eksiklikleri ve <strong>habersiz teslim aşımları</strong> (paslama/devir yapılmayan gecikmeler) üzerinden otomatik düşürülür.
              </p>
            </div>

            <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-3.5 space-y-1.5">
              <span className="text-xs">✨</span>
              <h4 className="text-[10px] font-bold text-neutral-300 uppercase font-mono">Kalite</h4>
              <p className="text-[9px] text-neutral-500 leading-normal">
                Yöneticiden veya müşteriden gelen revize sıklıkları, tasarım kalitesi beklentileri ve <strong>reklam kurulumundaki eksiklikler</strong> üzerinden otomatik düşürülür.
              </p>
            </div>

            <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-3.5 space-y-1.5">
              <span className="text-xs">⚙</span>
              <h4 className="text-[10px] font-bold text-neutral-300 uppercase font-mono">Operasyon</h4>
              <p className="text-[9px] text-neutral-500 leading-normal">
                İçerik takviminin hiç oluşturulmaması, günlük story kontrollerinin yapılmaması gibi operasyonel boşluklardan otomatik kesilir.
              </p>
            </div>

            <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-3.5 space-y-1.5">
              <span className="text-xs">💡</span>
              <h4 className="text-[10px] font-bold text-neutral-300 uppercase font-mono">Kazanımlar</h4>
              <p className="text-[9px] text-neutral-500 leading-normal">
                Fikir havuzuna eklenen yeni fikirler, göreve dönüşen fikirler ve onaylanan raporlar <strong>puanı etkilemeden</strong> başarı listesinde toplanır.
              </p>
            </div>

            <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-3.5 space-y-1.5 border-purple-500/10 bg-purple-500/[0.01]">
              <span className="text-xs">🤝</span>
              <h4 className="text-[10px] font-bold text-purple-400 uppercase font-mono">Yönetici Puanı</h4>
              <p className="text-[9px] text-neutral-500 leading-normal">
                İletişim, takım çalışması, inisiyatif alma, problem çözme ve yaratıcılık alanlarında yöneticinin el ile verdiği puanların ortalamasıdır.
              </p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="text-xs font-semibold">Veriler yükleniyor…</span>
          </div>
        </div>
      ) : (
        <>
          {/* Supabase Kurulum Uyarısı */}
          {!kpiTableReady && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-lg">⚠️</div>
              <div className="space-y-2 flex-1">
                <h3 className="text-sm font-black text-amber-300">Supabase Tablolar Kurulu Değil</h3>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  KPI sistemi çalışabilir durumda, ancak Supabase'de <code className="bg-neutral-900 border border-neutral-800 rounded px-1 text-amber-300 font-mono">kpi_cards</code> ve <code className="bg-neutral-900 border border-neutral-800 rounded px-1 text-amber-300 font-mono">agency_score_snapshots</code> tabloları henüz oluşturulmamış.
                </p>
                <p className="text-[11px] text-neutral-500">
                  Supabase Dashboard → SQL Editor → <strong className="text-neutral-300">kpi_tables.sql</strong> dosyasındaki SQL'i çalıştırın, ardından sayfayı yenileyin.
                </p>
              </div>
            </div>
          )}

          {/* Ajans Skoru Kartı */}
          {agencyScore ? (
            <div className="rounded-2xl border border-neutral-850 bg-neutral-950/80 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex items-center gap-5">
                  <ScoreDonut score={agencyScore.overallScore} size={100} />
                  <div>
                    <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1 font-mono">AJANS SKORU</div>
                    <div className={cn('text-2xl font-black', SCORE_TIER_COLORS[getScoreTier(agencyScore.overallScore)])}>
                      {agencyScore.label}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                      {MONTH_LABELS[selectedMonth]} {selectedYear} • {periodCards.filter(c => c.status === 'published').length} çalışan
                    </div>
                  </div>
                </div>

                <div className="sm:ml-auto flex flex-col sm:flex-row gap-6 text-[10px]">
                  {agencyScore.highlights.length > 0 && (
                    <div className="space-y-1">
                      {agencyScore.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          {h}
                        </div>
                      ))}
                    </div>
                  )}
                  {agencyScore.warnings.length > 0 && (
                    <div className="space-y-1">
                      {agencyScore.warnings.map((w, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-amber-400 font-semibold">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          {w}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-800 p-8 text-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Award className="h-10 w-10 text-neutral-700" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-neutral-400">Ajans Skoru Henüz Yok</p>
                  <p className="text-xs">Karne oluşturun ve yayınlayın; ajans skoru otomatik hesaplanacak.</p>
                </div>
              </div>
            </div>
          )}

          {/* Çalışan Karne Tablosu */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Ekip Performans Karnel.
              </h2>
              <span className="text-[10px] text-neutral-600 font-mono">
                {periodCards.length} / {employees.length} oluşturuldu
              </span>
            </div>

            {employees.length === 0 ? (
              <div className="rounded-xl border border-neutral-900 p-8 text-center text-xs text-muted-foreground">
                Sistemde aktif çalışan bulunamadı.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {employees.map(emp => {
                  const card = periodCards.find(c => c.employeeId === emp.id)
                  const tier = card ? getScoreTier(card.overallScore) : null

                  return (
                    <div
                      key={emp.id}
                      className={cn(
                        'rounded-2xl border p-5 space-y-4 transition-all hover:border-neutral-700 cursor-pointer group',
                        card
                          ? 'bg-neutral-950 border-neutral-850'
                          : 'bg-neutral-950/30 border-dashed border-neutral-900'
                      )}
                      onClick={() => card && setSelectedCardId(card.id)}
                    >
                      {/* Çalışan Başlık */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-black text-neutral-400">
                            {emp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">{emp.fullName}</p>
                            <p className="text-[9px] text-neutral-500 font-mono">{emp.title}</p>
                          </div>
                        </div>

                        {card ? (
                          <div className="flex flex-col items-end gap-1">
                            <ScoreDonut score={card.overallScore} size={52} />
                            <Badge className={cn('text-[8px] font-bold rounded-lg px-2 border', SCORE_TIER_BG[tier!], SCORE_TIER_COLORS[tier!])}>
                              {SCORE_TIER_LABELS[tier!]}
                            </Badge>
                          </div>
                        ) : (
                          <div className="text-[9px] text-neutral-600 font-mono text-right">
                            Karne yok
                          </div>
                        )}
                      </div>

                      {/* Boyut Barları */}
                      {card ? (
                        <div className="space-y-2">
                          <DimensionBar label="Disiplin" icon="⏱" score={card.disciplineScore} />
                          <DimensionBar label="Kalite" icon="✨" score={card.qualityScore} />
                          <DimensionBar label="Operasyon" icon="⚙" score={card.operationScore} />
                          <DimensionBar label="Katkı" icon="💡" score={card.contributionScore} />
                          {card.communicationScore !== undefined && (
                            <DimensionBar label="Yönetici" icon="🤝" score={Math.round(
                              ([card.communicationScore, card.teamworkScore, card.initiativeScore, card.problemSolvingScore, card.creativityScore]
                                .filter((s): s is number => s !== undefined)
                                .reduce((a, b) => a + b, 0)) /
                              ([card.communicationScore, card.teamworkScore, card.initiativeScore, card.problemSolvingScore, card.creativityScore]
                                .filter((s): s is number => s !== undefined).length)
                            )} />
                          )}
                        </div>
                      ) : (
                        <div className="text-[10px] text-neutral-600 text-center py-3 border border-dashed border-neutral-900 rounded-xl">
                          "Karne Oluştur" butonuna basın
                        </div>
                      )}

                      {/* Aksiyon Butonları */}
                      {card && (
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1 h-7 text-[10px] font-bold rounded-lg border border-neutral-900 hover:bg-neutral-900"
                            onClick={e => { e.stopPropagation(); setSelectedCardId(card.id) }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Detay
                          </Button>
                          {card.status === 'draft' ? (
                            <Button
                              size="sm"
                              className="flex-1 h-7 text-[10px] font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={e => { e.stopPropagation(); handlePublish(card.id) }}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Yayınla
                            </Button>
                          ) : (
                            <Badge className="flex-1 flex items-center justify-center gap-1 h-7 text-[10px] font-bold bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 rounded-lg">
                              <CheckCircle2 className="h-3 w-3" />
                              Yayında
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Detay Modalı */}
      {selectedCard && isMounted && createPortal(
        <KpiDetailModal
          card={selectedCard}
          employee={getEmployee(selectedCard.employeeId)}
          onClose={() => setSelectedCardId(null)}
          onPublish={handlePublish}
          onSaveManagerScores={async (scores) => {
            await KpiRepository.updateManagerScores(selectedCard.id, scores)
            await loadData()
            toast.success('Yönetici değerlendirmesi kaydedildi')
          }}
        />,
        document.body
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// KPI Detay Modalı
// ---------------------------------------------------------------------------
function KpiDetailModal({
  card,
  employee,
  onClose,
  onPublish,
  onSaveManagerScores,
}: {
  card: KpiCard
  employee: Employee | undefined
  onClose: () => void
  onPublish: (id: string) => void
  onSaveManagerScores: (scores: {
    disciplineScore: number
    qualityScore: number
    operationScore: number
    contributionScore: number
    overallScore: number
    managerReview?: ManagerReview
    deductions?: any[]
  }) => Promise<void>
}) {
  const tier = getScoreTier(card.overallScore)
  const [showManagerForm, setShowManagerForm] = useState(false)
  const [localDeductions, setLocalDeductions] = useState<any[]>(card.deductions || [])
  const [reviewText, setReviewText] = useState({
    strengths: card.managerReview?.strengths?.join('\n') ?? '',
    growthAreas: card.managerReview?.growthAreas?.join('\n') ?? '',
    managerNote: card.managerReview?.managerNote ?? '',
    goals: card.managerReview?.goals?.join('\n') ?? '',
    bonusEligible: card.managerReview?.bonusEligible ?? false,
    promotionFlag: card.managerReview?.promotionFlag ?? false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [reportAchievements, setReportAchievements] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'events' | 'constitution'>('events')

  useEffect(() => {
    async function loadReports() {
      try {
        const allReports = await ReportRepository.getAll()
        const filtered = allReports.filter(r => 
          r.employeeId === card.employeeId && 
          (r.status === 'approved' || r.status === 'submitted') &&
          new Date(r.date).getFullYear() === card.year &&
          new Date(r.date).getMonth() + 1 === card.month
        )
        const achievementsList = filtered.flatMap(r => extractAchievements(r.content))
        // Remove duplicates and trim
        const unique = Array.from(new Set(achievementsList.map(a => a.trim()))).filter(Boolean)
        setReportAchievements(unique)
      } catch (err) {
        console.error('Error loading reports for achievements:', err)
      }
    }
    loadReports()
  }, [card.employeeId, card.year, card.month])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const deductionSum = localDeductions
        .filter(d => d.applied)
        .reduce((sum, d) => sum + d.points, 0)
      const overall = Math.max(0, Math.min(100, 100 + deductionSum))

      const { computeAutoScoresFromDeductions } = await import('@/lib/kpi/kpi-engine')
      const updatedAutoScores = computeAutoScoresFromDeductions(localDeductions)

      await onSaveManagerScores({
        ...updatedAutoScores,
        overallScore: overall,
        deductions: localDeductions,
        managerReview: {
          reviewerEmployeeId: '',
          strengths: reviewText.strengths.split('\n').filter(Boolean),
          growthAreas: reviewText.growthAreas.split('\n').filter(Boolean),
          managerNote: reviewText.managerNote,
          goals: reviewText.goals.split('\n').filter(Boolean),
          bonusEligible: reviewText.bonusEligible,
          promotionFlag: reviewText.promotionFlag,
          reviewedAt: new Date().toISOString(),
        },
      })
      setShowManagerForm(false)
    } finally {
      setIsSaving(false)
    }
  }

  const autoScoreDimensions = [
    { key: 'disciplineScore', label: 'Disiplin', icon: '⏱', score: card.disciplineScore },
    { key: 'qualityScore', label: 'Kalite', icon: '✨', score: card.qualityScore },
    { key: 'operationScore', label: 'Operasyon', icon: '⚙', score: card.operationScore },
    { key: 'contributionScore', label: 'Katkı', icon: '💡', score: card.contributionScore },
  ]

  const managerDimensions = [
    { key: 'communicationScore', label: 'İletişim', icon: '💬' },
    { key: 'teamworkScore', label: 'Takım Çalışması', icon: '🤝' },
    { key: 'initiativeScore', label: 'İnisiyatif', icon: '🚀' },
    { key: 'problemSolvingScore', label: 'Problem Çözme', icon: '🧩' },
    { key: 'creativityScore', label: 'Yaratıcılık', icon: '🎨' },
  ] as const

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-950 border border-neutral-850 rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-neutral-900 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <ScoreDonut score={card.overallScore} size={72} />
            <div>
              <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest font-mono mb-1">
                PERFORMANS KARNESİ
              </div>
              <h2 className="text-base font-black text-white">{employee?.fullName ?? 'Bilinmiyor'}</h2>
              <p className="text-[10px] text-neutral-500 font-mono">{employee?.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge className={cn('text-[9px] font-bold border rounded-lg px-2', SCORE_TIER_BG[tier], SCORE_TIER_COLORS[tier])}>
                  {SCORE_TIER_LABELS[tier]}
                </Badge>
                <Badge className={cn(
                  'text-[9px] font-bold border rounded-lg px-2',
                  card.status === 'published'
                    ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400'
                    : 'bg-neutral-900 border-neutral-850 text-neutral-500'
                )}>
                  {card.status === 'published' ? '● Yayında' : '○ Taslak'}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-xl border border-neutral-900 hover:bg-neutral-900 text-neutral-400 hover:text-white shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6 custom-scrollbar">
          {/* Otomatik Skor Boyutları */}
          <div>
            <h3 className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-3 font-mono">
              OTOMATİK HESAPLANAN BOYUTLAR
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {autoScoreDimensions.map(d => (
                <div key={d.key} className="bg-neutral-900/50 border border-neutral-900 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 font-semibold flex items-center gap-1">
                      <span>{d.icon}</span> {d.label}
                    </span>
                    <span className={cn('text-sm font-black font-mono', SCORE_TIER_COLORS[getScoreTier(d.score)])}>
                      {d.score}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-900 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', SCORE_TIER_BAR[getScoreTier(d.score)])}
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ham Metrikler */}
          <div>
            <h3 className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-3 font-mono">
              HAM METRİKLER
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Tamamlanan', value: card.metrics.totalStepsCompleted, unit: 'görev' },
                { label: 'Zamanında', value: `${card.metrics.onTimeRate}%`, unit: 'teslim' },
                { label: 'Revize', value: card.metrics.revisionCount, unit: 'adet' },
                { label: 'İlk Onay', value: `${card.metrics.firstApprovalRate}%`, unit: 'oran' },
                { label: 'Handoff', value: card.metrics.handoffsSent, unit: 'paslandı' },
                { label: 'Fikir', value: card.metrics.ideasSubmitted, unit: 'üretildi' },
                { label: 'Dönüşüm', value: card.metrics.ideasConverted, unit: 'onaylı fikir' },
                { label: 'Raporlama', value: `${card.metrics.reportComplianceRate}%`, unit: 'uyum' },
              ].map((m, i) => (
                <div key={i} className="bg-neutral-950 border border-neutral-900 rounded-xl p-3 text-center">
                  <div className="text-base font-black text-foreground">{m.value}</div>
                  <div className="text-[8px] text-neutral-500 font-semibold uppercase tracking-wider font-mono">{m.label}</div>
                  <div className="text-[8px] text-neutral-600 font-mono">{m.unit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Rapor Başarı Analizi */}
          {reportAchievements.length > 0 && (
            <div className="bg-neutral-900/20 border border-neutral-900 rounded-xl p-4 space-y-3">
              <h3 className="text-[9px] font-black text-neutral-500 uppercase tracking-widest font-mono">
                RAPORLARDAN OTOMATİK AYIKLANAN BAŞARILAR
              </h3>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar text-[11px]">
                {reportAchievements.map((achievement, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 py-1.5 border-b border-neutral-950 last:border-0">
                    <span className="text-emerald-400 shrink-0 mt-0.5">🚀</span>
                    <span className="text-neutral-300 leading-relaxed">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yönetici Değerlendirmesi */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[9px] font-black text-neutral-500 uppercase tracking-widest font-mono">
                YÖNETİCİ DEĞERLENDİRMESİ
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowManagerForm(!showManagerForm)}
                className="h-7 text-[10px] font-bold rounded-lg border border-neutral-900 hover:bg-neutral-900 gap-1"
              >
                <Star className="h-3 w-3 text-amber-400" />
                {showManagerForm ? 'Kapat' : 'Puan Ver'}
                <ChevronDown className={cn('h-3 w-3 transition-transform', showManagerForm && 'rotate-180')} />
              </Button>
            </div>

            {showManagerForm ? (
              <div className="space-y-4 bg-neutral-900/30 border border-neutral-900 rounded-xl p-4">
                {/* Canlı Skor Simülasyonu */}
                <div className="flex items-center justify-between bg-neutral-950 border border-neutral-900 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-neutral-400">CANLI HESAPLANAN SKOR</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-neutral-500 font-mono">100 Başlangıç + Kesintiler =</span>
                    <span className={cn('text-base font-black font-mono', SCORE_TIER_COLORS[getScoreTier(Math.max(0, Math.min(100, 100 + localDeductions.filter(d => d.applied).reduce((sum, d) => sum + d.points, 0))))])}>
                      {Math.max(0, Math.min(100, 100 + localDeductions.filter(d => d.applied).reduce((sum, d) => sum + d.points, 0)))}
                    </span>
                  </div>
                </div>

                {/* Kesinti Listesi (Checklist) */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-1 font-mono">GÖREV VE HATA KESİNTİLERİ</div>
                  {localDeductions.map(d => {
                    const isAuto = d.source === 'auto'
                    return (
                      <label 
                        key={d.id} 
                        className={cn(
                          "flex items-start gap-3 p-2.5 rounded-xl border transition-all text-left",
                          d.applied 
                            ? "bg-neutral-950 border-neutral-900" 
                            : "bg-neutral-950/20 border-neutral-950 text-neutral-600 hover:border-neutral-900"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={d.applied}
                          disabled={isAuto}
                          onChange={() => {
                            if (!isAuto) {
                              setLocalDeductions(prev =>
                                prev.map(item => item.id === d.id ? { ...item, applied: !item.applied } : item)
                              )
                            }
                          }}
                          className="accent-purple-500 w-3.5 h-3.5 mt-0.5 shrink-0 disabled:opacity-50"
                        />
                        <div className="flex-1 space-y-0.5 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn("text-[11px] font-bold truncate", d.applied ? "text-neutral-200" : "text-neutral-500")}>
                              {d.title}
                            </span>
                            <span className={cn("text-[10px] font-black font-mono shrink-0", d.points > 0 ? "text-emerald-400" : "text-red-400")}>
                              {d.points > 0 ? `+${d.points}` : d.points}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-neutral-500">
                            <span className={cn("font-bold px-1 rounded shrink-0", isAuto ? "bg-purple-950/40 text-purple-400 border border-purple-900/20" : "bg-neutral-900 text-neutral-400 border border-neutral-800")}>
                              {isAuto ? 'Sistem' : 'Yönetici'}
                            </span>
                            <span className="truncate">{d.description}</span>
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>

                <div className="border-t border-neutral-900 pt-4 space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1 font-mono">GÜÇLÜ YÖNLER (her satıra bir madde)</label>
                    <textarea
                      value={reviewText.strengths}
                      onChange={e => setReviewText(prev => ({ ...prev, strengths: e.target.value }))}
                      rows={2}
                      placeholder="Hızlı teslim&#10;Yaratıcı içerik üretimi"
                      className="w-full bg-neutral-950 border border-neutral-900 rounded-xl p-3 text-xs text-foreground placeholder:text-neutral-700 focus:outline-none focus:border-purple-500 resize-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1 font-mono">GELİŞİM ALANLARI</label>
                    <textarea
                      value={reviewText.growthAreas}
                      onChange={e => setReviewText(prev => ({ ...prev, growthAreas: e.target.value }))}
                      rows={2}
                      placeholder="İletişimi güçlendirmeli&#10;Raporlamaya daha fazla özen göstermeli"
                      className="w-full bg-neutral-950 border border-neutral-900 rounded-xl p-3 text-xs text-foreground placeholder:text-neutral-700 focus:outline-none focus:border-purple-500 resize-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1 font-mono">YÖNETİCİ NOTU</label>
                    <textarea
                      value={reviewText.managerNote}
                      onChange={e => setReviewText(prev => ({ ...prev, managerNote: e.target.value }))}
                      rows={2}
                      className="w-full bg-neutral-950 border border-neutral-900 rounded-xl p-3 text-xs text-foreground placeholder:text-neutral-700 focus:outline-none focus:border-purple-500 resize-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1 font-mono">HEDEFLER</label>
                    <textarea
                      value={reviewText.goals}
                      onChange={e => setReviewText(prev => ({ ...prev, goals: e.target.value }))}
                      rows={2}
                      placeholder="Bu çeyrek 25 görevi zamanında tamamla&#10;En az 2 fikir üret"
                      className="w-full bg-neutral-950 border border-neutral-900 rounded-xl p-3 text-xs text-foreground placeholder:text-neutral-700 focus:outline-none focus:border-purple-500 resize-none font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reviewText.bonusEligible}
                        onChange={e => setReviewText(prev => ({ ...prev, bonusEligible: e.target.checked }))}
                        className="accent-purple-500 w-3.5 h-3.5"
                      />
                      <span className="text-[10px] font-bold text-neutral-400">Bonus Uygun</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reviewText.promotionFlag}
                        onChange={e => setReviewText(prev => ({ ...prev, promotionFlag: e.target.checked }))}
                        className="accent-amber-500 w-3.5 h-3.5"
                      />
                      <span className="text-[10px] font-bold text-neutral-400">Terfi Değerlendirmesi</span>
                    </label>
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl h-9 text-xs gap-2"
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  Değerlendirmeyi Kaydet
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
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
                  <div className="bg-neutral-900/30 border border-neutral-900 rounded-xl p-4 space-y-3">
                    <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest font-mono">ROL ANAYASASI (TÜM KPI KURALLARI)</div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar text-[11px]">
                      {localDeductions.map(d => {
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
                    {/* Puan Kesintileri ve Hata Logu */}
                    <div className="bg-neutral-900/30 border border-neutral-900 rounded-xl p-4 space-y-3">
                      <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest font-mono">PUAN KESİNTİLERİ / HATA LOGU</div>
                      
                      <div className="space-y-1.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between text-[10px] text-neutral-400 border-b border-neutral-900 pb-1.5 font-mono">
                          <span>Açıklama</span>
                          <span>Puan Değişimi</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300 py-1">
                          <span className="flex items-center gap-1.5">🏁 Başlangıç Puanı</span>
                          <span className="font-mono text-neutral-400">100</span>
                        </div>

                        {localDeductions.filter(d => d.applied && d.points < 0).length === 0 ? (
                          <div className="text-[10px] text-emerald-400 py-2 font-medium flex items-center gap-1.5">
                            ✓ Kusursuz Performans! Bu dönem hiçbir hata kesintisi bulunmuyor.
                          </div>
                        ) : (
                          localDeductions.filter(d => d.applied && d.points < 0).map(d => (
                            <div key={d.id} className="flex items-center justify-between text-[11px] py-1 border-b border-neutral-900/40">
                              <span className="text-neutral-400 flex items-center gap-2 truncate">
                                <span>🔴</span>
                                <span className="truncate">{d.title}</span>
                              </span>
                              <span className="font-black font-mono text-red-400">
                                {d.points}
                              </span>
                            </div>
                          ))
                        )}

                        <div className="flex items-center justify-between text-[11px] font-black border-t border-neutral-900 pt-2 text-white mt-1">
                          <span>FİNAL KPI SKORU</span>
                          <span className={cn("font-mono text-xs", SCORE_TIER_COLORS[tier])}>{card.overallScore}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pozitif Gelişmeler ve Kazanımlar */}
                    {localDeductions.filter(d => d.applied && d.points > 0).length > 0 && (
                      <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-xl p-4 space-y-2">
                        <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest font-mono">
                          POZİTİF GELİŞMELER & KAZANIMLAR (Puanı etkilemez)
                        </div>
                        <div className="space-y-1.5 max-h-[150px] overflow-y-auto custom-scrollbar">
                          {localDeductions.filter(d => d.applied && d.points > 0).map(d => (
                            <div key={d.id} className="flex items-start gap-2 text-[11px] py-0.5 border-b border-neutral-900/10 last:border-0">
                              <span className="text-emerald-400 shrink-0">🟢</span>
                              <div className="flex-1 text-neutral-300">
                                <span className="font-bold">{d.title}</span>
                                <span className="text-neutral-500 text-[10px] ml-1">({d.description})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Güçlü/Gelişim/Not Özeti */}
                {card.managerReview && (
                  <div className="bg-neutral-900/10 border border-neutral-900 rounded-xl p-4 space-y-2 text-[10px]">
                    <div className="flex items-center justify-between text-neutral-400 border-b border-neutral-900 pb-1.5 font-mono text-[9px]">
                      <span>ÇEYREKLİK DEĞERLENDİRME ÖZETİ</span>
                      <span>{new Date(card.managerReview.reviewedAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                    {card.managerReview.strengths.length > 0 && (
                      <p className="text-neutral-400">
                        <span className="text-neutral-300 font-semibold">💪 Güçlü Yönler: </span>
                        {card.managerReview.strengths.join(', ')}
                      </p>
                    )}
                    {card.managerReview.growthAreas.length > 0 && (
                      <p className="text-neutral-400">
                        <span className="text-neutral-300 font-semibold">📈 Gelişim Alanları: </span>
                        {card.managerReview.growthAreas.join(', ')}
                      </p>
                    )}
                    {card.managerReview.managerNote && (
                      <p className="text-neutral-400">
                        <span className="text-neutral-300 font-semibold">📝 Yönetici Notu: </span>
                        {card.managerReview.managerNote}
                      </p>
                    )}
                    {card.managerReview.goals.length > 0 && (
                      <p className="text-neutral-400">
                        <span className="text-neutral-300 font-semibold">🎯 Hedefler: </span>
                        {card.managerReview.goals.join(', ')}
                      </p>
                    )}
                    <div className="flex items-center gap-3 pt-1">
                      {card.managerReview.bonusEligible && (
                        <Badge className="bg-purple-950/30 border border-purple-500/20 text-purple-400 text-[8px] font-bold rounded-lg px-2">
                          ✓ Bonus Uygun
                        </Badge>
                      )}
                      {card.managerReview.promotionFlag && (
                        <Badge className="bg-amber-950/30 border border-amber-500/20 text-amber-400 text-[8px] font-bold rounded-lg px-2">
                          ✓ Terfi Değerlendirmesi
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-900 flex items-center justify-between gap-3 px-6">
          <span className="text-[9px] text-neutral-600 font-mono">ID: {card.id.slice(0, 8)}</span>
          {card.status === 'draft' && (
            <Button
              onClick={() => onPublish(card.id)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl h-8 text-[10px] px-4 gap-1.5"
            >
              <Send className="h-3 w-3" />
              Çalışana Yayınla
            </Button>
          )}
          {card.status === 'published' && (
            <Badge className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded-lg px-3 py-1.5">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Çalışan Görebiliyor
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
