'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type {
  Employee,
  Brand,
  CreativeProductionCredit,
  CreativeProductionFilter,
  CreativeProductionSummary,
} from '@/types/domain'
import { getStoredEmployees, getActiveEmployeeId } from '@/lib/storage/local-employee-store'
import { getStoredBrands } from '@/lib/storage/local-brand-store'
import { usePrincipal, isManagerOrAdmin, resolveVisibleBrandIds } from '@/lib/permissions/panel-authority'
import { getCreativeProductionReport } from '@/lib/services/creative-production-reporting'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sparkles,
  Layers,
  Building,
  User,
  Calendar,
  Clock,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Palette,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function CreativeProductionPage() {
  const { principal, activeEmployee: contextActiveEmployee } = usePrincipal()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  // Filters State
  const [selectedPreset, setSelectedPreset] = useState<
    'today' | 'this_week' | 'this_month' | 'prev_month' | 'all_time' | 'custom'
  >('this_month')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('00:00')
  const [endDate, setEndDate] = useState<string>('')
  const [endTime, setEndTime] = useState<string>('23:59')

  // Summary Data State
  const [summary, setSummary] = useState<CreativeProductionSummary>({
    completedJobCount: 0,
    completedCreativeCount: 0,
    employeeBreakdown: [],
    credits: [],
  })

  // Load Employees and Brands
  const loadBaseData = useCallback(async () => {
    setIsLoading(true)
    const empList = await getStoredEmployees()
    const brandList = await getStoredBrands()
    setEmployees(empList)
    setBrands(brandList)

    if (contextActiveEmployee) {
      setCurrentEmployeeId(contextActiveEmployee.id)
    } else {
      const savedId = getActiveEmployeeId()
      if (savedId && empList.some((e) => e.id === savedId)) {
        setCurrentEmployeeId(savedId)
      } else if (empList.length > 0) {
        setCurrentEmployeeId(empList[0].id)
      }
    }
    setIsLoading(false)
  }, [contextActiveEmployee])

  useEffect(() => {
    loadBaseData()
  }, [loadBaseData])

  const currentEmployee = useMemo(() => {
    if (contextActiveEmployee) return contextActiveEmployee
    return employees.find((e) => e.id === currentEmployeeId)
  }, [contextActiveEmployee, employees, currentEmployeeId])

  // Is current user a Graphic Designer (Worker) or Manager
  const isGraphicDesigner = currentEmployee?.rolePackageId === 'grafik-tasarim'
  const isManager =
    principal.isDedicatedAdmin ||
    currentEmployee?.rolePackageId === 'kreatif-yonetim' ||
    currentEmployee?.rolePackageId === 'kreatif-direktor' ||
    currentEmployee?.rolePackageId === 'art-director' ||
    currentEmployee?.rolePackageId === 'operasyon-yonetimi' ||
    currentEmployee?.rolePackageId === 'ajans-yonetimi' ||
    currentEmployee?.rolePackageId === 'admin'

  // Eligible Designers for Manager Scope
  const allowedDesigners = useMemo(() => {
    if (isGraphicDesigner) {
      return employees.filter((e) => e.id === currentEmployee?.id)
    }
    return employees.filter(
      (e) =>
        e.employeeStatus === 'active' &&
        (e.rolePackageId === 'grafik-tasarim' ||
          e.rolePackageId === 'video-kurgu' ||
          e.teamIds?.includes('grafik-studyo'))
    )
  }, [employees, isGraphicDesigner, currentEmployee])

  const allowedDesignerIds = useMemo(() => {
    return new Set(allowedDesigners.map((d) => d.id))
  }, [allowedDesigners])

  // Fetch Report Data
  const loadReport = useCallback(async () => {
    const filter: CreativeProductionFilter = {
      preset: selectedPreset,
      employeeId: isGraphicDesigner
        ? currentEmployee?.id
        : selectedEmployeeId === 'all'
        ? undefined
        : selectedEmployeeId,
      startDate: selectedPreset === 'custom' ? startDate : undefined,
      startTime: selectedPreset === 'custom' ? startTime : undefined,
      endDate: selectedPreset === 'custom' ? endDate : undefined,
      endTime: selectedPreset === 'custom' ? endTime : undefined,
    }

    const report = await getCreativeProductionReport(
      filter,
      isGraphicDesigner && currentEmployee ? [currentEmployee.id] : allowedDesignerIds,
      employees
    )
    setSummary(report)
  }, [
    selectedPreset,
    selectedEmployeeId,
    startDate,
    startTime,
    endDate,
    endTime,
    isGraphicDesigner,
    currentEmployee,
    allowedDesignerIds,
    employees,
  ])

  useEffect(() => {
    if (currentEmployee) {
      loadReport()
    }
  }, [loadReport, currentEmployee])

  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const getBrandDisplayName = (brandId?: string | null) => {
    if (!brandId || brandId === 'general' || brandId === 'general-agency' || brandId === 'general-brand') {
      return 'Genel Ajans'
    }
    const b = brands.find((brand) => brand.id === brandId)
    return b ? b.name : 'Genel Ajans'
  }

  const getEmployeeDisplayName = (empId: string) => {
    const emp = employees.find((e) => e.id === empId)
    return emp ? emp.fullName : 'Bilinmeyen Tasarımcı'
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Palette className="h-6 w-6 text-purple-400" />
            Kreatif Üretim Muhasebesi & Raporu
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isGraphicDesigner
              ? 'Onaylanmış kreatif üretim adetlerinizi ve dönemsel istatistiklerinizi inceleyin.'
              : 'Grafik tasarım ekibinin onaylanmış kesin üretim adetlerini ve iş bazlı raporlamalarını inceleyin.'}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border bg-card/30 backdrop-blur-md rounded-2xl shadow-sm overflow-hidden">
        <CardContent className="p-5 space-y-4">
          {/* Quick Presets Buttons */}
          <div className="flex items-center gap-2 flex-wrap pb-3 border-b border-neutral-850">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mr-2">
              <Calendar className="h-3.5 w-3.5" />
              Dönem:
            </span>
            <Button
              type="button"
              size="sm"
              variant={selectedPreset === 'today' ? 'default' : 'outline'}
              onClick={() => setSelectedPreset('today')}
              className={cn(
                'h-8 text-xs font-bold rounded-xl px-3',
                selectedPreset === 'today' && 'bg-purple-600 hover:bg-purple-700 text-white'
              )}
            >
              Bugün
            </Button>
            <Button
              type="button"
              size="sm"
              variant={selectedPreset === 'this_week' ? 'default' : 'outline'}
              onClick={() => setSelectedPreset('this_week')}
              className={cn(
                'h-8 text-xs font-bold rounded-xl px-3',
                selectedPreset === 'this_week' && 'bg-purple-600 hover:bg-purple-700 text-white'
              )}
            >
              Bu Hafta
            </Button>
            <Button
              type="button"
              size="sm"
              variant={selectedPreset === 'this_month' ? 'default' : 'outline'}
              onClick={() => setSelectedPreset('this_month')}
              className={cn(
                'h-8 text-xs font-bold rounded-xl px-3',
                selectedPreset === 'this_month' && 'bg-purple-600 hover:bg-purple-700 text-white'
              )}
            >
              Bu Ay
            </Button>
            <Button
              type="button"
              size="sm"
              variant={selectedPreset === 'prev_month' ? 'default' : 'outline'}
              onClick={() => setSelectedPreset('prev_month')}
              className={cn(
                'h-8 text-xs font-bold rounded-xl px-3',
                selectedPreset === 'prev_month' && 'bg-purple-600 hover:bg-purple-700 text-white'
              )}
            >
              Geçen Ay
            </Button>
            <Button
              type="button"
              size="sm"
              variant={selectedPreset === 'all_time' ? 'default' : 'outline'}
              onClick={() => setSelectedPreset('all_time')}
              className={cn(
                'h-8 text-xs font-bold rounded-xl px-3',
                selectedPreset === 'all_time' && 'bg-purple-600 hover:bg-purple-700 text-white'
              )}
            >
              Tüm Zamanlar (Aktivasyondan İtibaren)
            </Button>
            <Button
              type="button"
              size="sm"
              variant={selectedPreset === 'custom' ? 'default' : 'outline'}
              onClick={() => setSelectedPreset('custom')}
              className={cn(
                'h-8 text-xs font-bold rounded-xl px-3',
                selectedPreset === 'custom' && 'bg-purple-600 hover:bg-purple-700 text-white'
              )}
            >
              Özel Tarih Aralığı
            </Button>
          </div>

          {/* Historical Coverage Disclosure */}
          <div className="flex items-center gap-2 p-2.5 px-3 rounded-xl bg-purple-950/20 border border-purple-800/30 text-[11px] text-purple-300">
            <span className="font-bold">ℹ️ Kapsam Bilgisi:</span>
            <span>Üretim kayıtları kesinleşmiş sistem aktivasyon tarihinden itibaren tutulmaktadır. Eski tamamlanan işler için geriye dönük mutabakat planlanmaktadır.</span>
          </div>

          {/* Detailed Filters Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
            {/* Employee Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Çalışan / Tasarımcı
              </label>
              {isGraphicDesigner ? (
                <div className="flex items-center gap-2 h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs font-bold text-white">
                  <User className="h-3.5 w-3.5 text-purple-400" />
                  {currentEmployee?.fullName} (Kendi Hesabınız)
                </div>
              ) : (
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                  <SelectTrigger className="h-9 text-xs border-neutral-800 bg-neutral-900/50 rounded-xl">
                    <SelectValue placeholder="Tüm Tasarımcılar" />
                  </SelectTrigger>
                  <SelectContent className="z-[99999]">
                    <SelectItem value="all" className="text-xs font-bold">
                      👥 Tüm Tasarımcılar ({allowedDesigners.length})
                    </SelectItem>
                    {allowedDesigners.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id} className="text-xs">
                        {emp.fullName} {emp.employmentType === 'freelance' ? '(Freelance)' : '(Tam Zamanlı)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Custom Date Filters */}
            {selectedPreset === 'custom' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Başlangıç Tarihi & Saati
                  </label>
                  <div className="flex gap-1.5">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-9 text-xs border-neutral-800 bg-neutral-900/50 rounded-xl flex-1"
                    />
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="h-9 text-xs border-neutral-800 bg-neutral-900/50 rounded-xl w-24"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Bitiş Tarihi & Saati
                  </label>
                  <div className="flex gap-1.5">
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-9 text-xs border-neutral-800 bg-neutral-900/50 rounded-xl flex-1"
                    />
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="h-9 text-xs border-neutral-800 bg-neutral-900/50 rounded-xl w-24"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <Card className="rounded-2xl border bg-card/30 backdrop-blur-md shadow-sm border-purple-500/20 bg-purple-500/[0.02]">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Tamamlanan İş Adedi
              </span>
              <div className="text-3xl font-black text-foreground">{summary.completedJobCount}</div>
              <p className="text-[10px] text-muted-foreground">
                Onaylanmış ve kesinleşmiş iş adımları sayısı
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-card/30 backdrop-blur-md shadow-sm border-emerald-500/20 bg-emerald-500/[0.02]">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                Tamamlanan Kreatif Adedi
              </span>
              <div className="text-3xl font-black text-emerald-300">
                🎨 {summary.completedCreativeCount}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Üretilen toplam görsel ve tasarım sayısı (creative_count toplamı)
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Palette className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Breakdown Table (Only for Managers when All Employees or multiple designers are visible) */}
      {!isGraphicDesigner && selectedEmployeeId === 'all' && summary.employeeBreakdown.length > 0 && (
        <Card className="rounded-2xl border bg-card/30 backdrop-blur-md shadow-sm overflow-hidden">
          <CardHeader className="p-5 border-b border-neutral-850">
            <CardTitle className="text-sm font-black text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-purple-400" />
              Tasarımcı Bazlı Üretim Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-900/60 text-muted-foreground font-bold uppercase tracking-wider border-b border-neutral-850">
                  <tr>
                    <th className="px-5 py-3">Tasarımcı</th>
                    <th className="px-5 py-3">Çalışma Tipi</th>
                    <th className="px-5 py-3 text-right">Tamamlanan İş</th>
                    <th className="px-5 py-3 text-right">Tamamlanan Kreatif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {summary.employeeBreakdown.map((row) => (
                    <tr key={row.employeeId} className="hover:bg-neutral-900/30 transition-colors">
                      <td className="px-5 py-3 font-bold text-white flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-neutral-500" />
                        {row.employeeName}
                      </td>
                      <td className="px-5 py-3">
                        {row.employmentType === 'freelance' ? (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[9px] font-bold"
                          >
                            Freelance
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[9px] font-bold"
                          >
                            Tam Zamanlı
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-neutral-300">
                        {row.completedJobCount} İş
                      </td>
                      <td className="px-5 py-3 text-right font-black text-emerald-400">
                        🎨 {row.completedCreativeCount} Adet
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Ledger Table */}
      <Card className="rounded-2xl border bg-card/30 backdrop-blur-md shadow-sm overflow-hidden">
        <CardHeader className="p-5 border-b border-neutral-850 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-black text-foreground flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-purple-400" />
            Üretim Defteri (Kesinleşmiş Kayıtlar - {summary.credits.length})
          </CardTitle>
          <Badge variant="outline" className="text-[10px] text-muted-foreground font-bold">
            En Yeniden En Eskiye
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {summary.credits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-900/60 text-muted-foreground font-bold uppercase tracking-wider border-b border-neutral-850">
                  <tr>
                    <th className="px-5 py-3">Onay Tarihi & Saati</th>
                    <th className="px-5 py-3">Grafik Tasarımcı</th>
                    <th className="px-5 py-3">Marka / Context</th>
                    <th className="px-5 py-3">Görev / İş Akışı</th>
                    <th className="px-5 py-3 text-center">Kreatif Adedi</th>
                    <th className="px-5 py-3">Onaylayan (Art Director)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {summary.credits.map((credit) => (
                    <tr key={credit.id} className="hover:bg-neutral-900/30 transition-colors">
                      <td className="px-5 py-3 text-neutral-300 font-medium whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-neutral-500" />
                          {formatDateTime(credit.creditedAt)}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-bold text-white whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <User className="h-3 w-3 text-neutral-400" />
                          {getEmployeeDisplayName(credit.designerEmployeeId)}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-neutral-300 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Building className="h-3 w-3 text-neutral-500" />
                          {getBrandDisplayName(credit.brandId)}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-bold text-foreground">
                        <span className="block truncate max-w-xs">{credit.taskTitle || 'Görev Adımı'}</span>
                        {credit.workflowTitle && (
                          <span className="block text-[10px] text-muted-foreground truncate max-w-xs">
                            {credit.workflowTitle}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <Badge
                          variant="outline"
                          className="bg-emerald-950/40 text-emerald-300 border-emerald-700/50 font-black text-xs px-2.5 py-0.5"
                        >
                          🎨 {credit.creativeCount}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-neutral-400 whitespace-nowrap">
                        {credit.reviewerEmployeeId ? (
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="h-3 w-3 text-indigo-400" />
                            {getEmployeeDisplayName(credit.reviewerEmployeeId)}
                          </span>
                        ) : (
                          'Art Director Onaylı'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
              <Palette className="h-8 w-8 mx-auto text-neutral-600 mb-2" />
              <div className="font-bold text-white">Seçili dönemde onaylanmış kreatif üretim kaydı bulunamadı.</div>
              <p>Yalnızca Art Director tarafından final onayı verilmiş işler üretim defterinde listelenir.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
