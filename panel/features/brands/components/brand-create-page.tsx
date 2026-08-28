'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredEmployees, getActiveEmployeeId } from '@/lib/storage/local-employee-store'
import { resolvePanelAuthority, usePrincipal } from '@/lib/permissions/panel-authority'
import { AccessDenied } from '@/components/shared/access-denied'
import type { Employee } from '@/types/domain'
import { useBrandForm } from '@/features/brands/hooks/use-brand-form'
import { BrandBasicInfoSection } from '@/features/brands/components/brand-basic-info-section'
import { PackageSelectionSection } from '@/features/brands/components/package-selection-section'
import { PackagePreviewSection } from '@/features/brands/components/package-preview-section'
import { OperationPlanSection } from '@/features/brands/components/operation-plan-section'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export function BrandCreatePage() {
  const router = useRouter()
  const { principal, activeEmployee: contextActiveEmployee } = usePrincipal()
  const form = useBrandForm()
  const {
    isSubmitting,
    showPackageConfirm,
    confirmPackageChange,
    cancelPackageChange,
    submit,
  } = form

  // Auth states
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    async function checkAuth() {
      setIsLoadingAuth(true)
      const storedEmps = await getStoredEmployees()
      setEmployees(storedEmps)
      if (contextActiveEmployee) {
        setActiveEmployee(contextActiveEmployee)
      } else {
        const activeId = getActiveEmployeeId()
        const current = storedEmps.find((e) => e.id === activeId)
        if (current) {
          setActiveEmployee(current)
        }
      }
      setIsLoadingAuth(false)
    }
    checkAuth()
  }, [contextActiveEmployee])

  const effectiveActiveEmployee = useMemo(() => {
    if (contextActiveEmployee) return contextActiveEmployee
    if (activeEmployee) return activeEmployee
    const activeId = getActiveEmployeeId()
    return employees.find((e) => e.id === activeId) || null
  }, [contextActiveEmployee, activeEmployee, employees])

  // Resolve permission guard
  const hasPermission = useMemo(() => {
    return resolvePanelAuthority(principal, effectiveActiveEmployee, 'brand.manage')
  }, [principal, effectiveActiveEmployee])

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!hasPermission) {
    return <AccessDenied />
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Sayfa Başlığı */}
      <header className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Social Art Base</p>
        <h1 className="text-3xl font-semibold tracking-tight">Yeni Marka Oluştur</h1>
        <p className="text-muted-foreground text-sm">
          Yeni marka kaydını yapın, hizmet paketini seçin ve operasyon planını yapılandırın.
        </p>
      </header>

      {/* Accordion Form Bölümleri */}
      <div className="space-y-6">
        <Accordion
          type="single"
          collapsible
          defaultValue="basic-info"
          className="space-y-4 border-none"
        >
          {/* 1. Temel Bilgiler */}
          <AccordionItem
            value="basic-info"
            className="border rounded-xl bg-card px-6 shadow-sm overflow-hidden"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="text-left space-y-1">
                <h3 className="text-base font-semibold tracking-tight text-foreground">1. Temel Bilgiler</h3>
                <p className="text-xs text-muted-foreground font-normal">
                  Marka iletişim bilgileri, başlama tarihi ve operasyon yöneticisi ataması.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6 pt-2">
              <BrandBasicInfoSection form={form} />
            </AccordionContent>
          </AccordionItem>

          {/* 2. Paket Seçimi */}
          <AccordionItem
            value="package-select"
            className="border rounded-xl bg-card px-6 shadow-sm overflow-hidden"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="text-left space-y-1">
                <h3 className="text-base font-semibold tracking-tight text-foreground">2. Hizmet Paketi Seçimi</h3>
                <p className="text-xs text-muted-foreground font-normal">
                  Markanın satın aldığı operasyonel paketi seçin ve içeriğini inceleyin.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6 pt-2 space-y-4">
              <PackageSelectionSection form={form} />
              <PackagePreviewSection form={form} />
            </AccordionContent>
          </AccordionItem>

          {/* 3. Operasyon Planı */}
          <AccordionItem
            value="operation-plan"
            className="border rounded-xl bg-card px-6 shadow-sm overflow-hidden"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="text-left space-y-1">
                <h3 className="text-base font-semibold tracking-tight text-foreground">3. Operasyon Çalışma Planı</h3>
                <p className="text-xs text-muted-foreground font-normal">
                  Seçilen paket şablonunu özelleştirin, yeni kalemler ekleyin veya hedefleri düzenleyin.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6 pt-2">
              <OperationPlanSection form={form} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Form Aksiyon Butonları */}
        <div className="flex items-center justify-end gap-3 rounded-xl border bg-card p-4 shadow-sm">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => router.push('/brands')}>
            İptal
          </Button>
          <Button type="button" onClick={submit} disabled={isSubmitting}>
            {isSubmitting ? 'Kaydediliyor...' : 'Markayı Kaydet'}
          </Button>
        </div>
      </div>

      {/* Paket Değişimi Onay Modalı */}
      {showPackageConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border rounded-xl shadow-lg max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-full bg-amber-500/10 text-amber-500 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Paket Değiştiriliyor</h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  Mevcut operasyon planında değişiklikler yaptınız. Paketi değiştirmek mevcut planı silip yeni şablon yükleyecektir.
                </p>
              </div>
            </div>

            <p className="text-sm font-medium text-foreground bg-muted/30 p-3 rounded-lg border text-center">
              Devam etmek ve planı sıfırlamak istiyor musunuz?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" className="h-9 px-4 text-xs" onClick={cancelPackageChange}>
                Vazgeç / İptal
              </Button>
              <Button type="button" variant="default" className="h-9 px-4 text-xs bg-amber-600 hover:bg-amber-700 text-white" onClick={confirmPackageChange}>
                Evet, Değiştir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
