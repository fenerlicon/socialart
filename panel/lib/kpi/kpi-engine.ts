import type {
  KpiCard,
  KpiMetrics,
  WorkflowStepInstance,
  WorkflowApproval,
  WorkflowHandoff,
  Idea,
  Report,
  KpiDeductionLog,
} from '@/types/domain'
import { v4 as uuidv4 } from 'uuid'

// ---------------------------------------------------------------------------
// Yardımcı — Oran hesabı (0 bölme koruması)
// ---------------------------------------------------------------------------
function rate(numerator: number, denominator: number): number {
  if (denominator === 0) return 100 // Hiç işlem yapılmamışsa ceza vermiyoruz
  return Math.min(100, Math.round((numerator / denominator) * 100))
}

// ---------------------------------------------------------------------------
// Ham Metrik Hesaplama
// ---------------------------------------------------------------------------

export function computeMetrics(params: {
  steps: WorkflowStepInstance[]
  approvals: WorkflowApproval[]
  handoffs: WorkflowHandoff[]
  ideas: Idea[]
  reports: Report[]
  employeeId: string
  year: number
  month: number
}): KpiMetrics {
  const { steps, approvals, handoffs, ideas, reports, employeeId, year, month } = params

  // Dönem filtresi: sadece ilgili ay/yıl
  const inPeriod = (dateStr: string | undefined) => {
    if (!dateStr) return false
    const d = new Date(dateStr)
    return d.getFullYear() === year && d.getMonth() + 1 === month
  }

  // Çalışanın tamamladığı adımlar
  const mySteps = steps.filter(
    (s) =>
      s.assignedEmployeeId === employeeId &&
      s.status === 'completed' &&
      inPeriod(s.completedAt)
  )

  const totalStepsCompleted = mySteps.length

  // Zamanında / geç teslim
  let stepsOnTime = 0
  let stepsLate = 0
  let totalCompletionHours = 0

  for (const step of mySteps) {
    const completedAt = step.completedAt ? new Date(step.completedAt) : null
    const dueDate = step.dueDate ? new Date(step.dueDate) : null
    const startedAt = step.startedAt ? new Date(step.startedAt) : null

    if (completedAt && dueDate) {
      if (completedAt <= dueDate) stepsOnTime++
      else stepsLate++
    } else {
      stepsOnTime++ // due date yoksa ceza vermiyoruz
    }

    if (completedAt && startedAt) {
      const hours = (completedAt.getTime() - startedAt.getTime()) / (1000 * 60 * 60)
      totalCompletionHours += hours
    }
  }

  const avgCompletionHours =
    totalStepsCompleted > 0 ? Math.round(totalCompletionHours / totalStepsCompleted) : 0

  // Onay metrikleri
  const myApprovals = approvals.filter(
    (a) => a.requestedByEmployeeId === employeeId && inPeriod(a.createdAt)
  )
  const totalApprovalCount = myApprovals.length

  // İlk seferde doğrudan onaylananlar (revision_requested veya rejected olmamış)
  const firstTimeApprovalCount = myApprovals.filter((a) => a.status === 'approved' && !a.revisionNote).length
  const revisionCount = myApprovals.filter(
    (a) => a.status === 'revision_requested' || a.status === 'rejected'
  ).length

  // Handoff metrikleri
  const handoffsSent = handoffs.filter(
    (h) => h.fromEmployeeId === employeeId && inPeriod(h.createdAt)
  ).length
  const handoffsReceived = handoffs.filter(
    (h) => h.toEmployeeId === employeeId && inPeriod(h.createdAt) && h.status === 'accepted'
  ).length

  // Fikir Merkezi
  const myIdeas = ideas.filter((i) => i.creatorId === employeeId && inPeriod(i.createdAt))
  const ideasSubmitted = myIdeas.length
  const ideasConverted = myIdeas.filter((i) => i.status === 'converted').length

  // Raporlama
  const myReports = reports.filter((r) => r.employeeId === employeeId && inPeriod(r.date))
  const reportsSubmitted = myReports.filter((r) => r.status === 'submitted' || r.status === 'approved').length
  const reportsMissing = myReports.filter((r) => r.status === 'missing').length
  const totalReports = reportsSubmitted + reportsMissing

  // Oranlar
  const onTimeRate = rate(stepsOnTime, totalStepsCompleted)
  const firstApprovalRate = rate(firstTimeApprovalCount, totalApprovalCount)
  // Handoff rate: kaç tane iş paslandı / toplam iş
  const handoffRate = rate(handoffsSent, Math.max(1, totalStepsCompleted + handoffsSent))
  const reportComplianceRate = rate(reportsSubmitted, totalReports)

  return {
    totalStepsCompleted,
    stepsOnTime,
    stepsLate,
    avgCompletionHours,
    firstTimeApprovalCount,
    totalApprovalCount,
    revisionCount,
    handoffsSent,
    handoffsReceived,
    ideasSubmitted,
    ideasConverted,
    reportsSubmitted,
    reportsMissing,
    onTimeRate,
    firstApprovalRate,
    handoffRate,
    reportComplianceRate,
  }
}

// ---------------------------------------------------------------------------
// Unvan Bazlı KPI Görev Listesi ve Başlangıç Kesintileri
// ---------------------------------------------------------------------------

export function initializeDeductions(params: {
  metrics: KpiMetrics
  rolePackageId?: string
  existingCard?: KpiCard | null
  employeeId?: string
  year?: number
  month?: number
  steps?: WorkflowStepInstance[]
  approvals?: WorkflowApproval[]
  handoffs?: WorkflowHandoff[]
}): KpiDeductionLog[] {
  const { 
    metrics, 
    rolePackageId, 
    existingCard,
    employeeId = '',
    year = 2026,
    month = 7,
    steps = [],
    approvals = [],
    handoffs = []
  } = params
  const role = rolePackageId || ''

  // Dönem filtresi: sadece ilgili ay/yıl
  const inPeriod = (dateStr: string | undefined) => {
    if (!dateStr) return false
    const d = new Date(dateStr)
    return d.getFullYear() === year && d.getMonth() + 1 === month
  }

  // Çalışanın tamamladığı adımlar
  const mySteps = steps.filter(
    (s) =>
      s.assignedEmployeeId === employeeId &&
      s.status === 'completed' &&
      inPeriod(s.completedAt)
  )

  // Çalışanın dahil olduğu onay durumları
  const myApprovals = approvals.filter(
    (a) => a.requestedByEmployeeId === employeeId && inPeriod(a.createdAt)
  )

  // Eğer mevcut kartta zaten el ile seçilmiş kesintiler varsa onları koruyalım
  const prevMap = new Map<string, boolean>()
  if (existingCard?.deductions) {
    existingCard.deductions.forEach((d) => {
      prevMap.set(d.id, d.applied)
    })
  }

  const isApplied = (id: string, autoValue: boolean): boolean => {
    if (prevMap.has(id)) return prevMap.get(id)!
    return autoValue
  }

  // Otomatik tespit durumları
  const isLate = metrics.stepsLate > 0
  const isNoIdeas = metrics.ideasSubmitted === 0
  const isReportingMissing = metrics.reportsMissing > 0

  const list: KpiDeductionLog[] = []

  // 1. Grup: Kreatif Üretim Ekipleri (Tasarım, Kurgu, Çekim)
  if (
    role === 'grafik-tasarim' ||
    role === 'video-kurgu' ||
    role === 'fotograf-uretimi' ||
    role === 'video-uretimi'
  ) {
    // Otomatik Kreatif Tespitleri
    const creativeRejected = myApprovals.some(a => 
      (a.status === 'revision_requested' || a.status === 'rejected') && 
      (a.workflowStepInstanceId?.includes('design') || 
       a.workflowStepInstanceId?.includes('editing') || 
       a.workflowStepInstanceId?.includes('kurgu') || 
       a.workflowStepInstanceId?.includes('tasarim') || 
       a.workflowStepInstanceId?.includes('shooting') || 
       a.workflowStepInstanceId?.includes('cekim'))
    )

    const hasLateRevision = mySteps.some(s => 
      (s.id.includes('revision') || s.id.includes('revize') || s.id.includes('duzeltme')) && 
      s.completedAt && s.dueDate && new Date(s.completedAt) > new Date(s.dueDate)
    )

    list.push(
      {
        id: 'creative_quality_low',
        category: 'manual',
        title: 'Tasarım/kurgu kalitesi beklentinin altında',
        points: -10,
        description: 'Tasarım veya kurgu adımlarında yöneticiden onay alamama veya revize yeme.',
        source: 'auto',
        applied: isApplied('creative_quality_low', creativeRejected),
      },
      {
        id: 'creative_critical_error',
        category: 'manual',
        title: 'Kritik görsel/kurgu hatası yapıldı',
        points: -15,
        description: 'Tasarım veya videoda süreci baltalayacak kritik hata yapılması.',
        source: 'manual',
        applied: isApplied('creative_critical_error', false),
      },
      {
        id: 'creative_revision_delay',
        category: 'manual',
        title: 'Revize düzeltmesi geç teslim edildi',
        points: -8,
        description: 'İstenen düzeltmelerin deadline süresinden sonra tamamlanması.',
        source: 'auto',
        applied: isApplied('creative_revision_delay', hasLateRevision),
      },
      {
        id: 'creative_project_messy',
        category: 'manual',
        title: 'Dosya teslim düzenine uyulmadı',
        points: -5,
        description: 'Açık kaynak dosyalarının veya teslim klasörünün düzensiz bırakılması.',
        source: 'manual',
        applied: isApplied('creative_project_messy', false),
      },
      {
        id: 'delivery_due_missed',
        category: 'delivery',
        title: 'Görev teslim tarihi geçirildi',
        points: -10,
        description: 'Kendisine atanan iş adımlarında deadline süresinin aşılması.',
        source: 'auto',
        applied: isApplied('delivery_due_missed', isLate),
      },
      {
        id: 'discipline_delay',
        category: 'discipline',
        title: 'Görev geciktirdi',
        points: -5,
        description: 'Görevlere geç başlanması veya aksama yaşanması.',
        source: 'auto',
        applied: isApplied('discipline_delay', isLate),
      }
    )
  }
  // 2. Grup: Sosyal Medya & Strateji Müşteri İlişkileri
  else if (
    role === 'sosyal-medya-yonetimi' ||
    role === 'strateji-musteri-yonetimi'
  ) {
    // Otomatik Sosyal Medya Tespitleri
    const hasLateCalendar = mySteps.some(s => 
      (s.id.includes('calendar') || s.id.includes('takvim') || s.id.includes('plan')) && 
      s.completedAt && s.dueDate && new Date(s.completedAt) > new Date(s.dueDate)
    )

    const calendarRejected = myApprovals.some(a => 
      (a.status === 'revision_requested' || a.status === 'rejected') && 
      (a.workflowStepInstanceId?.includes('calendar') || a.workflowStepInstanceId?.includes('takvim'))
    )

    const storyLate = mySteps.some(s => 
      s.id.includes('story') && 
      s.completedAt && s.dueDate && new Date(s.completedAt) > new Date(s.dueDate)
    )

    // Yeni Otomatik Tespitler:
    // 1. İçerik takvimi hiç hazırlanmadı
    const hasCalendarStep = steps.some(s => 
      s.assignedEmployeeId === employeeId && 
      (s.id.includes('calendar') || s.id.includes('takvim') || s.id.includes('plan'))
    )
    const hasCompletedCalendar = mySteps.some(s => 
      s.id.includes('calendar') || s.id.includes('takvim') || s.id.includes('plan')
    )
    const neverPreparedCalendar = hasCalendarStep && !hasCompletedCalendar

    // 2. Günlük story kontrolü yapılmadı
    const hasStorySteps = steps.some(s => 
      s.assignedEmployeeId === employeeId && 
      s.id.includes('story')
    )
    const hasCompletedStory = mySteps.some(s => s.id.includes('story'))
    const storyCheckMissed = hasStorySteps && !hasCompletedStory

    // 3. Teslim tarihini haber vermeden geçirdi (Gecikmeli teslim var ama handoff talebi yok)
    const hasLateWithoutNotice = mySteps.some(s => 
      s.completedAt && s.dueDate && new Date(s.completedAt) > new Date(s.dueDate) && 
      !handoffs.some(h => h.workflowStepInstanceId === s.id && h.fromEmployeeId === employeeId)
    )

    list.push(
      {
        id: 'calendar_late',
        category: 'calendar',
        title: 'İçerik takvimi zamanında hazırlanmadı',
        points: -10,
        description: 'İçerik planı/takvimi hazırlık adımının deadline süresinin aşılması.',
        source: 'auto',
        applied: isApplied('calendar_late', hasLateCalendar),
      },
      {
        id: 'calendar_incomplete',
        category: 'calendar',
        title: 'İçerik takvimi eksik teslim edildi',
        points: -8,
        description: 'Hazırlanan takvimin revize alması veya düzeltme talep edilmesi.',
        source: 'auto',
        applied: isApplied('calendar_incomplete', calendarRejected),
      },
      {
        id: 'calendar_missing',
        category: 'calendar',
        title: 'İçerik takvimi hiç hazırlanmadı',
        points: -20,
        description: 'Bu dönem içerik takvimi adımlarının hiçbirinin tamamlanmaması.',
        source: 'auto',
        applied: isApplied('calendar_missing', neverPreparedCalendar),
      },
      {
        id: 'story_no_check',
        category: 'story',
        title: 'Günlük story kontrolü yapılmadı',
        points: -3,
        description: 'Dönem boyunca planlanan story paylaşımlarının hiçbirinin tamamlanmaması.',
        source: 'auto',
        applied: isApplied('story_no_check', storyCheckMissed),
      },
      {
        id: 'story_forgotten',
        category: 'story',
        title: 'Story paylaşımı unutuldu',
        points: -5,
        description: 'Hikaye paylaşımı adımlarının geciktirilmesi veya atlanması.',
        source: 'auto',
        applied: isApplied('story_forgotten', storyLate),
      },
      {
        id: 'story_wrong',
        category: 'story',
        title: 'Yanlış içerik yayınlandı',
        points: -8,
        description: 'Hatalı görsel, metin veya etiket ile story/post yayınlanması.',
        source: 'manual',
        applied: isApplied('story_wrong', false),
      },
      {
        id: 'delivery_late',
        category: 'delivery',
        title: 'İçerik yayına geç teslim edildi',
        points: -5,
        description: 'Gönderinin planlanan saatten sonra yayına verilmesi.',
        source: 'auto',
        applied: isApplied('delivery_late', isLate),
      },
      {
        id: 'delivery_due_missed',
        category: 'delivery',
        title: 'Teslim tarihi geçirildi',
        points: -10,
        description: 'Genel teslim deadline tarihinin aşılması.',
        source: 'auto',
        applied: isApplied('delivery_due_missed', isLate),
      },
      {
        id: 'discipline_delay',
        category: 'discipline',
        title: 'Görev geciktirdi',
        points: -5,
        description: 'İş adımlarını bekletme veya zamanında başlamama.',
        source: 'auto',
        applied: isApplied('discipline_delay', isLate),
      },
      {
        id: 'discipline_due_no_notice',
        category: 'discipline',
        title: 'Teslim tarihini haber vermeden geçirdi',
        points: -10,
        description: 'İş akışı adımı gecikmesine rağmen herhangi bir paslama/transfer talebi açılmaması.',
        source: 'auto',
        applied: isApplied('discipline_due_no_notice', hasLateWithoutNotice),
      }
    )
  }
  // 3. Grup: Dijital Pazarlama
  else if (role === 'dijital-pazarlama') {
    // Otomatik Reklam Kontrolü Tespitleri
    const hasLateSetup = mySteps.some(s => 
      (s.id.includes('setup') || s.id.includes('kurulum')) && 
      s.completedAt && s.dueDate && new Date(s.completedAt) > new Date(s.dueDate)
    )

    const setupRejected = myApprovals.some(a => 
      (a.status === 'revision_requested' || a.status === 'rejected') && 
      (a.workflowStepInstanceId?.includes('setup') || a.workflowStepInstanceId?.includes('kurulum'))
    )

    const hasLateOpt = mySteps.some(s => 
      (s.id.includes('optimize') || s.id.includes('optimizasyon')) && 
      s.completedAt && s.dueDate && new Date(s.completedAt) > new Date(s.dueDate)
    )

    const hasLatePixel = mySteps.some(s => 
      s.id.includes('pixel') && 
      s.completedAt && s.dueDate && new Date(s.completedAt) > new Date(s.dueDate)
    )

    list.push(
      // 1. Reklam Kurulum Disiplini
      {
        id: 'ads_setup_late',
        category: 'calendar',
        title: 'Kampanya zamanında kurulmadı',
        points: -15,
        description: 'Reklam kampanyasının planlanan yayın saatinde yayına alınamaması.',
        source: 'auto',
        applied: isApplied('ads_setup_late', hasLateSetup),
      },
      {
        id: 'ads_setup_incomplete',
        category: 'calendar',
        title: 'Eksik kampanya kurulumu yapıldı',
        points: -10,
        description: 'Reklam kurulum aşamasında onay alamama veya revizeye gönderilme.',
        source: 'auto',
        applied: isApplied('ads_setup_incomplete', setupRejected),
      },
      {
        id: 'ads_incorrect_target',
        category: 'calendar',
        title: 'Yanlış hedefleme veya yanlış bütçe ile çıkıldı',
        points: -15,
        description: 'Reklam hedef kitlesinde veya bütçe ayarlarında hata yapılması.',
        source: 'manual',
        applied: isApplied('ads_incorrect_target', false),
      },
      // 2. Günlük Reklam Kontrolü
      {
        id: 'ads_daily_check_missed',
        category: 'story',
        title: 'Günlük hesap kontrolü yapılmadı',
        points: -10,
        description: 'Günlük olarak bütçe, harcama ve gösterim durumlarının denetlenmemesi.',
        source: 'manual',
        applied: isApplied('ads_daily_check_missed', false),
      },
      {
        id: 'ads_rejected_not_noticed',
        category: 'story',
        title: 'Reject olan reklam fark edilmedi',
        points: -10,
        description: 'Reklamların onaylanmaması durumunda sistemde 1\'den fazla revize oluşması.',
        source: 'auto',
        applied: isApplied('ads_rejected_not_noticed', metrics.revisionCount > 1),
      },
      {
        id: 'ads_anomaly_not_detected',
        category: 'story',
        title: 'Harcama anomalisi zamanında tespit edilmedi',
        points: -15,
        description: 'Hesaptaki olağan dışı harcama artışı veya duruşunun geç fark edilmesi.',
        source: 'manual',
        applied: isApplied('ads_anomaly_not_detected', false),
      },
      // 3. Haftalık Optimizasyon
      {
        id: 'ads_weekly_opt_missed',
        category: 'manual',
        title: 'Haftalık optimizasyon yapılmadı',
        points: -15,
        description: 'Optimizasyon ve iyileştirme adımlarının deadline sürelerinin kaçırılması.',
        source: 'auto',
        applied: isApplied('ads_weekly_opt_missed', hasLateOpt),
      },
      {
        id: 'ads_creative_test_missed',
        category: 'manual',
        title: 'Kreatif testi yapılmadı',
        points: -10,
        description: 'Yeni kreatiflerin veya A/B testlerinin hesaba entegre edilmemesi.',
        source: 'manual',
        applied: isApplied('ads_creative_test_missed', false),
      },
      {
        id: 'ads_audience_test_missed',
        category: 'manual',
        title: 'Audience/Budget testi yapılmadı',
        points: -10,
        description: 'Yeni hedef kitle veya bütçe optimizasyon testlerinin uygulanmaması.',
        source: 'manual',
        applied: isApplied('ads_audience_test_missed', false),
      },
      // 4. Raporlama
      {
        id: 'ads_weekly_report_missed',
        category: 'delivery',
        title: 'Haftalık rapor hazırlanmadı',
        points: -15,
        description: 'Müşteri veya yönetime iletilmesi gereken haftalık performans raporunun gecikmesi.',
        source: 'auto',
        applied: isApplied('ads_weekly_report_missed', isReportingMissing),
      },
      {
        id: 'ads_report_incomplete',
        category: 'delivery',
        title: 'Eksik veya hatalı rapor teslim edildi',
        points: -10,
        description: 'Verileri yanlış veya analizleri yetersiz rapor sunulması.',
        source: 'manual',
        applied: isApplied('ads_report_incomplete', false),
      },
      // 5. Reklam Hesabı Sağlığı
      {
        id: 'ads_pixel_check_missed',
        category: 'discipline',
        title: 'Pixel/Event kontrolü yapılmadı',
        points: -10,
        description: 'Pixel test etme ve dönüşüm izleme adımlarında gecikme yaşanması.',
        source: 'auto',
        applied: isApplied('ads_pixel_check_missed', hasLatePixel),
      },
      {
        id: 'ads_health_issue_delayed',
        category: 'discipline',
        title: 'Hesap problemi zamanında çözülmedi',
        points: -15,
        description: 'Hesap kısıtlaması, ödeme yöntemi veya teknik sorunlara geç müdahale edilmesi.',
        source: 'manual',
        applied: isApplied('ads_health_issue_delayed', false),
      },
      {
        id: 'ads_tracking_error_not_noticed',
        category: 'discipline',
        title: 'Tracking hatası fark edilmedi',
        points: -10,
        description: 'UTM parametreleri veya dönüşüm izleme hatalarının tespit edilememesi.',
        source: 'manual',
        applied: isApplied('ads_tracking_error_not_noticed', false),
      },
      // 6. Görev Disiplini
      {
        id: 'ads_task_delayed',
        category: 'delivery',
        title: 'Görev gecikti',
        points: -10,
        description: 'Operasyon paneli adımlarında gecikme yaşanması.',
        source: 'auto',
        applied: isApplied('ads_task_delayed', isLate),
      },
      {
        id: 'ads_deadline_missed',
        category: 'delivery',
        title: 'Deadline kaçırıldı',
        points: -15,
        description: 'Kritik proje veya kampanya teslim tarihinin aşılması.',
        source: 'auto',
        applied: isApplied('ads_deadline_missed', metrics.stepsLate > 1),
      },
      {
        id: 'ads_task_not_updated',
        category: 'discipline',
        title: 'Görev güncellenmedi',
        points: -5,
        description: 'Tamamlanan veya devam eden işlerin durumlarının sisteme girilmemesi.',
        source: 'manual',
        applied: isApplied('ads_task_not_updated', false),
      },
      // 8. Süreç İyileştirme
      {
        id: 'ads_issue_not_reported',
        category: 'discipline',
        title: 'Tekrarlayan bir problemi raporlamadı',
        points: -10,
        description: 'Hesaplarda kronikleşen teknik sorunları yönetime bildirmeme.',
        source: 'manual',
        applied: isApplied('ads_issue_not_reported', false),
      },
      {
        id: 'ads_critical_error_not_reported',
        category: 'discipline',
        title: 'Operasyonu aksatan hatayı bildirmedi',
        points: -15,
        description: 'Ciddi bütçe harcaması veya kısıtlamaları gizleme veya geç bildirme.',
        source: 'manual',
        applied: isApplied('ads_critical_error_not_reported', false),
      }
    )
  }
  // 4. Grup: Operasyon Yönetimi & Diğerleri
  else {
    list.push(
      {
        id: 'op_coordination_fail',
        category: 'discipline',
        title: 'Ekip koordinasyonunda aksama yaşandı',
        points: -10,
        description: 'Süreç yönetiminde ekibin veya işlerin koordine edilememesi.',
        source: 'manual',
        applied: isApplied('op_coordination_fail', false),
      },
      {
        id: 'op_critical_delay',
        category: 'discipline',
        title: 'Süreci durduracak gecikme/hata yapıldı',
        points: -15,
        description: 'Operasyonel akışın durmasına yol açan majör organizasyon hatası.',
        source: 'manual',
        applied: isApplied('op_critical_delay', false),
      },
      {
        id: 'delivery_due_missed',
        category: 'delivery',
        title: 'Teslim tarihi geçirildi',
        points: -10,
        description: 'Kritik teslim tarihlerinin aşılması.',
        source: 'auto',
        applied: isApplied('delivery_due_missed', isLate),
      },
      {
        id: 'discipline_delay',
        category: 'discipline',
        title: 'Görev geciktirdi',
        points: -5,
        description: 'İş takip ve atamalarında gecikme.',
        source: 'auto',
        applied: isApplied('discipline_delay', isLate),
      }
    )
  }

  // Ortak Disiplin Kesintileri (Herkes İçin Geçerli)
  list.push(
    {
      id: 'discipline_approval_wait',
      category: 'discipline',
      title: 'Onay bekleyen işi gereksiz bekletti',
      points: -5,
      description: 'Onay aşamasındaki işleri vaktinde onaylamayarak bekletme.',
      source: 'auto',
      applied: isApplied('discipline_approval_wait', metrics.revisionCount > 2),
    },
    {
      id: 'discipline_reporting_missed',
      category: 'discipline',
      title: 'Rapor teslimi yapılmadı',
      points: -15,
      description: 'Günlük/haftalık raporlama gereksinimlerinin aksatılması.',
      source: 'auto',
      applied: isApplied('discipline_reporting_missed', (role === 'operasyon-yonetimi' || role === 'kreatif-yonetim') ? false : isReportingMissing),
    }
  )

  // Fikir Ödülleri & Cezaları (Fikir Merkezi)
  list.push({
    id: 'ideas_none',
    category: 'ideas',
    title: 'Ay boyunca hiç fikir paylaşmadı',
    points: -10,
    description: 'Fikir Merkezi havuzuna hiç katkıda bulunulmaması.',
    source: 'auto',
    applied: isApplied('ideas_none', isNoIdeas),
  })

  // Kabul edilen fikirler (Otomatik olarak metrics'ten)
  const convertedCount = metrics.ideasConverted
  const submittedCount = metrics.ideasSubmitted
  const acceptedCount = Math.max(0, submittedCount - convertedCount)

  for (let i = 0; i < acceptedCount; i++) {
    list.push({
      id: `ideas_accepted_${i}`,
      category: 'ideas',
      title: 'Kabul edilen fikir',
      points: 5,
      description: 'Fikir havuzunda kabul gören veya listeye eklenen fikir.',
      source: 'auto',
      applied: true,
    })
  }

  for (let i = 0; i < convertedCount; i++) {
    list.push({
      id: `ideas_converted_${i}`,
      category: 'ideas',
      title: 'Göreve dönüşen fikir',
      points: 10,
      description: 'Fikrin onaylanarak canlı bir iş akışına dönüştürülmesi.',
      source: 'auto',
      applied: true,
    })
  }

  // Manuel başarı fikri ödülü
  list.push({
    id: 'ideas_success',
    category: 'ideas',
    title: 'Uygulanıp başarı sağlayan fikir',
    points: 15,
    description: 'Fikrin uygulanıp yüksek geri dönüş/etkileşim getirmesi.',
    source: 'manual',
    applied: isApplied('ideas_success', false),
  })

  return list
}

// ---------------------------------------------------------------------------
// 5 Alt Kategori Skor Hesaplama (Her Biri 100 Üzerinden Düşerek İlerler)
// ---------------------------------------------------------------------------

export function computeAutoScoresFromDeductions(deductions: KpiDeductionLog[]): {
  disciplineScore: number
  qualityScore: number
  operationScore: number
  contributionScore: number
} {
  const getSum = (categories: string[]) =>
    deductions
      .filter((d) => d.applied && d.points < 0 && categories.includes(d.category || ''))
      .reduce((sum, d) => sum + d.points, 0)

  // Disiplin (Disiplin ve Rapor/Handoff)
  const disciplineScore = Math.max(0, Math.min(100, 100 + getSum(['discipline'])))

  // Kalite (Story ve Manuel kesintiler)
  const qualityScore = Math.max(0, Math.min(100, 100 + getSum(['story', 'manual'])))

  // Operasyon (Takvim ve Teslim süreçleri)
  const operationScore = Math.max(0, Math.min(100, 100 + getSum(['calendar', 'delivery'])))

  // Katkı (Fikir merkezi ödül ve cezaları)
  const contributionScore = Math.max(0, Math.min(100, 100 + getSum(['ideas'])))

  return {
    disciplineScore,
    qualityScore,
    operationScore,
    contributionScore,
  }
}

// ---------------------------------------------------------------------------
// Tam KPI Kartı Oluşturma
// ---------------------------------------------------------------------------

export function generateKpiCard(params: {
  employeeId: string
  year: number
  month: number
  steps: WorkflowStepInstance[]
  approvals: WorkflowApproval[]
  handoffs: WorkflowHandoff[]
  ideas: Idea[]
  reports: Report[]
  existingCard?: KpiCard | null
  rolePackageId?: string
}): KpiCard {
  const { employeeId, year, month, existingCard, rolePackageId } = params

  const metrics = computeMetrics({ ...params })

  // Kesinti listesini unvan bazlı oluştur/yenile
  const deductions = initializeDeductions({
    metrics,
    rolePackageId,
    existingCard,
    employeeId,
    year,
    month,
    steps: params.steps,
    approvals: params.approvals,
    handoffs: params.handoffs,
  })

  // Alt boyut skorlarını kesintilerden hesapla
  const autoScores = computeAutoScoresFromDeductions(deductions)

  // Yönetici değerlendirme puanları varsa koru
  const managerScores = existingCard
    ? {
        communicationScore: existingCard.communicationScore,
        teamworkScore: existingCard.teamworkScore,
        initiativeScore: existingCard.initiativeScore,
        problemSolvingScore: existingCard.problemSolvingScore,
        creativityScore: existingCard.creativityScore,
        managerReview: existingCard.managerReview,
      }
    : {}

  // Genel skor hesabı: 100'den başlar, tüm uygulanan kesintilerin toplamını ekler (clamped 0-100)
  const deductionSum = deductions
    .filter((d) => d.applied)
    .reduce((sum, d) => sum + d.points, 0)
  
  const overallScore = Math.max(0, Math.min(100, 100 + deductionSum))

  return {
    id: existingCard?.id || uuidv4(),
    employeeId,
    period: 'monthly',
    year,
    month,
    ...autoScores,
    ...managerScores,
    overallScore,
    metrics,
    status: existingCard?.status || 'draft',
    generatedAt: new Date().toISOString(),
    publishedAt: existingCard?.publishedAt,
    deductions,
  }
}

// ---------------------------------------------------------------------------
// Ajans Skoru Hesaplama (3 Kategoriye Göre: Başarılı, Geliştirilmeli, Kritik)
// ---------------------------------------------------------------------------

export function computeAgencyScore(cards: KpiCard[]): {
  overallScore: number
  label: string
  highlights: string[]
  warnings: string[]
} {
  if (cards.length === 0) {
    return { overallScore: 0, label: 'Veri Yok', highlights: [], warnings: [] }
  }

  const overallScore = Math.round(
    cards.reduce((sum, c) => sum + c.overallScore, 0) / cards.length
  )

  let label: string
  if (overallScore >= 80) label = 'Başarılı Operasyon'
  else if (overallScore >= 60) label = 'Geliştirilmeli'
  else label = 'Kritik Seviye'

  const highlights: string[] = []
  const warnings: string[] = []

  const avgOnTime = cards.reduce((s, c) => s + c.metrics.onTimeRate, 0) / cards.length
  const avgQuality = cards.reduce((s, c) => s + c.qualityScore, 0) / cards.length
  const avgRevision = cards.reduce((s, c) => s + c.metrics.revisionCount, 0) / cards.length
  const avgReport = cards.reduce((s, c) => s + c.metrics.reportComplianceRate, 0) / cards.length

  if (avgOnTime >= 85) highlights.push('Teslimler zamanında')
  if (avgQuality >= 80) highlights.push('Kalite yüksek')
  if (avgReport >= 90) highlights.push('Raporlama düzenli')

  if (avgOnTime < 70) warnings.push('Geciken teslimler arttı')
  if (avgRevision > 3) warnings.push('Revize sayısı yüksek')
  if (avgReport < 70) warnings.push('Raporlama eksiklikleri var')

  return { overallScore, label, highlights, warnings }
}

// ---------------------------------------------------------------------------
// Raporlardan Başarı Metriklerini Otomatik Ayıklayan Analiz Fonksiyonu
// ---------------------------------------------------------------------------

export function extractAchievements(content: string): string[] {
  if (!content) return []
  
  // Satırlara veya cümlelere ayır
  const lines = content.split(/[.\n]/).map(l => l.trim()).filter(Boolean)
  
  // Pazarlama ve operasyon başarı anahtar kelimeleri
  const keywords = [
    'roas', 'cpa', 'ctr', 'satış', 'ciro', 'arttı', 'artış', 'yüksel', 
    'düştü', 'optim', 'pixel', 'hedef', 'bütçe', 'verim', 'dönüşüm',
    'tasarım', 'reklam', 'kreatif', 'kurgu', 'izlenme', 'etkileşim'
  ]
  
  return lines.filter(line => {
    const lower = line.toLowerCase()
    // Sayı içeren veya artış/düşüş/başarı bildiren cümleleri seç
    const hasSuccessIndicator = 
      lower.includes('artış') || 
      lower.includes('yüksel') || 
      lower.includes('düştü') || 
      lower.includes('başarı') ||
      lower.includes('kazandı') ||
      lower.includes('tamamlandı')
    
    return keywords.some(k => lower.includes(k)) && (/\d+/.test(line) || hasSuccessIndicator)
  })
}
