import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Zap, 
  Globe, 
  User, 
  Calendar, 
  DollarSign, 
  Plus, 
  Send, 
  Flame, 
  Clock, 
  CheckCircle2, 
  FileText,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Lead, StageId } from '../types/crm';
import { STAGES } from '../mock/initialData';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateStage: (leadId: string, newStage: StageId) => void;
  onAddNote: (leadId: string, noteText: string) => void;
  onDeleteNote?: (leadId: string, noteId: string) => void;
  onDeleteLead?: (leadId: string) => void;
  onUpdateRetargeting: (leadId: string, date: string, note: string) => void;
  onUpdateBudget: (leadId: string, newBudget: number | null) => void;
  onUpdateAssignedTo?: (leadId: string, newStaff: string) => void;
  onUpdateLeadInfo?: (leadId: string, updatedData: any) => void;
}

const STAFF_LIST = ['Celal', 'Ercan', 'Furkan', 'Betül', 'Tuğba', 'Simge', 'Atanmadı'];

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onUpdateStage,
  onAddNote,
  onDeleteNote,
  onDeleteLead,
  onUpdateRetargeting,
  onUpdateBudget,
  onUpdateAssignedTo,
  onUpdateLeadInfo
}) => {
  if (!lead) return null;

  const [newNoteText, setNewNoteText] = useState('');
  const [retargetingDate, setRetargetingDate] = useState(lead.retargetingDate || '');
  const [retargetingNote, setRetargetingNote] = useState(lead.retargetingNote || '');
  const [isSavedRetargeting, setIsSavedRetargeting] = useState(false);

  // Custom Delete Confirm States
  const [showDeleteLeadConfirm, setShowDeleteLeadConfirm] = useState(false);
  const [confirmDeleteNoteId, setConfirmDeleteNoteId] = useState<string | null>(null);

  // Edit Lead Info Form State
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    title: lead.title || '',
    contactName: lead.contactName || '',
    phone: lead.phone || '',
    email: lead.email || '',
    city: lead.city || ''
  });
  const [isInfoSaved, setIsInfoSaved] = useState(false);

  const isProduction = lead.pipeline === 'PRODUCTION';
  const currentBudget = isProduction ? lead.productionDetails?.budget : lead.socialMediaDetails?.monthlyBudget;
  const [editableBudget, setEditableBudget] = useState<string>(currentBudget ? String(currentBudget) : '');
  const [isBudgetSaved, setIsBudgetSaved] = useState(false);

  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
  const currentStageObj = STAGES.find(s => s.id === lead.stage);

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(lead.id, newNoteText.trim());
    setNewNoteText('');
  };

  const handleSaveRetargeting = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRetargeting(lead.id, retargetingDate, retargetingNote);
    setIsSavedRetargeting(true);
    setTimeout(() => setIsSavedRetargeting(false), 2000);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = editableBudget.trim() ? Number(editableBudget) : null;
    onUpdateBudget(lead.id, val);
    setIsBudgetSaved(true);
    setTimeout(() => setIsBudgetSaved(false), 2000);
  };

  const handleSaveInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateLeadInfo) {
      onUpdateLeadInfo(lead.id, infoForm);
      setIsInfoSaved(true);
      setTimeout(() => {
        setIsInfoSaved(false);
        setIsEditingInfo(false);
      }, 1500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in cursor-pointer"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden cursor-default my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header (Generous top padding, zero cutoff, centered card format) */}
        <div className="pt-5 pb-3.5 px-4 sm:px-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {isProduction ? '🎬 Prodüksiyon' : '📱 Sosyal Medya'}
              </span>

              {lead.source === 'META_ADS' && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <Zap className="w-3 h-3" /> Meta Ads
                </span>
              )}
              {lead.source === 'WEBSITE' && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Globe className="w-3 h-3" /> Web Formu
                </span>
              )}
              {lead.source === 'MANUAL' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  👤 Manuel
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-xl font-black text-white flex items-center gap-2 flex-wrap leading-snug">
              <span className="truncate">{lead.title}</span>
              <button 
                onClick={() => setIsEditingInfo(!isEditingInfo)}
                className="px-2 py-0.5 rounded-md bg-indigo-600/20 hover:bg-indigo-600/30 text-[11px] text-indigo-300 font-extrabold border border-indigo-500/40 transition-colors shrink-0"
                title="Firma & İletişim Bilgilerini Düzenle"
              >
                {isEditingInfo ? 'Kapat' : '✏️ Düzenle'}
              </button>
            </h2>

            <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2 font-medium">
              <span className="flex items-center gap-1 text-slate-200 font-bold">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                {lead.contactName}
              </span>
              {lead.city && <span>• 📍 {lead.city}</span>}
              <span className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-semibold text-[11px]">Temsilci:</span>
                <select
                  value={lead.assignedTo || 'Atanmadı'}
                  onChange={(e) => onUpdateAssignedTo && onUpdateAssignedTo(lead.id, e.target.value)}
                  className="bg-transparent text-indigo-300 font-extrabold focus:outline-none cursor-pointer text-xs"
                >
                  {STAFF_LIST.map(staff => (
                    <option key={staff} value={staff} className="bg-slate-900 text-slate-200">{staff}</option>
                  ))}
                </select>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onDeleteLead && (
              <button
                type="button"
                onClick={() => setShowDeleteLeadConfirm(true)}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all flex items-center gap-1 text-xs font-bold shadow-sm"
                title="Müşteriyi Sil"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Sil</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-700 transition-all shadow-md active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer"
              title="Pencereyi Kapat"
            >
              <X className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-black pr-0.5">Kapat</span>
            </button>
          </div>
        </div>

        {/* Content Body (High Contrast & High Readability) */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 touch-pan-y">

          {/* Edit Lead Info Form Panel */}
          {isEditingInfo && (
            <form onSubmit={handleSaveInfoSubmit} className="bg-indigo-950/60 border border-indigo-500/40 p-4 rounded-2xl space-y-3 animate-fade-in shadow-xl">
              <div className="flex items-center justify-between border-b border-indigo-500/30 pb-2">
                <span className="font-extrabold text-xs text-indigo-200">✏️ Firma & Müşteri Bilgilerini Güncelle</span>
                {isInfoSaved && <span className="text-xs text-emerald-400 font-bold">✓ Güncellendi!</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Firma / Şirket Adı:</label>
                  <input
                    type="text"
                    value={infoForm.title}
                    onChange={(e) => setInfoForm({ ...infoForm, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Yetkili Kişi Adı:</label>
                  <input
                    type="text"
                    value={infoForm.contactName}
                    onChange={(e) => setInfoForm({ ...infoForm, contactName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Telefon Numarası:</label>
                  <input
                    type="text"
                    value={infoForm.phone}
                    onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">E-Posta Adresi:</label>
                  <input
                    type="email"
                    value={infoForm.email}
                    onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1 font-bold">Şehir / Lokasyon:</label>
                  <input
                    type="text"
                    value={infoForm.city}
                    onChange={(e) => setInfoForm({ ...infoForm, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingInfo(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl transition-colors shadow-md"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          )}

          {/* Stage Switcher Banner */}
          <div className="bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Mevcut Satış Aşaması</span>
              <div className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2 mt-0.5">
                <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${currentStageObj?.color}`} />
                {currentStageObj?.label}
              </div>
            </div>

            <select
              value={lead.stage}
              onChange={(e) => onUpdateStage(lead.id, e.target.value as StageId)}
              className="bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm font-extrabold rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
            >
              {STAGES.map(st => (
                <option key={st.id} value={st.id}>{st.label}</option>
              ))}
            </select>
          </div>

          {/* Quick Contact & Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Merhaba ${lead.contactName}, ${lead.title} ile ilgili bilgi vermek için yazıyorum.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 font-extrabold text-xs sm:text-sm transition-all shadow-md active:scale-98"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp'tan Mesaj At</span>
            </a>

            <a
              href={`tel:${lead.phone}`}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/40 font-extrabold text-xs sm:text-sm transition-all shadow-md active:scale-98"
            >
              <Phone className="w-4 h-4 text-blue-400" />
              <span>Hemen Ara</span>
            </a>
          </div>

          {/* Contact Details Card (High Readability) */}
          <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800/90 space-y-3 shadow-md">
            <h3 className="font-black text-indigo-400 text-xs uppercase tracking-wider">İLETİŞİM & KAYNAK DETAYLARI</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">TELEFON NUMARASI</span>
                <a href={`tel:${cleanPhone}`} className="font-black text-sm text-white hover:text-indigo-300 tracking-wide">{lead.phone || 'Belirtilmedi'}</a>
              </div>
              
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">E-POSTA ADRESİ</span>
                <span className="font-extrabold text-xs text-indigo-300 break-all">{lead.email || 'Belirtilmedi'}</span>
              </div>
              
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">ŞEHİR / LOKASYON</span>
                <span className="font-extrabold text-xs text-slate-200">{lead.city || 'Belirtilmedi'}</span>
              </div>
              
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">BAŞVURU TARİHİ</span>
                <span className="font-extrabold text-xs text-slate-200 font-mono">
                  {lead.createdAt ? new Date(lead.createdAt).toLocaleString('tr-TR') : 'Bugün'}
                </span>
              </div>
            </div>

            {lead.metaCampaignName && (
              <div className="pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400 font-bold block mb-0.5">REKLAM KAMPANYASI:</span>
                <span className="font-extrabold text-blue-400">{lead.metaCampaignName}</span>
              </div>
            )}
          </div>

          {/* Service Specs & Budget Box */}
          <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800/90 space-y-4 shadow-md">
            <h3 className="font-black text-indigo-400 text-xs uppercase tracking-wider">HİZMET & BÜTÇE DETAYLARI</h3>

            {/* Bütçe Formu - HER MÜŞTERİ İÇİN EKRANDA VE DÜZENLENEBİLİR */}
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <form onSubmit={handleSaveBudget} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-extrabold text-xs">
                    {isProduction ? 'Teklif / Proje Bütçesi (₺):' : 'Aylık Hizmet Bütçesi (₺/ay):'}
                  </span>
                  {editableBudget && (
                    <span className="text-emerald-400 font-black text-base">
                      ₺{Number(editableBudget).toLocaleString('tr-TR')}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="number"
                    placeholder="40.000 TL"
                    value={editableBudget}
                    onChange={(e) => setEditableBudget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-black text-base focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-lg transition-all text-xs whitespace-nowrap flex items-center justify-center shrink-0"
                  >
                    {isBudgetSaved ? '✓ Kaydedildi' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>

            {/* Ek Detaylar */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">HİZMET KATEGORİSİ</span>
                <span className="font-extrabold text-xs text-purple-400">
                  {isProduction ? (lead.productionDetails?.shootType || lead.productionDetails?.projectType || 'Prodüksiyon') : 'Sosyal Medya Yönetimi'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">KAPSAM</span>
                <span className="font-extrabold text-xs text-slate-200">
                  {isProduction ? `${lead.productionDetails?.estimatedDurationDays || 1} Gün Çekim` : `${lead.socialMediaDetails?.monthlyReelsCount || 12} Reels / Ay`}
                </span>
              </div>
            </div>
          </div>

          {/* Retargeting & Reminders Box */}
          <div className="bg-pink-950/20 border border-pink-500/20 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-pink-400 font-bold text-xs">
              <Flame className="w-4 h-4" />
              <span>Retargeting & İleride Görüşme Planı</span>
            </div>

            <form onSubmit={handleSaveRetargeting} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Yeniden Arancak Tarih:</label>
                  <input
                    type="date"
                    value={retargetingDate}
                    onChange={(e) => setRetargetingDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Retargeting Notu / Nedeni:</label>
                  <input
                    type="text"
                    placeholder="Örn: Bütçe onaylandıktan sonra Eylül ayında aranacak"
                    value={retargetingNote}
                    onChange={(e) => setRetargetingNote(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  {isSavedRetargeting ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                  <span>{isSavedRetargeting ? 'Kaydedildi!' : 'Tarihi Kaydet'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Internal Notes Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Temsilci Notu ({lead.assignedTo || 'Atanmadı'}) - Son Görüşme / Not ({lead.notes.length})</span>
            </h3>

            {/* Add Note Form */}
            <form onSubmit={handleAddNoteSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Bu lead hakkında yeni not yaz (Örn: Müşteri fiyat revizesi istedi)..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ekle</span>
              </button>
            </form>

            {/* Notes List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {lead.notes.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">Henüz not eklenmedi.</p>
              ) : (
                lead.notes.map((note) => (
                  <div key={note.id} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1 group relative">
                    <div className="flex items-center justify-between text-slate-400 font-medium text-[11px]">
                      <span className="text-indigo-400 font-bold">{note.author}</span>
                      <div className="flex items-center gap-2">
                        <span>{new Date(note.createdAt).toLocaleString('tr-TR')}</span>
                        {onDeleteNote && (
                          confirmDeleteNoteId === note.id ? (
                            <div className="flex items-center gap-1 bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/40 text-[10px] animate-fade-in">
                              <span className="text-rose-300 font-bold">Silinsin mi?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteNote(lead.id, note.id);
                                  setConfirmDeleteNoteId(null);
                                }}
                                className="text-rose-400 hover:text-rose-200 font-extrabold underline px-1"
                              >
                                Evet
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteNoteId(null)}
                                className="text-slate-400 hover:text-slate-200 px-1"
                              >
                                Vazgeç
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteNoteId(note.id)}
                              className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition-colors opacity-70 group-hover:opacity-100"
                              title="Notu Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                    <p className="text-slate-200 leading-relaxed pr-4">{note.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Sticky Modal Footer for Easy Mobile Exit */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 font-semibold truncate">
            Müşteri: <span className="text-slate-200 font-extrabold">{lead.title}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-slate-800 to-indigo-950 hover:from-slate-700 hover:to-indigo-900 border border-indigo-500/30 text-white font-extrabold text-xs shadow-lg active:scale-95 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4 text-indigo-400" />
            <span>✕ Pencereyi Kapat</span>
          </button>
        </div>
      </div>

      {/* Custom Delete Lead Confirmation Modal */}
      {showDeleteLeadConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <Trash2 className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">Müşteri Kaydını Sil</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                <strong className="text-slate-200">&quot;{lead.title || lead.contactName}&quot;</strong> isimli müşteriyi ve bağlı tüm temsilci notlarını silmek üzeresiniz. Bu işlem geri alınamaz.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteLeadConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteLead) onDeleteLead(lead.id);
                  setShowDeleteLeadConfirm(false);
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all"
              >
                Evet, Müşteriyi Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
