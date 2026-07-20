import React, { useState } from 'react';
import { X, Sparkles, Zap, Globe, CheckCircle2, ArrowRight } from 'lucide-react';
import { Lead, PipelineType } from '../types/crm';

interface FormSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'activities'>) => void;
}

export const FormSimulatorModal: React.FC<FormSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSimulateLead
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'META_ADS' | 'WEBSITE'>('META_ADS');
  const [pipeline, setPipeline] = useState<PipelineType>('PRODUCTION');
  const [companyName, setCompanyName] = useState('Atlas Teknoloji A.Ş.');
  const [contactName, setContactName] = useState('Kaan Güven');
  const [phone, setPhone] = useState('+90 532 999 8877');
  const [email, setEmail] = useState('kaan@atlastent.com');
  const [budget, setBudget] = useState(150000);
  const [message, setMessage] = useState('Ağustos ayı lansmanımız için 4K tanıtım filmi ve sosyal medya teaser çekimi fiyatı istiyoruz.');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();

    onSimulateLead({
      pipeline,
      title: `${companyName} (${pipeline === 'PRODUCTION' ? 'Prodüksiyon' : 'Sosyal Medya'})`,
      contactName,
      email,
      phone,
      city: 'İstanbul',
      source: mode,
      metaCampaignName: mode === 'META_ADS' ? 'Meta Ads - Instagram Lead Form Kampanyası' : undefined,
      stage: 'NEW',
      priority: 'HIGH',
      assignedTo: 'Otomatik Atandı',
      productionDetails: pipeline === 'PRODUCTION' ? {
        projectType: 'Tanıtım Filmi',
        budget: Number(budget),
        estimatedDurationDays: 3
      } : undefined,
      socialMediaDetails: pipeline === 'SOCIAL_MEDIA' ? {
        monthlyBudget: Number(budget),
        platforms: ['Instagram', 'TikTok'],
        monthlyReelsCount: 16,
        industry: 'Teknoloji / Yazılım'
      } : undefined
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-emerald-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                Canlı Lead Düşürme Simülatörü
              </h2>
              <p className="text-xs text-slate-400">Meta Reklamları veya Web Formundan CRM'e Veri Akışı Testi</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSimulate} className="p-5 space-y-4 text-xs">
          
          {/* Source Selection */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Gelen Lead Kaynağını Seçin:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('META_ADS')}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                  mode === 'META_ADS'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Zap className="w-4 h-4 text-blue-300" /> Meta Lead Ads
              </button>

              <button
                type="button"
                onClick={() => setMode('WEBSITE')}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                  mode === 'WEBSITE'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Globe className="w-4 h-4 text-purple-300" /> Web Formu
              </button>
            </div>
          </div>

          {/* Target Pipeline */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Hangi Hat (Pipeline) Düşsün?</label>
            <select
              value={pipeline}
              onChange={(e) => setPipeline(e.target.value as PipelineType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-semibold"
            >
              <option value="PRODUCTION">🎬 Prodüksiyon Pipeline</option>
              <option value="SOCIAL_MEDIA">📱 Sosyal Medya Pipeline</option>
            </select>
          </div>

          {/* Test Form Fields */}
          <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Şirket Adı</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Telefon</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Tahmini Bütçe (₺)</label>
                <input
                  type="number"
                  step="10000"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-bold text-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Gelen Form Notu / Mesajı</label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Success Banner */}
          {isSuccess && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-center flex items-center justify-center gap-2 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>🎉 Lead Anında CRM Paneline Düştü!</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
            >
              Kapat
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold shadow-lg shadow-emerald-500/25 flex items-center gap-2"
            >
              <span>Test Lead'ini CRM'e Düşür</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
