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
  Flame
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
  stats
}) => {
  return (
    <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
      {/* Upper Top Bar */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Pipeline Selector */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">


          {/* Pipeline Switcher Tabs */}
          <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner">
            <button
              onClick={() => onPipelineChange('PRODUCTION')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                currentPipeline === 'PRODUCTION'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Prodüksiyon</span>
            </button>
            
            <button
              onClick={() => onPipelineChange('SOCIAL_MEDIA')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                currentPipeline === 'SOCIAL_MEDIA'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Sosyal Medya</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-950/60 border border-slate-800/80 px-4 py-2 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-slate-400">Toplam Lead:</span>
            <span className="font-bold text-slate-200">{stats.totalLeads}</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Yeni Gelen:</span>
            <span className="font-bold text-blue-400">{stats.newCount}</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <button
            onClick={() => onSourceFilterChange(selectedSourceFilter === 'INACTIVE' ? 'ALL' : 'INACTIVE')}
            className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all cursor-pointer ${
              selectedSourceFilter === 'INACTIVE' 
                ? 'bg-amber-500/30 border border-amber-400 text-amber-200 shadow-md shadow-amber-500/20' 
                : 'hover:bg-slate-800/80'
            }`}
            title="Takipsiz 3+ gün olan leadleri filtrele"
          >
            <span className="text-amber-400 font-bold">⚠️ Takipsiz (3+ Gün):</span>
            <span className={`font-extrabold px-1.5 py-0.2 rounded text-[11px] ${
              (stats.inactiveCount || 0) > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' : 'text-slate-400'
            }`}>
              {stats.inactiveCount || 0} Lead
            </span>
          </button>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Potansiyel Hacim:</span>
            <span className="font-extrabold text-emerald-400">
              ₺{stats.totalPipelineValue.toLocaleString('tr-TR')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* New Lead Button */}
          <button
            onClick={onOpenNewLeadModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Lead Ekle</span>
          </button>
        </div>
      </div>

      {/* Sub Header & Controls */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 bg-slate-950/40 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
        
        {/* View Switchers */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => onViewChange('KANBAN')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              currentView === 'KANBAN'
                ? 'bg-slate-800 text-indigo-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          
          <button
            onClick={() => onViewChange('LIST')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              currentView === 'LIST'
                ? 'bg-slate-800 text-indigo-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Liste Görünümü</span>
          </button>

          <button
            onClick={() => onViewChange('ANALYTICS')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              currentView === 'ANALYTICS'
                ? 'bg-slate-800 text-indigo-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analiz & Rapor</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
          {/* Source Filter */}
          <div className="relative">
            <select
              value={selectedSourceFilter}
              onChange={(e) => onSourceFilterChange(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer pr-8 font-medium"
            >
              <option value="ALL">Tüm Kaynaklar</option>
              <option value="INACTIVE">⚠️ Takipsizler (3+ Gün)</option>
              <option value="META_ADS">⚡ Meta Ads (FB/IG)</option>
              <option value="WEBSITE">🌐 Web Formu</option>
              <option value="MANUAL">👤 Manuel / Referans</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Şirket, isim veya telefon ara..."
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
