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
    <header className="bg-slate-900/95 border-b border-slate-800/90 sticky top-0 z-30 backdrop-blur-md transition-all">
      {/* Upper Top Bar */}
      <div className="max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Top Row on Mobile: Pipeline Switcher & Admin Button */}
        <div className="flex items-center justify-between gap-2 w-full md:w-auto">
          {/* Pipeline Switcher Tabs */}
          <div className="bg-slate-950/90 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner shrink-0">
            <button
              onClick={() => onPipelineChange('PRODUCTION')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                currentPipeline === 'PRODUCTION'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/25'
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
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Sosyal Medya</span>
            </button>
          </div>

          {/* New Lead & Admin Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Prominent Back to Admin Button */}
            <button
              onClick={() => {
                if (onGoToAdmin) onGoToAdmin();
                else window.location.href = '/admin';
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-900/90 to-slate-800 hover:from-indigo-800 hover:to-slate-700 text-indigo-200 border border-indigo-500/40 transition-all shadow-md shadow-indigo-950/50 active:scale-95 cursor-pointer"
              title="İş Takip & Admin Paneline Dön"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-400" />
              <span>← Admin Paneli</span>
            </button>

            {/* Quick Panel Navigation Menu Dropdown */}
            <div className="relative group">
              <select
                onChange={(e) => {
                  if (e.target.value) window.location.href = e.target.value;
                }}
                defaultValue=""
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none pr-6 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394A3B8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:9px_9px] bg-[right_8px_center] bg-no-repeat"
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Müşteri</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Banner (Visible on Desktop, Scrollable Compact Bar on Mobile) */}
        <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800/80 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs min-w-max">
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
