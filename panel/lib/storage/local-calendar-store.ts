import { v4 as uuidv4 } from 'uuid'
import { CalendarRepository } from '@/lib/repositories/CalendarRepository'
import type { CalendarEvent, CalendarEventType } from '@/types/domain'
export type { CalendarEvent, CalendarEventType } from '@/types/domain'

// Map database ends_at/starts_at format to local format safely
function translateDbToLocal(dbEvent: any): CalendarEvent {
  const startsAtRaw = dbEvent.startsAt || dbEvent.starts_at || new Date().toISOString()
  let dateStr = new Date().toISOString().slice(0, 10)
  let timeStr = '10:00'

  try {
    const d = new Date(startsAtRaw)
    if (!isNaN(d.getTime())) {
      dateStr = d.toISOString().slice(0, 10)
      timeStr = d.toISOString().slice(11, 16)
    }
  } catch (e) {
    console.warn('Invalid date parsing for calendar event:', startsAtRaw)
  }

  return {
    id: String(dbEvent.id || uuidv4()),
    title: String(dbEvent.title || 'İsimsiz Etkinlik'),
    type: (dbEvent.type || 'meeting') as CalendarEventType,
    brandId: dbEvent.brandId || dbEvent.brand_id || undefined,
    employeeId: dbEvent.employeeId || dbEvent.employee_id || undefined,
    date: dateStr,
    time: timeStr,
    location: dbEvent.location || undefined,
    status: (dbEvent.status || 'scheduled') as CalendarEvent['status']
  }
}

// Map local format to database starts_at/ends_at format safely
function translateLocalToDb(localEvent: CalendarEvent): any {
  let startsAt = new Date().toISOString()
  let endsAt = new Date(Date.now() + 3600000).toISOString()

  try {
    const dateVal = localEvent.date || new Date().toISOString().slice(0, 10)
    const timeVal = localEvent.time || '10:00'
    const parsedStart = new Date(`${dateVal}T${timeVal}:00`)
    if (!isNaN(parsedStart.getTime())) {
      startsAt = parsedStart.toISOString()
      endsAt = new Date(parsedStart.getTime() + 3600000).toISOString()
    }
  } catch (e) {
    console.warn('Invalid local date formatting:', localEvent)
  }

  return {
    id: localEvent.id,
    title: localEvent.title,
    type: localEvent.type,
    brandId: localEvent.brandId,
    employeeId: localEvent.employeeId,
    startsAt,
    endsAt,
    location: localEvent.location,
    status: localEvent.status
  }
}

export async function getStoredCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const dbEvents = await CalendarRepository.getAll()
    return (dbEvents || []).map(translateDbToLocal)
  } catch (err) {
    console.error('Failed to load calendar events from Supabase, returning fallback empty list:', err)
    return []
  }
}

export async function saveCalendarEvents(events: CalendarEvent[]): Promise<void> {
  try {
    const dbEvents = events.map(translateLocalToDb)
    await CalendarRepository.saveMultiple(dbEvents)
  } catch (err) {
    console.error('Failed to save calendar events to Supabase:', err)
  }
}

export async function createCalendarEvent(input: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
  const newEvt: CalendarEvent = {
    ...input,
    id: uuidv4(),
  }
  try {
    const dbEvent = translateLocalToDb(newEvt)
    await CalendarRepository.save(dbEvent)
  } catch (err) {
    console.error('Failed to create calendar event in Supabase:', err)
  }
  return newEvt
}

export async function updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
  try {
    const existing = await CalendarRepository.getById(id)
    if (!existing) return null

    const translatedExisting = translateDbToLocal(existing)
    const updated = { ...translatedExisting, ...updates }
    const dbEvent = translateLocalToDb(updated)
    await CalendarRepository.save(dbEvent)
    return updated
  } catch (err) {
    console.error('Failed to update calendar event in Supabase:', err)
    return null
  }
}

export async function deleteCalendarEvent(id: string): Promise<boolean> {
  try {
    await CalendarRepository.delete(id)
    return true
  } catch (err) {
    console.error('Failed to delete calendar event from Supabase:', err)
    return false
  }
}
