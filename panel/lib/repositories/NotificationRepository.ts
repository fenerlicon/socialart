import { supabase } from '@/lib/supabase/client'
import type { Notification } from '@/types/domain'

export const NotificationRepository = {
  mapRowToNotification(row: any): Notification {
    return {
      id: row.id,
      recipientEmployeeId: row.recipient_employee_id,
      type: row.type,
      title: row.title,
      message: row.message,
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
