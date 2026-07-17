'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { Employee, Notification } from '@/types/domain'
import { getStoredEmployees, getActiveEmployeeId } from '@/lib/storage/local-employee-store'
import {
  getNotificationsByEmployeeId,
  markAllNotificationsAsRead,
} from '@/lib/storage/local-notification-store'
import { NotificationCard } from './notification-card'
import { NotificationFilters } from './notification-filters'
import { NotificationEmptyState } from './notification-empty-state'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, CheckSquare, User, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function NotificationPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('')
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all | read | unread
  const [typeFilter, setTypeFilter] = useState('all')

  const loadData = useCallback(async () => {
    const employeeList = await getStoredEmployees()
    setEmployees(employeeList)

    const savedId = getActiveEmployeeId()
    if (savedId && employeeList.some((e) => e.id === savedId)) {
      if (currentEmployeeId !== savedId) {
        setCurrentEmployeeId(savedId)
      }
      const list = await getNotificationsByEmployeeId(savedId)
      setNotifications(list)
    } else if (employeeList.length > 0) {
      const defaultId = employeeList[0].id
      setCurrentEmployeeId(defaultId)
      const list = await getNotificationsByEmployeeId(defaultId)
      setNotifications(list)
    }
  }, [currentEmployeeId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length
  }, [notifications])

  const handleMarkAllRead = async () => {
    if (!currentEmployeeId) return
    await markAllNotificationsAsRead(currentEmployeeId)
    await loadData()
    toast.success('Tüm bildirimler okundu olarak işaretlendi.')
  }

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // 1. Search filter
      const query = searchQuery.toLowerCase().trim()
      if (query) {
        const titleMatch = n.title.toLowerCase().includes(query)
        const messageMatch = n.message.toLowerCase().includes(query)
        if (!titleMatch && !messageMatch) return false
      }

      // 2. Status filter
      if (statusFilter === 'unread' && n.isRead) return false
      if (statusFilter === 'read' && !n.isRead) return false

      // 3. Type filter
      if (typeFilter !== 'all' && n.type !== typeFilter) return false

      return true
    })
  }, [notifications, searchQuery, statusFilter, typeFilter])

  return (
    <div className="space-y-6">
      {/* Üst Bar: Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 border-neutral-900/40">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Bell className="h-5.5 w-5.5 text-blue-500" />
            Bildirimler
            {unreadCount > 0 && (
              <Badge className="bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs font-bold shrink-0">
                {unreadCount} Yeni
              </Badge>
            )}
          </h2>
          <p className="text-xs text-muted-foreground">
            Sistem bildirimlerini ve size gelen devir veya onay güncellemelerini takip edin.
          </p>
        </div>
      </div>

      {/* Kontroller */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <span className="text-xs text-muted-foreground font-medium">
          Toplam {filteredNotifications.length} bildirim listeleniyor.
        </span>

        {unreadCount > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="border-neutral-800 text-xs h-8 px-3 flex items-center gap-1.5 hover:bg-neutral-900"
          >
            <CheckSquare className="h-4 w-4 text-emerald-500" />
            Tümünü Okundu Yap
          </Button>
        )}
      </div>

      {/* Filtreleme Kartı */}
      <NotificationFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
      />

      {/* Bildirim Listesi */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <NotificationCard
              key={notif.id}
              notification={notif}
              onMarkReadSuccess={loadData}
            />
          ))}
        </div>
      ) : (
        <NotificationEmptyState
          message={
            searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Arama kriterlerinize veya filtrelerinize uygun bildirim bulunamadı.'
              : 'Profilinize gönderilmiş herhangi bir bildirim bulunmamaktadır.'
          }
        />
      )}
    </div>
  )
}
