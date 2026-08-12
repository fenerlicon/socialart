import { v4 as uuidv4 } from 'uuid'
import { getStoredEmployees } from '@/lib/storage/local-employee-store'
import { getStoredReports, saveReports } from '@/lib/storage/local-reports-store'
import type { Report } from '@/types/domain'

/**
 * Checks all active employees for missing daily reports over the last 30 days.
 * If an employee was active and did not submit a report for a weekday,
 * a report with status "missing" is automatically inserted.
 */
export async function checkAndGenerateMissingReports(): Promise<number> {
  try {
    const employees = await getStoredEmployees()
    const activeEmployees = employees.filter(
      (e) =>
        e.employeeStatus === 'active' &&
        e.rolePackageId !== 'operasyon-yonetimi' &&
        e.rolePackageId !== 'kreatif-yonetim' &&
        e.rolePackageId !== 'kreatif-direktor'
    )
    if (activeEmployees.length === 0) return 0

    const reports = await getStoredReports()

    // Define rolling window: only check dates starting from SYSTEM_LAUNCH_DATE (2026-08-12)
    const SYSTEM_LAUNCH_DATE = '2026-08-12'
    const now = new Date()
    
    // Yesterday (today - 1 day)
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    // Launch date start
    const launchStartDate = new Date(`${SYSTEM_LAUNCH_DATE}T00:00:00`)

    // 30 days ago, but capped at launch date
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const startDate = thirtyDaysAgo < launchStartDate ? launchStartDate : thirtyDaysAgo

    // Generate weekday dates in YYYY-MM-DD format
    const datesToCheck: string[] = []
    const tempDate = new Date(startDate)
    while (tempDate <= yesterday) {
      const dayOfWeek = tempDate.getDay() // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const yyyy = tempDate.getFullYear()
        const mm = String(tempDate.getMonth() + 1).padStart(2, '0')
        const dd = String(tempDate.getDate()).padStart(2, '0')
        const dateStr = `${yyyy}-${mm}-${dd}`
        if (dateStr >= SYSTEM_LAUNCH_DATE) {
          datesToCheck.push(dateStr)
        }
      }
      tempDate.setDate(tempDate.getDate() + 1)
    }

    if (datesToCheck.length === 0) return 0

    // Create a map of existing reports for O(1) lookups
    // key: employeeId_date
    const reportMap = new Map<string, Report>()
    reports.forEach((r) => {
      if (r.type === 'daily') {
        reportMap.set(`${r.employeeId}_${r.date}`, r)
      }
    })

    const newMissingReports: Report[] = []

    activeEmployees.forEach((emp) => {
      // If employee has a created_at date, we only check dates after their creation date
      const empCreatedDate = emp.createdAt ? new Date(emp.createdAt) : null
      const formattedCreatedDate = empCreatedDate
        ? `${empCreatedDate.getFullYear()}-${String(empCreatedDate.getMonth() + 1).padStart(2, '0')}-${String(empCreatedDate.getDate()).padStart(2, '0')}`
        : null

      datesToCheck.forEach((dateStr) => {
        // Skip dates before employee was created
        if (formattedCreatedDate && dateStr < formattedCreatedDate) {
          return;
        }

        const key = `${emp.id}_${dateStr}`
        if (!reportMap.has(key)) {
          const newReport: Report = {
            id: uuidv4(),
            employeeId: emp.id,
            title: `Eksik Günlük Rapor`,
            type: 'daily',
            content: 'Bu tarihte günlük rapor girilmemiştir.',
            links: [],
            files: [],
            status: 'missing',
            date: dateStr,
            createdAt: `${dateStr}T23:59:59.000Z`, // Mark it at the end of that missed day
          }
          newMissingReports.push(newReport)
        }
      })
    })

    if (newMissingReports.length > 0) {
      // Save all new missing reports to Supabase
      await saveReports(newMissingReports)
      console.log(`Generated ${newMissingReports.length} missing reports automatically.`)
      return newMissingReports.length
    }

    return 0
  } catch (error) {
    console.error('Error auto-generating missing reports:', error)
    return 0
  }
}
