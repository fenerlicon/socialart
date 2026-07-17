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

interface EmployeeFiltersProps {
  searchQuery: string
  setSearchQuery: (q: string) => void
  statusFilter: string
  setStatusFilter: (s: string) => void
  locationFilter: string
  setLocationFilter: (l: string) => void
  packageFilter: string
  setPackageFilter: (p: string) => void
  sortBy: string
  setSortBy: (s: string) => void
}

export function EmployeeFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  locationFilter,
  setLocationFilter,
  packageFilter,
  setPackageFilter,
  sortBy,
  setSortBy,
}: EmployeeFiltersProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5 bg-card/25 border rounded-2xl p-4 shadow-sm backdrop-blur-md">
      {/* Arama */}
      <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
        <Label className="text-xs text-muted-foreground font-semibold">Çalışan Ara</Label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder="Ad soyad veya e-posta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs border bg-muted/10"
          />
        </div>
      </div>

      {/* Çalışan Durumu Filtresi */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-semibold">Çalışan Durumu</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 text-xs border bg-muted/10">
            <SelectValue placeholder="Tümü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Tümü</SelectItem>
            <SelectItem value="active" className="text-xs">Aktif</SelectItem>
            <SelectItem value="inactive" className="text-xs">Pasif</SelectItem>
            <SelectItem value="probation" className="text-xs">Deneme Süreci</SelectItem>
            <SelectItem value="intern" className="text-xs">Stajyer</SelectItem>
            <SelectItem value="part_time" className="text-xs">Part Time</SelectItem>
            <SelectItem value="freelance" className="text-xs">Freelance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Çalışma Konumu Filtresi */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-semibold">Çalışma Konumu</Label>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="h-9 text-xs border bg-muted/10">
            <SelectValue placeholder="Tümü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Tümü</SelectItem>
            <SelectItem value="office" className="text-xs">Ofiste</SelectItem>
            <SelectItem value="remote" className="text-xs">Evden Çalışıyor</SelectItem>
            <SelectItem value="field" className="text-xs">Sahada</SelectItem>
            <SelectItem value="hybrid" className="text-xs">Hibrit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rol Paketi Filtresi */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-semibold">Rol Paketi</Label>
        <Select value={packageFilter} onValueChange={setPackageFilter}>
          <SelectTrigger className="h-9 text-xs border bg-muted/10">
            <SelectValue placeholder="Tümü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Tümü</SelectItem>
            <SelectItem value="operasyon-yonetimi" className="text-xs">Operasyon Yönetimi</SelectItem>
            <SelectItem value="strateji-musteri-yonetimi" className="text-xs">Strateji & Müşteri Yönetimi</SelectItem>
            <SelectItem value="dijital-pazarlama" className="text-xs">Dijital Pazarlama</SelectItem>
            <SelectItem value="sosyal-medya-yonetimi" className="text-xs">Sosyal Medya Yönetimi</SelectItem>
            <SelectItem value="kreatif-yonetim" className="text-xs">Kreatif Yönetim</SelectItem>
            <SelectItem value="kreatif-direktor" className="text-xs">Kreatif Direktör</SelectItem>
            <SelectItem value="grafik-tasarim" className="text-xs">Grafik Tasarım</SelectItem>
            <SelectItem value="video-kurgu" className="text-xs">Video Kurgu</SelectItem>
            <SelectItem value="fotograf-uretimi" className="text-xs">Fotoğraf Üretimi</SelectItem>
            <SelectItem value="video-uretimi" className="text-xs">Video Üretimi</SelectItem>
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
            <SelectItem value="alphabetical-desc" className="text-xs">İsme Göre Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
