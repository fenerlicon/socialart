'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import type { Employee } from '@/types/domain'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HelpCircle, ArrowDown, Plus } from 'lucide-react'

interface OrgChartProps {
  employees: Employee[]
}

export function EmployeeOrgChart({ employees }: OrgChartProps) {
  // Helper to find employee by role or package
  const findEmp = (rolePkg: string, titleContains?: string) => {
    return employees.find(e => 
      e.rolePackageId === rolePkg || 
      (titleContains && e.title.toLowerCase().includes(titleContains.toLowerCase()))
    )
  }

  // 1. Leadership level
  const manager = findEmp('operasyon-yonetimi') // celal ünlü
  const founder = findEmp('kreatif-yonetim') // Ercan Özdemir (Kurucu/Kreatif Yonetici)

  // 2. Creative branch (under founder/kreatif-yonetim)
  const artDirector = findEmp('grafik-tasarim', 'Art Director') // Betül Ünlü
  
  // 3. Marketing/Customer branch
  const clientLead = findEmp('strateji-musteri-yonetimi') // Simge Yüksel
  const smmSpecialist = findEmp('sosyal-medya-yonetimi') // Tuğba Özdemir
  const adsSpecialist = findEmp('dijital-pazarlama') // Arda Furkan Aslanbaş

  return (
    <div className="space-y-12 py-6 overflow-x-auto w-full min-w-[900px] select-none text-center animate-in fade-in duration-300">
      
      {/* LEVEL 1: Ajans Liderliği */}
      <div className="flex flex-col items-center space-y-4">
        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block font-mono">
          AJANS LİDERLİĞİ VE YÖNETİM
        </span>
        <div className="flex justify-center items-stretch gap-12 relative">
          
          {/* Operasyon Yöneticisi */}
          {manager ? (
            <OrgNodeCard 
              name={manager.fullName}
              title={manager.title}
              department="Yönetim & Operasyon"
              borderColor="border-amber-500/40"
              bgColor="bg-amber-500/[0.02]"
              avatarText="CÜ"
              badgeText="Lider"
              badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/20"
            />
          ) : (
            <OrgPlaceholderCard title="Operasyon Yöneticisi" role="operasyon-yonetimi" />
          )}

          {/* Kurucu / Kreatif Yönetici */}
          {founder ? (
            <OrgNodeCard 
              name={founder.fullName}
              title={`${founder.title} & Kreatif Direktör`}
              department="Kreatif Departman Lideri"
              borderColor="border-purple-500/40"
              bgColor="bg-purple-500/[0.02]"
              avatarText="EÖ"
              badgeText="Lider"
              badgeColor="bg-purple-500/10 text-purple-400 border-purple-500/20"
            />
          ) : (
            <OrgPlaceholderCard title="Kreatif Direktör" role="kreatif-yonetim" />
          )}
        </div>
      </div>

      {/* Düşey Akış Çizgisi */}
      <div className="flex justify-around items-center w-full max-w-4xl mx-auto h-8 relative">
        <div className="w-px h-full bg-neutral-800" />
        <div className="w-px h-full bg-neutral-800" />
      </div>

      {/* LEVEL 2: Departmanlar / Alt Birimler */}
      <div className="grid grid-cols-2 gap-8 max-w-5xl mx-auto items-start">
        
        {/* SOL KOL: Operasyon, Strateji & Pazarlama Birimi (Celal Ünlü Yönetiminde) */}
        <div className="space-y-8 flex flex-col items-center border-t border-neutral-900 pt-6 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-neutral-950 border border-neutral-850 rounded-full flex items-center justify-center -mt-2">
            <ArrowDown className="h-2.5 w-2.5 text-neutral-500" />
          </div>

          <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block font-mono">
            STRATEJİ & REKLAM EKİBİ
          </span>

          <div className="flex flex-col items-center gap-6 w-full">
            {/* İletişim / Müşteri Temsilcisi */}
            {clientLead ? (
              <OrgNodeCard 
                name={clientLead.fullName}
                title={clientLead.title}
                department="Müşteri İlişkileri"
                borderColor="border-blue-500/30"
                bgColor="bg-blue-500/[0.01]"
                avatarText="SY"
                badgeText="Koordinatör"
                badgeColor="bg-blue-500/10 text-blue-400 border-blue-500/20"
              />
            ) : (
              <OrgPlaceholderCard title="Müşteri İlişkileri Lideri" role="strateji-musteri-yonetimi" />
            )}

            {/* Alt Kademe: Sosyal Medya (İletişim Liderine Bağlı) */}
            <div className="w-px h-6 bg-neutral-800" />

            {smmSpecialist ? (
              <OrgNodeCard 
                name={smmSpecialist.fullName}
                title={smmSpecialist.title}
                department="Sosyal Medya"
                borderColor="border-sky-500/30"
                bgColor="bg-sky-500/[0.01]"
                avatarText="TÖ"
              />
            ) : (
              <OrgPlaceholderCard title="Sosyal Medya Uzmanı" role="sosyal-medya-yonetimi" />
            )}
          </div>

          {/* Ayrı Birim: Dijital Pazarlama / Reklam Yönetimi */}
          <div className="border-t border-neutral-900/60 w-3/4 pt-6 mt-4 flex flex-col items-center gap-2">
            {adsSpecialist ? (
              <OrgNodeCard 
                name={adsSpecialist.fullName}
                title={adsSpecialist.title}
                department="Performans Pazarlama"
                borderColor="border-emerald-500/30"
                bgColor="bg-emerald-500/[0.01]"
                avatarText="AA"
              />
            ) : (
              <OrgPlaceholderCard title="Dijital Pazarlama Uzmanı" role="dijital-pazarlama" />
            )}
          </div>
        </div>

        {/* SAĞ KOL: Kreatif & Tasarım Birimi (Kreatif Direktör / Ercan Özdemir Yönetiminde) */}
        <div className="space-y-8 flex flex-col items-center border-t border-neutral-900 pt-6 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-neutral-950 border border-neutral-850 rounded-full flex items-center justify-center -mt-2">
            <ArrowDown className="h-2.5 w-2.5 text-neutral-500" />
          </div>

          <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest block font-mono">
            KREATİF & ÜRETİM EKİBİ
          </span>

          <div className="flex flex-col items-center gap-6 w-full">
            
            {/* Art Director: Betül Ünlü */}
            {artDirector ? (
              <OrgNodeCard 
                name={artDirector.fullName}
                title={artDirector.title}
                department="Grafik Tasarım & Sanat"
                borderColor="border-purple-500/40 animate-pulse-slow"
                bgColor="bg-purple-500/[0.01]"
                avatarText="BÜ"
                badgeText="Yönetici"
                badgeColor="bg-purple-500/10 text-purple-400 border-purple-500/20"
              />
            ) : (
              <OrgPlaceholderCard title="Art Director" role="grafik-tasarim" />
            )}

            {/* Düşey çizgi ve alt tasarım ekibi */}
            <div className="flex items-center justify-center gap-8 w-full relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-px bg-neutral-800" />
              <div className="absolute top-0 left-1/4 w-px h-6 bg-neutral-800" />
              <div className="absolute top-0 right-1/4 w-px h-6 bg-neutral-800" />
              
              <div className="w-full flex justify-around pt-6">
                {/* Grafik Tasarımcı (Atanmadı) */}
                <OrgPlaceholderCard title="Junior Tasarımcı" role="grafik-tasarim" isUnassigned />
                
                {/* İllüstratör / 3D Sanatçısı (Atanmadı) */}
                <OrgPlaceholderCard title="İllüstratör / 3D" role="grafik-tasarim" isUnassigned />
              </div>
            </div>

            {/* Ayrı Dal: Post Prodüksiyon / Video Kurgu Ekibi (Kreatif Direktöre Bağlı) */}
            <div className="border-t border-neutral-900/60 w-3/4 pt-6 mt-4 flex flex-col items-center">
              <div className="w-px h-6 bg-neutral-800 -mt-6 mb-4" />
              
              <div className="flex flex-col items-center gap-4 w-full">
                <OrgPlaceholderCard title="Video Kurgucu / Editor" role="video-kurgu" isUnassigned />
                <div className="w-px h-4 bg-neutral-900" />
                <OrgPlaceholderCard title="Çekim / Kamera Asistanı" role="video-uretimi" isUnassigned />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

interface NodeCardProps {
  name: string
  title: string
  department: string
  borderColor: string
  bgColor: string
  avatarText: string
  badgeText?: string
  badgeColor?: string
}

function OrgNodeCard({ 
  name, 
  title, 
  department, 
  borderColor, 
  bgColor, 
  avatarText, 
  badgeText, 
  badgeColor 
}: NodeCardProps) {
  return (
    <Card className={`w-64 rounded-2xl border ${borderColor} ${bgColor} text-left shadow-lg backdrop-blur-md transition-all hover:scale-[1.02] duration-200`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-300 font-mono shadow-inner">
              {avatarText}
            </div>
            <div className="leading-tight">
              <h4 className="text-xs font-extrabold text-neutral-100">{name}</h4>
              <span className="text-[9px] text-neutral-500 font-semibold">{department}</span>
            </div>
          </div>
          {badgeText && (
            <Badge className={`${badgeColor} text-[8px] font-black rounded-lg px-1.5 py-0.5 border`}>
              {badgeText}
            </Badge>
          )}
        </div>
        <div className="bg-neutral-950/60 border border-neutral-900/60 px-2.5 py-1.5 rounded-xl">
          <span className="text-[10px] font-bold text-neutral-400 font-mono block">
            {title}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function OrgPlaceholderCard({ title, role, isUnassigned }: { title: string; role?: string; isUnassigned?: boolean }) {
  const router = useRouter()
  return (
    <Card className="w-64 rounded-2xl border border-dashed border-neutral-850 bg-neutral-950/20 text-left shadow-sm hover:border-neutral-750 transition-colors p-4">
      <CardContent className="p-0 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl border border-dashed border-neutral-800 flex items-center justify-center text-xs text-neutral-600">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <h4 className="text-xs font-bold text-neutral-500">{title}</h4>
            <span className="text-[9px] text-neutral-600 font-semibold uppercase tracking-wider block mt-0.5">
              {isUnassigned ? '⚠️ Boş Pozisyon' : 'Atama Bekliyor'}
            </span>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => {
            const url = `/employees/new?title=${encodeURIComponent(title)}${role ? `&role=${role}` : ''}`
            router.push(url)
          }}
          className="h-6.5 w-full text-[9px] bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-lg flex items-center justify-center gap-1 shadow-sm transition-all"
        >
          <Plus className="h-2.5 w-2.5" /> Çalışan Ekle
        </Button>
      </CardContent>
    </Card>
  )
}
