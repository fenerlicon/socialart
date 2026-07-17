import { supabase } from '@/lib/supabase/client'
import type { CalendarEvent } from '@/types/domain'

export const CalendarRepository = {
  mapRowToEvent(row: any): CalendarEvent {
    return {
      id: row.id,
      title: row.title,
      type: row.type,
      brandId: row.brand_id || undefined,
      employeeId: row.employee_id || undefined,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      location: row.location || undefined,
      status: row.status,
    }
  },

  mapEventToRow(event: Partial<CalendarEvent>) {
    const row: any = {}
    if (event.id !== undefined) row.id = event.id
    if (event.title !== undefined) row.title = event.title
    if (event.type !== undefined) row.type = event.type
    if (event.brandId !== undefined) row.brand_id = event.brandId
    if (event.employeeId !== undefined) row.employee_id = event.employeeId
    if (event.startsAt !== undefined) row.starts_at = event.startsAt
    if (event.endsAt !== undefined) row.ends_at = event.endsAt
    if (event.location !== undefined) row.location = event.location
    if (event.status !== undefined) row.status = event.status
    return row
  },

  async getAll(): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('starts_at', { ascending: true })

    if (error) {
      console.error('Error fetching calendar events:', error)
      throw error
    }

    return (data || []).map(this.mapRowToEvent)
  },

  async getById(id: string): Promise<CalendarEvent | null> {
    if (!id) return null
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error(`Error fetching calendar event ${id}:`, error)
      throw error
    }

    return data ? this.mapRowToEvent(data) : null
  },

  async save(event: CalendarEvent): Promise<CalendarEvent> {
    const row = this.mapEventToRow(event)
    const { error } = await supabase
      .from('calendar_events')
      .upsert(row)

    if (error) {
      console.error('Error saving calendar event:', error)
      throw error
    }

    return event
  },

  async saveMultiple(events: CalendarEvent[]): Promise<void> {
    const rows = events.map((event) => this.mapEventToRow(event))
    const { error } = await supabase
      .from('calendar_events')
      .upsert(rows)

    if (error) {
      console.error('Error saving multiple calendar events:', error)
      throw error
    }
  },

  async update(id: string, fields: Partial<Omit<CalendarEvent, 'id'>>, actorId?: string): Promise<CalendarEvent | null> {
    const row = this.mapEventToRow(fields)
    if (actorId) row.updated_by = actorId

    const { data, error } = await supabase
      .from('calendar_events')
      .update(row)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      console.error(`Error updating calendar event ${id}:`, error)
      throw error
    }

    return data ? this.mapRowToEvent(data) : null
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`Error deleting calendar event ${id}:`, error)
      throw error
    }
  }
}
