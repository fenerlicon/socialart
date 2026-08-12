import { supabase } from '@/lib/supabase/client'
import type { Notification } from '@/types/domain'

function formatNotificationMessage(msg: string, type?: string): string {
  if (!msg) return ''
  const trimmed = msg.trim()
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const obj = JSON.parse(trimmed)
      // 1. Calendar event
      if (type === 'calendar_event' || obj.event_type || obj.starts_at || obj.date) {
        const parts: string[] = []
        if (obj.event_type_label) parts.push(obj.event_type_label)
        else if (obj.event_type) parts.push(obj.event_type)
        
        if (obj.date && obj.time) parts.push(`Tarih: ${obj.date} • Saat: ${obj.time}`)
        else if (obj.starts_at) {
          const d = new Date(obj.starts_at)
          parts.push(`Tarih: ${d.toLocaleDateString('tr-TR')} ${d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`)
        }
        
        if (obj.location) parts.push(`Konum: ${obj.location}`)
        if (obj.notes && obj.notes.trim()) parts.push(`Not: ${obj.notes.trim()}`)
        else if (obj.description && obj.description.trim()) parts.push(`Not: ${obj.description.trim()}`)
        
        return parts.length > 0 ? parts.join(' • ') : (obj.title || 'Takvim etkinliği kaydedildi.')
      }

      // 2. Payment request
      if (type === 'payment_request' || obj.amount || obj.total_amount) {
        const amt = obj.total_amount || obj.amount
        const parts: string[] = []
        if (obj.client_name) parts.push(`Müşteri: ${obj.client_name}`)
        if (amt) parts.push(`Tutar: ₺${Number(amt).toLocaleString('tr-TR')}`)
        if (obj.title) parts.push(`Açıklama: ${obj.title}`)
        if (obj.description) parts.push(obj.description)
        return parts.join(' • ')
      }

      // 3. GPT Task
      if (type === 'gpt_assigned_task' || obj.assignee_name || obj.due_date) {
        const parts: string[] = []
        if (obj.assignee_name) parts.push(`Atanan: ${obj.assignee_name}`)
        if (obj.due_date && obj.due_date !== 'Belirtilmedi') parts.push(`Teslim: ${obj.due_date}`)
        if (obj.description) parts.push(`Açıklama: ${obj.description}`)
        return parts.join(' • ')
      }

      // 4. Personal Todo
      if (type === 'personal_todo' || obj.category) {
        const parts: string[] = []
        if (obj.title) parts.push(`Görev: ${obj.title}`)
        if (obj.due_date) parts.push(`Tarih: ${obj.due_date}`)
        if (obj.notes) parts.push(`Not: ${obj.notes}`)
        return parts.join(' • ')
      }

      return obj.message || obj.description || obj.title || trimmed
    } catch {
      return trimmed
    }
  }
  return trimmed
}

export const NotificationRepository = {
  mapRowToNotification(row: any): Notification {
    return {
      id: row.id,
      recipientEmployeeId: row.recipient_employee_id,
      type: row.type,
      title: row.title,
      message: formatNotificationMessage(row.message, row.type),
      relatedEntityType: row.related_entity_type,
      relatedEntityId: row.related_entity_id,
      isRead: row.is_read,
      createdAt: row.created_at,
      readAt: row.read_at || undefined,
    }
  },

  mapNotificationToRow(notification: Partial<Notification>) {
    const row: any = {}
    if (notification.id !== undefined) row.id = notification.id
    if (notification.recipientEmployeeId !== undefined) row.recipient_employee_id = notification.recipientEmployeeId
    if (notification.type !== undefined) row.type = notification.type
    if (notification.title !== undefined) row.title = notification.title
    if (notification.message !== undefined) row.message = notification.message
    if (notification.relatedEntityType !== undefined) row.related_entity_type = notification.relatedEntityType
    if (notification.relatedEntityId !== undefined) row.related_entity_id = notification.relatedEntityId
    if (notification.isRead !== undefined) row.is_read = notification.isRead
    if (notification.createdAt !== undefined) row.created_at = notification.createdAt
    if (notification.readAt !== undefined) row.read_at = notification.readAt
    return row
  },

  async getByEmployeeId(employeeId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_employee_id', employeeId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(`Error fetching notifications for employee ${employeeId}:`, error)
      throw error
    }

    return (data || []).map(this.mapRowToNotification)
  },

  async getUnreadByEmployeeId(employeeId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_employee_id', employeeId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(`Error fetching unread notifications for employee ${employeeId}:`, error)
      throw error
    }

    return (data || []).map(this.mapRowToNotification)
  },

  async save(notification: Notification): Promise<void> {
    // Check duplicate: Unread notification with same recipient, type, relatedEntity
    const { data, error: checkError } = await supabase
      .from('notifications')
      .select('id')
      .eq('recipient_employee_id', notification.recipientEmployeeId)
      .eq('type', notification.type)
      .eq('related_entity_type', notification.relatedEntityType)
      .eq('related_entity_id', notification.relatedEntityId)
      .eq('is_read', false)
      .limit(1)

    if (checkError) throw checkError
    if (data && data.length > 0) return // Skip duplicate

    const row = this.mapNotificationToRow(notification)
    const { error } = await supabase
      .from('notifications')
      .insert(row)

    if (error) {
      console.error('Error insert notification:', error)
      throw error
    }
  },

  async saveMultiple(notifications: Notification[]): Promise<void> {
    for (const notification of notifications) {
      await this.save(notification)
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)

    if (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error)
      throw error
    }
  },

  async markAllAsRead(employeeId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('recipient_employee_id', employeeId)
      .eq('is_read', false)

    if (error) {
      console.error(`Error marking all notifications as read for employee ${employeeId}:`, error)
      throw error
    }
  },

  async delete(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) {
      console.error(`Error deleting notification ${notificationId}:`, error)
      throw error
    }
  }
}
