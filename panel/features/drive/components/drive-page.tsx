'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Brand, BrandDriveLinks, Employee } from '@/types/domain'
import { getStoredBrands } from '@/lib/storage/local-brand-store'
import { getDriveLinks, saveDriveLinks } from '@/lib/storage/local-drive-store'
import { getStoredEmployees, getActiveEmployeeId } from '@/lib/storage/local-employee-store'
import { usePrincipal, resolveVisibleBrands } from '@/lib/permissions/panel-authority'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Folder,
  Image as ImageIcon,
  FileText,
  Link2,
  Edit,
  ExternalLink,
  Search,
  Plus,
  Trash,
  Settings,
  Grid,
} from 'lucide-react'

export function DrivePage() {
  const { principal, activeEmployee: contextActiveEmployee } = usePrincipal()
  const [brands, setBrands] = useState<Brand[]>([])
  const [driveLinks, setDriveLinks] = useState<BrandDriveLinks[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [activeEmployeeId, setActiveEmployeeId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  
  // Form State
  const [googleDrive, setGoogleDrive] = useState('')
  const [photosDrive, setPhotosDrive] = useState('')
  const [briefsDrive, setBriefsDrive] = useState('')
  const [assetsDrive, setAssetsDrive] = useState('')
  const [customLinks, setCustomLinks] = useState<{ label: string; url: string }[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const storedBrands = await getStoredBrands()
        setBrands(storedBrands)

        const storedLinks = await getDriveLinks()
        setDriveLinks(storedLinks)

        const storedEmployees = await getStoredEmployees()
        setEmployees(storedEmployees)

        if (!contextActiveEmployee) {
          const activeId = getActiveEmployeeId()
          if (activeId) setActiveEmployeeId(activeId)
        }
      } catch (err) {
        console.error('Failed to load drive page data:', err)
      }
    }
    loadData()
  }, [contextActiveEmployee])

  const activeEmployee = useMemo(() => {
    if (contextActiveEmployee) return contextActiveEmployee
    return employees.find(e => e.id === activeEmployeeId)
  }, [contextActiveEmployee, employees, activeEmployeeId])

  const isManager = useMemo(() => {
    if (!activeEmployee) return false
    return activeEmployee.rolePackageId === 'operasyon-yonetimi' || activeEmployee.permissionOverrides?.['system.admin'] === true
  }, [activeEmployee])

  // Visible brands based on canonical brand scope
  const visibleBrands = useMemo(() => {
    return resolveVisibleBrands(principal, activeEmployee, brands)
  }, [principal, activeEmployee, brands])

  // Search filter applied on top of visible brands
  const filteredBrands = useMemo(() => {
    return visibleBrands.filter(b => 
      b.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [visibleBrands, searchQuery])

  // Get links helper
  const getBrandLinks = (brandId: string): BrandDriveLinks => {
    const found = driveLinks.find(d => d.brandId === brandId)
    return found || { brandId }
  }

  const handleEditClick = (brand: Brand) => {
    const links = getBrandLinks(brand.id)
    setSelectedBrand(brand)
    setGoogleDrive(links.googleDrive || '')
    setPhotosDrive(links.photosDrive || '')
    setBriefsDrive(links.briefsDrive || '')
    setAssetsDrive(links.assetsDrive || '')
    setCustomLinks(links.customLinks || [])
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBrand) return

    const updatedLink: BrandDriveLinks = {
      brandId: selectedBrand.id,
      googleDrive: googleDrive.trim() || undefined,
      photosDrive: photosDrive.trim() || undefined,
      briefsDrive: briefsDrive.trim() || undefined,
      assetsDrive: assetsDrive.trim() || undefined,
      customLinks: customLinks.filter(x => x.label.trim() && x.url.trim()),
    }

    try {
      const allUpdated = await saveDriveLinks(updatedLink)
      setDriveLinks(allUpdated)
      toast.success(`${selectedBrand.name} Drive bağlantıları kaydedildi!`)
      setIsModalOpen(false)
    } catch (err) {
      toast.error('Bağlantılar kaydedilemedi')
    }
  }

  return (
    <div className="space-y-6">
      {/* Sayfa Başlığı */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-900/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Folder className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Ajans Drive</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Her markanın bulut depolama klasörlerine, fotoğraf arşivlerine ve çalışma bağlantılarına buradan ulaşabilirsiniz.
          </p>
        </div>
      </div>

      {/* Arama Arayüzü */}
      <div className="flex items-center gap-3 bg-neutral-950/20 border border-neutral-900 p-3 rounded-2xl max-w-md">
        <Search className="h-4 w-4 text-neutral-500 shrink-0" />
        <input
          type="text"
          placeholder="Marka adına göre ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs w-full focus:outline-none text-neutral-200 placeholder-neutral-500"
        />
      </div>

      {/* Marka Drive Kartları */}
      {filteredBrands.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBrands.map((brand) => {
            const links = getBrandLinks(brand.id)
            return (
              <Card key={brand.id} className="rounded-2xl border bg-card/15 backdrop-blur-md hover:border-neutral-800 transition-all duration-200 overflow-hidden flex flex-col justify-between">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block font-mono">
                        MARKA KLASÖRLERİ
                      </span>
                      <CardTitle className="text-sm font-extrabold tracking-tight text-neutral-100">
                        {brand.name}
                      </CardTitle>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(brand)}
                      className="h-7 w-7 rounded-lg border border-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                      title="Drive Bağlantılarını Düzenle"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    {/* Google Drive Belge Klasörü */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-900 hover:bg-neutral-900/40 transition-colors group">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-amber-500" />
                        <div>
                          <span className="text-[10px] font-bold text-neutral-300 block leading-none">Belge Drive Klasörü</span>
                          <span className="text-[8px] text-neutral-500 block mt-0.5 font-mono">
                            {links.googleDrive ? 'Google Drive / Belgeler' : 'Ayarlanmadı'}
                          </span>
                        </div>
                      </div>
                      {links.googleDrive ? (
                        <a
                          href={links.googleDrive.startsWith('http') ? links.googleDrive : `https://${links.googleDrive}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-6 px-2 text-[9px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg flex items-center gap-1 transition-all"
                        >
                          Aç <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ) : (
                        <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-wider">EKSİK</span>
                      )}
                    </div>

                    {/* Fotoğraf Drive Klasörü */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-900 hover:bg-neutral-900/40 transition-colors group">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-emerald-500" />
                        <div>
                          <span className="text-[10px] font-bold text-neutral-300 block leading-none">Fotoğraf / Görsel Klasörü</span>
                          <span className="text-[8px] text-neutral-500 block mt-0.5 font-mono">
                            {links.photosDrive ? 'Arşiv / Kaynak Görseller' : 'Ayarlanmadı'}
                          </span>
                        </div>
                      </div>
                      {links.photosDrive ? (
                        <a
                          href={links.photosDrive.startsWith('http') ? links.photosDrive : `https://${links.photosDrive}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-6 px-2 text-[9px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg flex items-center gap-1 transition-all"
                        >
                          Aç <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ) : (
                        <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-wider">EKSİK</span>
                      )}
                    </div>

                    {/* Brief & Konseptler */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-900 hover:bg-neutral-900/40 transition-colors group">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-500" />
                        <div>
                          <span className="text-[10px] font-bold text-neutral-300 block leading-none">Briefler ve Konseptler</span>
                          <span className="text-[8px] text-neutral-500 block mt-0.5 font-mono">
                            {links.briefsDrive ? 'Brief / Planlama Dosyaları' : 'Ayarlanmadı'}
                          </span>
                        </div>
                      </div>
                      {links.briefsDrive ? (
                        <a
                          href={links.briefsDrive.startsWith('http') ? links.briefsDrive : `https://${links.briefsDrive}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-6 px-2 text-[9px] font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg flex items-center gap-1 transition-all"
                        >
                          Aç <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ) : (
                        <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-wider">EKSİK</span>
                      )}
                    </div>

                    {/* Tasarım Assetleri */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-900 hover:bg-neutral-900/40 transition-colors group">
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-blue-500" />
                        <div>
                          <span className="text-[10px] font-bold text-neutral-300 block leading-none">Tasarım & Font Assetleri</span>
                          <span className="text-[8px] text-neutral-500 block mt-0.5 font-mono">
                            {links.assetsDrive ? 'Logo / Font / PSD Arşivi' : 'Ayarlanmadı'}
                          </span>
                        </div>
                      </div>
                      {links.assetsDrive ? (
                        <a
                          href={links.assetsDrive.startsWith('http') ? links.assetsDrive : `https://${links.assetsDrive}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-6 px-2 text-[9px] font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg flex items-center gap-1 transition-all"
                        >
                          Aç <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ) : (
                        <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-wider">EKSİK</span>
                      )}
                    </div>
                  </div>

                  {/* Özel Ekstra Linkler */}
                  {links.customLinks && links.customLinks.length > 0 && (
                    <div className="pt-3 border-t border-neutral-900/60 space-y-1.5">
                      <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest block font-mono">ÖZEL MARKA LİNKLERİ</span>
                      <div className="flex flex-wrap gap-1.5">
                        {links.customLinks.map((cust, cidx) => (
                          <a
                            key={cidx}
                            href={cust.url.startsWith('http') ? cust.url : `https://${cust.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 px-2.5 py-1 rounded-lg text-[9px] text-neutral-350 hover:text-white font-medium transition-colors"
                          >
                            <span>🔗 {cust.label}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-900 p-8 text-center text-xs text-muted-foreground bg-neutral-950/[0.02]">
          Arama kriterine uygun marka bulunamadı.
        </div>
      )}

      {/* Drive Düzenleme Modalı */}
      {isModalOpen && selectedBrand && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg rounded-2xl border bg-neutral-900 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1 mb-4">
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block font-mono">LİNKLERİ GÜNCELLE</span>
              <h2 className="text-base font-bold text-foreground">
                {selectedBrand.name} Drive Yönetimi
              </h2>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Belge Drive Klasörü</Label>
                  <Input
                    placeholder="Google Drive linki..."
                    value={googleDrive}
                    onChange={(e) => setGoogleDrive(e.target.value)}
                    className="h-8 text-xs bg-neutral-950/60 border-neutral-850"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Fotoğraf / Görsel Klasörü</Label>
                  <Input
                    placeholder="Drive/Dropbox linki..."
                    value={photosDrive}
                    onChange={(e) => setPhotosDrive(e.target.value)}
                    className="h-8 text-xs bg-neutral-950/60 border-neutral-850"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Briefler & Konseptler</Label>
                  <Input
                    placeholder="Brief klasörü linki..."
                    value={briefsDrive}
                    onChange={(e) => setBriefsDrive(e.target.value)}
                    className="h-8 text-xs bg-neutral-950/60 border-neutral-850"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Tasarım & Font Assetleri</Label>
                  <Input
                    placeholder="Tasarım kaynakları linki..."
                    value={assetsDrive}
                    onChange={(e) => setAssetsDrive(e.target.value)}
                    className="h-8 text-xs bg-neutral-950/60 border-neutral-850"
                  />
                </div>
              </div>

              {/* Özel Linkler Bölümü */}
              <div className="space-y-2 pt-2 border-t border-neutral-850">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Özel Marka Linkleri</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCustomLinks([...customLinks, { label: '', url: '' }])}
                    className="h-5 text-[10px] text-blue-400 font-bold px-1.5"
                  >
                    + Yeni Özel Link
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-24 overflow-y-auto pr-1">
                  {customLinks.map((cust, idx) => (
                    <div key={`custom-${idx}`} className="flex items-center gap-2">
                      <Input
                        placeholder="Başlık (Örn: Web Sitesi)"
                        value={cust.label}
                        onChange={(e) => {
                          const updated = [...customLinks]
                          updated[idx].label = e.target.value
                          setCustomLinks(updated)
                        }}
                        className="h-8 text-xs bg-neutral-950/60 border-neutral-850 w-1/3"
                      />
                      <Input
                        placeholder="Bağlantı URL'i"
                        value={cust.url}
                        onChange={(e) => {
                          const updated = [...customLinks]
                          updated[idx].url = e.target.value
                          setCustomLinks(updated)
                        }}
                        className="h-8 text-xs bg-neutral-950/60 border-neutral-850 flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setCustomLinks(customLinks.filter((_, i) => i !== idx))}
                        className="h-8 w-8 hover:bg-red-500/10 text-neutral-500 hover:text-red-400 rounded-lg"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-850">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 text-xs rounded-xl border-neutral-800"
                >
                  Kapat
                </Button>
                <Button
                  type="submit"
                  className="h-8 text-xs bg-blue-600 hover:bg-blue-750 text-white rounded-xl font-bold px-5"
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

// Simple local X icon wrapper just in case
function X({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
      onClick={onClick}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
