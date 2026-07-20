import { v4 as uuidv4 } from 'uuid'
import { CalendarRepository } from '@/lib/repositories/CalendarRepository'
import type { CalendarEvent, CalendarEventType } from '@/types/domain'
export type { CalendarEvent, CalendarEventType } from '@/types/domain'

// Map database ends_at/starts_at format to local format
function translateDbToLocal(dbEvent: any): CalendarEvent {
  const startsAt = dbEvent.startsAt || new Date().toISOString()
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    type: dbEvent.type as CalendarEventType,
    brandId: dbEvent.brandId,
    employeeId: dbEvent.employeeId,
    date: startsAt.slice(0, 10), // YYYY-MM-DD
    time: startsAt.slice(11, 16), // HH:MM
    location: dbEvent.location,
    status: dbEvent.status as CalendarEvent['status']
  }
}

// Map local format to database starts_at/ends_at format
function translateLocalToDb(localEvent: CalendarEvent): any {
  const startsAt = new Date(`${localEvent.date}T${localEvent.time}:00`).toISOString()
  // Add 1 hour for endsAt
  const endsAt = new Date(new Date(`${localEvent.date}T${localEvent.time}:00`).getTime() + 60 * 60 * 1000).toISOString()

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
  const dbEvents = await CalendarRepository.getAll()
  return dbEvents.map(translateDbToLocal)
}

export async function saveCalendarEvents(events: CalendarEvent[]): Promise<void> {
  const dbEvents = events.map(translateLocalToDb)
  await CalendarRepository.saveMultiple(dbEvents)
}

export async function createCalendarEvent(input: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
  const newEvt: CalendarEvent = {
    ...input,
    id: uuidv4(),
  }
  const dbEvent = translateLocalToDb(newEvt)
  await CalendarRepository.save(dbEvent)
  return newEvt
}

export async function updateCalendarEvent(id: string, input: Partial<Omit<CalendarEvent, 'id'>>): Promise<void> {
  const existingList = await getStoredCalendarEvents()
  const existing = existingList.find(e => e.id === id)
  if (!existing) return

  const updated: CalendarEvent = { ...existing, ...input }
  const dbEvent = translateLocalToDb(updated)
  await CalendarRepository.save(dbEvent)
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  await CalendarRepository.delete(id)
}
