'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { CreditCard, Plus, CheckCircle2, X } from 'lucide-react'

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

export default function PaymentsPage() {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    client_name: '',
    company_code: '',
    title: '',
    amount: '',
    description: ''
  })

  const fetchPaymentRequests = async () => {
    try {
      let remoteRequests: PaymentRequest[] = []
      try {
        const { data } = await supabase
          .from('client_payment_requests')
          .select('*')
          .order('created_at', { ascending: false })
        if (data) remoteRequests = data as PaymentRequest[]
      } catch (err) {
        console.warn('DB payment requests fetch error:', err)
      }

      const localStr = typeof window !== 'undefined' ? localStorage.getItem('socialart_payment_requests') || '[]' : '[]'
      const localRequests: PaymentRequest[] = JSON.parse(localStr)

      const mergedMap = new Map<string, PaymentRequest>()
      remoteRequests.forEach(r => mergedMap.set(r.id, r))
      localRequests.forEach(r => { if (!mergedMap.has(r.id)) mergedMap.set(r.id, r) })

      setPaymentRequests(Array.from(mergedMap.values()))
    } catch (e) {
      console.error('fetchPaymentRequests error:', e)
    }
  }

  useEffect(() => {
    fetchPaymentRequests()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.client_name || !form.title || !form.amount) {
      alert('Lütfen Müşteri Adı, Ödeme Başlığı ve Tutar alanlarını doldurunuz.')
      return
    }

    const numAmount = parseFloat(form.amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Lütfen geçerli bir tutar giriniz.')
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

    // Save to DB
    try {
      await supabase.from('client_payment_requests').insert([{
        client_name: newReq.client_name,
        company_code: newReq.company_code,
        title: newReq.title,
        description: newReq.description,
        amount: newReq.amount,
        status: newReq.status
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

    alert(`✅ Ödeme talebi ("${newReq.title}" - ₺${newReq.amount}) başarıyla oluşturuldu ve "${newReq.client_name}" müşterisinin paneline iletildi!`)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/40">
              {paymentRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
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
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Müşteri / Firma Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Furkan Aslanbaş, Zen Estetik..."
                  value={form.client_name}
                  onChange={(e) => setForm(prev => ({ ...prev, client_name: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Müşteri Kodu (Opsiyonel)</label>
                  <input
                    type="text"
                    placeholder="Örn: furkan, ZEN..."
                    value={form.company_code}
                    onChange={(e) => setForm(prev => ({ ...prev, company_code: e.target.value }))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Tutar (TL) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1.00 veya 15000"
                    value={form.amount}
                    onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-cyan-400"
                  />
                </div>
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
