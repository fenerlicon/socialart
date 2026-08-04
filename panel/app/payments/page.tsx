'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { CreditCard, Plus, CheckCircle2, X, Building2, AlertCircle, Trash2 } from 'lucide-react'

interface PaymentRequest {
  id: string
  client_name: string
  company_code?: string
  title: string
  description?: string
  amount: number
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
  const [toast, setToast] = useState<ToastState | null>(null)

  const [form, setForm] = useState({
    client_name: '',
    company_code: '',
    title: '',
    amount: '',
    description: ''
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
      try {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('type', 'payment_request')
          .order('created_at', { ascending: false })
        if (data && data.length > 0) {
          remoteRequests = data.map((n: any) => {
            try {
              return JSON.parse(n.message) as PaymentRequest
            } catch {
              return null
            }
          }).filter(Boolean) as PaymentRequest[]
        }
      } catch (err) {
        console.warn('DB payment requests fetch error:', err)
      }

      const localStr = typeof window !== 'undefined' ? localStorage.getItem('socialart_payment_requests') || '[]' : '[]'
      const localRequests: PaymentRequest[] = JSON.parse(localStr)

      // Auto-migrate any un-synced local requests to Supabase database
      const remoteIds = new Set(remoteRequests.map(r => r.id))
      for (const localReq of localRequests) {
        if (!remoteIds.has(localReq.id)) {
          try {
            await supabase.from('notifications').insert([{
              id: localReq.id,
              type: 'payment_request',
              title: localReq.title,
              message: JSON.stringify(localReq),
              related_entity_type: 'payment',
              related_entity_id: localReq.company_code || localReq.client_name,
              is_read: false,
              created_at: localReq.created_at || new Date().toISOString()
            }])
            remoteRequests.push(localReq)
          } catch (e) {
            console.warn('Auto-migrate payment request error:', e)
          }
        }
      }

      const mergedMap = new Map<string, PaymentRequest>()
      remoteRequests.forEach(r => mergedMap.set(r.id, r))
      localRequests.forEach(r => { if (!mergedMap.has(r.id)) mergedMap.set(r.id, r) })

      setPaymentRequests(Array.from(mergedMap.values()))
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
      } catch (e) {
        console.warn('Fetch real brands error:', e)
      }

      // 2. Fetch from active_clients
      try {
        const { data: clientsData } = await supabase.from('active_clients').select('*')
        if (clientsData) {
          clientsData.forEach((c: any) => {
            const name = (c.brand || c.name || c.company || '').trim()
            if (name && !seen.has(name.toLowerCase())) {
              seen.add(name.toLowerCase())
              const code = c.company_code || c.code || name.toLowerCase().replace(/[^a-z0-9]/g, '')
              dynamicBrands.push({ name, code })
            }
          })
        }
      } catch (e) {}

      // 3. Fetch from customer_accounts
      try {
        const { data: customerData } = await supabase.from('customer_accounts').select('*')
        if (customerData) {
          customerData.forEach((c: any) => {
            const name = (c.name || c.company || '').trim()
            if (name && !seen.has(name.toLowerCase())) {
              seen.add(name.toLowerCase())
              const code = c.company_code || c.code || name.toLowerCase().replace(/[^a-z0-9]/g, '')
              dynamicBrands.push({ name, code })
            }
          })
        }
      } catch (e) {}

      // 4. Fetch from leads
      try {
        const { data: leadsData } = await supabase.from('leads').select('name, company')
        if (leadsData) {
          leadsData.forEach((l: any) => {
            const name = (l.company || l.name || '').trim()
            if (name && !seen.has(name.toLowerCase())) {
              seen.add(name.toLowerCase())
              const code = name.toLowerCase().replace(/[^a-z0-9]/g, '')
              dynamicBrands.push({ name, code })
            }
          })
        }
      } catch (e) {}

      setBrandsList(dynamicBrands)
    } catch (err) {
      console.warn('Fetch brands error:', err)
    }
  }

  useEffect(() => {
    fetchPaymentRequests()
    fetchBrands()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.client_name || !form.title || !form.amount) {
      triggerToast('Lütfen Zorunlu Alanları Doldurunuz', 'Müşteri Adı, Ödeme Başlığı ve Tutar zorunludur.', 'error')
      return
    }

    const numAmount = parseFloat(form.amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      triggerToast('Geçersiz Tutar', 'Lütfen 0\'dan büyük geçerli bir tutar giriniz.', 'error')
      return
    }

    const companyCode = form.company_code.trim() || form.client_name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')

    const newReq: PaymentRequest = {
      id: `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      client_name: form.client_name.trim(),
      company_code: companyCode,
      title: form.title.trim(),
      description: form.description.trim(),
      amount: numAmount,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    // Save to DB (using notifications table for real-time client portal sync)
    try {
      await supabase.from('notifications').insert([{
        id: newReq.id,
        type: 'payment_request',
        title: newReq.title,
        message: JSON.stringify(newReq),
        related_entity_type: 'payment',
        related_entity_id: newReq.company_code || newReq.client_name,
        is_read: false,
        created_at: newReq.created_at
      }])
    } catch (err) {
      console.warn('Supabase insert payment request fallback:', err)
    }

    // Save to localStorage
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

    triggerToast(
      'Ödeme Talebi Oluşturuldu! 🚀',
      `"${newReq.title}" (₺${newReq.amount.toLocaleString('tr-TR')}) talebi "${newReq.client_name}" müşterisine iletildi.`,
      'success'
    )
  }

  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm('Bu ödeme talebini silmek istediğinize emin misiniz?')) return

    try {
      // 1. Delete from Supabase notifications table
      try {
        await supabase.from('notifications').delete().eq('id', id)
      } catch (err) {
        console.warn('DB payment request delete error:', err)
      }

      // 2. Delete from localStorage
      if (typeof window !== 'undefined') {
        const localStr = localStorage.getItem('socialart_payment_requests') || '[]'
        const localRequests: PaymentRequest[] = JSON.parse(localStr)
        const filtered = localRequests.filter(r => r.id !== id)
        localStorage.setItem('socialart_payment_requests', JSON.stringify(filtered))
      }

      setPaymentRequests(prev => prev.filter(r => r.id !== id))
      triggerToast('Ödeme Talebi Silindi 🗑️', 'Seçilen ödeme talebi başarıyla kaldırıldı.', 'success')
    } catch (e) {
      console.error('handleDeleteRequest error:', e)
    }
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
            Müşterilerin panellerine doğrudan özel ödeme talebi oluşturun ve iyzico 3D Secure ile ödemelerini takip edin.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:opacity-90 text-white font-extrabold text-xs px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" /> + Yeni Ödeme Talebi Gönder
        </button>
      </div>

      {/* Payment Requests Table */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="px-6 py-4 border-b border-neutral-800/60 flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-200">
            Oluşturulan Ödeme Talepleri ({paymentRequests.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-950/50 text-neutral-400 font-bold border-b border-neutral-800/40">
                <th className="p-4">MÜŞTERİ / FİRMA KODU</th>
                <th className="p-4">ÖDEME BAŞLIĞI</th>
                <th className="p-4">AÇIKLAMA</th>
                <th className="p-4">TUTAR (TL)</th>
                <th className="p-4">DURUM</th>
                <th className="p-4">TARİH</th>
                <th className="p-4 text-right">İŞLEM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/40">
              {paymentRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    Henüz oluşturulmuş bir ödeme talebi bulunmuyor. &quot;+ Yeni Ödeme Talebi Gönder&quot; butonunu kullanarak müşterinize doğrudan talep yollayabilirsiniz.
                  </td>
                </tr>
              ) : (
                paymentRequests.map((reqItem) => {
                  const isPending = reqItem.status === 'pending'
                  return (
                    <tr key={reqItem.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="p-4 font-bold text-white">
                        {reqItem.client_name}
                        {reqItem.company_code && (
                          <div className="text-[10px] text-cyan-400 font-semibold font-mono">
                            KOD: {reqItem.company_code}
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-neutral-200">{reqItem.title}</td>
                      <td className="p-4 text-neutral-400 max-w-xs truncate">{reqItem.description || '-'}</td>
                      <td className="p-4 font-black text-cyan-400 text-sm">
                        ₺ {Number(reqItem.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
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
                        <button
                          onClick={() => handleDeleteRequest(reqItem.id)}
                          title="Ödeme Talebini Sil"
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all inline-flex items-center gap-1.5 font-bold text-[11px]"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Sil
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400" /> Yeni Ödeme Talebi Gönder
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
                <div className="space-y-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-850">
                  {selectedBrandOption !== 'custom' && (
                    <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                      🔒 Seçilen markanın bilgileri sabittir, değiştirilemez.
                    </div>
                  )}
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 mb-1">Müşteri / Firma Adı *</label>
                    <input
                      type="text"
                      required
                      readOnly={selectedBrandOption !== 'custom'}
                      placeholder="Örn: Ogena Yapı, Aryanvar..."
                      value={form.client_name}
                      onChange={(e) => setForm(prev => ({ ...prev, client_name: e.target.value }))}
                      className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                        selectedBrandOption !== 'custom'
                          ? 'bg-neutral-950/90 border-neutral-800 text-neutral-400 cursor-not-allowed font-semibold'
                          : 'bg-neutral-900 border-neutral-800 text-white focus:border-cyan-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 mb-1">Müşteri Kodu (Panel Giriş Kodu)</label>
                    <input
                      type="text"
                      readOnly={selectedBrandOption !== 'custom'}
                      placeholder="Örn: ogenayapi, aryanvar..."
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

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Tutar (TL) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Örn: 5000"
                  value={form.amount}
                  onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Ödeme Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ağustos Ayı Sosyal Medya Hizmeti"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Açıklama / Not</label>
                <textarea
                  rows={3}
                  placeholder="Fatura ve hizmet detayları..."
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
                  Müşteri Paneline İlet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
