// Skor aralıklarına göre etiket, renk ve ikon eşlemeleri

export type ScoreTier = 'success' | 'needs_work' | 'critical'

export function getScoreTier(score: number): ScoreTier {
  if (score >= 80) return 'success'
  if (score >= 60) return 'needs_work'
  return 'critical'
}

export const SCORE_TIER_LABELS: Record<ScoreTier, string> = {
  success: 'Başarılı',
  needs_work: 'Geliştirilmeli',
  critical: 'Kritik',
}

export const SCORE_TIER_COLORS: Record<ScoreTier, string> = {
  success: 'text-emerald-400',
  needs_work: 'text-amber-400',
  critical: 'text-red-400',
}

export const SCORE_TIER_BG: Record<ScoreTier, string> = {
  success: 'bg-emerald-500/10 border-emerald-500/20',
  needs_work: 'bg-amber-500/10 border-amber-500/20',
  critical: 'bg-red-500/10 border-red-500/20',
}

export const SCORE_TIER_BAR: Record<ScoreTier, string> = {
  success: 'bg-emerald-500',
  needs_work: 'bg-amber-500',
  critical: 'bg-red-500',
}

export const SCORE_TIER_RING: Record<ScoreTier, string> = {
  success: 'stroke-emerald-500',
  needs_work: 'stroke-amber-500',
  critical: 'stroke-red-500',
}

export const DIMENSION_LABELS: Record<string, string> = {
  disciplineScore: 'Disiplin',
  qualityScore: 'Kalite',
  operationScore: 'Operasyon',
  contributionScore: 'Katkı',
  communicationScore: 'İletişim',
  teamworkScore: 'Takım Çalışması',
  initiativeScore: 'İnisiyatif',
  problemSolvingScore: 'Problem Çözme',
  creativityScore: 'Yaratıcılık',
}

export const DIMENSION_ICONS: Record<string, string> = {
  disciplineScore: '⏱',
  qualityScore: '✨',
  operationScore: '⚙',
  contributionScore: '💡',
  communicationScore: '💬',
  teamworkScore: '🤝',
  initiativeScore: '🚀',
  problemSolvingScore: '🧩',
  creativityScore: '🎨',
}

export const QUARTER_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: 'Q1 — Ocak–Mart',
  2: 'Q2 — Nisan–Haziran',
  3: 'Q3 — Temmuz–Eylül',
  4: 'Q4 — Ekim–Aralık',
}

export const MONTH_LABELS: Record<number, string> = {
  1: 'Ocak',
  2: 'Şubat',
  3: 'Mart',
  4: 'Nisan',
  5: 'Mayıs',
  6: 'Haziran',
  7: 'Temmuz',
  8: 'Ağustos',
  9: 'Eylül',
  10: 'Ekim',
  11: 'Kasım',
  12: 'Aralık',
}

export function getMonthQuarter(month: number): 1 | 2 | 3 | 4 {
  if (month <= 3) return 1
  if (month <= 6) return 2
  if (month <= 9) return 3
  return 4
}
