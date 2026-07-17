'use client'

import { useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Employee, WorkflowStepInstance, WorkflowInstance, WorkflowHistory, Notification, Brand, WorkflowHandoff, Report } from '@/types/domain'
import { getStoredBrands } from '@/lib/storage/local-brand-store'
import { getStoredWorkflowInstances, getWorkflowStepInstances, getStoredWorkflowHistory, updateWorkflowStepInstance } from '@/lib/storage/local-workflow-instance-store'
import { TaskDeliveryModal } from '@/components/shared/task-delivery-modal'
import { getStoredNotifications } from '@/lib/storage/local-notification-store'
import { getStoredHandoffs } from '@/lib/storage/local-handoff-store'
import { getStoredReports } from '@/lib/storage/local-reports-store'
import { progressWorkflowStep } from '@/lib/workflows/progress-workflow'
import { requestApproval } from '@/lib/workflows/approval-workflow'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  Calendar,
  Bell,
  ArrowRightLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ClipboardList,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'

function getLocalDateString() {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  const localDate = new Date(d.getTime() - offset * 60 * 1000)
  return localDate.toISOString().split('T')[0]
}

interface EmployeeDashboardProps {
  employee: Employee
}

export function EmployeeDashboard({ employee }: EmployeeDashboardProps) {
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [instances, setInstances] = useState<WorkflowInstance[]>([])
  const [steps, setSteps] = useState<WorkflowStepInstance[]>([])
  const [handoffs, setHandoffs] = useState<WorkflowHandoff[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'today' | 'handoffs' | 'notifications'>('active')
  const [deliveryModalData, setDeliveryModalData] = useState<{
    stepId: string
    instanceId: string
    title: string
  } | null>(null)
  const [reports, setReports] = useState<Report[]>([])

  const loadData = async () => {
    const storedBrands = await getStoredBrands()
    setBrands(storedBrands)
    const storedInstances = await getStoredWorkflowInstances()
    setInstances(storedInstances)
    const storedSteps = await getWorkflowStepInstances()
    setSteps(storedSteps)
    const storedHandoffs = await getStoredHandoffs()
    setHandoffs(storedHandoffs)
    const storedNotifs = await getStoredNotifications()
    setNotifications(storedNotifs)
    const storedReports = await getStoredReports()
    setReports(storedReports)
  }

  useEffect(() => {
    loadData()
  }, [employee.id])

  // Filter tasks assigned to this employee
  const mySteps = useMemo(() => {
    const active = steps.filter((s) => s.assignedEmployeeId === employee.id && s.status === 'active')
    const pending = steps.filter((s) => s.assignedEmployeeId === employee.id && s.status === 'pending')
    
    // Check which ones are due today
    const todayStr = new Date().toISOString().split('T')[0]
    const today = active.filter((s) => s.dueDate && s.dueDate.startsWith(todayStr))
    
    return { active, pending, today }
  }, [steps, employee.id])

  // Filter pending handoffs sent to this employee
  const pendingHandoffsCount = useMemo(() => {
    return handoffs.filter((h) => h.toEmployeeId === employee.id && h.status === 'pending').length
  }, [handoffs, employee.id])

  const hasDailyReportToday = useMemo(() => {
    const todayDateStr = getLocalDateString()
    return reports.some(
      (r) =>
        r.employeeId === employee.id &&
        r.type === 'daily' &&
        r.date === todayDateStr
    )
  }, [reports, employee.id])

  // Filter unread notifications
  const unreadNotifications = useMemo(() => {
    return notifications
      .filter((n) => n.recipientEmployeeId === employee.id && !n.isRead)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [notifications, employee.id])

  // Blinking Alerts for handoffs or new active step activations
  const blinkingAlerts = useMemo(() => {
    return unreadNotifications.filter(
      (n) => n.type === 'handoff_requested' || n.type === 'step_activated' || n.type === 'workflow_assigned'
    )
  }, [unreadNotifications])

  // Get brand name helper
  const getBrandName = (brandId: string) => {
    const b = brands.find((x) => x.id === brandId)
    return b ? b.name : 'Marka'
  }

  // Get instance title helper
  const getInstanceTitle = (instanceId: string) => {
    const inst = instances.find((x) => x.id === instanceId)
    return inst ? inst.title : 'İş Akışı'
  }

  // Quick Action handlers on Dashboard
  const handleCompleteStep = async (stepId: string, instanceId: string, isApproval: boolean) => {
    setIsSubmitting(true)
    try {
      if (isApproval) {
        requestApproval({
          workflowInstanceId: instanceId,
          stepInstanceId: stepId,
          requestedByEmployeeId: employee.id,
          note: 'Onay talep ediliyor.',
        })
        toast.success('Onay talebi gönderildi.')
      } else {
        progressWorkflowStep({
          workflowInstanceId: instanceId,
          stepInstanceId: stepId,
          action: 'complete',
          actorEmployeeId: employee.id,
        })
        toast.success('İş adımı başarıyla tamamlandı.')
      }
      loadData()
    } catch (err: any) {
      toast.error('İşlem gerçekleştirilemedi', { description: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeliveryConfirm = async (deliveryNote: string, links: string[], files: string[]) => {
    if (!deliveryModalData) return
    const { stepId, instanceId } = deliveryModalData
    setDeliveryModalData(null)
    setIsSubmitting(true)
    try {
      const stepObj = steps.find((s) => s.id === stepId)
      if (stepObj) {
        const formattedNote = `\n\n[Teslim Açıklaması]: ${deliveryNote}` +
          (links.length > 0 ? `\n[Fotoğraf/Görsel Bağlantıları]: ${links.join(', ')}` : '') +
          (files.length > 0 ? `\n[Dosya Bağlantıları]: ${files.join(', ')}` : '')

        const updatedStep = {
          ...stepObj,
          description: `${stepObj.description}${formattedNote}`
        }
        await updateWorkflowStepInstance(updatedStep)
      }

      await progressWorkflowStep({
        workflowInstanceId: instanceId,
        stepInstanceId: stepId,
        action: 'complete',
        actorEmployeeId: employee.id,
      })
      toast.success('Görev teslim edildi ve tamamlandı.')
      loadData()
    } catch (err: any) {
      toast.error('İşlem gerçekleştirilemedi', { description: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCompleteClick = (stepId: string, instanceId: string, title: string, isApproval: boolean) => {
    if (isApproval) {
      handleCompleteStep(stepId, instanceId, true)
    } else {
      setDeliveryModalData({ stepId, instanceId, title })
    }
  }

  const renderTaskList = () => {
    switch (activeTab) {
      case 'active':
        if (mySteps.active.length === 0) {
          return (
            <div className="rounded-2xl border border-dashed border-neutral-850 p-8 text-center text-xs text-muted-foreground bg-neutral-950/[0.02]">
              Üzerinizde şu an aktif bir iş bulunmuyor. Harika bir iş çıkardınız!
            </div>
          )
        }
        return (
          <div className="grid gap-3">
            {mySteps.active.slice(0, 4).map((step) => {
              const brandName = getBrandName(
                instances.find((i) => i.id === step.workflowInstanceId)?.brandId || ''
              )
              const instanceTitle = getInstanceTitle(step.workflowInstanceId)
              return (
                <div
                  key={step.id}
                  className="rounded-2xl border border-neutral-900 bg-card/20 p-4 hover:border-neutral-800 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                      <span>{brandName}</span>
                      <span>•</span>
                      <span>{instanceTitle}</span>
                    </div>
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Play className="h-3 w-3 text-blue-500 animate-pulse" />
                      {step.title}
                    </h4>
                    {step.description && (
                      <p className="text-[10px] text-muted-foreground max-w-[340px] truncate">
                        {step.description}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    disabled={isSubmitting || step.handoffStatus === 'pending'}
                    onClick={() => handleCompleteClick(step.id, step.workflowInstanceId, step.title, step.requiresApproval)}
                    className={`text-white font-semibold text-[10px] h-7 px-3.5 rounded-lg shrink-0 ${
                      step.requiresApproval ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {step.requiresApproval ? 'Onaya Gönder' : 'Tamamla'}
                  </Button>
                </div>
              )
            })}
          </div>
        )

      case 'today':
        if (mySteps.today.length === 0) {
          return (
            <div className="rounded-2xl border border-dashed border-neutral-850 p-8 text-center text-xs text-muted-foreground bg-neutral-950/[0.02]">
              Bugün teslim etmeniz gereken bir iş bulunmuyor. Rahat bir nefes alabilirsiniz!
            </div>
          )
        }
        return (
          <div className="grid gap-3">
            {mySteps.today.slice(0, 4).map((step) => {
              const brandName = getBrandName(
                instances.find((i) => i.id === step.workflowInstanceId)?.brandId || ''
              )
              const instanceTitle = getInstanceTitle(step.workflowInstanceId)
              return (
                <div
                  key={step.id}
                  className="rounded-2xl border border-neutral-900 bg-card/20 p-4 hover:border-neutral-800 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                      <span>{brandName}</span>
                      <span>•</span>
                      <span>{instanceTitle}</span>
                    </div>
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      {step.title}
                    </h4>
                    {step.description && (
                      <p className="text-[10px] text-muted-foreground max-w-[340px] truncate">
                        {step.description}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    disabled={isSubmitting || step.handoffStatus === 'pending'}
                    onClick={() => handleCompleteClick(step.id, step.workflowInstanceId, step.title, step.requiresApproval)}
                    className="text-white font-semibold text-[10px] h-7 px-3.5 rounded-lg shrink-0 bg-amber-600 hover:bg-amber-700"
                  >
                    {step.requiresApproval ? 'Onaya Gönder' : 'Tamamla'}
                  </Button>
                </div>
              )
            })}
          </div>
        )

      case 'handoffs':
        const myHandoffs = handoffs.filter((h) => h.toEmployeeId === employee.id && h.status === 'pending')
        if (myHandoffs.length === 0) {
          return (
            <div className="rounded-2xl border border-dashed border-neutral-850 p-8 text-center text-xs text-muted-foreground bg-neutral-950/[0.02]">
              Kabul etmenizi bekleyen paslanan bir iş bulunmuyor.
            </div>
          )
        }
        return (
          <div className="grid gap-3">
            {myHandoffs.map((h) => {
              const step = steps.find((s) => s.id === h.workflowStepInstanceId)
              const stepTitle = step ? step.title : 'İş Adımı'
              const brandName = getBrandName(
                instances.find((i) => i.id === h.workflowInstanceId)?.brandId || ''
              )
              return (
                <div
                  key={h.id}
                  className="rounded-2xl border border-neutral-900 bg-card/20 p-4 hover:border-neutral-800 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                      <span>{brandName}</span>
                      <span>•</span>
                      <span>Devir Talebi</span>
                    </div>
                    <h4 className="text-xs font-bold text-foreground">
                      {stepTitle}
                    </h4>
                    {h.note && (
                      <p className="text-[10px] text-muted-foreground">
                        Not: "{h.note}"
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={() => router.push('/my-work')}
                    className="text-white font-semibold text-[10px] h-7 px-3.5 rounded-lg shrink-0 bg-purple-600 hover:bg-purple-700"
                  >
                    Benim İşlerime Git
                  </Button>
                </div>
              )
            })}
          </div>
        )

      case 'notifications':
        if (unreadNotifications.length === 0) {
          return (
            <div className="rounded-2xl border border-dashed border-neutral-850 p-8 text-center text-xs text-muted-foreground bg-neutral-950/[0.02]">
              Okunmamış bildiriminiz bulunmuyor.
            </div>
          )
        }
        return (
          <div className="grid gap-3">
            {unreadNotifications.slice(0, 4).map((notif) => (
              <div
                key={notif.id}
                className="rounded-2xl border border-neutral-900 bg-card/20 p-4 hover:border-neutral-800 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-purple-400 block uppercase tracking-wider">BİLDİRİM</span>
                  <h4 className="text-xs font-bold text-foreground font-semibold">
                    {notif.title}
                  </h4>
                  <p className="text-[10px] text-neutral-300">
                    {notif.message}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => router.push('/notifications')}
                  className="text-white font-semibold text-[10px] h-7 px-3.5 rounded-lg shrink-0 bg-neutral-800 hover:bg-neutral-700"
                >
                  Bildirimler Sayfasına Git
                </Button>
              </div>
            ))}
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Günlük Rapor Eksik Bannerı */}
      {!hasDailyReportToday && (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/[0.08] to-purple-500/[0.08] p-5 backdrop-blur-md relative overflow-hidden animate-pulse ring-2 ring-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-amber-500/25 border border-amber-500/35 p-2 rounded-xl shrink-0 animate-bounce">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                ⚠️ Günlük Rapor Eksik!
              </h4>
              <p className="text-[11px] text-neutral-300 leading-normal max-w-xl">
                Bugün için günlük raporunuzu henüz yazmadınız. İş kuralları gereği her gün sonunda rapor eklenmesi zorunludur.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => router.push('/reports')}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-lg shrink-0 transition-all hover:scale-105 duration-200"
          >
            Şimdi Rapor Yaz
          </Button>
        </div>
      )}

      {/* Blinking Alert Banner */}
      {blinkingAlerts.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/[0.08] to-purple-500/[0.08] p-5 backdrop-blur-md relative overflow-hidden animate-pulse ring-2 ring-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-amber-500/25 border border-amber-500/35 p-2 rounded-xl shrink-0 animate-bounce">
              <Bell className="h-5 w-5 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                🚨 Yeni Görev veya Devir Talebi Var!
              </h4>
              <p className="text-[11px] text-neutral-300 leading-normal max-w-xl">
                Size atanmış yeni bir iş adımı veya onaylamanızı bekleyen paslanmış bir görev bulunuyor. Lütfen işlerinizin aksamaması için kontrol edin.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              const hasHandoff = blinkingAlerts.some(a => a.type === 'handoff_requested')
              if (hasHandoff) {
                setActiveTab('handoffs')
              } else {
                router.push('/my-work')
              }
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-lg shrink-0 transition-all hover:scale-105 duration-200"
          >
            Detayları Gör
          </Button>
        </div>
      )}

      {/* Karşılama Kartı */}
      <div className="rounded-2xl border border-purple-500/10 bg-gradient-to-r from-purple-500/[0.03] to-blue-500/[0.03] p-6 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1.5 relative">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
            Merhaba, {employee.fullName}!
          </h2>
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            Bugün sorumluluğunuzda olan iş adımlarını ve gelen bildirimlerinizi buradan yönetebilirsiniz. 
            Rolünüz: <span className="font-bold text-purple-400">{employee.title || 'Ajans Sorumlusu'}</span>.
          </p>
        </div>
      </div>

      {/* İstatistik Metrikleri */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          onClick={() => setActiveTab('active')}
          className={cn(
            "rounded-2xl border bg-card/45 shadow-sm backdrop-blur-md hover:border-neutral-800 transition-all cursor-pointer select-none",
            activeTab === 'active'
              ? "border-purple-500 bg-purple-500/[0.03] ring-1 ring-purple-500/20"
              : "border-transparent"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Aktif İşlerim</span>
            <Play className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mySteps.active.length}</div>
            <p className="text-[9px] text-muted-foreground mt-1">Sorumlu olduğunuz yayındaki adımlar</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab('today')}
          className={cn(
            "rounded-2xl border bg-card/45 shadow-sm backdrop-blur-md hover:border-neutral-800 transition-all cursor-pointer select-none",
            activeTab === 'today'
              ? "border-amber-500 bg-amber-500/[0.03] ring-1 ring-amber-500/20"
              : "border-transparent"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bugün Teslim</span>
            <Calendar className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mySteps.today.length}</div>
            <p className="text-[9px] text-muted-foreground mt-1">Bugün bitmesi planlanan işler</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab('handoffs')}
          className={cn(
            "rounded-2xl border bg-card/45 shadow-sm backdrop-blur-md hover:border-neutral-800 transition-all cursor-pointer select-none",
            activeTab === 'handoffs'
              ? "border-emerald-500 bg-emerald-500/[0.03] ring-1 ring-emerald-500/20"
              : "border-transparent"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bana Paslananlar</span>
            <ArrowRightLeft className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingHandoffsCount}</div>
            <p className="text-[9px] text-muted-foreground mt-1">Kabul edilmeyi bekleyen devir talepleri</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab('notifications')}
          className={cn(
            "rounded-2xl border bg-card/45 shadow-sm backdrop-blur-md hover:border-neutral-800 transition-all cursor-pointer select-none",
            activeTab === 'notifications'
              ? "border-purple-500 bg-purple-500/[0.03] ring-1 ring-purple-500/20"
              : "border-transparent"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Yeni Bildirimler</span>
            <Bell className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadNotifications.length}</div>
            <p className="text-[9px] text-muted-foreground mt-1">Okunmamış son güncellemeler</p>
          </CardContent>
        </Card>
      </div>

      {/* İki Kolonlu Panel */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Sol taraf: Öncelikli İşler Listesi */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-purple-500" />
              {activeTab === 'active' && 'Öncelikli Aktif İşlerim'}
              {activeTab === 'today' && 'Bugün Teslim Edilecek İşlerim'}
              {activeTab === 'handoffs' && 'Bana Paslanan Devir Talepleri'}
              {activeTab === 'notifications' && 'Yeni Bildirimlerim'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (activeTab === 'notifications') {
                  router.push('/notifications')
                } else {
                  router.push('/my-work')
                }
              }}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              Hepsini Gör <ArrowRight className="h-3 w-3" />
            </Button>
          </div>

          {renderTaskList()}
        </div>

        {/* Sağ taraf: Son Bildirimler & Hızlı Linkler */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-purple-500" />
              Son Bildirimler
            </h3>

            {unreadNotifications.length > 0 ? (
              <div className="grid gap-2.5">
                {unreadNotifications.slice(0, 4).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => router.push('/notifications')}
                    className="rounded-xl border border-neutral-900 bg-card/10 p-3 hover:border-neutral-800 transition-colors cursor-pointer space-y-0.5"
                  >
                    <span className="font-bold text-[10px] text-foreground block truncate">
                      {notif.title}
                    </span>
                    <span className="text-[9px] text-muted-foreground block line-clamp-2 leading-relaxed">
                      {notif.message}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-neutral-900 p-6 text-center text-[10px] text-muted-foreground bg-neutral-950/[0.02]">
                Yeni bir güncelleme bulunmuyor.
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Görev Teslim Modalı */}
      {deliveryModalData && (
        <TaskDeliveryModal
          isOpen={!!deliveryModalData}
          onClose={() => setDeliveryModalData(null)}
          onConfirm={handleDeliveryConfirm}
          taskTitle={deliveryModalData.title}
        />
      )}
    </div>
  )
}
