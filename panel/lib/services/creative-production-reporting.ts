import { CreativeProductionCreditRepository } from '@/lib/repositories/CreativeProductionCreditRepository'
import type {
  CreativeProductionCredit,
  CreativeProductionFilter,
  CreativeProductionSummary,
  Employee,
} from '@/types/domain'

/**
 * Resolves ISO date strings for filtering based on preset or custom date/time inputs.
 */
export function resolveDateRange(filter: CreativeProductionFilter): {
  fromIso: string | null
  toIso: string | null
} {
  const now = new Date()

  switch (filter.preset) {
    case 'today': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      return { fromIso: start.toISOString(), toIso: end.toISOString() }
    }
    case 'this_week': {
      // Monday of current week
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1) // adjust when Sunday
      const monday = new Date(now.setDate(diff))
      monday.setHours(0, 0, 0, 0)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      sunday.setHours(23, 59, 59, 999)
      return { fromIso: monday.toISOString(), toIso: sunday.toISOString() }
    }
    case 'this_month': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      return { fromIso: firstDay.toISOString(), toIso: lastDay.toISOString() }
    }
    case 'prev_month': {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0)
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      return { fromIso: firstDay.toISOString(), toIso: lastDay.toISOString() }
    }
    case 'all_time': {
      return { fromIso: null, toIso: null }
    }
    case 'custom':
    default: {
      let fromIso: string | null = null
      let toIso: string | null = null

      if (filter.startDate) {
        const timePart = filter.startTime ? filter.startTime : '00:00:00'
        const d = new Date(`${filter.startDate}T${timePart}`)
        if (!isNaN(d.getTime())) fromIso = d.toISOString()
      }

      if (filter.endDate) {
        const timePart = filter.endTime ? (filter.endTime.length === 5 ? `${filter.endTime}:59` : filter.endTime) : '23:59:59'
        const d = new Date(`${filter.endDate}T${timePart}`)
        if (!isNaN(d.getTime())) toIso = d.toISOString()
      }

      return { fromIso, toIso }
    }
  }
}

/**
 * Core Reporting Service for Creative Production Ledger
 */
export async function getCreativeProductionReport(
  filter: CreativeProductionFilter,
  allowedEmployeeIds?: Set<string> | string[],
  allEmployees: Employee[] = []
): Promise<CreativeProductionSummary> {
  const allCredits = await CreativeProductionCreditRepository.getAll()
  const { fromIso, toIso } = resolveDateRange(filter)

  const allowedSet = allowedEmployeeIds
    ? allowedEmployeeIds instanceof Set
      ? allowedEmployeeIds
      : new Set(allowedEmployeeIds)
    : null

  const filteredCredits = allCredits.filter((credit) => {
    // 1. Employee Scope / Security Guard
    if (allowedSet && !allowedSet.has(credit.designerEmployeeId)) {
      return false
    }

    // 2. Specific Employee Filter
    if (filter.employeeId && credit.designerEmployeeId !== filter.employeeId) {
      return false
    }

    // 3. Brand Filter
    if (filter.brandId) {
      if (filter.brandId === 'general' || filter.brandId === 'general-agency') {
        if (credit.brandId !== null && credit.brandId !== 'general' && credit.brandId !== 'general-agency') {
          return false
        }
      } else {
        if (credit.brandId !== filter.brandId) {
          return false
        }
      }
    }

    // 4. Timestamp Filter (inclusive creditedAt)
    const creditedTime = new Date(credit.creditedAt).getTime()

    if (fromIso) {
      const fromTime = new Date(fromIso).getTime()
      if (creditedTime < fromTime) return false
    }

    if (toIso) {
      const toTime = new Date(toIso).getTime()
      if (creditedTime > toTime) return false
    }

    return true
  })

  // Calculate totals
  const completedJobCount = filteredCredits.length
  const completedCreativeCount = filteredCredits.reduce(
    (sum, c) => sum + (c.creativeCount >= 1 ? c.creativeCount : 1),
    0
  )

  // Compute Employee Breakdown
  const empMap = new Map<
    string,
    {
      employeeId: string
      employeeName: string
      employmentType?: string
      completedJobCount: number
      completedCreativeCount: number
    }
  >()

  // Initialize breakdown for allowed designers or all participants
  filteredCredits.forEach((credit) => {
    const designerId = credit.designerEmployeeId
    if (!empMap.has(designerId)) {
      const emp = allEmployees.find((e) => e.id === designerId)
      empMap.set(designerId, {
        employeeId: designerId,
        employeeName: emp ? emp.fullName : 'Bilinmeyen Tasarımcı',
        employmentType: emp?.employmentType,
        completedJobCount: 0,
        completedCreativeCount: 0,
      })
    }

    const item = empMap.get(designerId)!
    item.completedJobCount += 1
    item.completedCreativeCount += credit.creativeCount >= 1 ? credit.creativeCount : 1
  })

  const employeeBreakdown = Array.from(empMap.values()).sort(
    (a, b) => b.completedCreativeCount - a.completedCreativeCount
  )

  return {
    completedJobCount,
    completedCreativeCount,
    employeeBreakdown,
    credits: filteredCredits,
  }
}
