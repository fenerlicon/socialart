'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, X } from 'lucide-react'

interface BrandDeleteDialogProps {
  isOpen: boolean
  brandName: string
  onClose: () => void
  onConfirm: () => void
}

export function BrandDeleteDialog({
  isOpen,
  brandName,
  onClose,
  onConfirm,
}: BrandDeleteDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-neutral-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-muted/20">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            Markayı Sil
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          <p className="text-xs text-muted-foreground leading-normal">
            <strong className="text-foreground">"{brandName}"</strong> markasını ve markaya ait tüm operasyon planları ile ekip eşleştirmelerini silmek istediğinizden emin misiniz?
          </p>
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 text-xs font-semibold">
            Dikkat: Bu işlem geri alınamaz!
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-muted/20 border-t border-neutral-800 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 text-xs px-4 border"
          >
            Vazgeç
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="h-9 text-xs px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow"
          >
            Evet, Kalıcı Olarak Sil
          </Button>
        </div>
      </div>
    </div>
  )
}
