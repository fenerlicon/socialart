'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Users,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  BarChart2,
  CheckCircle2,
  Clock,
  AlertCircle,
  PhoneCall,
  Mail,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  X,
  FileText,
  DollarSign
} from 'lucide-react'

interface Lead {
  id: string
  name: string
  company?: string
  rep?: string
  phone?: string
  email?: string
  city?: string
  service?: string
  pipeline?: string
  stage?: string
  status?: string
  budget?: number
  created_at?: string
  notes?: any[]
}

const STAGES = [
  { id: 'NEW', title: 'Geldi (Yeni Lead)', color: '#00e5ff' },
  { id: 'CONTACTED', title: 'İlk İletişim', color: '#8a2be2' },
  { id: 'WAITING', title: 'Teklif Bekliyor', color: '#facc15' },
  { id: 'PROPOSAL_SENT', title: 'Teklif İletildi', color: '#38bdf8' },
  { id: 'RETARGETING', title: 'Yeniden Ulaşılacak', color: '#f97316' },
  { id: 'WON', title: 'Anlaşıldı (Won)', color: '#34d399' },
  { id: 'LOST', title: 'Reddedildi (Lost)', color: '#f43f5e' }
]

export default function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [search, setSearch] = useState('')
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false)
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    service: 'Sosyal Medya Yönetimi',
    pipeline: 'SOCIAL_MEDIA',
    budget: '',
    notes: ''
  })

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Supabase leads fetch error:', error)
      } else if (data) {
        setLeads(data as Lead[])
      }
    } catch (e) {
      console.error('Fetch leads error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLeadForm.name) {
      alert('Lütfen Müşteri / Firma Adı giriniz.')
      return
    }

    const newLead: Partial<Lead> = {
      name: newLeadForm.name.trim(),
      company: newLeadForm.company.trim() || newLeadForm.name.trim(),
      phone: newLeadForm.phone.trim(),
      email: newLeadForm.email.trim(),
      service: newLeadForm.service,
      pipeline: newLeadForm.pipeline,
      stage: 'NEW',
      status: 'Sıcak',
      budget: parseFloat(newLeadForm.budget) || 0,
      created_at: new Date().toISOString()
    }

    try {
      const { data, error } = await supabase.from('leads').insert([newLead]).select('*')
      if (error) {
        console.warn('Insert lead error:', error)
      } else if (data && data[0]) {
        setLeads(prev => [data[0] as Lead, ...prev])
      }
    } catch (err) {
      console.error('Create lead error:', err)
    }

    setIsNewLeadOpen(false)
    setNewLeadForm({ name: '', company: '', phone: '', email: '', service: 'Sosyal Medya Yönetimi', pipeline: 'SOCIAL_MEDIA', budget: '', notes: '' })
    alert('✅ Yeni müşteri potansiyeli CRM sistemine eklendi!')
  }

  const handleStageChange = async (leadId: string, newStage: string) => {
    const stageToStatus: Record<string, string> = {
      'NEW': 'Geldi (Yeni Lead)',
      'CONTACTED': 'Görüşme Yapıldı',
      'WAITING': 'Teklif Bekliyor',
      'PROPOSAL_SENT': 'Teklif İletildi',
      'RETARGETING': 'Yeniden Ulaşılacak',
      'WON': 'Anlaşıldı',
      'LOST': 'Reddedildi'
    }

    const newStatus = stageToStatus[newStage] || newStage

    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage, status: newStatus } : l))

    try {
      await supabase.from('leads').update({ stage: newStage, status: newStatus }).eq('id', leadId)
    } catch (e) {
      console.warn('Update lead stage error:', e)
    }
  }

  const filteredLeads = leads.filter(l =>
    (l.name && l.name.toLowerCase().includes(search.toLowerCase())) ||
    (l.company && l.company.toLowerCase().includes(search.toLowerCase())) ||
    (l.phone && l.phone.includes(search))
  )

  const totalWon = leads.filter(l => l.stage === 'WON' || l.status === 'Anlaşıldı').reduce((sum, l) => sum + (Number(l.budget) || 0), 0)
  const totalPipelineValue = leads.reduce((sum, l) => sum + (Number(l.budget) || 0), 0)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" /> SocialArt CRM Engine
          </div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-400" /> Müşteri İlişkileri & Pipeline (CRM)
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Potansiyel müşterilerinizi, teklif aşamalarını ve satış dönüşümlerini canlı takip edin.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'kanban' ? 'bg-purple-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Pano (Kanban)
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Liste Görünümü
            </button>
          </div>

          <button
            onClick={() => setIsNewLeadOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-cyan-400 hover:opacity-90 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" /> + Yeni Müşteri Ekle
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 backdrop-blur-xl">
          <div className="text-[10px] font-bold text-neutral-500 uppercase">Toplam Potansiyel</div>
          <div className="text-2xl font-black text-white mt-1">{leads.length} Müşteri</div>
          <div className="text-[10px] text-neutral-400 mt-1">CRM veritabanındaki tüm kayıtlar</div>
        </div>

        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 backdrop-blur-xl">
          <div className="text-[10px] font-bold text-neutral-500 uppercase">Yeni Gelenler</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">
            {leads.filter(l => l.stage === 'NEW' || l.status === 'Geldi (Yeni Lead)').length}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">İletişim bekleyen leadler</div>
        </div>

        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 backdrop-blur-xl">
          <div className="text-[10px] font-bold text-neutral-500 uppercase">Kazanılan (Won)</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {leads.filter(l => l.stage === 'WON' || l.status === 'Anlaşıldı').length}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">Anlaşılan markalar</div>
        </div>

        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 backdrop-blur-xl">
          <div className="text-[10px] font-bold text-neutral-500 uppercase">Toplam Portföy Değeri</div>
          <div className="text-2xl font-black text-purple-400 mt-1">
            ₺ {totalPipelineValue.toLocaleString('tr-TR')}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">Tahmini bütçe toplamı</div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Müşteri adı, firma veya telefon ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Main Content View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const stageLeads = filteredLeads.filter(l => (l.stage || 'NEW') === stage.id)

            return (
              <div key={stage.id} className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-3 min-w-[220px]">
                <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
                  <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: stage.color }}></span>
                    {stage.title}
                  </span>
                  <span className="text-[10px] font-bold bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="flex flex-col gap-3 flex-1 min-h-[300px]">
                  {stageLeads.length === 0 ? (
                    <div className="text-[11px] text-neutral-600 italic text-center py-10">Müşteri yok</div>
                  ) : (
                    stageLeads.map(lead => (
                      <div
                        key={lead.id}
                        className="bg-neutral-950 border border-neutral-800 hover:border-purple-500/50 rounded-xl p-3 space-y-2 transition-all shadow-md group cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                              {lead.name}
                            </div>
                            {lead.company && lead.company !== lead.name && (
                              <div className="text-[10px] text-neutral-400 font-semibold">{lead.company}</div>
                            )}
                          </div>
                          {lead.budget ? (
                            <span className="text-[10px] font-black text-cyan-400 font-mono">
                              ₺{Number(lead.budget).toLocaleString('tr-TR')}
                            </span>
                          ) : null}
                        </div>

                        {lead.service && (
                          <div className="text-[10px] text-neutral-500 bg-neutral-900 px-2 py-1 rounded-md inline-block font-mono">
                            {lead.service}
                          </div>
                        )}

                        <div className="pt-2 border-t border-neutral-900 flex items-center justify-between gap-1 text-[10px]">
                          <select
                            value={lead.stage || 'NEW'}
                            onChange={(e) => handleStageChange(lead.id, e.target.value)}
                            className="bg-neutral-900 text-neutral-300 border border-neutral-800 rounded px-1.5 py-0.5 text-[9px] font-semibold outline-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {STAGES.map(s => (
                              <option key={s.id} value={s.id}>{s.title}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-950/60 text-neutral-400 font-bold border-b border-neutral-800">
                <th className="p-4">MÜŞTERİ / FİRMA ADI</th>
                <th className="p-4">İLETİŞİM</th>
                <th className="p-4">HİZMET</th>
                <th className="p-4">BÜTÇE</th>
                <th className="p-4">AŞAMA</th>
                <th className="p-4">TARİH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/40">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">Müşteri kaydı bulunamadı.</td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="p-4 font-bold text-white">
                      {lead.name}
                      {lead.company && <div className="text-[10px] text-neutral-400 font-normal">{lead.company}</div>}
                    </td>
                    <td className="p-4 text-neutral-300">
                      <div>{lead.phone || '-'}</div>
                      <div className="text-[10px] text-neutral-500">{lead.email}</div>
                    </td>
                    <td className="p-4 text-neutral-300">{lead.service || '-'}</td>
                    <td className="p-4 font-black text-cyan-400">
                      {lead.budget ? `₺ ${Number(lead.budget).toLocaleString('tr-TR')}` : '-'}
                    </td>
                    <td className="p-4">
                      <select
                        value={lead.stage || 'NEW'}
                        onChange={(e) => handleStageChange(lead.id, e.target.value)}
                        className="bg-neutral-950 text-neutral-300 border border-neutral-800 rounded px-2.5 py-1 text-xs font-semibold outline-none"
                      >
                        {STAGES.map(s => (
                          <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-neutral-500 text-[11px]">
                      {lead.created_at ? new Date(lead.created_at).toLocaleDateString('tr-TR') : 'Bugün'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* New Lead Modal */}
      {isNewLeadOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" /> Yeni Müşteri Potansiyeli Ekle
              </h3>
              <button onClick={() => setIsNewLeadOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Müşteri / Yetkili Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Ahmet Yılmaz"
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Firma / Marka Adı</label>
                <input
                  type="text"
                  placeholder="Yılmaz Holding"
                  value={newLeadForm.company}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Telefon</label>
                  <input
                    type="tel"
                    placeholder="0532 000 0000"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Tahmini Bütçe (TL)</label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={newLeadForm.budget}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">İlgilenilen Hizmet</label>
                <select
                  value={newLeadForm.service}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, service: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                >
                  <option value="Sosyal Medya Yönetimi">Sosyal Medya Yönetimi</option>
                  <option value="Meta Ads Reklam Yönetimi">Meta Ads Reklam Yönetimi</option>
                  <option value="Kreatif Prodüksiyon">Kreatif Prodüksiyon</option>
                  <option value="SEO & GEO Optimizasyonu">SEO & GEO Optimizasyonu</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewLeadOpen(false)}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs py-2.5 rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-2 bg-gradient-to-r from-purple-600 to-cyan-400 hover:opacity-90 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-lg"
                >
                  CRM'e Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
