'use client'

import { useState, useEffect } from 'react'
import type { Brand, Employee } from '@/types/domain'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Edit2, AlertTriangle } from 'lucide-react'

interface BrandEditDialogProps {
  isOpen: boolean
  brand: Brand | null
  employees: Employee[]
  onClose: () => void
  onConfirm: (updatedBrand: Brand) => void
}

export function BrandEditDialog({
  isOpen,
  brand,
  employees,
  onClose,
  onConfirm,
}: BrandEditDialogProps) {
  const [name, setName] = useState('')
  const [selectedPackageId, setSelectedPackageId] = useState<'eko' | 'business' | 'booster'>('eko')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [instagram, setInstagram] = useState('')
  const [website, setWebsite] = useState('')
  const [startDate, setStartDate] = useState('')
  const [operationManagerId, setOperationManagerId] = useState('')

  // Sync state with brand when it opens/changes
  useEffect(() => {
    if (brand) {
      setName(brand.name || '')
      setSelectedPackageId(brand.selectedPackageId || 'eko')
      setStatus(brand.status || 'active')
      setContactPerson(brand.contactPerson || '')
      setPhone(brand.phone || '')
      setEmail(brand.email || '')
      setInstagram(brand.instagram || '')
      setWebsite(brand.website || '')
      setStartDate(brand.startDate || '')
      setOperationManagerId(brand.operationManagerId || '')
    }
  }, [brand, isOpen])

  if (!isOpen || !brand) return null

  const handleSave = () => {
    if (!name.trim()) return

    const updatedBrand: Brand = {
      ...brand,
      name: name.trim(),
      selectedPackageId,
      status,
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      instagram: instagram.trim() || undefined,
      website: website.trim() || undefined,
      startDate,
      operationManagerId,
      updatedAt: new Date().toISOString(),
    }

    onConfirm(updatedBrand)
  }

  // Filter manager candidates (rolePackageId === 'operasyon-yonetimi' or similar)
  const managerCandidates = employees.filter(
    (e) => e.rolePackageId === 'operasyon-yonetimi' || e.teamIds.includes('merkezi-operasyon')
  )

  const finalManagerList = managerCandidates.length > 0 ? managerCandidates : employees

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-neutral-800 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-muted/20">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Edit2 className="h-4 w-4 text-blue-500" />
            Marka Bilgilerini Düzenle
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

        {/* Content Form */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Marka Adı */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">Marka Adı *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Marka Adı girin..."
              className="h-9 text-xs bg-muted/5 border-neutral-850"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Hizmet Paketi */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">Hizmet Paketi</label>
              <Select
                value={selectedPackageId}
                onValueChange={(val: any) => setSelectedPackageId(val)}
              >
                <SelectTrigger className="h-9 text-xs bg-muted/5 border-neutral-850">
                  <SelectValue placeholder="Seçin..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eko" className="text-xs">Eko Paket</SelectItem>
                  <SelectItem value="business" className="text-xs">Business Paket</SelectItem>
                  <SelectItem value="booster" className="text-xs">Booster Paket</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Durum */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">Durum</label>
              <Select
                value={status}
                onValueChange={(val: any) => setStatus(val)}
              >
                <SelectTrigger className="h-9 text-xs bg-muted/5 border-neutral-850">
                  <SelectValue placeholder="Seçin..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active" className="text-xs text-emerald-400 font-semibold">Aktif</SelectItem>
                  <SelectItem value="inactive" className="text-xs text-neutral-450">Pasif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Operasyon Sorumlusu */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">Operasyon Sorumlusu</label>
              <Select value={operationManagerId} onValueChange={setOperationManagerId}>
                <SelectTrigger className="h-9 text-xs bg-muted/5 border-neutral-850">
                  <SelectValue placeholder="Sorumlu Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {finalManagerList.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id} className="text-xs">
                      {emp.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Başlangıç Tarihi */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">Başlangıç Tarihi</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 text-xs bg-muted/5 border-neutral-850"
              />
            </div>
          </div>

          <div className="h-px bg-neutral-900 my-2" />
          <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">İletişim & Sosyal Medya</h4>

          <div className="grid grid-cols-2 gap-4">
            {/* Yetkili Kişi */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">Yetkili Kişi</label>
              <Input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                className="h-9 text-xs bg-muted/5 border-neutral-850"
              />
            </div>

            {/* Telefon */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">Telefon</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Örn: 0555..."
                className="h-9 text-xs bg-muted/5 border-neutral-850"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* E-posta */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">E-posta</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Örn: info@marka.com"
                className="h-9 text-xs bg-muted/5 border-neutral-850"
              />
            </div>

            {/* Instagram Kullanıcı Adı */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">Instagram @</label>
              <Input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Kullanıcı adı..."
                className="h-9 text-xs bg-muted/5 border-neutral-850"
              />
            </div>
          </div>

          {/* Web Sitesi */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">Web Sitesi</label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Örn: www.marka.com"
              className="h-9 text-xs bg-muted/5 border-neutral-850"
            />
          </div>
        </div>

        {/* Actions Footer */}
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
            onClick={handleSave}
            disabled={!name.trim()}
            className="h-9 text-xs px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
          >
            Değişiklikleri Kaydet
          </Button>
        </div>
      </div>
    </div>
  )
}
