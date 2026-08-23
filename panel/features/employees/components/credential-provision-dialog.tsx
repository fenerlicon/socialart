'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check, ShieldAlert, KeyRound, X } from 'lucide-react'
import { toast } from 'sonner'

export interface ProvisionedCredentialData {
  id: string
  fullName: string
  identifier: string
  temporaryPassword: string
}

interface CredentialProvisionDialogProps {
  open: boolean
  data: ProvisionedCredentialData | null
  onClose: () => void
}

export function CredentialProvisionDialog({
  open,
  data,
  onClose,
}: CredentialProvisionDialogProps) {
  const [copiedUser, setCopiedUser] = useState(false)
  const [copiedPass, setCopiedPass] = useState(false)

  if (!open || !data) return null

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(data.identifier)
    setCopiedUser(true)
    toast.success('Kullanıcı adı kopyalandı')
    setTimeout(() => setCopiedUser(false), 2000)
  }

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(data.temporaryPassword)
    setCopiedPass(true)
    toast.success('Geçici şifre kopyalandı')
    setTimeout(() => setCopiedPass(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-neutral-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2 text-amber-400">
            <KeyRound className="h-5 w-5" />
            <h3 className="text-base font-bold text-foreground">
              Panel Giriş Bilgileri Oluşturuldu
            </h3>
          </div>
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
        <div className="p-6 space-y-4">
          <p className="text-xs text-muted-foreground leading-normal">
            <strong className="text-foreground">{data.fullName}</strong> için sisteme ilk giriş geçici kimliği başarıyla üretildi.
          </p>

          {/* Security Alert */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-200">
            <ShieldAlert className="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-amber-300">Bu şifre yalnızca 1 kez gösterilir.</p>
              <p className="text-neutral-300">
                Lütfen bilgileri personele güvenli bir kanaldan iletin. Personel ilk girişinde kendi kalıcı şifresini oluşturmak zorunda kalacaktır.
              </p>
            </div>
          </div>

          {/* Credentials Box */}
          <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/80 p-4">
            {/* Username Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5 overflow-hidden">
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                  Kullanıcı Adı
                </span>
                <p className="font-mono text-sm font-semibold text-neutral-100 truncate">
                  {data.identifier}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-xs"
                onClick={handleCopyUsername}
              >
                {copiedUser ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedUser ? 'Kopyalandı' : 'Kopyala'}
              </Button>
            </div>

            <div className="border-t border-neutral-800" />

            {/* Temporary Password Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5 overflow-hidden">
                <span className="text-[11px] font-medium text-amber-400/90 uppercase tracking-wider">
                  Geçici Şifre
                </span>
                <p className="font-mono text-sm font-bold text-amber-300 tracking-wider truncate">
                  {data.temporaryPassword}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs"
                onClick={handleCopyPassword}
              >
                {copiedPass ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedPass ? 'Kopyalandı' : 'Kopyala'}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/20 border-t border-neutral-800 flex justify-end">
          <Button
            type="button"
            className="w-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-semibold shadow"
            onClick={onClose}
          >
            Bilgileri Kaydettim, Kapat
          </Button>
        </div>
      </div>
    </div>
  )
}
