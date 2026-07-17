import { v4 as uuidv4 } from 'uuid'
import { ReportRepository } from '@/lib/repositories/ReportRepository'
import type { Report } from '@/types/domain'
export type { Report }

export async function getStoredReports(): Promise<Report[]> {
  return ReportRepository.getAll()
}

export async function saveReports(reports: Report[]): Promise<void> {
  await ReportRepository.saveMultiple(reports)
}

export async function createReport(input: Omit<Report, 'id' | 'createdAt'>): Promise<Report> {
  const newReport: Report = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    ...input,
  }
  await ReportRepository.save(newReport)
  return newReport
}

export async function updateReport(
  id: string,
  fields: Partial<Omit<Report, 'id' | 'createdAt'>>
): Promise<Report | undefined> {
  const r = await ReportRepository.update(id, fields)
  return r || undefined
}

export async function deleteReport(id: string): Promise<Report[]> {
  await ReportRepository.delete(id)
  return ReportRepository.getAll()
}
