'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FiltersProps {
  searchQuery: string
  setSearchQuery: (val: string) => void
  statusFilter: string
  setStatusFilter: (val: string) => void
  typeFilter: string
  setTypeFilter: (val: string) => void
}

export function NotificationFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
}: FiltersProps) {
  
  const handleClear = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setTypeFilter('all')
  }

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || typeFilter !== 'all'

  const NOTIFICATION_TYPES = [
    { value: 'workflow_assigned', label: 'İş Atamaları' },
    { value: 'step_activated', label: 'Aktifleşen Adımlar' },
    { value: 'handoff_requested', label: 'Paslama Talepleri' },
    { value: 'handoff_accepted', label: 'Kabul Edilen Paslamalar' },
    { value: 'handoff_rejected', label: 'Reddedilen Paslamalar' },
    { value: 'workflow_completed', label: 'Tamamlanan İş Akışları' },
    { value: 'cycle_completed', label: 'Dönem Kapanışları' },
    { value: 'approval_required', label: 'Onay Gereksinimleri' },
    { value: 'system', label: 'Sistem Duyuruları' },
  ]

  return (
    <div className="rounded-2xl border bg-card/25 p-5 shadow-sm backdrop-blur-md space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {/* Search */}
        <div className="relative col-span-1 sm:col-span-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Bildirimlerde ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 bg-muted/10 border-neutral-800 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs bg-muted/10 border-neutral-700">
              <SelectValue placeholder="Okunma Durumu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Tüm Bildirimler</SelectItem>
              <SelectItem value="unread" className="text-xs">Sadece Okunmamışlar</SelectItem>
              <SelectItem value="read" className="text-xs">Sadece Okunmuşlar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notification Type Filter */}
        <div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 text-xs bg-muted/10 border-neutral-700">
              <SelectValue placeholder="Bildirim Tipi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Tüm Tipler</SelectItem>
              {NOTIFICATION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value} className="text-xs">
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground text-xs h-8 px-3 flex items-center gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Filtreleri Temizle
          </Button>
        </div>
      )}
    </div>
  )
}
