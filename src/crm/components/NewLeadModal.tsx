import React, { useState } from 'react';
import { X, Plus, Film, Share2 } from 'lucide-react';
import { Lead, PipelineType, LeadSource } from '../types/crm';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'activities'>) => void;
  defaultPipeline: PipelineType;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({
  isOpen,
  onClose,
  onAddLead,
  defaultPipeline
}) => {
  if (!isOpen) return null;

  const [pipeline, setPipeline] = useState<PipelineType>(defaultPipeline);
  const [title, setTitle] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('İstanbul');
  const [source, setSource] = useState<LeadSource>('MANUAL');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  
  // Production
  const [projectType, setProjectType] = useState<'Tanıtım Filmi' | 'Reklam Çekimi' | 'Müzik Klipi' | 'Etkinlik Çekimi' | 'Ürün / Fotoğraf'>('Tanıtım Filmi');
  const [prodBudget, setProdBudget] = useState<string>('');
  
  // Social Media
  const [industry, setIndustry] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState<string>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Array<'Instagram' | 'TikTok' | 'LinkedIn' | 'YouTube'>>(['Instagram', 'TikTok']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !contactName || !phone) return;

    onAddLead({
      pipeline,
      title,
      contactName,
      email: email || `${contactName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      phone,
      city,
      source,
      stage: 'NEW',
      priority,
      assignedTo: 'Siz',
      productionDetails: pipeline === 'PRODUCTION' ? {
        projectType,
        budget: prodBudget ? Number(prodBudget) : null,
        estimatedDurationDays: 2
      } : undefined,
      socialMediaDetails: pipeline === 'SOCIAL_MEDIA' ? {
        monthlyBudget: monthlyBudget ? Number(monthlyBudget) : null,
        platforms: selectedPlatforms,
        monthlyReelsCount: 12,
        industry: industry || 'Genel Sektör'
      } : undefined
    });

    onClose();
  };

  const togglePlatform = (plat: 'Instagram' | 'TikTok' | 'LinkedIn' | 'YouTube') => {
    if (selectedPlatforms.includes(plat)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== plat));
    } else {
      setSelectedPlatforms([...selectedPlatforms, plat]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-base text-slate-100">Yeni Lead Ekle</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Pipeline Switch */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Satış Hattı (Pipeline):</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPipeline('PRODUCTION')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                  pipeline === 'PRODUCTION'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Film className="w-3.5 h-3.5" /> Prodüksiyon
              </button>

              <button
                type="button"
                onClick={() => setPipeline('SOCIAL_MEDIA')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                  pipeline === 'SOCIAL_MEDIA'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" /> Sosyal Medya
              </button>
            </div>
          </div>

          {/* Title & Contact */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Şirket / Proje Adı *</label>
            <input
              type="text"
              required
              placeholder="Örn: ABC Marka Reklam Çekimi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Yetkili Ad Soyad *</label>
              <input
                type="text"
                required
                placeholder="Örn: Ali Yılmaz"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Telefon *</label>
              <input
                type="text"
                required
                placeholder="Örn: +90 532 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">E-Posta</label>
              <input
                type="email"
                placeholder="ali@marka.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Şehir</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Specific Fields */}
          {pipeline === 'PRODUCTION' ? (
            <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Proje Türü</label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                >
                  <option value="Sunuculu Video">Sunuculu Video</option>
                  <option value="Tanıtım Filmi">Tanıtım Filmi</option>
                  <option value="Reklam Çekimi">Reklam Çekimi</option>
                  <option value="Müzik Klipi">Müzik Klipi</option>
                  <option value="Etkinlik Çekimi">Etkinlik Çekimi</option>
                  <option value="Ürün / Fotoğraf">Ürün / Fotoğraf</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Bütçe (₺) (Opsiyonel)</label>
                <input
                  type="number"
                  step="5000"
                  placeholder="Bütçe Belirtilmedi"
                  value={prodBudget}
                  onChange={(e) => setProdBudget(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Sektör</label>
                  <input
                    type="text"
                    placeholder="Örn: Restoran, Moda"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Aylık Bütçe (₺/ay) (Opsiyonel)</label>
                  <input
                    type="number"
                    step="5000"
                    placeholder="Bütçe Belirtilmedi"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Platformlar:</label>
                <div className="flex gap-2">
                  {(['Instagram', 'TikTok', 'LinkedIn', 'YouTube'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                        selectedPlatforms.includes(p)
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Priority & Source */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Lead Kaynağı</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="MANUAL">Manuel / Tavsiye</option>
                <option value="META_ADS">Meta Ads (Reklam)</option>
                <option value="WEBSITE">Web Sitesi Formu</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Öncelik Derecesi</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="LOW">Düşük</option>
                <option value="MEDIUM">Orta</option>
                <option value="HIGH">Yüksek</option>
                <option value="URGENT">Acil 🔥</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30"
            >
              Lead Oluştur
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
