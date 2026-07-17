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
  selectedBrandId: string
  setSelectedBrandId: (val: string) => void
  selectedCycleId: string
  setSelectedCycleId: (val: string) => void
  selectedType: string
  setSelectedType: (val: string) => void
  selectedResponsibility: string
  setSelectedResponsibility: (val: string) => void
  
  brandsList: { id: string; name: string }[]
  cyclesList: { id: string; label: string }[]
  typesList: string[]
  responsibilitiesList: string[]
}

export function MyWorkFilters({
  searchQuery,
  setSearchQuery,
  selectedBrandId,
  setSelectedBrandId,
  selectedCycleId,
  setSelectedCycleId,
  selectedType,
  setSelectedType,
  selectedResponsibility,
  setSelectedResponsibility,
  brandsList,
  cyclesList,
  typesList,
  responsibilitiesList,
}: FiltersProps) {
  
  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedBrandId('all')
    setSelectedCycleId('all')
    setSelectedType('all')
    setSelectedResponsibility('all')
  }

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedBrandId !== 'all' ||
    selectedCycleId !== 'all' ||
    selectedType !== 'all' ||
    selectedResponsibility !== 'all'

  // Türkçe sorumluluk rolleri etiket haritası
  const roleLabels: Record<string, string> = {
    operation: 'Operasyon',
    strategy: 'Strateji',
    digital_marketing: 'Dijital Pazarlama',
    social_media: 'Sosyal Medya',
    creative_management: 'Kreatif Yönetim',
    creative_director: 'Kreatif Direktör',
    graphic_design: 'Grafik Tasarım',
    video_editing: 'Video Kurgu',
    photography: 'Fotoğraf',
    videography: 'Video',
    reporting: 'Raporlama',
    custom: 'Özel Sorumluluk',
  }

  return (
    <div className="rounded-2xl border bg-card/25 p-5 shadow-sm backdrop-blur-md space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* Search */}
        <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Marka veya iş akışı ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 bg-muted/10 border-neutral-800 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Brand Filter */}
        <div className="space-y-1">
          <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
            <SelectTrigger className="h-9 text-xs bg-muted/10 border-neutral-800">
              <SelectValue placeholder="Marka Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Tüm Markalar</SelectItem>
              {brandsList.map((brand) => (
                <SelectItem key={brand.id} value={brand.id} className="text-xs">
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cycle Filter */}
        <div className="space-y-1">
          <Select value={selectedCycleId} onValueChange={setSelectedCycleId}>
            <SelectTrigger className="h-9 text-xs bg-muted/10 border-neutral-800">
              <SelectValue placeholder="Operasyon Dönemi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Tüm Dönemler</SelectItem>
              {cyclesList.map((cycle) => (
                <SelectItem key={cycle.id} value={cycle.id} className="text-xs">
                  {cycle.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Workflow Type Filter */}
        <div className="space-y-1">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="h-9 text-xs bg-muted/10 border-neutral-800">
              <SelectValue placeholder="İçerik Tipi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Tüm Tipler</SelectItem>
              {typesList.map((type) => (
                <SelectItem key={type} value={type} className="text-xs">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Responsibility Filter */}
        <div className="space-y-1">
          <Select value={selectedResponsibility} onValueChange={setSelectedResponsibility}>
            <SelectTrigger className="h-9 text-xs bg-muted/10 border-neutral-800">
              <SelectValue placeholder="Sorumluluk Rolü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Tüm Sorumluluklar</SelectItem>
              {responsibilitiesList.map((resp) => (
                <SelectItem key={resp} value={resp} className="text-xs">
                  {roleLabels[resp] || resp}
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
            onClick={handleClearFilters}
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
