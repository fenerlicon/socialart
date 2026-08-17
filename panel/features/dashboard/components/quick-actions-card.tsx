'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Folder, Users, Zap, Bell, ShieldCheck, Sparkles } from 'lucide-react'

export function QuickActionsCard() {
  const router = useRouter()

  return (
    <Card className="rounded-2xl border bg-card/40 shadow-sm backdrop-blur-md overflow-hidden hover:border-neutral-800 transition-colors">
      <CardHeader className="border-b border-neutral-800/40 pb-3">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <Zap className="text-amber-500 h-4 w-4" />
          Hızlı Erişim ve Aksiyonlar
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex flex-wrap gap-3">
        <Button
          onClick={() => router.push('/tasks')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs h-10 flex items-center justify-center gap-1.5 shadow rounded-xl flex-1 sm:flex-initial min-w-[150px] px-4"
        >
          <Sparkles className="h-4 w-4" /> + Özel Görev Ata
        </Button>

        <Button
          onClick={() => router.push('/brands/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 flex items-center justify-center gap-1.5 shadow rounded-xl flex-1 sm:flex-initial min-w-[150px] px-4"
        >
          <Plus className="h-4 w-4" /> Yeni Marka Ekle
        </Button>

        <Button
          onClick={() => router.push('/employees/new')}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-10 flex items-center justify-center gap-1.5 shadow rounded-xl flex-1 sm:flex-initial min-w-[150px] px-4"
        >
          <Plus className="h-4 w-4" /> Yeni Çalışan Ekle
        </Button>

        <Button
          onClick={() => router.push('/brands')}
          variant="outline"
          className="text-xs h-10 flex items-center justify-center gap-1.5 border rounded-xl hover:bg-muted/40 flex-1 sm:flex-initial min-w-[150px] px-4"
        >
          <Folder className="h-4 w-4 text-blue-500" /> Markaları Listele
        </Button>

        <Button
          onClick={() => router.push('/employees')}
          variant="outline"
          className="text-xs h-10 flex items-center justify-center gap-1.5 border rounded-xl hover:bg-muted/40 flex-1 sm:flex-initial min-w-[150px] px-4"
        >
          <Users className="h-4 w-4 text-purple-500" /> Çalışanları Listele
        </Button>

        <Button
          onClick={() => router.push('/my-work')}
          variant="outline"
          className="text-xs h-10 flex items-center justify-center gap-1.5 border rounded-xl hover:bg-muted/40 border-emerald-500/20 hover:bg-emerald-500/[0.03] flex-1 sm:flex-initial min-w-[150px] px-4"
        >
          <Zap className="h-4 w-4 text-emerald-500" /> Benim İşlerim (My Work)
        </Button>

        <Button
          onClick={() => router.push('/notifications')}
          variant="outline"
          className="text-xs h-10 flex items-center justify-center gap-1.5 border rounded-xl hover:bg-muted/40 border-blue-500/20 hover:bg-blue-500/[0.03] flex-1 sm:flex-initial min-w-[150px] px-4"
        >
          <Bell className="h-4 w-4 text-blue-500" /> Bildirimler
        </Button>

        <Button
          onClick={() => router.push('/approvals')}
          variant="outline"
          className="text-xs h-10 flex items-center justify-center gap-1.5 border rounded-xl hover:bg-muted/40 border-purple-500/20 hover:bg-purple-500/[0.03] flex-1 sm:flex-initial min-w-[150px] px-4"
        >
          <ShieldCheck className="h-4 w-4 text-purple-500" /> Onay Merkezi
        </Button>
      </CardContent>
    </Card>
  )
}
