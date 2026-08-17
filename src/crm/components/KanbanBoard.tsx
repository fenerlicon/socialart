import React from 'react';
import { Lead, StageId, PipelineType, getRetargetingStatus } from '../types/crm';
import { STAGES } from '../mock/initialData';
import { LeadCard } from './LeadCard';
import { Plus, TrendingUp, Layers, ChevronRight, Flame, Bell, AlertTriangle } from 'lucide-react';

interface KanbanBoardProps {
  leads: Lead[];
  currentPipeline: PipelineType;
  onSelectLead: (lead: Lead) => void;
  onStageChange: (leadId: string, newStage: StageId) => void;
  onPipelineChange?: (leadId: string, newPipeline: 'PRODUCTION' | 'SOCIAL_MEDIA') => void;
  onOpenNewLeadModal: () => void;
  onToggleQualified?: (leadId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  currentPipeline,
  onSelectLead,
  onStageChange,
  onPipelineChange,
  onOpenNewLeadModal,
  onToggleQualified
}) => {
  const [activeMobileStage, setActiveMobileStage] = React.useState<string>('ALL');

  // Filter leads by current pipeline
  const pipelineLeads = leads.filter(l => l.pipeline === currentPipeline);

  // Calculate stage sum
  const getStageTotalValue = (stageLeads: Lead[]) => {
    return stageLeads.reduce((sum, lead) => {
      const rawVal = currentPipeline === 'PRODUCTION'
        ? lead.productionDetails?.budget
        : lead.socialMediaDetails?.monthlyBudget;
      const numVal = (typeof rawVal === 'number' && !isNaN(rawVal))
        ? rawVal
        : (parseFloat(String(rawVal || '').replace(/[^0-9.-]+/g, '')) || 0);
      return Number(sum) + numVal;
    }, 0);
  };

  return (
    <div className="w-full flex flex-col">
      {/* Mobile Stage Selector Tabs (Visible on screens < md) */}
      <div className="md:hidden w-full overflow-x-auto px-3 py-2 bg-slate-950/80 border-b border-slate-800/80 scrollbar-none sticky top-[108px] z-20 backdrop-blur-md">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveMobileStage('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
              activeMobileStage === 'ALL'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            Tüm Aşamalar ({pipelineLeads.length})
          </button>
          {STAGES.map((st) => {
            const stageLeads = pipelineLeads.filter(l => l.stage === st.id);
            const count = stageLeads.length;
            const isSelected = activeMobileStage === st.id;
            const todayCalls = stageLeads.filter(l => getRetargetingStatus(l)?.type === 'TODAY').length;
            const overdueCalls = stageLeads.filter(l => getRetargetingStatus(l)?.type === 'OVERDUE').length;

            return (
              <button
                key={st.id}
                onClick={() => setActiveMobileStage(st.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-slate-800 text-white border-indigo-500 shadow-md'
                    : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:bg-slate-800/80'
                }`}
              >
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${st.color}`} />
                <span>{st.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {count}
                </span>
                {todayCalls > 0 && (
                  <span className="px-1 py-0.2 rounded text-[9px] font-black bg-amber-500 text-slate-950 animate-pulse">
                    🔥{todayCalls}
                  </span>
                )}
                {overdueCalls > 0 && todayCalls === 0 && (
                  <span className="px-1 py-0.2 rounded text-[9px] font-black bg-rose-500 text-white">
                    ⚠️{overdueCalls}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Board Columns Container */}
      <div className="w-full md:overflow-x-auto overflow-visible pb-32 md:pb-8 pt-3 px-3 sm:px-6 touch-pan-y">
        <div className="flex flex-col md:flex-row gap-4 min-w-full md:min-w-max">
          {STAGES.map((stage) => {
            // If on mobile and a specific stage tab is selected, filter out other stages
            if (activeMobileStage !== 'ALL' && activeMobileStage !== stage.id) {
              return null;
            }

            const stageLeads = pipelineLeads.filter(l => l.stage === stage.id);
            const stageValue = getStageTotalValue(stageLeads);
            const todayCalls = stageLeads.filter(l => getRetargetingStatus(l)?.type === 'TODAY').length;
            const overdueCalls = stageLeads.filter(l => getRetargetingStatus(l)?.type === 'OVERDUE').length;

            return (
              <div
                key={stage.id}
                className={`w-full md:w-[310px] shrink-0 flex flex-col bg-slate-950/70 border rounded-2xl p-3 shadow-md md:min-h-[calc(100vh-210px)] md:max-h-[calc(100vh-210px)] overflow-visible md:overflow-hidden transition-all ${
                  todayCalls > 0 
                    ? 'border-amber-500/50 shadow-amber-500/10' 
                    : overdueCalls > 0
                    ? 'border-rose-500/40'
                    : 'border-slate-800/90'
                }`}
              >
                {/* Column Header */}
                <div className="pb-2.5 border-b border-slate-800/80 mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${stage.color}`} />
                    <h2 className="font-extrabold text-sm text-slate-200">{stage.label}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold border ${stage.badgeBg}`}>
                      {stageLeads.length}
                    </span>
                    {todayCalls > 0 && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border border-amber-400 shadow-md shadow-amber-500/20 animate-pulse flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-slate-950" /> {todayCalls} Bugün
                      </span>
                    )}
                    {overdueCalls > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-rose-500/25 text-rose-300 border border-rose-500/40 flex items-center gap-0.5">
                        ⚠️ {overdueCalls} Gecikti
                      </span>
                    )}
                  </div>

                  {stage.id === 'NEW' && (
                    <button
                      onClick={onOpenNewLeadModal}
                      className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Bu aşamaya yeni lead ekle"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Total Financial Value in Stage */}
                <div className="bg-slate-900/50 rounded-xl p-2 mb-2.5 flex items-center justify-between text-xs border border-slate-800/60">
                  <span className="text-slate-400 font-medium">Aşama Hacmi:</span>
                  <span className="font-extrabold text-slate-200">
                    ₺{stageValue.toLocaleString('tr-TR')}
                    {currentPipeline === 'SOCIAL_MEDIA' ? ' /ay' : ''}
                  </span>
                </div>

                {/* Lead Cards List (Natural height on mobile, inner scroll ONLY on desktop) */}
                <div className="flex-1 space-y-3 pr-0.5 md:overflow-y-auto md:scrollbar-thin md:scrollbar-thumb-slate-800">
                  {stageLeads.length === 0 ? (
                    <div className="h-28 border border-dashed border-slate-800/80 rounded-xl flex flex-col items-center justify-center text-slate-600 text-xs gap-1.5 p-4 text-center">
                      <Layers className="w-5 h-5 text-slate-700" />
                      <span>Bu aşamada kayıt bulunmuyor</span>
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onSelect={onSelectLead}
                        onStageChange={onStageChange}
                        onPipelineChange={onPipelineChange}
                        onToggleQualified={onToggleQualified}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Mobile Scroll-To-Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-5 right-5 z-40 bg-indigo-600/90 hover:bg-indigo-500 text-white p-3 rounded-full shadow-2xl shadow-indigo-600/50 backdrop-blur-md border border-indigo-400/40 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold md:hidden"
        title="Sayfa Başına Dön"
      >
        <span className="text-sm">↑</span>
        <span className="text-[11px]">Üste Çık</span>
      </button>
    </div>
  );
};
