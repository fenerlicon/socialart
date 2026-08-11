import React, { useState } from 'react';
import { 
  Film, 
  Share2, 
  Kanban, 
  List, 
  BarChart3, 
  Plus, 
  Sparkles, 
  Search,
  Filter,
  Layers,
  PhoneCall,
  Flame,
  ArrowLeft,
  Menu,
  X,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { PipelineType } from '../types/crm';

type ViewType = 'KANBAN' | 'LIST' | 'ANALYTICS';

interface HeaderProps {
  currentPipeline: PipelineType;
  onPipelineChange: (pipeline: PipelineType) => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onOpenNewLeadModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSourceFilter: string;
  onSourceFilterChange: (source: string) => void;
  onGoToAdmin?: () => void;
  stats: {
    totalLeads: number;
    totalPipelineValue: number;
    retargetingCount: number;
    newCount: number;
    inactiveCount?: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  currentPipeline,
  onPipelineChange,
  currentView,
  onViewChange,
  onOpenNewLeadModal,
  searchQuery,
  onSearchChange,
  selectedSourceFilter,
  onSourceFilterChange,
  onGoToAdmin,
  stats
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900/95 border-b border-slate-800/90 sticky top-0 z-40 backdrop-blur-md transition-all">
      
      {/* ------------------------------------------------------------- */}
      {/* MOBILE COMPACT HEADER BAR (Screen < md) - ONLY ~52px HEIGHT   */}
      {/* ------------------------------------------------------------- */}
      <div className="md:hidden px-3 py-2 flex items-center justify-between gap-2">
        {/* Left: Back & Logo */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              if (onGoToAdmin) onGoToAdmin();
              else window.location.href = '/admin';
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-black bg-indigo-950 text-indigo-300 border border-indigo-500/40 active:scale-95 cursor-pointer"
            title="Admin Paneline Dön"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
          <span className="text-xs font-black text-white tracking-tight hidden sm:inline">SocialArt</span>
        </div>

        {/* Center: Compact Pipeline Segment Toggle */}
        <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-[11px] font-bold shrink-0">
          <button
            onClick={() => onPipelineChange('PRODUCTION')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              currentPipeline === 'PRODUCTION'
                ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3 h-3" />
            <span>Prodüksiyon</span>
          </button>
          <button
            onClick={() => onPipelineChange('SOCIAL_MEDIA')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              currentPipeline === 'SOCIAL_MEDIA'
                ? 'bg-purple-600 text-white shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3 h-3" />
            <span>Sosyal Medya</span>
          </button>
        </div>

        {/* Right: + New Lead & Hamburger Menu Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenNewLeadModal}
            className="px-2.5 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md active:scale-95 cursor-pointer"
          >
            + Ekle
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 active:scale-95 cursor-pointer"
            title="Menüyü Aç / Kapat"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 text-indigo-400" /> : <Menu className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* MOBILE EXPANDABLE CONTROL PANEL (Shown when isMobileMenuOpen === true) */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-3 pb-3 pt-1 border-t border-slate-800/80 bg-slate-950/95 space-y-2.5 animate-fade-in">
          {/* Quick Stats Bar */}
          <div className="flex items-center justify-between gap-1 bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-[11px] font-bold">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Toplam:</span>
              <span className="text-white font-black">{stats.totalLeads}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Yeni:</span>
              <span className="text-blue-400 font-black">{stats.newCount}</span>
            </div>
            <button
              onClick={() => onSourceFilterChange(selectedSourceFilter === 'INACTIVE' ? 'ALL' : 'INACTIVE')}
              className={`px-1.5 py-0.5 rounded text-[10px] ${selectedSourceFilter === 'INACTIVE' ? 'bg-amber-500/30 text-amber-200 font-black border border-amber-500/40' : 'text-amber-400 font-bold'}`}
            >
              ⚠️ Takipsiz: {stats.inactiveCount || 0}
            </button>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Hacim:</span>
              <span className="text-emerald-400 font-black">₺{stats.totalPipelineValue.toLocaleString('tr-TR')}</span>
            </div>
          </div>

          {/* Controls: Navigation Dropdown + View Switchers */}
          <div className="grid grid-cols-2 gap-2">
            <select
              onChange={(e) => { if (e.target.value) window.location.href = e.target.value; }}
              defaultValue=""
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="" disabled>🏠 Menüye Git...</option>
              <option value="/admin/dashboard">🏠 Ana Panel</option>
              <option value="/admin/my-work">📝 Benim İşlerim</option>
              <option value="/admin/todo">📌 Yapılacaklar</option>
              <option value="/admin/calendar">📅 Takvim</option>
              <option value="/admin/operations">⚡ Operasyonlar</option>
              <option value="/admin/employees">👥 Ekip Üyeleri</option>
            </select>

            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold justify-between">
              <button
                onClick={() => { onViewChange('KANBAN'); setIsMobileMenuOpen(false); }}
                className={`flex-1 py-1 text-center rounded-lg ${currentView === 'KANBAN' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                Pano
              </button>
              <button
                onClick={() => { onViewChange('LIST'); setIsMobileMenuOpen(false); }}
                className={`flex-1 py-1 text-center rounded-lg ${currentView === 'LIST' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                Liste
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Müşteri, şirket veya tel ara..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DESKTOP HEADER BAR (Screen >= md) - UNCHANGED PERFECT LAYOUT   */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden md:block max-w-[1700px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Pipeline Switcher Tabs */}
          <div className="bg-slate-950/90 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner shrink-0">
            <button
              onClick={() => onPipelineChange('PRODUCTION')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                currentPipeline === 'PRODUCTION'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Prodüksiyon</span>
            </button>
            
            <button
              onClick={() => onPipelineChange('SOCIAL_MEDIA')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                currentPipeline === 'SOCIAL_MEDIA'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Sosyal Medya</span>
            </button>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800/80 px-3 py-1.5 rounded-xl text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-slate-400">Toplam:</span>
              <span className="font-extrabold text-slate-200">{stats.totalLeads}</span>
            </div>
            
            <div className="h-3 w-px bg-slate-800/80" />
            
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Yeni:</span>
              <span className="font-extrabold text-blue-400">{stats.newCount}</span>
            </div>
            
            <div className="h-3 w-px bg-slate-800/80" />
            
            <button
              onClick={() => onSourceFilterChange(selectedSourceFilter === 'INACTIVE' ? 'ALL' : 'INACTIVE')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                selectedSourceFilter === 'INACTIVE' 
                  ? 'bg-amber-500/30 border border-amber-400 text-amber-200 font-bold' 
                  : 'hover:bg-slate-800/80 text-amber-400'
              }`}
            >
              <span className="font-bold">⚠️ Takipsiz:</span>
              <span className="font-extrabold px-1.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {stats.inactiveCount || 0}
              </span>
            </button>
            
            <div className="h-3 w-px bg-slate-800/80" />
            
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Hacim:</span>
              <span className="font-extrabold text-emerald-400">
                ₺{stats.totalPipelineValue.toLocaleString('tr-TR')}
              </span>
            </div>
          </div>

          {/* Admin Navigation & New Lead Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (onGoToAdmin) onGoToAdmin();
                else window.location.href = '/admin';
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-900/90 to-slate-800 hover:from-indigo-800 hover:to-slate-700 text-indigo-200 border border-indigo-500/40 transition-all shadow-md cursor-pointer"
              title="İş Takip & Admin Paneline Dön"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-400" />
              <span>← Admin Paneli</span>
            </button>

            <div className="relative group">
              <select
                onChange={(e) => {
                  if (e.target.value) window.location.href = e.target.value;
                }}
                defaultValue=""
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="" disabled>🏠 Git...</option>
                <option value="/admin/dashboard">🏠 Ana Panel</option>
                <option value="/admin/my-work">📝 Benim İşlerim</option>
                <option value="/admin/todo">📌 Yapılacaklar</option>
                <option value="/admin/calendar">📅 Takvim</option>
                <option value="/admin/operations">⚡ Operasyonlar</option>
                <option value="/admin/employees">👥 Ekip Üyeleri</option>
              </select>
            </div>

          </div>

        </div>

        {/* Sub Header Controls: Views & Search */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800/90">
            <button
              onClick={() => onViewChange('KANBAN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                currentView === 'KANBAN'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Pano</span>
            </button>
            <button
              onClick={() => onViewChange('LIST')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                currentView === 'LIST'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>Liste</span>
            </button>
            <button
              onClick={() => onViewChange('ANALYTICS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                currentView === 'ANALYTICS'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Rapor</span>
            </button>
          </div>

        {/* Search & Source Filter Bar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Source Filter */}
          <div className="relative shrink-0">
            <select
              value={selectedSourceFilter}
              onChange={(e) => onSourceFilterChange(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
            >
              <option value="ALL">Tüm Kaynaklar</option>
              <option value="INACTIVE">⚠️ Takipsizler (3+ Gün)</option>
              <option value="META_ADS">⚡ Meta Ads (FB/IG)</option>
              <option value="WEBSITE">🌐 Web Formu</option>
              <option value="MANUAL">👤 Manuel / Ref</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ara..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
            />
          </div>
        </div>
      </div>

    </div>
  </header>
);
};
