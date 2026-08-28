'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Link2, Paperclip, Trash, Camera, Film, FileText, AlertCircle, CheckCircle2, Send } from 'lucide-react'
import { toast } from 'sonner'

export function isValidUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== 'string') return false
  const trimmed = urlString.trim()
  if (!trimmed) return false
  try {
    const url = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`)
    return Boolean(url.hostname && (url.hostname.includes('.') || url.hostname === 'localhost'))
  } catch {
    return false
  }
}

interface TaskDeliveryModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (deliveryNote: string, links: string[], files: string[]) => void
  taskTitle: string
  stepTitle?: string
  stepTemplateId?: string
  requiresApproval?: boolean
}

type RequirementType = 'shooting' | 'editing' | 'report' | 'none'

function detectRequirement(stepTitle: string, stepTemplateId: string): RequirementType {
  const title = (stepTitle || '').toLowerCase()
  const tmpl = (stepTemplateId || '').toLowerCase()

  if (
    title.includes('çekim') || title.includes('fotoğraf') || title.includes('foto') ||
    tmpl.includes('cekim') || tmpl.includes('fotograf') || tmpl.includes('shooting') || tmpl.includes('photo')
  ) return 'shooting'

  if (
    title.includes('kurgu') || title.includes('montaj') || title.includes('video') || title.includes('edit') ||
    tmpl.includes('kurgu') || tmpl.includes('montaj') || tmpl.includes('video') || tmpl.includes('edit')
  ) return 'editing'

  if (
    title.includes('rapor') || title.includes('sunum') || title.includes('presentation') || title.includes('report') ||
    tmpl.includes('rapor') || tmpl.includes('sunum') || tmpl.includes('report')
  ) return 'report'

  return 'none'
}

const REQUIREMENT_CONFIG: Record<RequirementType, {
  icon: React.ReactNode
  color: string
  borderColor: string
  bgColor: string
  title: string
  description: string
  placeholder: string
  label: string
} | null> = {
  shooting: {
    icon: <Camera className="h-4 w-4" />,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/[0.06]',
    title: 'Ham Dosya Linki Zorunludur',
    description: 'Çekim tamamlandıktan sonra ham dosyaların (RAW/MP4 vb.) Google Drive veya benzeri bir bulut linkini girmeniz zorunludur.',
    placeholder: 'https://drive.google.com/drive/folders/... (ham çekim dosyaları)',
    label: '📷 Çekim Ham Dosyaları — Drive Linki',
  },
  editing: {
    icon: <Film className="h-4 w-4" />,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/[0.06]',
    title: 'Hazır Video Linki Zorunludur',
    description: 'Kurgu tamamlandıktan sonra hazır videonun Google Drive veya benzeri paylaşım linkini girmeniz zorunludur.',
    placeholder: 'https://drive.google.com/file/d/... (kurgulanmış hazır video)',
    label: '🎬 Kurgulanmış Hazır Video — Drive Linki',
  },
  report: {
    icon: <FileText className="h-4 w-4" />,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-500/[0.06]',
    title: 'Belge Linki Zorunludur',
    description: 'Rapor veya sunum teslim edilirken ilgili belgenin (Google Docs, Slides, PDF vb.) linkini girmeniz zorunludur.',
    placeholder: 'https://docs.google.com/presentation/d/... (rapor/sunum belgesi)',
    label: '📄 Rapor / Sunum Belgesi — Drive/Docs Linki',
  },
  none: null,
}

export function TaskDeliveryModal({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  stepTitle = '',
  stepTemplateId = '',
  requiresApproval = false,
}: TaskDeliveryModalProps) {
  const [deliveryNote, setDeliveryNote] = useState('')
  const [requiredLink, setRequiredLink] = useState('')
  const [links, setLinks] = useState<string[]>([''])
  const [files, setFiles] = useState<string[]>([''])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const requirementType = detectRequirement(stepTitle, stepTemplateId)
  const requirementConfig = REQUIREMENT_CONFIG[requirementType]

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitAttempted(true)
    setErrorMessage(null)

    // 1. Description validation
    if (!deliveryNote.trim()) {
      setErrorMessage('Teslim açıklaması zorunludur.')
      toast.error('Teslim açıklaması zorunludur.')
      return
    }

    // 2. Link collection & URL validation
    const rawLinks = [
      ...(requiredLink.trim() ? [requiredLink.trim()] : []),
      ...links.map((l) => l.trim()).filter(Boolean),
      ...files.map((f) => f.trim()).filter(Boolean),
    ]

    if (rawLinks.length === 0) {
      setErrorMessage('Onaya göndermek için en az bir teslim linki eklemelisiniz.')
      toast.error('Onaya göndermek için en az bir teslim linki eklemelisiniz.')
      return
    }

    const invalidLink = rawLinks.find((l) => !isValidUrl(l))
    if (invalidLink) {
      setErrorMessage(`Geçersiz bağlantı adresi: "${invalidLink}". Lütfen geçerli bir URL giriniz.`)
      toast.error('Lütfen geçerli bir bağlantı adresi (URL) giriniz.')
      return
    }

    const validLinks = [
      ...(requiredLink.trim() ? [requiredLink.trim()] : []),
      ...links.map((l) => l.trim()).filter(Boolean),
    ]
    const validFiles = files.map((f) => f.trim()).filter(Boolean)

    onConfirm(deliveryNote.trim(), validLinks, validFiles)

    setDeliveryNote('')
    setRequiredLink('')
    setLinks([''])
    setFiles([''])
    setErrorMessage(null)
    setSubmitAttempted(false)
  }

  return (
    <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <Card className="w-full max-w-lg max-h-[calc(100dvh-2rem)] flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl relative overflow-hidden my-auto">
        {/* Top accent */}
        <div className="h-1 w-full shrink-0 bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-500" />

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Header */}
          <div className="p-5 sm:p-6 pb-4 border-b border-neutral-800/80 shrink-0 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-foreground">
                {requiresApproval ? 'Görevi Teslim Et ve Onaya Gönder' : 'Görevi Teslim Et ve Tamamla'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Görev: <span className="text-purple-400 font-semibold">{taskTitle}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 shrink-0 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
            {/* Global Error Banner */}
            {errorMessage && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Zorunlu Link Bölümü (Görev tipine göre) */}
            {requirementConfig && (
              <div className={`rounded-xl border p-4 space-y-3 ${requirementConfig.borderColor} ${requirementConfig.bgColor}`}>
                <div className="flex items-start gap-2">
                  <span className={requirementConfig.color}>{requirementConfig.icon}</span>
                  <div className="space-y-0.5">
                    <p className={`text-xs font-black ${requirementConfig.color}`}>{requirementConfig.title}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{requirementConfig.description}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className={`text-[10px] font-bold uppercase tracking-wider ${requirementConfig.color}`}>
                    {requirementConfig.label} <span className="text-rose-400">*</span>
                  </Label>
                  <Input
                    placeholder={requirementConfig.placeholder}
                    value={requiredLink}
                    onChange={(e) => setRequiredLink(e.target.value)}
                    className={`h-9 text-xs bg-neutral-900/80 border-neutral-700 focus:ring-1 ${
                      submitAttempted && !requiredLink.trim() ? 'border-red-500/60 ring-1 ring-red-500/30' : ''
                    }`}
                  />
                  {requiredLink.trim() && isValidUrl(requiredLink) && (
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Geçerli link eklendi
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Teslim Notu */}
            <div className="space-y-1.5">
              <Label htmlFor="deliveryNote" className="text-xs font-bold text-neutral-200">
                Teslim Açıklaması / Notu <span className="text-rose-400">*</span>
              </Label>
              <textarea
                id="deliveryNote"
                rows={3}
                placeholder="Görevin teslimi hakkında bilgi verin (Örn. Marka Kampanya Banner Seti tamamlandı, 4 format hazırlandı...)..."
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                className={`w-full rounded-xl bg-neutral-900/60 border px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none ${
                  submitAttempted && !deliveryNote.trim() ? 'border-rose-500/60 ring-1 ring-rose-500/30' : 'border-neutral-800'
                }`}
              />
              {submitAttempted && !deliveryNote.trim() && (
                <p className="text-[10px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Teslim açıklaması zorunludur.
                </p>
              )}
            </div>

            {/* Teslim / Görsel / Drive Bağlantıları */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1 text-xs text-neutral-200 font-bold">
                  <Link2 className="h-3.5 w-3.5 text-blue-400" />
                  Teslim / Görsel / Drive Linki <span className="text-rose-400">*</span>
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setLinks([...links, ''])}
                  className="h-5 text-[10px] text-purple-400 font-bold px-1.5 hover:bg-neutral-900"
                >
                  + Link Ekle
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Google Drive, Figma, WeTransfer veya doğrudan dosya linki giriniz.
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {links.map((link, idx) => (
                  <div key={`link-${idx}`} className="flex items-center gap-2">
                    <Input
                      placeholder="https://drive.google.com/... veya https://www.figma.com/..."
                      value={link}
                      onChange={(e) => {
                        const updated = [...links]
                        updated[idx] = e.target.value
                        setLinks(updated)
                      }}
                      className="h-9 text-xs bg-neutral-900/60 border-neutral-800"
                    />
                    {links.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setLinks(links.filter((_, i) => i !== idx))}
                        className="h-8 w-8 text-rose-400 shrink-0 hover:bg-rose-500/10"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Ek Dosya Linkleri */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1 text-xs text-neutral-300">
                  <Paperclip className="h-3.5 w-3.5 text-purple-400" />
                  Ek Dosya Linkleri (WeTransfer / Bulut / Arşiv)
                  <span className="text-[9px] text-muted-foreground font-normal">(isteğe bağlı)</span>
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setFiles([...files, ''])}
                  className="h-5 text-[10px] text-purple-400 font-bold px-1.5 hover:bg-neutral-900"
                >
                  + Dosya Linki Ekle
                </Button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {files.map((file, idx) => (
                  <div key={`file-${idx}`} className="flex items-center gap-2">
                    <Input
                      placeholder="https://wetransfer.com/..."
                      value={file}
                      onChange={(e) => {
                        const updated = [...files]
                        updated[idx] = e.target.value
                        setFiles(updated)
                      }}
                      className="h-9 text-xs bg-neutral-900/60 border-neutral-800"
                    />
                    {files.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                        className="h-8 w-8 text-rose-400 shrink-0 hover:bg-rose-500/10"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Footer / Actions */}
          <div className="p-4 sm:px-6 border-t border-neutral-800/80 bg-neutral-950/90 shrink-0 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 text-xs rounded-xl font-semibold border-neutral-800 hover:bg-neutral-900"
            >
              Vazgeç
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-5 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {requiresApproval ? 'Görevi Teslim Et ve Onaya Gönder' : 'Görevi Teslim Et ve Tamamla'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
