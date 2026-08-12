'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { 
  CreditCard, 
  Plus, 
  CheckCircle2, 
  X, 
  Building2, 
  AlertCircle, 
  Trash2, 
  Pencil, 
  ListPlus, 
  ShieldCheck, 
  Copy, 
  Layers,
  Receipt
} from 'lucide-react'

export interface PaymentItem {
  id: string
  title: string
  amount: number
}

export interface PaymentRequest {
  id: string
  client_name: string
  company_code?: string
  title: string
  description?: string
  amount: number
  kdv_amount?: number
  total_amount?: number
  is_kdv_exempt?: boolean
  items?: PaymentItem[]
  status: string
  created_at?: string
  paid_at?: string
}

interface BrandOption {
  name: string
  code: string
}

interface ToastState {
  message: string
  subtext?: string
  type: 'success' | 'error'
}

export default function PaymentsPage() {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([])
  const [brandsList, setBrandsList] = useState<BrandOption[]>([])
  const [selectedBrandOption, setSelectedBrandOption] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<PaymentRequest | null>(null)
  const [viewingRequest, setViewingRequest] = useState<PaymentRequest | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)

  // Creation Form State
  const [entryMode, setEntryMode] = useState<'single' | 'itemized'>('single')
  const [isKdvExempt, setIsKdvExempt] = useState(false)
  const [items, setItems] = useState<PaymentItem[]>([
    { id: 'item-1', title: '', amount: 0 }
  ])
  const [form, setForm] = useState({
    client_name: '',
    company_code: '',
    title: '',
    amount: '',
    description: ''
  })

  // Edit Form State
  const [editEntryMode, setEditEntryMode] = useState<'single' | 'itemized'>('single')
  const [editIsKdvExempt, setEditIsKdvExempt] = useState(false)
  const [editItems, setEditItems] = useState<PaymentItem[]>([])
  const [editForm, setEditForm] = useState({
    client_name: '',
    company_code: '',
    title: '',
    amount: '',
    description: '',
    status: 'pending'
  })

  const triggerToast = (message: string, subtext?: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, subtext, type })
    setTimeout(() => {
      setToast(null)
    }, 4500)
  }

  const fetchPaymentRequests = async () => {
    try {
      let remoteRequests: PaymentRequest[] = []

      // 1. Fetch from dedicated payment_requests table
      try {
        const { data, error } = await supabase
          .from('payment_requests')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          remoteRequests = data.map((r: any) => ({
            id: r.id,
            client_name: r.client_name,
            company_code: r.company_code,
            title: r.title,
            description: r.description || '',
            amount: Number(r.amount),
            kdv_amount: r.kdv_amount !== undefined ? Number(r.kdv_amount) : (r.is_kdv_exempt ? 0 : Number(r.amount) * 0.20),
            total_amount: r.total_amount !== undefined ? Number(r.total_amount) : (r.is_kdv_exempt ? Number(r.amount) : Number(r.amount) * 1.20),
            is_kdv_exempt: Boolean(r.is_kdv_exempt),
            items: Array.isArray(r.items) ? r.items : [],
            status: r.status,
            created_at: r.created_at,
            paid_at: r.paid_at
          }))
        }
      } catch (err) {
        console.warn('DB payment_requests table fetch error:', err)
      }

      // 2. Fallback / Merge from notifications table if any missing
      try {
        const { data: notifData } = await supabase
          .from('notifications')
          .select('*')
          .eq('type', 'payment_request')
          .order('created_at', { ascending: false })

        if (notifData && notifData.length > 0) {
          const map = new Map<string, PaymentRequest>()
          remoteRequests.forEach(r => map.set(r.id, r))

          notifData.forEach((n: any) => {
            if (!map.has(n.id)) {
              try {
                if (n.message && n.message.startsWith('{')) {
                  const parsed = JSON.parse(n.message)
                  map.set(n.id, parsed)
                } else {
                  const amtMatch = n.title?.match(/₺([0-9.,]+)/) || n.message?.match(/₺([0-9.,]+)/)
                  const amt = amtMatch ? parseFloat(amtMatch[1].replace(/\./g, '').replace(',', '.')) : 0
                  map.set(n.id, {
                    id: n.id,
                    client_name: n.related_entity_id || 'Müşteri',
                    company_code: n.related_entity_id || 'musteri',
                    title: n.title,
                    description: n.message,
                    amount: amt,
                    kdv_amount: amt * 0.20,
                    total_amount: amt * 1.20,
                    is_kdv_exempt: false,
                    items: [],
                    status: 'pending',
                    created_at: n.created_at
                  })
                }
              } catch {}
            }
          })
          remoteRequests = Array.from(map.values())
        }
      } catch (err) {
        console.warn('DB payment requests notification fallback fetch error:', err)
      }

      // Set payment requests directly from Supabase DB
      setPaymentRequests(remoteRequests)
      if (typeof window !== 'undefined') {
        localStorage.setItem('socialart_payment_requests', JSON.stringify(remoteRequests))
      }
    } catch (e) {
      console.error('fetchPaymentRequests error:', e)
    }
  }

  const fetchBrands = async () => {
    try {
      const dynamicBrands: BrandOption[] = []
      const seen = new Set<string>()

      // 1. Fetch REAL active agency brands from 'brands' table (Markalar)
      try {
        const { data: realBrandsData } = await supabase.from('brands').select('id, name, instagram, website').order('name', { ascending: true })
        if (realBrandsData && realBrandsData.length > 0) {
          realBrandsData.forEach((b: any) => {
            const name = (b.name || '').trim()
            if (name && !seen.has(name.toLowerCase())) {
              seen.add(name.toLowerCase())
              const code = name.toLowerCase().replace(/[^a-z0-9]/g, '')
              dynamicBrands.push({ name, code })
            }
          })
        }
      } catch (e) {}

      // 2. Fetch from active_clients table
      try {
        const { data: clientsData } = await supabase.from('active_clients').select('name').order('name', { ascending: true })
        if (clientsData && clientsData.length > 0) {
          clientsData.forEach((c: any) => {
            const name = (c.name || '').trim()
            if (name && !seen.has(name.toLowerCase())) {
              seen.add(name.toLowerCase())
              const code = name.toLowerCase().replace(/[^a-z0-9]/g, '')
              dynamicBrands.push({ name, code })
            }
          })
        }
      } catch (e) {}

      // Fallback defaults if empty
      if (dynamicBrands.length === 0) {
        const defaults = [
          { name: 'Ogena Yapı', code: 'ogenayapi' },
          { name: 'Arayanvar', code: 'arayanvar' },
          { name: 'Durnas PDR', code: 'durnaspdr' },
          { name: 'SMI Bilişim', code: 'smibilisim' },
          { name: 'Ze Corner', code: 'zecorner' },
          { name: 'Ayka Store', code: 'aykastore' },
        ]
        defaults.forEach(d => {
          if (!seen.has(d.name.toLowerCase())) {
            seen.add(d.name.toLowerCase())
            dynamicBrands.push(d)
          }
        })
      }

      setBrandsList(dynamicBrands)
    } catch (e) {
      console.error('fetchBrands error:', e)
    }
  }

  useEffect(() => {
    fetchPaymentRequests()
    fetchBrands()

    // Realtime Supabase Sync
    const channel = supabase
      .channel('realtime-payment-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_requests' }, () => {
        fetchPaymentRequests()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleBrandSelectChange = (val: string) => {
    setSelectedBrandOption(val)
    if (val === 'custom') {
      setForm(prev => ({ ...prev, client_name: '', company_code: '' }))
    } else {
      const found = brandsList.find(b => b.name === val)
      if (found) {
        setForm(prev => ({ ...prev, client_name: found.name, company_code: found.code }))
      }
    }
  }

  // --- Dynamic Item Row Helpers (Creation) ---
  const handleAddItemRow = () => {
    setItems(prev => [
      ...prev,
      { id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, title: '', amount: 0 }
    ])
  }

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: 'title' | 'amount', value: any) => {
    setItems(prev => {
      const next = [...prev]
      if (field === 'amount') {
        const parsed = parseFloat(value) || 0
        next[index] = { ...next[index], amount: parsed }
      } else {
        next[index] = { ...next[index], title: value }
      }
      return next
    })
  }

  // Calculate Subtotal for Items
  const itemsTotal = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0)
  const effectiveBaseAmount = entryMode === 'itemized' ? itemsTotal : (parseFloat(form.amount) || 0)
  const calculatedKdv = isKdvExempt ? 0 : effectiveBaseAmount * 0.20
  const calculatedGrandTotal = effectiveBaseAmount + calculatedKdv

  // --- Dynamic Item Row Helpers (Edit) ---
  const handleAddEditItemRow = () => {
    setEditItems(prev => [
      ...prev,
      { id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, title: '', amount: 0 }
    ])
  }

  const handleRemoveEditItemRow = (index: number) => {
    if (editItems.length <= 1) return
    setEditItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleEditItemChange = (index: number, field: 'title' | 'amount', value: any) => {
    setEditItems(prev => {
      const next = [...prev]
      if (field === 'amount') {
        const parsed = parseFloat(value) || 0
        next[index] = { ...next[index], amount: parsed }
      } else {
        next[index] = { ...next[index], title: value }
      }
      return next
    })
  }

  const editItemsTotal = editItems.reduce((sum, it) => sum + (Number(it.amount) || 0), 0)
  const editEffectiveBaseAmount = editEntryMode === 'itemized' ? editItemsTotal : (parseFloat(editForm.amount) || 0)
  const editCalculatedKdv = editIsKdvExempt ? 0 : editEffectiveBaseAmount * 0.20
  const editCalculatedGrandTotal = editEffectiveBaseAmount + editCalculatedKdv

  // --- Submit Create ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.client_name || !form.title) {
      triggerToast('Lütfen Zorunlu Alanları Doldurunuz', 'Müşteri Adı ve Ödeme Başlığı zorunludur.', 'error')
      return
    }

    let finalAmount = 0
    let validItems: PaymentItem[] = []

    if (entryMode === 'itemized') {
      validItems = items.filter(it => it.title.trim() && it.amount > 0)
      if (validItems.length === 0) {
        triggerToast('Kalem Bilgisi Eksik', 'Lütfen en az bir hizmet/masraf kalemi ve tutarı giriniz.', 'error')
        return
      }
      finalAmount = validItems.reduce((s, it) => s + it.amount, 0)
    } else {
      finalAmount = parseFloat(form.amount)
      if (isNaN(finalAmount) || finalAmount <= 0) {
        triggerToast('Geçersiz Tutar', 'Lütfen 0\'dan büyük geçerli bir tutar giriniz.', 'error')
        return
      }
    }

    const companyCode = form.company_code.trim() || form.client_name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
    const finalKdv = isKdvExempt ? 0 : finalAmount * 0.20
    const finalGrandTotal = finalAmount + finalKdv

    const newReq: PaymentRequest = {
      id: `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      client_name: form.client_name.trim(),
      company_code: companyCode,
      title: form.title.trim(),
      description: form.description.trim(),
      amount: finalAmount,
      kdv_amount: finalKdv,
      total_amount: finalGrandTotal,
      is_kdv_exempt: isKdvExempt,
      items: validItems,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    // 1. Save to dedicated payment_requests table
    try {
      await supabase.from('payment_requests').insert([{
        id: newReq.id,
        client_name: newReq.client_name,
        company_code: newReq.company_code,
        title: newReq.title,
        description: newReq.description,
        amount: newReq.amount,
        kdv_amount: newReq.kdv_amount,
        total_amount: newReq.total_amount,
        is_kdv_exempt: newReq.is_kdv_exempt,
        items: newReq.items,
        status: newReq.status,
        created_at: newReq.created_at
      }])
    } catch (err) {
      console.warn('Supabase insert payment_requests error:', err)
    }

    // 2. Also insert into client_payment_requests for backward compatibility
    try {
      await supabase.from('client_payment_requests').insert([{
        id: newReq.id,
        client_name: newReq.client_name,
        company_code: newReq.company_code,
        title: newReq.title,
        description: newReq.description,
        amount: newReq.amount,
        kdv_amount: newReq.kdv_amount,
        total_amount: newReq.total_amount,
        is_kdv_exempt: newReq.is_kdv_exempt,
        items: newReq.items,
        status: newReq.status
      }])
    } catch (err) {}

    // 3. Also create notification
    try {
      await supabase.from('notifications').insert([{
        id: newReq.id,
        type: 'payment_request',
        title: `💳 Ödeme Talebi: ${newReq.client_name} (₺${finalGrandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })})`,
        message: `${newReq.client_name} için ₺${newReq.amount.toLocaleString('tr-TR')} ${isKdvExempt ? '(KDV Muaf)' : `(+%20 KDV dahil ₺${finalGrandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })})`} tutarında ödeme bağlantısı oluşturuldu.`,
        related_entity_type: 'payment',
        related_entity_id: newReq.company_code || newReq.client_name,
        is_read: false,
        created_at: newReq.created_at
      }])
    } catch (err) {
      console.warn('Supabase insert payment request notification fallback:', err)
    }

    // 4. Save to localStorage
    if (typeof window !== 'undefined') {
      const localStr = localStorage.getItem('socialart_payment_requests') || '[]'
      const localRequests = JSON.parse(localStr)
      localRequests.unshift(newReq)
      localStorage.setItem('socialart_payment_requests', JSON.stringify(localRequests))
    }

    setPaymentRequests(prev => [newReq, ...prev])
    setIsModalOpen(false)
    setForm({ client_name: '', company_code: '', title: '', amount: '', description: '' })
    setSelectedBrandOption('')
    setIsKdvExempt(false)
    setEntryMode('single')
    setItems([{ id: 'item-1', title: '', amount: 0 }])

    triggerToast(
      'Ödeme Talebi Oluşturuldu! 🚀',
      `"${newReq.title}" (₺${newReq.total_amount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}) talebi "${newReq.client_name}" müşterisine iletildi.`,
      'success'
    )
  }

  // --- Open Edit ---
  const handleOpenEdit = (item: PaymentRequest) => {
    setEditingRequest(item)
    const hasItems = Array.isArray(item.items) && item.items.length > 0
    setEditEntryMode(hasItems ? 'itemized' : 'single')
    setEditIsKdvExempt(Boolean(item.is_kdv_exempt))
    setEditItems(hasItems ? item.items! : [{ id: 'edit-item-1', title: item.title, amount: item.amount }])
    setEditForm({
      client_name: item.client_name,
      company_code: item.company_code || '',
      title: item.title,
      amount: String(item.amount),
      description: item.description || '',
      status: item.status || 'pending'
    })
  }

  // --- Submit Update ---
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRequest) return
    if (!editForm.client_name || !editForm.title) {
      triggerToast('Lütfen Zorunlu Alanları Doldurunuz', 'Müşteri Adı ve Ödeme Başlığı zorunludur.', 'error')
      return
    }

    let finalAmount = 0
    let validItems: PaymentItem[] = []

    if (editEntryMode === 'itemized') {
      validItems = editItems.filter(it => it.title.trim() && it.amount > 0)
      if (validItems.length === 0) {
        triggerToast('Kalem Bilgisi Eksik', 'Lütfen en az bir hizmet/masraf kalemi ve tutarı giriniz.', 'error')
        return
      }
      finalAmount = validItems.reduce((s, it) => s + it.amount, 0)
    } else {
      finalAmount = parseFloat(editForm.amount)
      if (isNaN(finalAmount) || finalAmount <= 0) {
        triggerToast('Geçersiz Tutar', 'Lütfen 0\'dan büyük geçerli bir tutar giriniz.', 'error')
        return
      }
    }

    const companyCode = editForm.company_code.trim() || editForm.client_name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
    const finalKdv = editIsKdvExempt ? 0 : finalAmount * 0.20
    const finalGrandTotal = finalAmount + finalKdv
    const nowIso = new Date().toISOString()

    const updatedItem: PaymentRequest = {
      ...editingRequest,
      client_name: editForm.client_name.trim(),
      company_code: companyCode,
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      amount: finalAmount,
      kdv_amount: finalKdv,
      total_amount: finalGrandTotal,
      is_kdv_exempt: editIsKdvExempt,
      items: validItems,
      status: editForm.status
    }

    // 1. Update payment_requests table
    try {
      await supabase.from('payment_requests').update({
        client_name: updatedItem.client_name,
        company_code: updatedItem.company_code,
        title: updatedItem.title,
        description: updatedItem.description,
        amount: updatedItem.amount,
        kdv_amount: updatedItem.kdv_amount,
        total_amount: updatedItem.total_amount,
        is_kdv_exempt: updatedItem.is_kdv_exempt,
        items: updatedItem.items,
        status: updatedItem.status,
        updated_at: nowIso
      }).eq('id', updatedItem.id)
    } catch (err) {
      console.warn('Supabase update payment_requests error:', err)
    }

    // 2. Update client_payment_requests
    try {
      await supabase.from('client_payment_requests').update({
        client_name: updatedItem.client_name,
        company_code: updatedItem.company_code,
        title: updatedItem.title,
        description: updatedItem.description,
        amount: updatedItem.amount,
        kdv_amount: updatedItem.kdv_amount,
        total_amount: updatedItem.total_amount,
        is_kdv_exempt: updatedItem.is_kdv_exempt,
        items: updatedItem.items,
        status: updatedItem.status,
        updated_at: nowIso
      }).eq('id', updatedItem.id)
    } catch (err) {}

    // 3. Update notifications table
    try {
      await supabase.from('notifications').update({
        title: `💳 Ödeme Talebi: ${updatedItem.client_name} (₺${finalGrandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })})`,
        message: `${updatedItem.client_name} için ₺${updatedItem.amount.toLocaleString('tr-TR')} ${editIsKdvExempt ? '(KDV Muaf)' : `(+%20 KDV dahil ₺${finalGrandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })})`} tutarında ödeme bağlantısı oluşturuldu.`,
        related_entity_id: updatedItem.company_code || updatedItem.client_name,
        is_read: updatedItem.status === 'paid'
      }).eq('id', updatedItem.id)
    } catch (err) {}

    // 4. Update localStorage
    if (typeof window !== 'undefined') {
      const localStr = localStorage.getItem('socialart_payment_requests') || '[]'
      const localRequests: PaymentRequest[] = JSON.parse(localStr)
      const updated = localRequests.map(r => r.id === updatedItem.id ? updatedItem : r)
      localStorage.setItem('socialart_payment_requests', JSON.stringify(updated))
    }

    setPaymentRequests(prev => prev.map(r => r.id === updatedItem.id ? updatedItem : r))
    setEditingRequest(null)

    triggerToast(
      'Ödeme Talebi Güncellendi! ✏️',
      `"${updatedItem.title}" (₺${updatedItem.total_amount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}) talebi başarıyla güncellendi.`,
      'success'
    )
  }

  // --- Delete ---
  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm('Bu ödeme talebini silmek istediğinize emin misiniz?')) return

    try {
      // 1. Delete from payment_requests table
      try {
        await supabase.from('payment_requests').delete().eq('id', id)
      } catch (err) {
        console.warn('DB payment_requests delete error:', err)
      }

      // 2. Delete from client_payment_requests table
      try {
        await supabase.from('client_payment_requests').delete().eq('id', id)
      } catch (err) {}

      // 3. Delete from Supabase notifications table
      try {
        await supabase.from('notifications').delete().eq('id', id)
      } catch (err) {
        console.warn('DB payment request notification delete error:', err)
      }

      // 4. Delete from localStorage
      if (typeof window !== 'undefined') {
        const localStr = localStorage.getItem('socialart_payment_requests') || '[]'
        const localRequests: PaymentRequest[] = JSON.parse(localStr)
        const filtered = localRequests.filter(r => r.id !== id)
        localStorage.setItem('socialart_payment_requests', JSON.stringify(filtered))
      }

      setPaymentRequests(prev => prev.filter(r => r.id !== id))
      if (viewingRequest?.id === id) setViewingRequest(null)
      triggerToast('Ödeme Talebi Silindi 🗑️', 'Seçilen ödeme talebi başarıyla kaldırıldı.', 'success')
    } catch (e) {
      console.error('handleDeleteRequest error:', e)
    }
  }

  const copyPaymentLink = (req: PaymentRequest) => {
    const url = `${window.location.origin}/musteri`
    navigator.clipboard.writeText(url)
    triggerToast('Bağlantı Kopyalandı! 📋', `Müşteri Paneli adresi panoya kopyalandı (${url})`, 'success')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] max-w-md w-full border backdrop-blur-xl rounded-2xl p-4 shadow-2xl flex items-start gap-3 transition-all duration-300 ${
          toast.type === 'error'
            ? 'bg-red-950/90 border-red-500/40 shadow-red-500/20'
            : 'bg-neutral-900/95 border-cyan-500/40 shadow-cyan-500/20'
        }`}>
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
            toast.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
          }`}>
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-extrabold text-white">{toast.message}</h4>
            {toast.subtext && <p className="text-[11px] text-neutral-300 mt-0.5 leading-relaxed">{toast.subtext}</p>}
          </div>
          <button onClick={() => setToast(null)} className="text-neutral-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 backdrop-blur-xl">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-cyan-400" /> Müşteri Ödeme Talepleri
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Müşterilerin panellerine doğrudan tek tutar veya <strong>kalem kalem hizmet masrafları</strong> (kurgucu, ses, çekim vb.) şeklinde ödeme talebi oluşturun.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:opacity-90 text-white font-extrabold text-xs px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" /> + Yeni Ödeme Talebi Oluştur
        </button>
      </div>

      {/* Payment Requests Table */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="px-6 py-4 border-b border-neutral-800/60 flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-cyan-400" />
            Oluşturulan Ödeme Talepleri ({paymentRequests.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-950/50 text-neutral-400 font-bold border-b border-neutral-800/40">
                <th className="p-4">MÜŞTERİ / FİRMA KODU</th>
                <th className="p-4">ÖDEME BAŞLIĞI</th>
                <th className="p-4">KALEMLER & DETAY</th>
                <th className="p-4">NET TUTAR</th>
                <th className="p-4">KDV / GENEL TOPLAM</th>
                <th className="p-4">DURUM</th>
                <th className="p-4">TARİH</th>
                <th className="p-4 text-right">İŞLEMLER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/40">
              {paymentRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-500">
                    Henüz oluşturulmuş bir ödeme talebi bulunmuyor. &quot;+ Yeni Ödeme Talebi Oluştur&quot; butonunu kullanarak müşterinize doğrudan talep yollayabilirsiniz.
                  </td>
                </tr>
              ) : (
                paymentRequests.map((reqItem) => {
                  const isPending = reqItem.status === 'pending'
                  const hasItems = Array.isArray(reqItem.items) && reqItem.items.length > 0
                  const grandTotal = reqItem.total_amount || (reqItem.is_kdv_exempt ? reqItem.amount : reqItem.amount * 1.20)

                  return (
                    <tr key={reqItem.id} className="hover:bg-neutral-800/30 transition-colors group">
                      <td className="p-4 font-bold text-white">
                        {reqItem.client_name}
                        {reqItem.company_code && (
                          <div className="text-[10px] text-cyan-400 font-semibold font-mono">
                            KOD: {reqItem.company_code}
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-neutral-200">
                        {reqItem.title}
                        {hasItems && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                            <Layers className="w-3 h-3" /> {reqItem.items!.length} Kalem
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-neutral-400 max-w-xs">
                        {hasItems ? (
                          <div className="space-y-0.5">
                            {reqItem.items!.slice(0, 2).map((it, idx) => (
                              <div key={idx} className="text-[11px] text-neutral-300 truncate">
                                • {it.title}: <strong className="text-cyan-300">₺{Number(it.amount).toLocaleString('tr-TR')}</strong>
                              </div>
                            ))}
                            {reqItem.items!.length > 2 && (
                              <div className="text-[10px] text-purple-400 font-semibold">
                                + {reqItem.items!.length - 2} diğer kalem...
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="truncate block">{reqItem.description || '-'}</span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-neutral-300 text-xs">
                        ₺ {Number(reqItem.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4">
                        <div className="font-black text-cyan-400 text-sm">
                          ₺ {Number(grandTotal).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] font-semibold">
                          {reqItem.is_kdv_exempt ? (
                            <span className="text-emerald-400 font-bold">🛡️ KDV Muaf (%0)</span>
                          ) : (
                            <span className="text-neutral-400">+ %20 KDV Dahil</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                          isPending 
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {isPending ? '🟡 BEKLİYOR' : '🟢 ÖDENDİ'}
                        </span>
                      </td>
                      <td className="p-4 text-neutral-500 text-[11px]">
                        {reqItem.created_at ? new Date(reqItem.created_at).toLocaleDateString('tr-TR') : 'Bugün'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingRequest(reqItem)}
                            title="Kalem ve Detayları Gör"
                            className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-all inline-flex items-center gap-1 font-bold text-[11px]"
                          >
                            <Receipt className="w-3.5 h-3.5 text-purple-400" /> Detay
                          </button>
                          <button
                            onClick={() => handleOpenEdit(reqItem)}
                            title="Ödeme Talebini Düzenle"
                            className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all inline-flex items-center gap-1 font-bold text-[11px]"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(reqItem.id)}
                            title="Ödeme Talebini Sil"
                            className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all inline-flex items-center gap-1 font-bold text-[11px]"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View / Breakdown Detail Modal */}
      {viewingRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{viewingRequest.title}</h3>
                  <p className="text-[11px] text-neutral-400 font-medium">
                    {viewingRequest.client_name} {viewingRequest.company_code ? `(Kod: ${viewingRequest.company_code})` : ''}
                  </p>
                </div>
              </div>
              <button onClick={() => setViewingRequest(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description if any */}
            {viewingRequest.description && (
              <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
                <span className="text-[10px] uppercase font-extrabold text-neutral-500 block mb-1">Açıklama / Fatura Notu</span>
                {viewingRequest.description}
              </div>
            )}

            {/* Itemized Breakdown Table if present */}
            {Array.isArray(viewingRequest.items) && viewingRequest.items.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-400" /> Hizmet / Masraf Kalemleri Dökümü:
                  </span>
                  <span className="text-[11px] text-neutral-500">{viewingRequest.items.length} Kalem</span>
                </div>
                <div className="bg-neutral-950 rounded-2xl border border-neutral-800 divide-y divide-neutral-850 overflow-hidden">
                  {viewingRequest.items.map((it, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div className="font-semibold text-neutral-200">
                        <span className="text-neutral-500 font-mono mr-2">{idx + 1}.</span>
                        {it.title}
                      </div>
                      <div className="font-bold text-white font-mono">
                        ₺ {Number(it.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Price Calculations Summary Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Ara Toplam (Net Hizmet Bedeli):</span>
                <span className="font-bold text-white font-mono">
                  ₺ {Number(viewingRequest.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-xs text-neutral-400">
                <span>
                  KDV Oranı {viewingRequest.is_kdv_exempt ? '(KDV Muafiyeti Aktif)' : '(%20)'}:
                </span>
                <span className={`font-bold font-mono ${viewingRequest.is_kdv_exempt ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {viewingRequest.is_kdv_exempt ? '₺ 0,00 (%0 Muaf)' : `+ ₺ ${(Number(viewingRequest.amount) * 0.20).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                </span>
              </div>
              <div className="h-px bg-neutral-800 my-1" />
              <div className="flex justify-between items-center pt-1">
                <div>
                  <span className="text-xs font-extrabold text-neutral-300 block">ÖDENECEK GENEL TOPLAM</span>
                  <span className="text-[10px] text-neutral-500">
                    {viewingRequest.is_kdv_exempt ? 'KDV Dahil Değil (Muaf Tutuldu)' : 'KDV Dahil Tutar'}
                  </span>
                </div>
                <div className="text-lg font-black text-cyan-400 font-mono">
                  ₺ {(viewingRequest.total_amount || (viewingRequest.is_kdv_exempt ? viewingRequest.amount : viewingRequest.amount * 1.20)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => copyPaymentLink(viewingRequest)}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" /> Müşteri Linkini Kopyala
              </button>
              <button
                onClick={() => {
                  const req = viewingRequest
                  setViewingRequest(null)
                  handleOpenEdit(req)
                }}
                className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Pencil className="w-3.5 h-3.5" /> Düzenle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400" /> Yeni Ödeme Talebi Oluştur
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Brand Selection Dropdown */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" /> Müşteri / Marka Seçin *
                </label>
                <select
                  value={selectedBrandOption}
                  onChange={(e) => handleBrandSelectChange(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-400 font-bold"
                >
                  <option value="">-- Markalar Listesinden Seçin --</option>
                  {brandsList.map((brand, idx) => (
                    <option key={idx} value={brand.name}>
                      🏢 {brand.name} (Kod: {brand.code})
                    </option>
                  ))}
                  <option value="custom">➕ Özel / Manuel Müşteri Adı Gir</option>
                </select>
              </div>

              {/* Show text inputs if custom or pre-filled */}
              {(selectedBrandOption === 'custom' || form.client_name) && (
                <div className="space-y-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
                  {selectedBrandOption !== 'custom' && (
                    <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                      🔒 Seçilen markanın bilgileri otomatik dolduruldu.
                    </div>
                  )}
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 mb-1">Müşteri / Firma Adı *</label>
                    <input
                      type="text"
                      required
                      readOnly={selectedBrandOption !== 'custom'}
                      placeholder="Örn: Ogena Yapı, Arayanvar..."
                      value={form.client_name}
                      onChange={(e) => setForm(prev => ({ ...prev, client_name: e.target.value }))}
                      className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                        selectedBrandOption !== 'custom'
                          ? 'bg-neutral-950/90 border-neutral-800 text-neutral-400 cursor-not-allowed font-semibold'
                          : 'bg-neutral-900 border-neutral-800 text-white focus:border-cyan-400 font-bold'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 mb-1">Müşteri Kodu (Panel Giriş Kodu)</label>
                    <input
                      type="text"
                      readOnly={selectedBrandOption !== 'custom'}
                      placeholder="Örn: ogenayapi, arayanvar..."
                      value={form.company_code}
                      onChange={(e) => setForm(prev => ({ ...prev, company_code: e.target.value }))}
                      className={`w-full border rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none ${
                        selectedBrandOption !== 'custom'
                          ? 'bg-neutral-950/90 border-neutral-800 text-cyan-500/70 cursor-not-allowed'
                          : 'bg-neutral-900 border-neutral-800 text-cyan-400 focus:border-cyan-400'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Payment Title */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Ödeme Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ağustos Ayı Prodüksiyon ve Kurgu Bedeli"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 font-bold"
                />
              </div>

              {/* Entry Mode Switch: Single Amount vs Itemized */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-300">Tutar Giriş Yöntemi</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setEntryMode('single')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      entryMode === 'single'
                        ? 'bg-cyan-500 text-black shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    💰 Tek Tutar (Standart)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryMode('itemized')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      entryMode === 'itemized'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <ListPlus className="w-3.5 h-3.5" /> Kalem Kalem Giriş
                  </button>
                </div>
              </div>

              {/* Single Mode Input */}
              {entryMode === 'single' && (
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Tutar (TL) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-neutral-500">₺</span>
                    <input
                      type="number"
                      step="0.01"
                      required={entryMode === 'single'}
                      placeholder="Örn: 5000"
                      value={form.amount}
                      onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white font-bold outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Itemized Rows Mode */}
              {entryMode === 'itemized' && (
                <div className="space-y-3 bg-neutral-950/70 p-3.5 rounded-2xl border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-purple-400" /> Hizmet / Masraf Kalemleri
                    </span>
                    <span className="text-[10px] text-neutral-400 font-semibold">
                      Toplam: ₺ {itemsTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {items.map((it, idx) => (
                      <div key={it.id || idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          required={entryMode === 'itemized'}
                          placeholder="Örn: Kurgucu, Ses Sanatçısı..."
                          value={it.title}
                          onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-purple-400 font-medium"
                        />
                        <div className="w-32 relative">
                          <span className="absolute left-2.5 top-1.5 text-[11px] font-bold text-neutral-500">₺</span>
                          <input
                            type="number"
                            step="0.01"
                            required={entryMode === 'itemized'}
                            placeholder="Tutar"
                            value={it.amount === 0 ? '' : it.amount}
                            onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-6 pr-2 py-1.5 text-xs text-white font-bold outline-none focus:border-purple-400 font-mono"
                          />
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="w-full py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Yeni Kalem Ekle (Ses, Kurgu, Çekim vb.)
                  </button>
                </div>
              )}

              {/* KDV'den Muaf Tut Checkbox */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-neutral-200">
                  <input
                    type="checkbox"
                    checked={isKdvExempt}
                    onChange={(e) => setIsKdvExempt(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                  />
                  <span>🛡️ KDV&apos;den Muaf Tut (%0 KDV Uygula)</span>
                </label>
                {isKdvExempt && (
                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    KDV MUAF
                  </span>
                )}
              </div>

              {/* Live Calculation Preview Card */}
              <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1.5">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Ara Toplam (Net):</span>
                  <span className="font-bold text-white font-mono">
                    ₺ {effectiveBaseAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>KDV {isKdvExempt ? '(%0 Muaf):' : '(%20 Eklenen):'}</span>
                  <span className={`font-bold font-mono ${isKdvExempt ? 'text-emerald-400' : 'text-cyan-400'}`}>
                    {isKdvExempt ? '₺ 0,00' : `+ ₺ ${calculatedKdv.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
                <div className="h-px bg-neutral-800 my-1" />
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-white">GENEL TOPLAM:</span>
                  <span className="text-base font-black text-cyan-400 font-mono">
                    ₺ {calculatedGrandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Description / Note */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Açıklama / Fatura Notu (İsteğe Bağlı)</label>
                <textarea
                  rows={2}
                  placeholder="Hizmet kapsamı veya fatura bilgisi..."
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs py-2.5 rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-2 bg-gradient-to-r from-cyan-400 to-purple-600 hover:opacity-90 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-lg"
                >
                  Müşteri Paneline İlet 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-cyan-400" /> Ödeme Talebini Düzenle
              </h3>
              <button onClick={() => setEditingRequest(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Müşteri / Firma Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Arayanvar"
                  value={editForm.client_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, client_name: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Müşteri Kodu (Giriş Kodu)</label>
                <input
                  type="text"
                  placeholder="Örn: arayanvar"
                  value={editForm.company_code}
                  onChange={(e) => setEditForm(prev => ({ ...prev, company_code: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-cyan-400 focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Ödeme Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Reklam Maliyeti"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 font-bold"
                />
              </div>

              {/* Edit Mode Switch */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-300">Tutar Giriş Yöntemi</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setEditEntryMode('single')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      editEntryMode === 'single'
                        ? 'bg-cyan-500 text-black shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    💰 Tek Tutar (Standart)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditEntryMode('itemized')
                      if (editItems.length === 0) {
                        setEditItems([{ id: 'edit-1', title: editForm.title, amount: parseFloat(editForm.amount) || 0 }])
                      }
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      editEntryMode === 'itemized'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <ListPlus className="w-3.5 h-3.5" /> Kalem Kalem Giriş
                  </button>
                </div>
              </div>

              {editEntryMode === 'single' ? (
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Tutar (TL) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required={editEntryMode === 'single'}
                    placeholder="Örn: 5000"
                    value={editForm.amount}
                    onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              ) : (
                <div className="space-y-3 bg-neutral-950/70 p-3.5 rounded-2xl border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-purple-400" /> Hizmet / Masraf Kalemleri
                    </span>
                    <span className="text-[10px] text-neutral-400 font-semibold">
                      Toplam: ₺ {editItemsTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {editItems.map((it, idx) => (
                      <div key={it.id || idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          required={editEntryMode === 'itemized'}
                          placeholder="Kalem Adı"
                          value={it.title}
                          onChange={(e) => handleEditItemChange(idx, 'title', e.target.value)}
                          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-purple-400 font-medium"
                        />
                        <div className="w-32 relative">
                          <span className="absolute left-2.5 top-1.5 text-[11px] font-bold text-neutral-500">₺</span>
                          <input
                            type="number"
                            step="0.01"
                            required={editEntryMode === 'itemized'}
                            placeholder="Tutar"
                            value={it.amount === 0 ? '' : it.amount}
                            onChange={(e) => handleEditItemChange(idx, 'amount', e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-6 pr-2 py-1.5 text-xs text-white font-bold outline-none focus:border-purple-400 font-mono"
                          />
                        </div>
                        {editItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEditItemRow(idx)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddEditItemRow}
                    className="w-full py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Kalem Ekle
                  </button>
                </div>
              )}

              {/* Edit KDV Exemption Checkbox */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-neutral-200">
                  <input
                    type="checkbox"
                    checked={editIsKdvExempt}
                    onChange={(e) => setEditIsKdvExempt(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                  />
                  <span>🛡️ KDV&apos;den Muaf Tut (%0 KDV)</span>
                </label>
                {editIsKdvExempt && (
                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    KDV MUAF
                  </span>
                )}
              </div>

              {/* Edit Live Calculation Preview Card */}
              <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1.5">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Ara Toplam (Net):</span>
                  <span className="font-bold text-white font-mono">
                    ₺ {editEffectiveBaseAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>KDV {editIsKdvExempt ? '(%0 Muaf):' : '(%20 Eklenen):'}</span>
                  <span className={`font-bold font-mono ${editIsKdvExempt ? 'text-emerald-400' : 'text-cyan-400'}`}>
                    {editIsKdvExempt ? '₺ 0,00' : `+ ₺ ${editCalculatedKdv.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
                <div className="h-px bg-neutral-800 my-1" />
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-white">GÜNCEL GENEL TOPLAM:</span>
                  <span className="text-base font-black text-cyan-400 font-mono">
                    ₺ {editCalculatedGrandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Açıklama / Not</label>
                <textarea
                  rows={2}
                  placeholder="Hizmet detayları veya fatura notu..."
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Ödeme Durumu</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 font-bold"
                >
                  <option value="pending">🟡 BEKLİYOR</option>
                  <option value="paid">🟢 ÖDENDİ</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs py-2.5 rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-2 bg-gradient-to-r from-cyan-400 to-purple-600 hover:opacity-90 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-lg"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
