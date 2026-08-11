import React from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { PipelineType } from '../types/crm';

interface HeaderProps {
  currentPipeline: PipelineType;
  onPipelineChange: (pipeline: PipelineType) => void;
  currentView: 'KANBAN' | 'LIST' | 'ANALYTICS';
  onViewChange: (view: 'KANBAN' | 'LIST' | 'ANALYTICS') => void;
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
  return (
    <header className="bg-slate-900/95 border-b border-slate-800/90 md:sticky top-0 z-30 backdrop-blur-md transition-all">
        {/* Top Header Controls (Stacked cleanly on mobile, inline on desktop) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 w-full">
          
          {/* Mobile Row 1: Admin Navigation & New Lead Button */}
          <div className="flex items-center justify-between gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 flex-1 md:flex-none">
              <button
                onClick={() => {
                  if (onGoToAdmin) onGoToAdmin();
                  else window.location.href = '/admin';
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-900/90 to-slate-800 hover:from-indigo-800 hover:to-slate-700 text-indigo-200 border border-indigo-500/40 transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
                title="İş Takip & Admin Paneline Dön"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
                <span>← Admin</span>
              </button>

              <select
                onChange={(e) => {
                  if (e.target.value) window.location.href = e.target.value;
                }}
                defaultValue=""
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl px-2 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer flex-1 md:w-auto"
              >
                <option value="" disabled>🏠 Menü...</option>
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Müşteri</span>
            </button>
          </div>

          {/* Mobile Row 2: Pipeline Switcher Segmented Tabs */}
          <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 w-full md:w-auto shrink-0">
            <button
              onClick={() => onPipelineChange('PRODUCTION')}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentPipeline === 'PRODUCTION'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Prodüksiyon</span>
            </button>
            
            <button
              onClick={() => onPipelineChange('SOCIAL_MEDIA')}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentPipeline === 'SOCIAL_MEDIA'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Sosyal Medya</span>
            </button>
          </div>

          {/* Quick Stats Banner */}
          <div className="w-full md:w-auto overflow-x-auto pb-0.5 md:pb-0 scrollbar-none">
            <div className="flex items-center justify-between md:justify-start gap-2 bg-slate-950/70 border border-slate-800/80 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs min-w-max">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-slate-400">Toplam:</span>
                <span className="font-extrabold text-slate-200">{stats.totalLeads}</span>
              </div>
              
              <div className="h-3 w-px bg-slate-800/80" />
              
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Yeni:</span>
                <span className="font-extrabold text-blue-400">{stats.newCount}</span>
              </div>
              
              <div className="h-3 w-px bg-slate-800/80" />
              
              <button
                onClick={() => onSourceFilterChange(selectedSourceFilter === 'INACTIVE' ? 'ALL' : 'INACTIVE')}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                  selectedSourceFilter === 'INACTIVE' 
                    ? 'bg-amber-500/30 border border-amber-400 text-amber-200 font-bold' 
                    : 'hover:bg-slate-800/80 text-amber-400'
                }`}
              >
                <span className="font-bold">⚠️ Takipsiz:</span>
                <span className="font-extrabold px-1 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {stats.inactiveCount || 0}
                </span>
              </button>
              
              <div className="h-3 w-px bg-slate-800/80" />
              
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Hacim:</span>
                <span className="font-extrabold text-emerald-400">
                  ₺{stats.totalPipelineValue.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>
          </div>

        </div>

      {/* Sub Header Controls: Views & Search */}
      <div className="max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 py-2 bg-slate-950/60 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* View Switchers */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800/90 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => onViewChange('KANBAN')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              currentView === 'KANBAN'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Board</span>
          </button>
          
          <button
            onClick={() => onViewChange('LIST')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              currentView === 'LIST'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Liste</span>
          </button>

          <button
            onClick={() => onViewChange('ANALYTICS')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
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
    </header>
  );
};
