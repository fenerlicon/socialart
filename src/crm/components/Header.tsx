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
  List as ListIcon,
  Star,
  Download
} from 'lucide-react';
import { PipelineType } from '../types/crm';

type ViewType = 'KANBAN' | 'LIST' | 'ANALYTICS';

interface HeaderProps {
  embedded?: boolean;
  currentPipeline: PipelineType;
  onPipelineChange: (pipeline: PipelineType) => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onOpenNewLeadModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSourceFilter: string;
  onSourceFilterChange: (source: string) => void;
  isQualityOnlyFilter: boolean;
  onToggleQualityOnly: () => void;
  qualifiedCount: number;
  onExportQualityLeads: () => void;
  onGoToAdmin?: () => void;
  stats: {
    totalLeads: number;
    totalPipelineValue: number;
    retargetingCount: number;
    newCount: number;
    inactiveCount?: number;
    todayRetargetingCount?: number;
    overdueRetargetingCount?: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  embedded = false,
  currentPipeline,
  onPipelineChange,
  currentView,
  onViewChange,
  onOpenNewLeadModal,
  searchQuery,
  onSearchChange,
  selectedSourceFilter,
  onSourceFilterChange,
  isQualityOnlyFilter,
  onToggleQualityOnly,
  qualifiedCount,
  onExportQualityLeads,
  onGoToAdmin,
  stats
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900/95 border-b border-slate-800/90 relative md:sticky md:top-0 z-40 backdrop-blur-md transition-all">
      
      {/* ------------------------------------------------------------- */}
      {/* MOBILE HEADER BAR (Screen < md) - STRICTLY 50px CLEAN HEADER  */}
      {/* ------------------------------------------------------------- */}
      {!embedded && (
        <div className="md:hidden px-4 py-2.5 flex items-center justify-between gap-3 bg-slate-950/95 border-b border-slate-800/80">
          {/* Left: SA Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-black text-xs text-white shadow-md shadow-purple-900/40">
              SA
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight leading-none">Social Art CRM</h1>
              <span className="text-[10px] font-bold text-slate-400">Mobil Panel</span>
            </div>
          </div>

          {/* Right: Back & Hamburger Menu Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onGoToAdmin) onGoToAdmin();
                else window.location.href = '/admin';
              }}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 active:scale-95 transition-all"
              title="Admin Paneli"
            >
              <ArrowLeft className="w-4 h-4 text-purple-400" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 active:scale-95 transition-all"
              title="Menü"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-rose-400" /> : <Menu className="w-4 h-4 text-slate-200" />}
            </button>
          </div>
        </div>
      )}

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

          {/* Mobile Quality & Export Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onToggleQualityOnly();
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-black transition-all border ${
                isQualityOnlyFilter
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 border-yellow-400 font-black'
                  : 'bg-slate-900 text-amber-300 border-amber-500/40'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isQualityOnlyFilter ? 'fill-slate-950 text-slate-950' : 'fill-amber-400 text-amber-400'}`} />
              <span>{isQualityOnlyFilter ? '⭐ Kaliteliler Açık' : `⭐ Kaliteliler (${qualifiedCount})`}</span>
            </button>

            <button
              onClick={() => {
                onExportQualityLeads();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-500/40 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Meta İndir ({qualifiedCount})</span>
            </button>
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
            
            {/* Today Retargeting Call Radar Button */}
            {(stats.todayRetargetingCount || 0) > 0 && (
              <>
                <div className="h-3 w-px bg-slate-800/80" />
                <button
                  onClick={() => onSourceFilterChange(selectedSourceFilter === 'RETARGETING_TODAY' ? 'ALL' : 'RETARGETING_TODAY')}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg transition-all cursor-pointer font-black ${
                    selectedSourceFilter === 'RETARGETING_TODAY'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border border-amber-400 shadow-md shadow-amber-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30 animate-pulse'
                  }`}
                  title="Bugün Aranması Gereken Müşterileri Listele"
                >
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>Bugün Aranacak:</span>
                  <span className="px-1.5 rounded text-[10px] bg-slate-950 text-amber-300 font-extrabold border border-amber-500/40">
                    {stats.todayRetargetingCount}
                  </span>
                </button>
              </>
            )}

            {/* Overdue Retargeting Alert Button */}
            {(stats.overdueRetargetingCount || 0) > 0 && (
              <>
                <div className="h-3 w-px bg-slate-800/80" />
                <button
                  onClick={() => onSourceFilterChange(selectedSourceFilter === 'RETARGETING_OVERDUE' ? 'ALL' : 'RETARGETING_OVERDUE')}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-all cursor-pointer font-black ${
                    selectedSourceFilter === 'RETARGETING_OVERDUE'
                      ? 'bg-rose-500 text-white border border-rose-400 shadow-md shadow-rose-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  }`}
                  title="Araması Geciken Retargeting Leadlerini Listele"
                >
                  <span>⚠️ Geciken:</span>
                  <span className="px-1.5 rounded text-[10px] bg-slate-950 text-rose-300 font-extrabold border border-rose-500/40">
                    {stats.overdueRetargetingCount}
                  </span>
                </button>
              </>
            )}

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

            <button
              onClick={onOpenNewLeadModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
              title="Yeni Potansiyel Müşteri Ekle"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Müşteri</span>
            </button>
          </div>

        </div>

        {/* Sub Header Controls: Views, Quality Filter, Search & Export */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Switchers */}
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

            {/* Independent Quality Filter Button */}
            <button
              onClick={onToggleQualityOnly}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all border shrink-0 cursor-pointer shadow-sm active:scale-95 ${
                isQualityOnlyFilter
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 border-yellow-400 shadow-amber-500/20'
                  : 'bg-slate-900/90 text-amber-300 border-amber-500/40 hover:bg-amber-500/10'
              }`}
              title="Sadece Kaliteli Olarak İşaretlenmiş Leadleri Filtrele"
            >
              <Star className={`w-3.5 h-3.5 ${isQualityOnlyFilter ? 'fill-slate-950 text-slate-950' : 'fill-amber-400 text-amber-400'}`} />
              <span>{isQualityOnlyFilter ? '⭐ Kaliteliler Açık' : '⭐ Kaliteli Leadler'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                isQualityOnlyFilter ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {qualifiedCount}
              </span>
            </button>

            {/* Meta Audience Export Button */}
            <button
              onClick={onExportQualityLeads}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-900/20 border border-emerald-500/40 transition-all active:scale-95 shrink-0 cursor-pointer"
              title="Meta Ads Lookalike Audience (Müşteri Listesi) CSV İndir"
            >
              <Download className="w-3.5 h-3.5" />
              <span>📥 Meta İndir ({qualifiedCount})</span>
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
                <option value="RETARGETING_TODAY">🔔 Bugün Aranacaklar ({stats.todayRetargetingCount || 0})</option>
                <option value="RETARGETING_OVERDUE">⚠️ Geciken Retargeting ({stats.overdueRetargetingCount || 0})</option>
                <option value="RETARGETING_ALL">🔥 Tüm Retargeting ({stats.retargetingCount || 0})</option>
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
