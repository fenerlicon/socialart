import { supabase } from '@/lib/supabase/client'
import type { Report } from '@/types/domain'

export const ReportRepository = {
  mapRowToReport(row: any): Report {
    let contentVal = ''
    let links: string[] = []
    let files: string[] = []

    if (row.content && typeof row.content === 'object') {
      contentVal = row.content.text || ''
      links = row.content.links || []
      files = row.content.files || []
    } else if (typeof row.content === 'string') {
      try {
        const parsed = JSON.parse(row.content)
        contentVal = parsed.text || ''
        links = parsed.links || []
        files = parsed.files || []
      } catch {
        contentVal = row.content
      }
    }

    return {
      id: row.id,
      employeeId: row.employee_id,
      title: row.title,
      type: row.type,
      content: contentVal,
      links,
      files,
      status: row.status,
      date: row.date,
      createdAt: row.created_at,
    }
  },

  mapReportToRow(report: Partial<Report>) {
    const row: any = {}
    if (report.id !== undefined) row.id = report.id
    if (report.employeeId !== undefined) row.employee_id = report.employeeId
    if (report.title !== undefined) row.title = report.title
    if (report.type !== undefined) row.type = report.type
    
    // Store content as JSONB object { text: report.content, links: report.links, files: report.files }
    if (report.content !== undefined || report.links !== undefined || report.files !== undefined) {
      row.content = {
        text: report.content || '',
        links: report.links || [],
        files: report.files || [],
      }
    }
    
    if (report.status !== undefined) row.status = report.status
    if (report.date !== undefined) row.date = report.date
    if (report.createdAt !== undefined) row.created_at = report.createdAt
    return row
  },

  async getAll(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reports:', error)
      throw error
    }

    return (data || []).map(this.mapRowToReport)
  },

  async getById(id: string): Promise<Report | null> {
    if (!id) return null
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error(`Error fetching report with id ${id}:`, error)
      throw error
    }

    return data ? this.mapRowToReport(data) : null
  },

  async save(report: Report): Promise<Report> {
    const row = this.mapReportToRow(report)
    const { error } = await supabase
      .from('reports')
      .upsert(row)

    if (error) {
      console.error('Error saving report:', error)
      throw error
    }

    return report
  },

  async saveMultiple(reports: Report[]): Promise<void> {
    const rows = reports.map((report) => this.mapReportToRow(report))
    const { error } = await supabase
      .from('reports')
      .upsert(rows)

    if (error) {
      console.error('Error saving multiple reports:', error)
      throw error
    }
  },

  async update(id: string, fields: Partial<Omit<Report, 'id' | 'createdAt'>>, actorId?: string): Promise<Report | null> {
    const row = this.mapReportToRow(fields)
    if (actorId) row.updated_by = actorId

    const { data, error } = await supabase
      .from('reports')
      .update(row)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      console.error(`Error updating report ${id}:`, error)
      throw error
    }

    return data ? this.mapRowToReport(data) : null
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`Error deleting report ${id}:`, error)
      throw error
    }
  }
}
