import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, X, ShieldAlert, CheckSquare, Square } from 'lucide-react'

interface EmployeeDeleteDialogProps {
  isOpen: boolean
  employeeName: string
  isAssignedToBrands: boolean
  assignedBrandsCount: number
  onClose: () => void
  onConfirm: (releaseResponsibilities: boolean) => void
  isDeleting?: boolean
}

export function EmployeeDeleteDialog({
  isOpen,
  employeeName,
  isAssignedToBrands,
  assignedBrandsCount,
  onClose,
  onConfirm,
  isDeleting = false,
}: EmployeeDeleteDialogProps) {
  const [releaseToPool, setReleaseToPool] = useState(true)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-neutral-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-muted/20">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            {isAssignedToBrands ? (
              <ShieldAlert className="h-4 w-4 text-amber-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            )}
            Çalışanı Sil
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isDeleting}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isAssignedToBrands ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-normal">
                <strong className="text-foreground">"{employeeName}"</strong> isimli çalışanın aktif marka veya görev sorumlulukları bulunuyor.
              </p>
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 text-xs font-semibold leading-normal space-y-2">
                <div>
                  Bu çalışan şu anda <strong className="text-foreground">{assignedBrandsCount}</strong> marka veya operasyon sürecine atanmış durumda.
                </div>
                <button
                  type="button"
                  onClick={() => setReleaseToPool(!releaseToPool)}
                  className="flex items-center gap-2 text-left text-xs text-foreground hover:text-amber-300 transition-colors pt-1 cursor-pointer"
                >
                  {releaseToPool ? (
                    <CheckSquare className="h-4 w-4 text-amber-400 shrink-0" />
                  ) : (
                    <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span>Üzerindeki görevleri / sorumlulukları ortak havuza bırak</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-normal">
                <strong className="text-foreground">"{employeeName}"</strong> çalışanını ve çalışana ait yetki override'larını silmek istediğinizden emin misiniz?
              </p>
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 text-xs font-semibold">
                Dikkat: Bu işlem geri alınamaz!
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-muted/20 border-t border-neutral-800 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="h-9 text-xs px-4 border"
          >
            Vazgeç
          </Button>
          {isAssignedToBrands ? (
            <Button
              type="button"
              disabled={!releaseToPool || isDeleting}
              onClick={() => onConfirm(releaseToPool)}
              className="h-9 text-xs px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow disabled:opacity-50"
            >
              {isDeleting ? 'Siliniyor...' : 'Görevleri Havuza Bırak ve Sil'}
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isDeleting}
              onClick={() => onConfirm(false)}
              className="h-9 text-xs px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow"
            >
              {isDeleting ? 'Siliniyor...' : 'Evet, Kalıcı Olarak Sil'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
