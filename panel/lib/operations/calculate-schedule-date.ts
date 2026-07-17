import type { OperationScheduleRule } from '@/types/domain'

/**
 * Belirli bir kural (OperationScheduleRule) ve tarih parametrelerine göre planlama tarihini hesaplar.
 *
 * @param rule Tarih hesaplama kuralı
 * @param params Ay, yıl ve referans olay tarihleri
 * @returns YYYY-MM-DD formatında tarih dizesi veya undefined
 */
export function calculateScheduleDate(
  rule: OperationScheduleRule,
  params: {
    month: number // 1-12
    year: number
    referenceEvents?: Record<string, string> // Örn. { shooting_date: "2026-07-02" }
  }
): string | undefined {
  const { month, year, referenceEvents = {} } = params

  const formatOutputDate = (d: Date): string => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  // 1. Sabit Ay Günü (fixed_day)
  if (rule.ruleType === 'fixed_day') {
    if (typeof rule.dayOfMonth !== 'number') return undefined
    
    // Ayın son gününü bul (örn. Şubat 28, Temmuz 31 gibi taşmaları önlemek için)
    const lastDayInMonth = new Date(year, month, 0).getDate()
    const targetDay = Math.min(rule.dayOfMonth, lastDayInMonth)
    
    const calculatedDate = new Date(year, month - 1, targetDay)
    return formatOutputDate(calculatedDate)
  }

  // 2. Referans Olaya Göre (relative_to_event)
  if (rule.ruleType === 'relative_to_event') {
    if (!rule.referenceEventType) return undefined
    
    const refEventDateStr = referenceEvents[rule.referenceEventType]
    if (!refEventDateStr) return undefined // Referans olay tarihi verilmemişse hesaplanamaz.

    const refDate = new Date(refEventDateStr)
    if (isNaN(refDate.getTime())) return undefined // Geçersiz tarih formatı.

    // Gün ofsetini uygula
    refDate.setDate(refDate.getDate() + (rule.offsetDays || 0))
    return formatOutputDate(refDate)
  }

  // 3. Ayın Belirli Haftasının Belirli Günü (monthly_week)
  if (rule.ruleType === 'monthly_week') {
    if (!rule.weekPosition || !rule.weekday) return undefined

    const weekdayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    }

    const targetDayOfWeek = weekdayMap[rule.weekday]
    if (targetDayOfWeek === undefined) return undefined

    // İlgili ayın tüm günlerini tarayarak hedef güne (örn. Cuma) uyan tarihleri listele
    const matchingDatesInMonth: Date[] = []
    const currentDate = new Date(year, month - 1, 1)

    while (currentDate.getMonth() === month - 1) {
      if (currentDate.getDay() === targetDayOfWeek) {
        matchingDatesInMonth.push(new Date(currentDate))
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    if (matchingDatesInMonth.length === 0) return undefined

    let selectedDate: Date | undefined

    switch (rule.weekPosition) {
      case 'first':
        selectedDate = matchingDatesInMonth[0]
        break
      case 'second':
        selectedDate = matchingDatesInMonth[1]
        break
      case 'third':
        selectedDate = matchingDatesInMonth[2]
        break
      case 'fourth':
        selectedDate = matchingDatesInMonth[3]
        break
      case 'last':
        selectedDate = matchingDatesInMonth[matchingDatesInMonth.length - 1]
        break
      default:
        return undefined
    }

    if (!selectedDate) return undefined
    return formatOutputDate(selectedDate)
  }

  // 4. Manuel Belirlenen Tarih (manual)
  if (rule.ruleType === 'manual') {
    return undefined // Manuel kurallar harici veya kullanıcı girdisiyle atanmalıdır.
  }

  return undefined
}
