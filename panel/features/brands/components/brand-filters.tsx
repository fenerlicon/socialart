'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'
import type { Employee } from '@/types/domain'

interface BrandFiltersProps {
  searchQuery: string
  setSearchQuery: (q: string) => void
  statusFilter: string
  setStatusFilter: (s: string) => void
  packageFilter: string
  setPackageFilter: (p: string) => void
  managerFilter: string
  setManagerFilter: (m: string) => void
  sortBy: string
  setSortBy: (s: string) => void
  employees: Employee[]
}

export function BrandFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  packageFilter,
  setPackageFilter,
  managerFilter,
  setManagerFilter,
  sortBy,
  setSortBy,
  employees,
}: BrandFiltersProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5 bg-card/25 border rounded-2xl p-4 shadow-sm backdrop-blur-md">
      {/* Arama */}
      <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
        <Label className="text-xs text-muted-foreground font-semibold">Marka Ara</Label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder="Marka adı girin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs border bg-muted/10"
          />
        </div>
      </div>

      {/* Durum Filtresi */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-semibold">Durum</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 text-xs border bg-muted/10">
            <SelectValue placeholder="Tümü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Tümü</SelectItem>
            <SelectItem value="active" className="text-xs">Aktif</SelectItem>
            <SelectItem value="inactive" className="text-xs">Pasif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Paket Filtresi */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-semibold">Hizmet Paketi</Label>
        <Select value={packageFilter} onValueChange={setPackageFilter}>
          <SelectTrigger className="h-9 text-xs border bg-muted/10">
            <SelectValue placeholder="Tümü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Tümü</SelectItem>
            <SelectItem value="eko" className="text-xs">Eko Paket</SelectItem>
            <SelectItem value="business" className="text-xs">Business Paket</SelectItem>
            <SelectItem value="booster" className="text-xs">Booster Paket</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Operasyon Sorumlusu Filtresi */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-semibold">Operasyon Sorumlusu</Label>
        <Select value={managerFilter} onValueChange={setManagerFilter}>
          <SelectTrigger className="h-9 text-xs border bg-muted/10">
            <SelectValue placeholder="Tümü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Tümü</SelectItem>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id} className="text-xs">
                {emp.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sıralama */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-semibold">Sıralama Kriteri</Label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-9 text-xs border bg-muted/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest" className="text-xs">En Yeni</SelectItem>
            <SelectItem value="oldest" className="text-xs">En Eski</SelectItem>
            <SelectItem value="alphabetical" className="text-xs">İsme Göre A-Z</SelectItem>
            <SelectItem value="progress-high" className="text-xs">İlerleme Yüksek</SelectItem>
            <SelectItem value="progress-low" className="text-xs">İlerleme Düşük</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
