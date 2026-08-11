import React from 'react';
import { Lead, StageId, PipelineType } from '../types/crm';
import { STAGES } from '../mock/initialData';
import { LeadCard } from './LeadCard';
import { Plus, TrendingUp, Layers, ChevronRight } from 'lucide-react';

interface KanbanBoardProps {
  leads: Lead[];
  currentPipeline: PipelineType;
  onSelectLead: (lead: Lead) => void;
  onStageChange: (leadId: string, newStage: StageId) => void;
  onPipelineChange?: (leadId: string, newPipeline: 'PRODUCTION' | 'SOCIAL_MEDIA') => void;
  onOpenNewLeadModal: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  currentPipeline,
  onSelectLead,
  onStageChange,
  onPipelineChange,
  onOpenNewLeadModal
}) => {
  const [activeMobileStage, setActiveMobileStage] = React.useState<string>('ALL');

  // Filter leads by current pipeline
  const pipelineLeads = leads.filter(l => l.pipeline === currentPipeline);

  // Calculate stage sum
  const getStageTotalValue = (stageLeads: Lead[]) => {
    return stageLeads.reduce((sum, lead) => {
      if (currentPipeline === 'PRODUCTION') {
        return sum + (lead.productionDetails?.budget || 0);
      } else {
        return sum + (lead.socialMediaDetails?.monthlyBudget || 0);
      }
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
            const count = pipelineLeads.filter(l => l.stage === st.id).length;
            const isSelected = activeMobileStage === st.id;
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
              </button>
            );
          })}
        </div>
      </div>

      {/* Board Columns Container */}
      <div className="w-full overflow-x-auto pb-8 pt-3 px-3 sm:px-6">
        <div className="flex flex-col md:flex-row gap-4 min-w-full md:min-w-max">
          {STAGES.map((stage) => {
            // If on mobile and a specific stage tab is selected, filter out other stages
            if (activeMobileStage !== 'ALL' && activeMobileStage !== stage.id) {
              return null;
            }

            const stageLeads = pipelineLeads.filter(l => l.stage === stage.id);
            const stageValue = getStageTotalValue(stageLeads);

            return (
              <div
                key={stage.id}
                className="w-full md:w-[310px] shrink-0 flex flex-col bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3 shadow-md md:min-h-[calc(100vh-210px)] md:max-h-[calc(100vh-210px)] overflow-hidden transition-all"
              >
                {/* Column Header */}
                <div className="pb-2.5 border-b border-slate-800/80 mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${stage.color}`} />
                    <h2 className="font-extrabold text-sm text-slate-200">{stage.label}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold border ${stage.badgeBg}`}>
                      {stageLeads.length}
                    </span>
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

                {/* Lead Cards List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 md:scrollbar-thin md:scrollbar-thumb-slate-800 max-h-[600px] md:max-h-none">
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
