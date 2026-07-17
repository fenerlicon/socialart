'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Activity } from 'lucide-react'

interface ProgressCardProps {
  totalTarget: number
  totalCompleted: number
}

export function ProgressCard({ totalTarget, totalCompleted }: ProgressCardProps) {
  const percentage = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0

  return (
    <Card className="rounded-2xl border bg-card/40 shadow-sm backdrop-blur-md overflow-hidden hover:border-neutral-800 transition-colors flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-neutral-800/40">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          Genel Operasyon İlerlemesi
        </CardTitle>
        <span className="text-[10px] text-muted-foreground font-semibold uppercase bg-neutral-800 px-2 py-0.5 rounded">
          Ajans Geneli
        </span>
      </CardHeader>
      <CardContent className="pt-5 space-y-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-foreground bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            %{percentage}
          </span>
          <span className="text-xs text-muted-foreground font-medium">tamamlandı</span>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-blue-500" />
              Toplam Adım: <strong>{totalTarget}</strong>
            </span>
            <span>
              Tamamlanan: <strong className="text-foreground">{totalCompleted}</strong>
            </span>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground leading-normal border-t border-neutral-800/40 pt-3">
          Bu oran, ajans bünyesinde iptal edilmeyen tüm iş akışlarının adım bazlı (tamamlanan + geçilen / toplam adım) anlık ilerleme durumunu göstermektedir.
        </p>
      </CardContent>
    </Card>
  )
}
