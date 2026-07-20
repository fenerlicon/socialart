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
  AlertCircle
} from 'lucide-react';
import { Lead, StageId } from '../types/crm';
import { STAGES } from '../mock/initialData';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateStage: (leadId: string, newStage: StageId) => void;
  onAddNote: (leadId: string, noteText: string) => void;
  onUpdateRetargeting: (leadId: string, date: string, note: string) => void;
  onUpdateBudget: (leadId: string, newBudget: number | null) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onUpdateStage,
  onAddNote,
  onUpdateRetargeting,
  onUpdateBudget
}) => {
  if (!lead) return null;

  const [newNoteText, setNewNoteText] = useState('');
  const [retargetingDate, setRetargetingDate] = useState(lead.retargetingDate || '');
  const [retargetingNote, setRetargetingNote] = useState(lead.retargetingNote || '');
  const [isSavedRetargeting, setIsSavedRetargeting] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {isProduction ? '🎬 Prodüksiyon Pipeline' : '📱 Sosyal Medya Pipeline'}
              </span>

              {lead.source === 'META_ADS' && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Zap className="w-3 h-3" /> Meta Ads
                </span>
              )}
              {lead.source === 'WEBSITE' && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Globe className="w-3 h-3" /> Web Formu
                </span>
              )}
            </div>

            <h2 className="text-xl font-extrabold text-slate-100">{lead.title}</h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>{lead.contactName}</span>
              {lead.city && <span>• {lead.city}</span>}
              <span>• Temsilci: <strong className="text-slate-300">{lead.assignedTo || 'Atanmadı'}</strong></span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Stage Switcher Banner */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-400 font-medium">Mevcut Satış Aşaması:</span>
              <div className="font-bold text-sm text-slate-200 flex items-center gap-2 mt-0.5">
                <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${currentStageObj?.color}`} />
                {currentStageObj?.label}
              </div>
            </div>

            <select
              value={lead.stage}
              onChange={(e) => onUpdateStage(lead.id, e.target.value as StageId)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:border-indigo-500"
            >
              {STAGES.map(st => (
                <option key={st.id} value={st.id}>{st.label}</option>
              ))}
            </select>
          </div>

          {/* Quick Contact & Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Merhaba ${lead.contactName}, ${lead.title} ile ilgili bilgi vermek için yazıyorum.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 font-semibold text-xs transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp'tan Mesaj At</span>
            </a>

            <a
              href={`tel:${lead.phone}`}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 font-semibold text-xs transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Hemen Ara</span>
            </a>
          </div>

          {/* Contact Details Grid */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3 text-xs">
            <h3 className="font-bold text-slate-300 text-xs uppercase tracking-wider mb-2">İletişim & Kaynak Detayları</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 block">Telefon:</span>
                <span className="font-medium text-slate-200">{lead.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">E-Posta:</span>
                <span className="font-medium text-slate-200">{lead.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Şehir / Lokasyon:</span>
                <span className="font-medium text-slate-200">{lead.city || 'Belirtilmedi'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Başvuru Tarihi:</span>
                <span className="font-medium text-slate-200">
                  {new Date(lead.createdAt).toLocaleString('tr-TR')}
                </span>
              </div>
            </div>

            {lead.metaCampaignName && (
              <div className="pt-2 border-t border-slate-800/80 text-blue-400">
                <span className="text-slate-500 block">Reklam Kampanyası:</span>
                <span className="font-semibold">{lead.metaCampaignName}</span>
              </div>
            )}
          </div>

          {/* Service Specs & Budget Box */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3 text-xs">
            <h3 className="font-bold text-slate-300 text-xs uppercase tracking-wider mb-2">Hizmet & Bütçe Detayları</h3>

            {isProduction && lead.productionDetails && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block mb-1">Proje Türü:</span>
                  <span className="font-bold text-indigo-400">{lead.productionDetails.projectType}</span>
                </div>
                <div>
                  <form onSubmit={handleSaveBudget}>
                    <span className="text-slate-500 block mb-1">Teklif / Bütçe (₺):</span>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        placeholder="Örn: 150000 (Boş ise Belirsiz)"
                        value={editableBudget}
                        onChange={(e) => setEditableBudget(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors whitespace-nowrap text-[11px]"
                      >
                        {isBudgetSaved ? '✓' : 'Kaydet'}
                      </button>
                    </div>
                  </form>
                </div>
                <div>
                  <span className="text-slate-500 block">Çekim Süresi:</span>
                  <span className="font-medium text-slate-300">{lead.productionDetails.estimatedDurationDays || 1} Gün</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Çekim Lokasyonu:</span>
                  <span className="font-medium text-slate-300">{lead.productionDetails.shootingLocation || 'Belirtilmedi'}</span>
                </div>
              </div>
            )}

            {!isProduction && lead.socialMediaDetails && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block mb-1">Sektör / Marka Türü:</span>
                  <span className="font-bold text-purple-400">{lead.socialMediaDetails.industry}</span>
                </div>
                <div>
                  <form onSubmit={handleSaveBudget}>
                    <span className="text-slate-500 block mb-1">Aylık Bütçe (₺/ay):</span>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        placeholder="Örn: 40000 (Boş ise Belirsiz)"
                        value={editableBudget}
                        onChange={(e) => setEditableBudget(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors whitespace-nowrap text-[11px]"
                      >
                        {isBudgetSaved ? '✓' : 'Kaydet'}
                      </button>
                    </div>
                  </form>
                </div>
                <div>
                  <span className="text-slate-500 block">Hedef Platformlar:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {lead.socialMediaDetails.platforms.map(p => (
                      <span key={p} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block">Aylık İçerik Hedefi:</span>
                  <span className="font-medium text-slate-300">{lead.socialMediaDetails.monthlyReelsCount} Adet Reels/Post</span>
                </div>
              </div>
            )}
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
              <span>Temsilci Notu - Son Görüşme / Not ({lead.notes.length})</span>
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
                  <div key={note.id} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 font-medium text-[11px]">
                      <span className="text-indigo-400 font-bold">{note.author}</span>
                      <span>{new Date(note.createdAt).toLocaleString('tr-TR')}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{note.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
