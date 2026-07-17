'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import type { BrandFormApi } from '@/features/brands/hooks/use-brand-form'
import {
  OPERATION_PLAN_ITEM_TYPE_LABELS,
  type OperationPlanItemType,
} from '@/types/domain'
import { toast } from 'sonner'

export function OperationPlanSection({ form }: { form: BrandFormApi }) {
  const { values, addPlanItem, deletePlanItem, updatePlanItem } = form

  // Local state for the new item form
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<OperationPlanItemType>('content')
  const [newTarget, setNewTarget] = useState<number>(4)

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      toast.error('Lütfen kalem başlığı girin')
      return
    }
    addPlanItem({
      title: newTitle.trim(),
      type: newType,
      target: newTarget,
    })
    setNewTitle('')
    setNewType('content')
    setNewTarget(4)
  }

  return (
    <div className="space-y-6">
      {/* Yeni Kalem Ekleme Formu */}
      <form onSubmit={handleAddItem} className="rounded-lg border bg-muted/20 p-4 space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="text-sm font-semibold text-foreground">Yeni Operasyon Kalemi Ekle</h4>
          <p className="text-xs text-muted-foreground font-normal">
            Markanın planına özel yeni hedefler tanımlayın.
          </p>
        </div>
        
        <div className="grid gap-3 sm:grid-cols-12 items-end">
          <div className="space-y-1.5 sm:col-span-6">
            <Label htmlFor="newTitle" className="text-xs">Kalem Başlığı</Label>
            <Input
              id="newTitle"
              placeholder="Örn. Influencer Yönetimi, Ekstra Story..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-3">
            <Label htmlFor="newType" className="text-xs">Tip</Label>
            <Select
              value={newType}
              onValueChange={(val) => setNewType(val as OperationPlanItemType)}
            >
              <SelectTrigger id="newType" className="h-9">
                <SelectValue placeholder="Tip seçin" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(OPERATION_PLAN_ITEM_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="newTarget" className="text-xs">Hedef Adet</Label>
            <Input
              id="newTarget"
              type="number"
              min="0"
              value={newTarget}
              onChange={(e) => setNewTarget(parseInt(e.target.value) || 0)}
              className="h-9"
            />
          </div>

          <div className="sm:col-span-1">
            <Button type="submit" size="icon" className="h-9 w-full">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>

      {/* Operasyon Planı Listesi */}
      <div className="rounded-lg border overflow-hidden">
        <div className="px-4 py-3 bg-muted/40 border-b flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">Marka Operasyon Planı</h4>
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
            {values.operationPlan.length} Kalem
          </span>
        </div>

        {values.operationPlan.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-muted/10 text-muted-foreground font-semibold">
                  <th className="p-3">Kalem Başlığı</th>
                  <th className="p-3 w-40">Tip</th>
                  <th className="p-3 w-24">Hedef</th>
                  <th className="p-3 w-12 text-center">Sil</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {values.operationPlan.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/5 transition-colors">
                    {/* Başlık */}
                    <TableCell className="p-2.5">
                      <Input
                        value={item.title}
                        onChange={(e) => updatePlanItem(item.id, { title: e.target.value })}
                        className="h-8 text-xs font-medium px-2 py-1 bg-transparent hover:bg-background focus:bg-background"
                      />
                    </TableCell>

                    {/* Tip */}
                    <TableCell className="p-2.5">
                      <Select
                        value={item.type}
                        onValueChange={(val) => updatePlanItem(item.id, { type: val as OperationPlanItemType })}
                      >
                        <SelectTrigger className="h-8 text-xs bg-transparent hover:bg-background focus:bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(OPERATION_PLAN_ITEM_TYPE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value} className="text-xs">
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Hedef */}
                    <TableCell className="p-2.5">
                      <Input
                        type="number"
                        min="0"
                        value={item.target}
                        onChange={(e) => updatePlanItem(item.id, { target: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="h-8 text-xs px-2 py-1 bg-transparent hover:bg-background focus:bg-background"
                      />
                    </TableCell>

                    {/* Sil */}
                    <TableCell className="p-2.5 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePlanItem(item.id)}
                        className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground text-xs">
            Operasyon planında hiç kalem bulunmamaktadır. Lütfen yukarıdan yeni bir kalem ekleyin.
          </div>
        )}
      </div>
    </div>
  )
}

// Subcomponent to mock a row to avoid full table import complications if any
function TableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={className}>{children}</tr>
}
function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={className}>{children}</td>
}
