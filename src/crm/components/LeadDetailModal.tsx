import React, { useState, useEffect } from 'react';
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
  Trash2,
  Star,
  Target,
  Download
} from 'lucide-react';
import { Lead, StageId, getRetargetingStatus, isSystemPlaceholderNote } from '../types/crm';
import { STAGES } from '../mock/initialData';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateStage: (leadId: string, newStage: StageId) => void;
  onAddNote: (leadId: string, noteText: string, author?: string) => void;
  onDeleteNote?: (leadId: string, noteId: string) => void;
  onDeleteLead?: (leadId: string) => void;
  onUpdateRetargeting: (leadId: string, date: string, note: string) => void;
  onUpdateBudget: (leadId: string, newBudget: number | null) => void;
  onUpdateAssignedTo?: (leadId: string, newStaff: string) => void;
  onUpdateLeadInfo?: (leadId: string, updatedData: any) => void;
  onToggleQualified?: (leadId: string) => void;
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
  onUpdateLeadInfo,
  onToggleQualified
}) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState<string>('Furkan');
  const [feedTab, setFeedTab] = useState<'all' | 'notes' | 'logs'>('all');
  const [retargetingDate, setRetargetingDate] = useState('');
  const [retargetingNote, setRetargetingNote] = useState('');
  const [isSavedRetargeting, setIsSavedRetargeting] = useState(false);

  // Custom Delete Confirm States
  const [showDeleteLeadConfirm, setShowDeleteLeadConfirm] = useState(false);
  const [confirmDeleteNoteId, setConfirmDeleteNoteId] = useState<string | null>(null);

  // Edit Lead Info Form State
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    title: '',
    contactName: '',
    phone: '',
    email: '',
    city: ''
  });
  const [isInfoSaved, setIsInfoSaved] = useState(false);

  const [editableBudget, setEditableBudget] = useState<string>('');
  const [isBudgetSaved, setIsBudgetSaved] = useState(false);

  // Body scroll lock & ESC key cleanup
  useEffect(() => {
    if (!lead) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow || '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lead, onClose]);

  // Sync form state when lead changes
  useEffect(() => {
    if (lead) {
      setRetargetingDate(lead.retargetingDate || '');
      setRetargetingNote(lead.retargetingNote || '');
      setInfoForm({
        title: lead.title || '',
        contactName: lead.contactName || '',
        phone: lead.phone || '',
        email: lead.email || '',
        city: lead.city || ''
      });
      const isProduction = lead.pipeline === 'PRODUCTION';
      const currentBudget = isProduction ? lead.productionDetails?.budget : lead.socialMediaDetails?.monthlyBudget;
      setEditableBudget(currentBudget ? String(currentBudget) : '');

      // Detect active logged-in user
      try {
        const userStr = localStorage.getItem('ajans_user') || localStorage.getItem('socialart_user') || localStorage.getItem('social-art-base:credentials');
        if (userStr) {
          const parsed = JSON.parse(userStr);
          const foundName = parsed.name || parsed.full_name || parsed.username;
          if (foundName) {
            setNoteAuthor(foundName);
            return;
          }
        }
      } catch (e) {}

      if (lead.assignedTo && lead.assignedTo !== 'Atanmadı') {
        setNoteAuthor(lead.assignedTo);
      } else {
        setNoteAuthor('Furkan');
      }
    }
  }, [lead]);

  if (!lead) return null;

  const isProduction = lead.pipeline === 'PRODUCTION';
  const currentBudget = isProduction ? lead.productionDetails?.budget : lead.socialMediaDetails?.monthlyBudget;

  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
  const currentStageObj = STAGES.find(s => s.id === lead.stage);

  // Feed partition (Notes vs System Logs)
  const manualNotes = (lead.notes || []).filter(n => n.type !== 'log' && !isSystemPlaceholderNote(n.text));
  const explicitLogs = (lead.notes || []).filter(n => n.type === 'log' || isSystemPlaceholderNote(n.text));

  // Convert each manual note into an audit log entry so Loglar tab records note additions
  const noteAdditionLogs = manualNotes.map(n => ({
    id: `log-from-${n.id}`,
    author: n.author || 'Temsilci',
    text: `Yeni temsilci notu eklendi: "${n.text.length > 100 ? n.text.slice(0, 100) + '...' : n.text}"`,
    createdAt: n.createdAt,
    type: 'log' as const,
    actionType: 'NOTE' as const
  }));

  // Convert activities into log entries if not already present in explicitLogs
  const activityLogs = (lead.activities || []).map(a => ({
    id: a.id || `act-${Math.random()}`,
    author: a.author || lead.assignedTo || 'Sistem',
    text: a.title + (a.details ? `: "${a.details}"` : ''),
    createdAt: a.date,
    type: 'log' as const,
    actionType: ((a.type as any) || 'INFO_UPDATE') as any
  }));

  // Combine logs without duplicate text & timestamp
  const systemLogs = [...explicitLogs, ...noteAdditionLogs, ...activityLogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // All Feed combining manual note cards and logs
  const allFeed = [...manualNotes, ...explicitLogs, ...activityLogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const displayedFeed = feedTab === 'notes' ? manualNotes : feedTab === 'logs' ? systemLogs : allFeed;

  const getInitials = (name: string) => {
    if (!name) return 'TM';
    const clean = name.replace(/\(.*\)/, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  };

  const formatLogDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(lead.id, newNoteText.trim(), noteAuthor);
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

  if (!lead) return null;

  return (
    <div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}
      className="w-full h-full bg-slate-950 flex flex-col sm:items-center sm:justify-center sm:p-4 sm:bg-slate-950/85 sm:backdrop-blur-sm animate-fade-in cursor-pointer"
      onClick={onClose}
    >
      <div
        className="w-full h-full max-w-2xl bg-slate-900 border-0 sm:border border-slate-800 rounded-none sm:rounded-3xl sm:h-auto sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header (Clean solid header with safe area padding) */}
        <div className="pt-3 sm:pt-4 pb-3.5 px-4 sm:px-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0">
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
              {lead.source === 'GOOGLE_ADS' && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Target className="w-3 h-3" /> Google Ads
                </span>
              )}
              {lead.source === 'WEBSITE' && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Globe className="w-3 h-3" /> Web Formu
                </span>
              )}
              {lead.source === 'AI_AGENT' && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  🤖 ChatGPT AI
                </span>
              )}
              {lead.source === 'MANUAL' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  👤 Manuel
                </span>
              )}

              {lead.adName && lead.adName !== 'Manuel Giriş / Referans' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                  🎯 Reklam: {lead.adName}
                </span>
              )}

              {lead.isQualified && (
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ⭐ Meta Kaliteli Lead
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
            {onToggleQualified && (
              <button
                type="button"
                onClick={() => onToggleQualified(lead.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
                  lead.isQualified
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/60 shadow-amber-500/20 font-black'
                    : 'bg-slate-800 hover:bg-amber-500/15 text-slate-300 hover:text-amber-300 border-slate-700'
                }`}
                title={lead.isQualified ? "Kaliteli işaretini kaldır" : "Kaliteli Lead (Meta Hedef Kitle için) olarak işaretle"}
              >
                <Star className={`w-3.5 h-3.5 ${lead.isQualified ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                <span>{lead.isQualified ? '⭐ Kaliteli (Kaldır)' : '+ Kaliteli Yap'}</span>
              </button>
            )}

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
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60 transition-all shadow-md active:scale-95 flex items-center justify-center shrink-0 cursor-pointer"
              title="Kapat"
            >
              <X className="w-5 h-5 text-slate-200" />
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
            <div className="flex items-center justify-between">
              <h3 className="font-black text-indigo-400 text-xs uppercase tracking-wider">İLETİŞİM & KAYNAK DETAYLARI</h3>
              {lead.isQualified && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ⭐ Kaliteli Lead
                </span>
              )}
            </div>

            {/* Meta Ads Lookalike / Quality Box */}
            <div className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              lead.isQualified
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-slate-900/50 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-start gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                  lead.isQualified ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  <Star className={`w-3.5 h-3.5 ${lead.isQualified ? 'fill-amber-400 text-amber-400' : ''}`} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Meta Ads Kaliteli Lead Durumu</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {lead.isQualified
                      ? 'Bu müşteri kaliteli işaretlendi. Meta Benzer Hedef Kitle (Lookalike) dışa aktarımına dahildir.'
                      : 'Müşteriyi kaliteli işaretleyip Meta reklamlarında benzer kitle oluşturmak için indirebilirsiniz.'}
                  </p>
                </div>
              </div>

              {onToggleQualified && (
                <button
                  type="button"
                  onClick={() => onToggleQualified(lead.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border shrink-0 transition-all cursor-pointer active:scale-95 ${
                    lead.isQualified
                      ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/50'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-md'
                  }`}
                >
                  {lead.isQualified ? 'Kaldır' : '⭐ Kaliteli Yap'}
                </button>
              )}
            </div>
            
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

            {/* Neden Sizinle Çalışmalıyız? / Aday Açıklaması */}
            {lead.whyUs && (
              <div className="bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-500/30 space-y-1">
                <span className="text-[11px] font-black text-indigo-300 uppercase tracking-wider block">
                  💡 Neden Sizinle Çalışmalıyız? / Başvuru Açıklaması
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                  {lead.whyUs}
                </p>
              </div>
            )}

            {/* CV & Portfolyo Bağlantıları */}
            {(lead.resumeUrl || lead.portfolioUrl || lead.instagramUrl) && (
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-black text-indigo-300 uppercase tracking-wider block">
                  📎 Aday Ekleri & Portfolyo Bağlantıları
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {lead.resumeUrl && (
                    <a
                      href={lead.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>📄 Özgeçmiş (CV) İndir / Aç</span>
                    </a>
                  )}
                  {lead.portfolioUrl && (
                    <a
                      href={lead.portfolioUrl.startsWith('http') ? lead.portfolioUrl : `https://${lead.portfolioUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>🔗 Portfolyo Linkini Gör</span>
                    </a>
                  )}
                  {lead.instagramUrl && (
                    <a
                      href={lead.instagramUrl.startsWith('http') ? lead.instagramUrl : `https://instagram.com/${lead.instagramUrl.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>📸 Instagram Profili (@{lead.instagramUrl.replace('@', '')})</span>
                    </a>
                  )}
                </div>
              </div>
            )}

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
            <div className="flex items-center justify-between gap-2 text-pink-400 font-bold text-xs flex-wrap">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                <span>Retargeting & İleride Görüşme Planı</span>
              </div>
              {(() => {
                const rt = getRetargetingStatus({ retargetingDate, retargetingNote });
                if (!rt) return null;
                return (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                    rt.type === 'TODAY' ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse' :
                    rt.type === 'OVERDUE' ? 'bg-rose-500 text-white border-rose-400' :
                    'bg-pink-500/20 text-pink-200 border-pink-500/40'
                  }`}>
                    {rt.label}
                  </span>
                );
              })()}
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

          {/* Temsilci Notları & Aktivite / İşlem Günlüğü (Audit Log) */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
            
            {/* Header with 3 Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    Temsilci Notları & İşlem Günlüğü
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Sorumlu: <strong className="text-indigo-300">{lead.assignedTo || 'Atanmadı'}</strong>
                  </span>
                </div>
              </div>

              {/* Feed Tabs Switcher */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setFeedTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    feedTab === 'all'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>Tümü ({allFeed.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeedTab('notes')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    feedTab === 'notes'
                      ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Notlar ({manualNotes.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeedTab('logs')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    feedTab === 'logs'
                      ? 'bg-purple-600 text-white shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>Loglar ({systemLogs.length})</span>
                </button>
              </div>
            </div>

            {/* Add Note Box (Available on all tabs) */}
            <form onSubmit={handleAddNoteSubmit} className="space-y-2 bg-slate-950/90 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[11px] font-semibold">Notu Yazan:</span>
                  <select
                    value={noteAuthor}
                    onChange={(e) => setNoteAuthor(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 text-indigo-300 font-extrabold text-xs rounded-lg px-2 py-0.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {STAFF_LIST.filter(s => s !== 'Atanmadı').map(staff => (
                      <option key={staff} value={staff} className="bg-slate-900 text-slate-200">{staff}</option>
                    ))}
                    {!STAFF_LIST.includes(noteAuthor) && (
                      <option value={noteAuthor} className="bg-slate-900 text-slate-200">{noteAuthor}</option>
                    )}
                  </select>
                </div>
                <span className="text-[10px] text-slate-500">Ekleyen: <strong className="text-slate-300">{noteAuthor}</strong></span>
              </div>

              <div className="flex gap-2">
                <textarea
                  rows={2}
                  placeholder={`"${lead.title || lead.contactName}" hakkında temsilci notu yazın (Örn: Müşteri fiyat revizesi istedi, Salı aranacak)...`}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="flex-1 bg-slate-900/90 border border-slate-800 text-slate-100 text-xs rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleAddNoteSubmit(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex flex-col items-center justify-center gap-1 shrink-0 active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span className="text-[10px]">Kaydet</span>
                </button>
              </div>
            </form>

            {/* Feed List Items */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {displayedFeed.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-800/80 rounded-xl bg-slate-950/40">
                  <p className="text-xs text-slate-500 italic">
                    {feedTab === 'notes' ? 'Henüz temsilci notu eklenmedi.' : feedTab === 'logs' ? 'Henüz kayıtlı işlem günlüğü yok.' : 'Henüz işlem veya not geçmişi bulunmuyor.'}
                  </p>
                </div>
              ) : (
                displayedFeed.map((item) => {
                  const isLog = item.type === 'log';

                  if (isLog) {
                    // System / Audit Log Card
                    const actionType = item.actionType || 'INFO_UPDATE';
                    const isStageChange = actionType === 'STAGE_CHANGE';
                    const isQuality = actionType === 'QUALIFIED';
                    const isBudget = actionType === 'BUDGET_UPDATE';
                    const isRetargeting = actionType === 'RETARGETING';
                    const isAssigned = actionType === 'ASSIGNED';
                    const isNote = actionType === 'NOTE';

                    return (
                      <div 
                        key={item.id} 
                        className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                          isQuality
                            ? 'bg-amber-950/20 border-amber-500/30'
                            : isStageChange
                            ? 'bg-indigo-950/20 border-indigo-500/30'
                            : isBudget
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : isRetargeting
                            ? 'bg-pink-950/20 border-pink-500/30'
                            : isAssigned
                            ? 'bg-blue-950/20 border-blue-500/30'
                            : isNote
                            ? 'bg-indigo-950/20 border-indigo-500/30'
                            : 'bg-slate-950/80 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            {isQuality && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/40 flex items-center gap-1">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Kalite Durumu
                              </span>
                            )}
                            {isStageChange && (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/40 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Aşama Değişimi
                              </span>
                            )}
                            {isBudget && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/40 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" /> Bütçe Revizesi
                              </span>
                            )}
                            {isRetargeting && (
                              <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 font-extrabold border border-pink-500/40 flex items-center gap-1">
                                <Flame className="w-3 h-3" /> Retargeting Planı
                              </span>
                            )}
                            {isAssigned && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-extrabold border border-blue-500/40 flex items-center gap-1">
                                <User className="w-3 h-3" /> Temsilci Atandı
                              </span>
                            )}
                            {isNote && (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/40 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3 text-indigo-400" /> Temsilci Notu
                              </span>
                            )}
                            {!isQuality && !isStageChange && !isBudget && !isRetargeting && !isAssigned && !isNote && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-extrabold border border-slate-700 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-purple-400" /> İşlem Günlüğü
                              </span>
                            )}
                            <span className="text-slate-400 font-medium">
                              Yapan: <strong className="text-slate-200">{item.author || 'Sistem'}</strong>
                            </span>
                          </div>

                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatLogDate(item.createdAt)}
                          </span>
                        </div>

                        <p className="text-slate-200 font-medium pl-1 leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    );
                  }

                  // Manual Note Card
                  const authorName = item.author || 'Temsilci';
                  const initials = getInitials(authorName);

                  return (
                    <div 
                      key={item.id} 
                      className="bg-slate-950/90 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2 group relative hover:border-slate-700 transition-all shadow-sm"
                    >
                      <div className="flex items-center justify-between text-[11px] gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-[10px] flex items-center justify-center shadow-md">
                            {initials}
                          </div>
                          <div>
                            <span className="text-indigo-300 font-black">{authorName}</span>
                            <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                              Temsilci Notu
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatLogDate(item.createdAt)}
                          </span>
                          {onDeleteNote && (
                            confirmDeleteNoteId === item.id ? (
                              <div className="flex items-center gap-1 bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/40 text-[10px] animate-fade-in">
                                <span className="text-rose-300 font-bold">Silinsin mi?</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteNote(lead.id, item.id);
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
                                onClick={() => setConfirmDeleteNoteId(item.id)}
                                className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                                title="Notu Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                        <p className="text-slate-100 font-medium leading-relaxed whitespace-pre-wrap">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

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
