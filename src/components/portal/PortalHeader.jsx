import React from 'react';
import { 
  BarChart3, 
  Clapperboard, 
  FolderDown, 
  CreditCard, 
  LogOut, 
  Building2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function PortalHeader({
  customer,
  activeTab,
  setActiveTab,
  onLogout,
  clientDetails
}) {
  const tabs = [
    { id: 'overview_ads', label: 'Marka & Reklamlar', icon: BarChart3, badge: '🟢 Canlı' },
    { id: 'production_studio', label: 'Prodüksiyon & Onay', icon: Clapperboard, badge: '⏳ Yakında' },
    { id: 'assets_drive', label: 'Dosyalar & Drive', icon: FolderDown, badge: '⏳ Yakında' },
    { id: 'billing_support', label: 'Finans & İletişim', icon: CreditCard, badge: '💳 3D Secure' },
  ];

  return (
    <header className="mb-8 space-y-6">
      {/* Top Bar: Brand Identity & Session Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-3xl backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {customer?.client_name || 'Markanız'}
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>VIP Marka Portalı</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              SocialArt Dijital Prodüksiyon & Reklam Operasyon Üssü
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>256-Bit SSL Korumalı</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Güvenli Çıkış</span>
          </button>
        </div>
      </div>

      {/* 4 Core Navigation Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 bg-slate-950/70 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-between p-3 sm:p-3.5 rounded-xl transition-all font-bold text-xs relative ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-600/25 border border-indigo-400/30'
                  : 'bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="truncate text-left">{tab.label}</span>
              </div>

              {tab.badge && (
                <span className={`hidden sm:inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
