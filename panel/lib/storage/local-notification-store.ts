import type { Notification } from '@/types/domain'
import { NotificationRepository } from '@/lib/repositories/NotificationRepository'

export async function getStoredNotifications(): Promise<Notification[]> {
  // Let's implement getting all notifications or just return an empty array if not used directly
  const { supabase } = require('@/lib/supabase/client')
  const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('Error fetching all notifications:', error)
    return []
  }
  return (data || []).map((row: any) => NotificationRepository.mapRowToNotification(row))
}

export async function getNotificationsByEmployeeId(employeeId: string): Promise<Notification[]> {
  return NotificationRepository.getByEmployeeId(employeeId)
}

export async function getUnreadNotificationsByEmployeeId(employeeId: string): Promise<Notification[]> {
  return NotificationRepository.getUnreadByEmployeeId(employeeId)
}

export async function saveNotification(notification: Notification): Promise<void> {
  await NotificationRepository.save(notification)
}

export async function saveNotifications(notifications: Notification[]): Promise<void> {
  await NotificationRepository.saveMultiple(notifications)
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await NotificationRepository.markAsRead(notificationId)
}

export async function markAllNotificationsAsRead(employeeId: string): Promise<void> {
  await NotificationRepository.markAllAsRead(employeeId)
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await NotificationRepository.delete(notificationId)
}
