'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { Brand, Employee } from '@/types/domain'
import { getStoredBrands } from '@/lib/storage/local-brand-store'
import { getStoredEmployees, getActiveEmployeeId } from '@/lib/storage/local-employee-store'
import { AccessDenied } from '@/components/shared/access-denied'
import { getStoredCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, type CalendarEvent, type CalendarEventType } from '@/lib/storage/local-calendar-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  MapPin,
  Clock,
  User,
  ShieldAlert,
  Home,
  X,
  Trash2,
  Edit,
} from 'lucide-react'

const EVENT_TYPE_COLORS: Record<CalendarEventType, { bg: string; border: string; text: string; label: string }> = {
  meeting: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', label: 'Toplantı' },
  shoot: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', label: 'Çekim' },
  publish: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', label: 'Yayın' },
  deadline: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', label: 'Deadline' },
  campaign: { bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400', label: 'Kampanya' },
  leave: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', label: 'İzin' },
  holiday: { bg: 'bg-neutral-500/10', border: 'border-neutral-500/20', text: 'text-neutral-400', label: 'Resmi Tatil' },
  operation_cycle: { bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-400', label: 'Operasyon' },
}

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]

const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

export function CalendarPage() {
  const router = useRouter()

  // Base Data States
  const [brands, setBrands] = useState<Brand[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)

  // Calendar View State
  const [viewDate, setViewDate] = useState<Date>(new Date(2026, 6, 9)) // July 9, 2026
  const [selectedView, setSelectedView] = useState<'month' | 'week' | 'day'>('month')

  // Filters State
  const [filterBrand, setFilterBrand] = useState('all')
  const [filterEmployee, setFilterEmployee] = useState('all')
  const [filterType, setFilterType] = useState('all')

  // Add Event Form State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<CalendarEventType>('meeting')
  const [brandId, setBrandId] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [dateStr, setDateStr] = useState('2026-07-09')
  const [timeStr, setTimeStr] = useState('12:00')
  const [location, setLocation] = useState('')

  // Event Detail Modal State
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  // Generate Month Grid Data
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  // Filter events (Moved above conditional returns)
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      if (filterBrand !== 'all' && evt.brandId !== filterBrand) return false
      if (filterEmployee !== 'all' && evt.employeeId !== filterEmployee) return false
      if (filterType !== 'all' && evt.type !== filterType) return false
      return true
    })
  }, [events, filterBrand, filterEmployee, filterType])

  const monthDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay() // 0 is Sunday
    // Adjust for Monday start: Monday is 0, Sunday is 6
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1

    const totalDays = new Date(year, month + 1, 0).getDate()
    const days = []

    // Padding empty days before the first day of the month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push({ day: null, dateStr: null })
    }

    // Days of the month
    for (let d = 1; d <= totalDays; d++) {
      const dayDate = new Date(year, month, d)
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({
        day: d,
        dateStr: dateString,
        dateObj: dayDate,
      })
    }

    return days
  }, [year, month])

  useEffect(() => {
    async function loadData() {
      try {
        const emps = (await getStoredEmployees()) || []
        setEmployees(emps)
        const storedBrands = (await getStoredBrands()) || []
        setBrands(storedBrands)
        const storedEvents = (await getStoredCalendarEvents()) || []
        setEvents(storedEvents)

        const activeId = typeof window !== 'undefined' ? getActiveEmployeeId() : null
        let active = activeId ? emps.find((e) => e.id === activeId) : undefined
        if (!active && emps.length > 0) {
          active = emps[0]
        }
        if (active) {
          setActiveEmployee(active)
        } else {
          setActiveEmployee({
            id: 'temp-admin',
            fullName: 'Yönetici',
            email: 'admin@socialart.com',
            title: 'Yönetici',
            employeeStatus: 'active',
            workLocationStatus: 'office',
            rolePackageId: 'operasyon-yonetimi',
            teamIds: [],
            permissionOverrides: {},
            hasAdvancedCalendarAccess: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
        }
      } catch (err) {
        console.error('Error in calendar-page loadData:', err)
        setActiveEmployee({
          id: 'temp-admin',
          fullName: 'Yönetici',
          email: 'admin@socialart.com',
          title: 'Yönetici',
          employeeStatus: 'active',
          workLocationStatus: 'office',
          rolePackageId: 'operasyon-yonetimi',
          teamIds: [],
          permissionOverrides: {},
          hasAdvancedCalendarAccess: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // 1. Yetki Kontrolü (hasAdvancedCalendarAccess)
  if (loading) {
    return <div className="p-12 text-center text-xs text-muted-foreground">Yükleniyor...</div>
  }

  if (!activeEmployee) {
    return <AccessDenied />
  }

  // Get brand name & employee name
  const getBrandName = (id?: string) => {
    if (!id) return ''
    return brands.find((b) => b.id === id)?.name || ''
  }

  const getEmployeeName = (id?: string) => {
    if (!id) return ''
    return employees.find((e) => e.id === id)?.fullName || ''
  }



  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1))
  }

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)

  // Start Edit Mode from selected event
  const handleStartEdit = (evt: CalendarEvent) => {
    setEditingEventId(evt.id)
    setTitle(evt.title)
    setType(evt.type)
    setBrandId(evt.brandId || '')
    setEmployeeId(evt.employeeId || '')
    setDateStr(evt.date || '2026-07-09')
    setTimeStr(evt.time || '12:00')
    setLocation(evt.location || '')
    setIsEditing(true)
  }

  // Save Edit Event
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEventId || !title.trim() || !dateStr) {
      toast.error('Lütfen başlık ve tarih alanlarını doldurun.')
      return
    }

    await updateCalendarEvent(editingEventId, {
      title,
      type,
      brandId: brandId || undefined,
      employeeId: employeeId || undefined,
      date: dateStr,
      time: timeStr,
      location: location || undefined,
    })

    const storedEvents = await getStoredCalendarEvents()
    setEvents(storedEvents)
    setIsEditing(false)
    setSelectedEvent(null)
    toast.success('Etkinlik güncellendi!')
  }

  // Delete Event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Bu etkinlik kaydını silmek istediğinize emin misiniz?')) return

    await deleteCalendarEvent(eventId)
    const storedEvents = await getStoredCalendarEvents()
    setEvents(storedEvents)
    setSelectedEvent(null)
    toast.success('Etkinlik silindi!')
  }

  // Add Event submit
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !dateStr) {
      toast.error('Lütfen başlık ve tarih alanlarını doldurun.')
      return
    }

    await createCalendarEvent({
      title,
      type,
      brandId: brandId || undefined,
      employeeId: employeeId || undefined,
      date: dateStr,
      time: timeStr,
      location: location || undefined,
      status: 'pending',
    })

    const storedEvents = await getStoredCalendarEvents()
    setEvents(storedEvents)
    setIsModalOpen(false)
    toast.success('Etkinlik takvime eklendi!')
  }

  return (
    <div className="space-y-6">
      {/* Sayfa Başlığı */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-900/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Gelişmiş Takvim</h1>
          </div>
          <p className="text-muted-foreground text-xs mt-0.5">
            Ajans genelindeki çekim planlarını, toplantıları, teslim tarihlerini ve önemli kampanyaları tek bir yerden takip edin.
          </p>
        </div>
        <Button
          onClick={() => {
            setTitle('')
            setType('meeting')
            setBrandId(brands[0]?.id || '')
            setEmployeeId(employees[0]?.id || '')
            setDateStr('2026-07-09')
            setTimeStr('12:00')
            setLocation('')
            setIsModalOpen(true)
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-md self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Etkinlik Ekle
        </Button>
      </div>

      {/* Filtre Paneli */}
      <div className="rounded-2xl border border-neutral-900 bg-card/15 p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold mr-2">
          <Filter className="h-4 w-4" /> Filtrele:
        </div>

        <select
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
          className="h-8 rounded-lg bg-neutral-900 border border-neutral-850 px-2.5 text-xs text-neutral-200"
        >
          <option value="all">Tüm Markalar</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select
          value={filterEmployee}
          onChange={(e) => setFilterEmployee(e.target.value)}
          className="h-8 rounded-lg bg-neutral-900 border border-neutral-850 px-2.5 text-xs text-neutral-200"
        >
          <option value="all">Tüm Çalışanlar</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>{e.fullName}</option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-8 rounded-lg bg-neutral-900 border border-neutral-850 px-2.5 text-xs text-neutral-200"
        >
          <option value="all">Tüm Olay Tipleri</option>
          {Object.entries(EVENT_TYPE_COLORS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Takvim Yapısı */}
      <Card className="rounded-2xl border bg-card/10 shadow-lg p-6 backdrop-blur-md border-neutral-900 overflow-hidden">
        {/* Ay Başlığı ve Yönlendirmeler */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-foreground">
              {MONTH_NAMES[month]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                className="h-7 w-7 rounded-lg hover:bg-neutral-900 border border-neutral-850"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="h-7 w-7 rounded-lg hover:bg-neutral-900 border border-neutral-850"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex bg-neutral-950/80 border border-neutral-900 rounded-xl p-0.5 gap-0.5">
            {(['month', 'week', 'day'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setSelectedView(v)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                  selectedView === v
                    ? 'bg-purple-600/10 border border-purple-500/20 text-purple-400'
                    : 'text-neutral-500 hover:text-foreground'
                }`}
              >
                {v === 'month' ? 'Ay' : v === 'week' ? 'Hafta' : 'Gün'}
              </button>
            ))}
          </div>
        </div>

        {/* Haftanın Günleri Başlıkları */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {DAY_NAMES.map((name) => (
            <div key={name} className="py-2">{name}</div>
          ))}
        </div>

        {/* Aylık Izgara Günleri */}
        <div className="grid grid-cols-7 gap-2 min-h-[450px]">
          {monthDays.map((cell, idx) => {
            const dayEvents = cell.dateStr
              ? filteredEvents.filter((evt) => evt.date === cell.dateStr)
              : []

            return (
              <div
                key={idx}
                className={`rounded-xl border min-h-[75px] p-2 flex flex-col justify-between transition-colors overflow-hidden group ${
                  cell.day
                    ? 'bg-neutral-950/20 border-neutral-900/60 hover:border-neutral-800'
                    : 'bg-transparent border-transparent'
                }`}
              >
                {cell.day && (
                  <>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-neutral-400">{cell.day}</span>
                      {dayEvents.length > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                      )}
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-[75px] scrollbar-thin">
                      {dayEvents.map((evt) => {
                        const style = EVENT_TYPE_COLORS[evt.type] || { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', label: 'Etkinlik' }
                        return (
                          <div
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedEvent(evt)
                            }}
                            className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${style.bg} ${style.border} ${style.text} truncate cursor-pointer hover:brightness-125 transition-all`}
                            title={evt.title}
                          >
                            {evt.time} {evt.title}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Detay Modali */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm rounded-2xl border bg-neutral-900 shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-purple-400" />
              Etkinlik Detayları
            </h2>

            <div className="space-y-4">
              <div>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">BAŞLIK</span>
                <p className="text-sm font-bold text-foreground">{selectedEvent.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">ETKİNLİK TİPİ</span>
                  {(() => {
                    const style = EVENT_TYPE_COLORS[selectedEvent.type] || { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', label: selectedEvent.type || 'Etkinlik' }
                    return (
                      <Badge className={`mt-1 font-bold text-[9px] ${style.bg} ${style.border} ${style.text} shadow-none rounded-lg border`}>
                        {style.label}
                      </Badge>
                    )
                  })()}
                </div>

                {selectedEvent.brandId && (
                  <div>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">MARKA</span>
                    <p className="text-xs font-bold text-purple-400 mt-1">{getBrandName(selectedEvent.brandId)}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">TARİH & SAAT</span>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-300 mt-1">
                    <Clock className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                    <span>{selectedEvent.date} {selectedEvent.time}</span>
                  </div>
                </div>

                {selectedEvent.employeeId && (
                  <div>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">SORUMLU</span>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-300 mt-1">
                      <User className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                      <span>{getEmployeeName(selectedEvent.employeeId)}</span>
                    </div>
                  </div>
                )}
              </div>

              {selectedEvent.location && (
                <div>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">KONUM / LOKASYON</span>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-300 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                    <span>{selectedEvent.location}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons: Edit & Delete */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const evt = selectedEvent
                    setSelectedEvent(null)
                    handleStartEdit(evt)
                  }}
                  className="h-8 text-xs gap-1.5 rounded-xl border-neutral-800 text-neutral-300 hover:text-purple-400 hover:border-purple-500/50"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Düzenle
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="h-8 text-xs gap-1.5 rounded-xl border-rose-900/50 text-rose-400 hover:bg-rose-950/40 hover:border-rose-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Sil
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Etkinlik Düzenleme Modali */}
      {isEditing && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md rounded-2xl border bg-neutral-900 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-base font-bold text-foreground mb-4">Etkinliği Düzenle</h2>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-title">Başlık</Label>
                <Input
                  id="edit-title"
                  placeholder="Etkinlik veya randevu başlığı..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-type">Tip</Label>
                  <select
                    id="edit-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as CalendarEventType)}
                    className="h-9 w-full rounded-xl bg-neutral-950/60 border border-neutral-850 px-3 text-xs text-neutral-200"
                  >
                    <option value="meeting">Toplantı</option>
                    <option value="shoot">Çekim / Prodüksiyon</option>
                    <option value="revision">Revizyon / Teslimat</option>
                    <option value="deadline">Bitiş Tarihi (Deadline)</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-brand">İlişkili Marka</Label>
                  <select
                    id="edit-brand"
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="h-9 w-full rounded-xl bg-neutral-950/60 border border-neutral-850 px-3 text-xs text-neutral-200"
                  >
                    <option value="">Marka Yok</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-date">Tarih</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-time">Saat</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-employee">Sorumlu</Label>
                  <select
                    id="edit-employee"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="h-9 w-full rounded-xl bg-neutral-950/60 border border-neutral-850 px-3 text-xs text-neutral-200"
                  >
                    <option value="">Sorumlu Yok</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-loc">Lokasyon</Label>
                  <Input
                    id="edit-loc"
                    placeholder="Konum veya link..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="h-9 text-xs rounded-xl font-semibold border-neutral-850"
                >
                  Vazgeç
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-md"
                >
                  Güncelle
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Yeni Etkinlik Ekleme Modali */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md rounded-2xl border bg-neutral-900 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-base font-bold text-foreground mb-4">Yeni Etkinlik Ekle</h2>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Başlık</Label>
                <Input
                  id="title"
                  placeholder="Etkinlik veya çekim başlığı..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="type">Etkinlik Tipi</Label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value as CalendarEventType)}
                    className="h-9 w-full rounded-xl bg-neutral-950/60 border border-neutral-850 px-3 text-xs text-neutral-200"
                  >
                    {Object.entries(EVENT_TYPE_COLORS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="brand">Marka</Label>
                  <select
                    id="brand"
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="h-9 w-full rounded-xl bg-neutral-950/60 border border-neutral-850 px-3 text-xs text-neutral-200"
                  >
                    <option value="">Marka Yok</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="date">Tarih</Label>
                  <Input
                    id="date"
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="time">Saat</Label>
                  <Input
                    id="time"
                    type="time"
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="employee">Sorumlu</Label>
                  <select
                    id="employee"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="h-9 w-full rounded-xl bg-neutral-950/60 border border-neutral-850 px-3 text-xs text-neutral-200"
                  >
                    <option value="">Sorumlu Yok</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="loc">Lokasyon</Label>
                  <Input
                    id="loc"
                    placeholder="Konum veya link..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 text-xs rounded-xl font-semibold border-neutral-850"
                >
                  Vazgeç
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-md"
                >
                  Kaydet
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
