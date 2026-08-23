import { EmployeeRepository } from '@/lib/repositories/EmployeeRepository'
import { BrandRepository } from '@/lib/repositories/BrandRepository'
import { IdeaRepository } from '@/lib/repositories/IdeaRepository'
import { CycleRepository } from '@/lib/repositories/CycleRepository'
import { WorkflowRepository } from '@/lib/repositories/WorkflowRepository'
import { ApprovalRepository } from '@/lib/repositories/ApprovalRepository'
import { HandoffRepository } from '@/lib/repositories/HandoffRepository'
import { NotificationRepository } from '@/lib/repositories/NotificationRepository'
import { CalendarRepository } from '@/lib/repositories/CalendarRepository'
import { ReportRepository } from '@/lib/repositories/ReportRepository'

import type { Employee, Brand, BrandOperationCycle, WorkflowInstance, WorkflowStepInstance, WorkflowHistory, WorkflowApproval, WorkflowHandoff, Notification, CalendarEvent, Report, Idea } from '@/types/domain'

// Default Seed Data to fallback on if localStorage is empty
const DEFAULT_EMPLOYEE_SEEDS: Employee[] = [
  {
    id: 'emp-celal',
    fullName: 'Celal Aslan',
    email: 'celal@socialart.com',
    title: 'Operasyon Yöneticisi',
    rolePackageId: 'operasyon-yonetimi',
    teamIds: ['merkezi-operasyon'],
    permissionOverrides: {},
    username: 'celal',
    employeeStatus: 'active',
    workLocationStatus: 'office',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    hasAdvancedCalendarAccess: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'emp-ali',
    fullName: 'Ali Can',
    email: 'ali@socialart.com',
    title: 'Sosyal Medya Uzmanı',
    rolePackageId: 'sosyal-medya-yonetimi',
    teamIds: ['sosyal-medya'],
    permissionOverrides: {},
    username: 'ali',
    employeeStatus: 'active',
    workLocationStatus: 'remote',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    hasAdvancedCalendarAccess: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'emp-ayse',
    fullName: 'Ayşe Yılmaz',
    email: 'ayse@socialart.com',
    title: 'Video Üretim Uzmanı',
    rolePackageId: 'video-uretimi',
    teamIds: ['post-produksiyon'],
    permissionOverrides: {},
    username: 'ayse',
    employeeStatus: 'active',
    workLocationStatus: 'office',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    hasAdvancedCalendarAccess: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'emp-fatma',
    fullName: 'Fatma Demir',
    email: 'fatma@socialart.com',
    title: 'Grafik Tasarımcı',
    rolePackageId: 'grafik-tasarim',
    teamIds: ['grafik-studyo'],
    permissionOverrides: {},
    username: 'fatma',
    employeeStatus: 'active',
    workLocationStatus: 'hybrid',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
    hasAdvancedCalendarAccess: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'emp-kreatif',
    fullName: 'Kürşat Deren (Kreatif Direktör)',
    email: 'kursat@socialart.com',
    title: 'Kreatif Direktör',
    rolePackageId: 'kreatif-yonetim',
    teamIds: ['grafik-studyo', 'post-produksiyon', 'fotograf-studyo', 'video-produksiyon', 'kreatif-koordinasyon'],
    permissionOverrides: {
      'operations.view': true,
      'task.manage': true,
      'team.manage': true,
      'approval.review': true
    },
    username: 'kursat',
    employeeStatus: 'active',
    workLocationStatus: 'office',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
    hasAdvancedCalendarAccess: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const DEFAULT_BRAND_SEEDS: Brand[] = [
  {
    id: 'brand-zara',
    name: 'Zara',
    instagram: '@zara',
    website: 'https://www.zara.com',
    contactPerson: 'Mehmet Yılmaz',
    phone: '+90 532 123 45 67',
    email: 'mehmet@zara.com.tr',
    operationManagerId: 'emp-celal',
    startDate: '2026-01-01',
    status: 'active',
    selectedPackageId: 'business',
    operationPlan: [
      { id: 'plan-zara-1', title: 'Aylık 15 Post Paylaşımı', type: 'content', target: 15, completed: 5, status: 'in_progress' },
      { id: 'plan-zara-2', title: '90 Günlük Story Paylaşımı', type: 'content', target: 90, completed: 12, status: 'in_progress' },
      { id: 'plan-zara-3', title: 'Meta Ads Reklam Optimizasyonu', type: 'advertising', target: 4, completed: 1, status: 'in_progress' },
      { id: 'plan-zara-4', title: 'Aylık Performans Raporlama', type: 'reporting', target: 1, completed: 0, status: 'pending' }
    ],
    brandAssignments: [
      { id: 'asg-zara-1', employeeId: 'emp-celal', responsibility: 'Genel Yönetim', roleLabel: 'Operasyon Yöneticisi' },
      { id: 'asg-zara-2', employeeId: 'emp-ali', responsibility: 'Sosyal Medya', roleLabel: 'Sosyal Medya Uzmanı' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'brand-nike',
    name: 'Nike',
    instagram: '@nike',
    website: 'https://www.nike.com',
    contactPerson: 'Ebru Kaya',
    phone: '+90 533 987 65 43',
    email: 'ebru.kaya@nike.com',
    operationManagerId: 'emp-celal',
    startDate: '2026-02-01',
    status: 'active',
    selectedPackageId: 'booster',
    operationPlan: [
      { id: 'plan-nike-1', title: 'Aylık 20 Reels Videosu', type: 'content', target: 20, completed: 10, status: 'in_progress' },
      { id: 'plan-nike-2', title: 'Haftalık Reklam Kampanyası', type: 'advertising', target: 4, completed: 2, status: 'in_progress' }
    ],
    brandAssignments: [
      { id: 'asg-nike-1', employeeId: 'emp-celal', responsibility: 'Genel Yönetim', roleLabel: 'Operasyon Yöneticisi' },
      { id: 'asg-nike-2', employeeId: 'emp-ayse', responsibility: 'Video Çekim', roleLabel: 'Video Uzmanı' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const DEFAULT_IDEA_SEEDS: Idea[] = [
  {
    id: 'idea-zara-ai',
    title: 'Yapay Zeka Destekli Zara Stil Danışmanı Reels Serisi',
    description: 'Yapay zeka filtreleri ve seslendirmesi kullanarak kullanıcıların Zara kıyafet kombinlerini yorumlayan eğlenceli ve etkileşimli bir Reels serisi.',
    category: 'Reels / Video',
    brandId: 'brand-zara',
    creatorId: 'emp-ali',
    impact: 'high',
    status: 'pending',
    votes: 3,
    votedEmployeeIds: ['emp-celal', 'emp-ayse', 'emp-fatma'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'idea-nike-airmax',
    title: 'Nike Air Max Günü Özel Sokak Röportajları',
    description: 'Sokaktaki Nike severlerle Air Max ayakkabıları hakkında yaratıcı mini röportajlar ve ayakkabı detay çekimleri.',
    category: 'Sokak Çekimi',
    brandId: 'brand-nike',
    creatorId: 'emp-ayse',
    impact: 'high',
    status: 'pending',
    votes: 4,
    votedEmployeeIds: ['emp-celal', 'emp-ali', 'emp-fatma', 'emp-ayse'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'idea-zara-sustainable',
    title: 'Sürdürülebilir Zara Koleksiyonu Estetik Carousel',
    description: 'Zara\'nın sürdürülebilir kumaşlardan üretilen yeni koleksiyonu için minimalist toprak tonlarında bilgilendirici carousel serisi.',
    category: 'Tasarım / Post',
    brandId: 'brand-zara',
    creatorId: 'emp-fatma',
    impact: 'medium',
    status: 'pending',
    votes: 1,
    votedEmployeeIds: ['emp-ali'],
    createdAt: new Date().toISOString()
  }
]

export async function runManualMigration(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Migrate Employees
    const localEmpsRaw = localStorage.getItem('social-art-base:employees')
    let employees: Employee[] = []
    if (localEmpsRaw) {
      employees = JSON.parse(localEmpsRaw)
    } else {
      employees = DEFAULT_EMPLOYEE_SEEDS
    }

    for (const emp of employees) {
      await EmployeeRepository.save(emp)
    }

    // DB'deki güncel çalışanları çekip geçerli ID'leri doğrulayalım
    const dbEmployees = await EmployeeRepository.getAll()
    const validEmpIds = new Set(dbEmployees.map(e => e.id))
    const fallbackEmpId = dbEmployees.find(e => e.rolePackageId === 'operasyon-yonetimi')?.id || dbEmployees[0]?.id

    // 2. Migrate Brands
    const localBrandsRaw = localStorage.getItem('social-art-base:brands')
    let brands: Brand[] = []
    if (localBrandsRaw) {
      brands = JSON.parse(localBrandsRaw)
    } else {
      brands = DEFAULT_BRAND_SEEDS
    }

    for (const brand of brands) {
      if (!validEmpIds.has(brand.operationManagerId)) {
        if (fallbackEmpId) {
          brand.operationManagerId = fallbackEmpId
        }
      }
      if (brand.brandAssignments) {
        brand.brandAssignments = brand.brandAssignments.filter(asg => validEmpIds.has(asg.employeeId))
      }
      await BrandRepository.save(brand)
    }

    // 3. Migrate Ideas
    const localIdeasRaw = localStorage.getItem('social-art-base:ideas')
    let ideas: Idea[] = []
    if (localIdeasRaw) {
      ideas = JSON.parse(localIdeasRaw)
    } else {
      ideas = DEFAULT_IDEA_SEEDS
    }

    for (const idea of ideas) {
      if (!validEmpIds.has(idea.creatorId)) {
        if (fallbackEmpId) {
          idea.creatorId = fallbackEmpId
        }
      }
      if (idea.votedEmployeeIds) {
        idea.votedEmployeeIds = idea.votedEmployeeIds.filter(id => validEmpIds.has(id))
      }
    }
    await IdeaRepository.saveMultiple(ideas)

    // 4. Migrate Cycles
    const localCyclesRaw = localStorage.getItem('social-art-base:cycles')
    if (localCyclesRaw) {
      const cycles: BrandOperationCycle[] = JSON.parse(localCyclesRaw)
      for (const cycle of cycles) {
        await CycleRepository.save(cycle)
      }
    }

    // 5. Migrate Workflow Instances & Steps
    const localInstancesRaw = localStorage.getItem('social-art-base:workflow-instances')
    const localStepsRaw = localStorage.getItem('social-art-base:workflow-step-instances')
    if (localInstancesRaw && localStepsRaw) {
      const instances: WorkflowInstance[] = JSON.parse(localInstancesRaw)
      const steps: WorkflowStepInstance[] = JSON.parse(localStepsRaw)
      // Save directly without duplicate validation block
      const instRows = instances.map(i => WorkflowRepository.mapInstanceToRow(i))
      const stepRows = steps.map(s => WorkflowRepository.mapStepToRow(s))

      const { supabase } = require('@/lib/supabase/client')
      if (instRows.length > 0) {
        const { error } = await supabase.from('workflow_instances').upsert(instRows)
        if (error) throw error
      }
      if (stepRows.length > 0) {
        const { error } = await supabase.from('workflow_step_instances').upsert(stepRows)
        if (error) throw error
      }
    }

    // 6. Migrate History
    const localHistoryRaw = localStorage.getItem('social-art-base:workflow-history')
    if (localHistoryRaw) {
      const history: WorkflowHistory[] = JSON.parse(localHistoryRaw)
      const { supabase } = require('@/lib/supabase/client')
      const rows = history.map(h => WorkflowRepository.mapHistoryToRow(h))
      if (rows.length > 0) {
        const { error } = await supabase.from('workflow_history').upsert(rows)
        if (error) throw error
      }
    }

    // 7. Migrate Approvals
    const localApprovalsRaw = localStorage.getItem('social-art-base:approvals')
    if (localApprovalsRaw) {
      const approvals: WorkflowApproval[] = JSON.parse(localApprovalsRaw)
      for (const approval of approvals) {
        await ApprovalRepository.save(approval)
      }
    }

    // 8. Migrate Handoffs
    const localHandoffsRaw = localStorage.getItem('social-art-base:workflow-handoffs')
    if (localHandoffsRaw) {
      const handoffs: WorkflowHandoff[] = JSON.parse(localHandoffsRaw)
      for (const handoff of handoffs) {
        await HandoffRepository.save(handoff)
      }
    }

    // 9. Migrate Notifications
    const localNotificationsRaw = localStorage.getItem('social-art-base:notifications')
    if (localNotificationsRaw) {
      const notifications: Notification[] = JSON.parse(localNotificationsRaw)
      await NotificationRepository.saveMultiple(notifications)
    }

    // 10. Migrate Calendar Events
    const localEventsRaw = localStorage.getItem('social-art-base:calendar-events')
    if (localEventsRaw) {
      const events: any[] = JSON.parse(localEventsRaw)
      const mappedEvents: CalendarEvent[] = events.map((evt) => {
        // Translate date and time to startsAt and endsAt
        const date = evt.date || '2026-07-09'
        const time = evt.time || '12:00'
        const startsAt = new Date(`${date}T${time}:00`).toISOString()
        const endsAt = new Date(new Date(`${date}T${time}:00`).getTime() + 60 * 60 * 1000).toISOString() // 1 hour duration default
        return {
          id: evt.id,
          title: evt.title,
          type: evt.type,
          brandId: evt.brandId,
          employeeId: evt.employeeId,
          startsAt,
          endsAt,
          location: evt.location,
          status: evt.status
        }
      })
      await CalendarRepository.saveMultiple(mappedEvents)
    }

    // 11. Migrate Reports
    const localReportsRaw = localStorage.getItem('social-art-base:reports')
    if (localReportsRaw) {
      const reports: Report[] = JSON.parse(localReportsRaw)
      for (const report of reports) {
        if (!validEmpIds.has(report.employeeId)) {
          if (fallbackEmpId) {
            report.employeeId = fallbackEmpId
          }
        }
      }
      await ReportRepository.saveMultiple(reports)
    }

    return {
      success: true,
      message: 'Veri göçü (migration) başarıyla tamamlandı. Tüm veriler Supabase veritabanına aktarıldı.'
    }
  } catch (error: any) {
    console.error('Migration failed:', error)
    return {
      success: false,
      message: `Veri göçü başarısız oldu: ${error.message || error}`
    }
  }
}
