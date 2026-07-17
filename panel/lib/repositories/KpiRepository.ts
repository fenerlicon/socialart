import { supabase } from '@/lib/supabase/client'
import type { KpiCard, AgencyScoreSnapshot, KpiMetrics, ManagerReview } from '@/types/domain'
import { v4 as uuidv4 } from 'uuid'

// ---------------------------------------------------------------------------
// Row Mappers
// ---------------------------------------------------------------------------

function mapRowToKpiCard(row: any): KpiCard {
  return {
    id: row.id,
    employeeId: row.employee_id,
    period: row.period,
    year: row.year,
    month: row.month ?? undefined,
    quarter: row.quarter ?? undefined,
    disciplineScore: Number(row.discipline_score),
    qualityScore: Number(row.quality_score),
    operationScore: Number(row.operation_score),
    contributionScore: Number(row.contribution_score),
    communicationScore: row.communication_score != null ? Number(row.communication_score) : undefined,
    teamworkScore: row.teamwork_score != null ? Number(row.teamwork_score) : undefined,
    initiativeScore: row.initiative_score != null ? Number(row.initiative_score) : undefined,
    problemSolvingScore: row.problem_solving_score != null ? Number(row.problem_solving_score) : undefined,
    creativityScore: row.creativity_score != null ? Number(row.creativity_score) : undefined,
    overallScore: Number(row.overall_score),
    metrics: (row.metrics as KpiMetrics) || {} as KpiMetrics,
    managerReview: (row.manager_review as ManagerReview) || undefined,
    status: row.status,
    generatedAt: row.generated_at,
    publishedAt: row.published_at ?? undefined,
    deductions: row.deductions || [],
  }
}

function mapKpiCardToRow(card: Partial<KpiCard>): any {
  const row: any = {}
  if (card.id !== undefined) row.id = card.id
  if (card.employeeId !== undefined) row.employee_id = card.employeeId
  if (card.period !== undefined) row.period = card.period
  if (card.year !== undefined) row.year = card.year
  if (card.month !== undefined) row.month = card.month
  if (card.quarter !== undefined) row.quarter = card.quarter
  if (card.disciplineScore !== undefined) row.discipline_score = card.disciplineScore
  if (card.qualityScore !== undefined) row.quality_score = card.qualityScore
  if (card.operationScore !== undefined) row.operation_score = card.operationScore
  if (card.contributionScore !== undefined) row.contribution_score = card.contributionScore
  if (card.communicationScore !== undefined) row.communication_score = card.communicationScore
  if (card.teamworkScore !== undefined) row.teamwork_score = card.teamworkScore
  if (card.initiativeScore !== undefined) row.initiative_score = card.initiativeScore
  if (card.problemSolvingScore !== undefined) row.problem_solving_score = card.problemSolvingScore
  if (card.creativityScore !== undefined) row.creativity_score = card.creativityScore
  if (card.overallScore !== undefined) row.overall_score = card.overallScore
  if (card.metrics !== undefined) row.metrics = card.metrics
  if (card.managerReview !== undefined) row.manager_review = card.managerReview
  if (card.status !== undefined) row.status = card.status
  if (card.generatedAt !== undefined) row.generated_at = card.generatedAt
  if (card.publishedAt !== undefined) row.published_at = card.publishedAt
  if (card.deductions !== undefined) row.deductions = card.deductions
  row.updated_at = new Date().toISOString()
  return row
}

function mapRowToSnapshot(row: any): AgencyScoreSnapshot {
  return {
    id: row.id,
    month: row.month,
    year: row.year,
    overallScore: Number(row.overall_score),
    label: row.label,
    highlights: row.highlights || [],
    warnings: row.warnings || [],
    employeeCount: row.employee_count,
    generatedAt: row.generated_at,
  }
}

// ---------------------------------------------------------------------------
// KpiRepository
// ---------------------------------------------------------------------------

export const KpiRepository = {
  // ── KPI Cards ─────────────────────────────────────────────

  async getAllCards(): Promise<KpiCard[]> {
    const { data, error } = await supabase
      .from('kpi_cards')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    if (error) {
      console.error('Error fetching KPI cards:', error)
      throw error
    }

    return (data || []).map(mapRowToKpiCard)
  },

  async getCardsByEmployee(employeeId: string): Promise<KpiCard[]> {
    const { data, error } = await supabase
      .from('kpi_cards')
      .select('*')
      .eq('employee_id', employeeId)
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    if (error) {
      console.error(`Error fetching KPI cards for employee ${employeeId}:`, error)
      throw error
    }

    return (data || []).map(mapRowToKpiCard)
  },

  async getCardByEmployeeAndMonth(
    employeeId: string,
    year: number,
    month: number
  ): Promise<KpiCard | null> {
    const { data, error } = await supabase
      .from('kpi_cards')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('year', year)
      .eq('month', month)
      .eq('period', 'monthly')
      .maybeSingle()

    if (error) {
      console.error('Error fetching monthly KPI card:', error)
      throw error
    }

    return data ? mapRowToKpiCard(data) : null
  },

  async getCardByEmployeeAndQuarter(
    employeeId: string,
    year: number,
    quarter: 1 | 2 | 3 | 4
  ): Promise<KpiCard | null> {
    const { data, error } = await supabase
      .from('kpi_cards')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('year', year)
      .eq('quarter', quarter)
      .eq('period', 'quarterly')
      .maybeSingle()

    if (error) {
      console.error('Error fetching quarterly KPI card:', error)
      throw error
    }

    return data ? mapRowToKpiCard(data) : null
  },

  async getPublishedCardsForMonth(year: number, month: number): Promise<KpiCard[]> {
    const { data, error } = await supabase
      .from('kpi_cards')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .eq('period', 'monthly')
      .eq('status', 'published')

    if (error) {
      console.error('Error fetching published monthly KPI cards:', error)
      throw error
    }

    return (data || []).map(mapRowToKpiCard)
  },

  async saveCard(card: KpiCard): Promise<KpiCard> {
    const id = card.id || uuidv4()
    const row = mapKpiCardToRow({ ...card, id })
    const { data, error } = await supabase
      .from('kpi_cards')
      .upsert(row)
      .select()
      .single()

    if (error) {
      console.error('Error saving KPI card:', error)
      throw error
    }

    return mapRowToKpiCard(data)
  },

  async publishCard(cardId: string): Promise<void> {
    const { error } = await supabase
      .from('kpi_cards')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', cardId)

    if (error) {
      console.error('Error publishing KPI card:', error)
      throw error
    }
  },

  async updateManagerScores(
    cardId: string,
    scores: {
      communicationScore?: number
      teamworkScore?: number
      initiativeScore?: number
      problemSolvingScore?: number
      creativityScore?: number
      overallScore: number
      managerReview?: ManagerReview
      deductions?: any[]
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('kpi_cards')
      .update({
        communication_score: scores.communicationScore ?? null,
        teamwork_score: scores.teamworkScore ?? null,
        initiative_score: scores.initiativeScore ?? null,
        problem_solving_score: scores.problemSolvingScore ?? null,
        creativity_score: scores.creativityScore ?? null,
        overall_score: scores.overallScore,
        manager_review: scores.managerReview ?? null,
        deductions: scores.deductions ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cardId)

    if (error) {
      console.error('Error updating manager scores:', error)
      throw error
    }
  },

  // ── Agency Score Snapshots ─────────────────────────────────

  async getAllSnapshots(): Promise<AgencyScoreSnapshot[]> {
    const { data, error } = await supabase
      .from('agency_score_snapshots')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    if (error) {
      console.error('Error fetching agency score snapshots:', error)
      throw error
    }

    return (data || []).map(mapRowToSnapshot)
  },

  async getSnapshotForMonth(year: number, month: number): Promise<AgencyScoreSnapshot | null> {
    const { data, error } = await supabase
      .from('agency_score_snapshots')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .maybeSingle()

    if (error) {
      console.error('Error fetching agency score snapshot:', error)
      throw error
    }

    return data ? mapRowToSnapshot(data) : null
  },

  async saveSnapshot(snapshot: Omit<AgencyScoreSnapshot, 'id'>): Promise<AgencyScoreSnapshot> {
    const row = {
      month: snapshot.month,
      year: snapshot.year,
      overall_score: snapshot.overallScore,
      label: snapshot.label,
      highlights: snapshot.highlights,
      warnings: snapshot.warnings,
      employee_count: snapshot.employeeCount,
      generated_at: snapshot.generatedAt,
    }

    const { data, error } = await supabase
      .from('agency_score_snapshots')
      .upsert(row, { onConflict: 'year,month' })
      .select()
      .single()

    if (error) {
      console.error('Error saving agency score snapshot:', error)
      throw error
    }

    return mapRowToSnapshot(data)
  },
}
