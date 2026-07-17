'use client'

import { Button } from '@/components/ui/button'
import { Plus, Search, FolderOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BrandEmptyStateProps {
  mode: 'empty' | 'no-results'
  onResetFilters?: () => void
}

export function BrandEmptyState({ mode, onResetFilters }: BrandEmptyStateProps) {
  const router = useRouter()

  if (mode === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-12 text-center rounded-2xl border border-dashed border-neutral-800 bg-card/20 backdrop-blur-md animate-in fade-in duration-300">
        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full mb-4 shrink-0">
          <Search className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-foreground mb-1">
          Filtrelere uygun marka bulunamadı
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm leading-normal mb-4">
          Arama teriminizi değiştirmeyi veya filtreleri temizlemeyi deneyebilirsiniz.
        </p>
        {onResetFilters && (
          <Button onClick={onResetFilters} variant="outline" size="sm" className="h-9 px-4 text-xs font-semibold">
            Filtreleri Temizle
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 py-16 text-center rounded-2xl border border-dashed border-neutral-800 bg-card/20 backdrop-blur-md animate-in fade-in duration-300">
      <div className="p-3.5 bg-blue-600/10 text-blue-500 rounded-full mb-4 shrink-0">
        <FolderOpen className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">
        Henüz Marka Eklenmedi
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm leading-normal mb-6">
        İlk markanızı oluşturarak ajans operasyonunu başlatın.
      </p>
      <Button
        onClick={() => router.push('/brands/new')}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 px-5 flex items-center gap-1.5 shadow"
      >
        <Plus className="h-4 w-4" /> Yeni Marka Ekle
      </Button>
    </div>
  )
}
