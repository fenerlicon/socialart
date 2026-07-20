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
    <div className="w-full overflow-x-auto pb-6 pt-2">
      <div className="flex gap-4 min-w-max px-4 sm:px-6">
        {STAGES.map((stage) => {
          const stageLeads = pipelineLeads.filter(l => l.stage === stage.id);
          const stageValue = getStageTotalValue(stageLeads);

          return (
            <div
              key={stage.id}
              className="w-80 shrink-0 flex flex-col bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 shadow-sm min-h-[calc(100vh-220px)] max-h-[calc(100vh-220px)] overflow-hidden"
            >
              {/* Column Header */}
              <div className="pb-3 border-b border-slate-800/80 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${stage.color}`} />
                  <h2 className="font-bold text-sm text-slate-200">{stage.label}</h2>
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
              <div className="bg-slate-900/40 rounded-lg p-2 mb-3 flex items-center justify-between text-xs border border-slate-800/50">
                <span className="text-slate-500 font-medium">Toplam Hacim:</span>
                <span className="font-bold text-slate-300">
                  ₺{stageValue.toLocaleString('tr-TR')}
                  {currentPipeline === 'SOCIAL_MEDIA' ? ' /ay' : ''}
                </span>
              </div>

              {/* Lead Cards List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                {stageLeads.length === 0 ? (
                  <div className="h-32 border border-dashed border-slate-800/80 rounded-xl flex flex-col items-center justify-center text-slate-600 text-xs gap-1.5 p-4 text-center">
                    <Layers className="w-5 h-5 text-slate-700" />
                    <span>Bu aşamada lead bulunmuyor</span>
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
  );
};
