import React from 'react';
import { 
  Phone, 
  MessageSquare, 
  Globe, 
  Zap, 
  Calendar, 
  DollarSign, 
  Tag, 
  Clock, 
  ChevronRight,
  MoreVertical,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Lead, StageId } from '../types/crm';
import { STAGES } from '../mock/initialData';

interface LeadCardProps {
  lead: Lead;
  onSelect: (lead: Lead) => void;
  onStageChange: (leadId: string, newStage: StageId) => void;
  onPipelineChange?: (leadId: string, newPipeline: 'PRODUCTION' | 'SOCIAL_MEDIA') => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onSelect,
  onStageChange,
  onPipelineChange
}) => {
  const isProduction = lead.pipeline === 'PRODUCTION';

  // Calculate formatted budget
  const getBudgetDisplay = () => {
    if (isProduction) {
      const b = lead.productionDetails?.budget;
      return b && b > 0 ? `₺${b.toLocaleString('tr-TR')}` : 'Bütçe Belirtilmedi';
    } else {
      const b = lead.socialMediaDetails?.monthlyBudget;
      return b && b > 0 ? `₺${b.toLocaleString('tr-TR')} /ay` : 'Bütçe Belirtilmedi';
    }
  };

  const isBudgetSet = isProduction 
    ? Boolean(lead.productionDetails?.budget && lead.productionDetails.budget > 0)
    : Boolean(lead.socialMediaDetails?.monthlyBudget && lead.socialMediaDetails.monthlyBudget > 0);

  // WhatsApp formatted link
  const getWhatsAppLink = () => {
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Merhaba ${lead.contactName}, ${lead.title} talebiniz hakkında iletişime geçiyorum.`);
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  const getPriorityColor = () => {
    switch (lead.priority) {
      case 'URGENT': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'HIGH': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'MEDIUM': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'LOW': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  // Calculate inactive days
  const getDaysInactive = () => {
    const lastDate = new Date(lead.updatedAt || lead.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysInactive = getDaysInactive();
  const isInactiveAlert = daysInactive >= 3 && lead.stage !== 'WON' && lead.stage !== 'LOST';

  return (
    <div 
      onClick={() => onSelect(lead)}
      className={`group relative bg-slate-900/90 hover:bg-slate-800/90 border rounded-xl p-4 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer flex flex-col justify-between ${
        isInactiveAlert ? 'border-amber-500/50 shadow-amber-500/5' : 'border-slate-800 hover:border-slate-700 hover:shadow-indigo-500/5'
      }`}
    >
      {/* Inactivity Warning Banner on Top */}
      {isInactiveAlert && (
        <div className="mb-2 bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 rounded-lg px-2.5 py-1 text-amber-300 text-[10px] font-bold flex items-center justify-between animate-pulse">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            Takip Bekliyor ({daysInactive} gündür işlem yapılmadı)
          </span>
          <span className="text-amber-400">⚠️</span>
        </div>
      )}

      {/* Header Info */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          {/* Source Badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {lead.source === 'META_ADS' && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Zap className="w-3 h-3 text-blue-400" />
                Meta Lead Ad
              </span>
            )}
            {lead.source === 'WEBSITE' && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Globe className="w-3 h-3 text-purple-400" />
                Web Formu
              </span>
            )}
            {lead.source === 'MANUAL' && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                Manuel / Ref
              </span>
            )}

            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getPriorityColor()}`}>
              {lead.priority}
            </span>
          </div>

          {/* Quick Actions: Pipeline Switch & Stage Select */}
          <div className="flex items-center gap-1">
            {onPipelineChange && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const targetPipeline = isProduction ? 'SOCIAL_MEDIA' : 'PRODUCTION';
                  onPipelineChange(lead.id, targetPipeline);
                }}
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border transition-all ${
                  isProduction
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20'
                }`}
                title={isProduction ? "Sosyal Medya Kanalına Taşı" : "Prodüksiyon Kanalına Taşı"}
              >
                {isProduction ? "➔ Sosyal Medya" : "➔ Prodüksiyon"}
              </button>
            )}

            <select
              value={lead.stage}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                onStageChange(lead.id, e.target.value as StageId);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] rounded px-1.5 py-0.5 cursor-pointer hover:border-slate-700 focus:outline-none"
            >
              {STAGES.map(st => (
                <option key={st.id} value={st.id}>{st.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Title & Contact */}
        <h3 className="font-bold text-sm text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
          {lead.title}
        </h3>
        <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5 mt-0.5">
          <span>{lead.contactName}</span>
          {lead.city && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500">{lead.city}</span>
            </>
          )}
        </p>

        {/* Pipeline Specific Details Box */}
        <div className="bg-slate-950/60 rounded-lg p-2.5 mb-3 border border-slate-800/80 text-xs space-y-1.5">
          {isProduction && lead.productionDetails && (
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 font-medium">{lead.productionDetails.projectType}</span>
              <span className={`font-bold ${isBudgetSet ? 'text-emerald-400' : 'text-slate-500 italic font-normal text-[11px]'}`}>
                {getBudgetDisplay()}
              </span>
            </div>
          )}

          {!isProduction && lead.socialMediaDetails && (
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span className="text-slate-400 font-medium">{lead.socialMediaDetails.industry}</span>
                <span className={`font-bold ${isBudgetSet ? 'text-emerald-400' : 'text-slate-500 italic font-normal text-[11px]'}`}>
                  {getBudgetDisplay()}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {lead.socialMediaDetails.platforms.map(plat => (
                  <span key={plat} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                    {plat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Retargeting Note Warning if in Retargeting Stage */}
        {lead.stage === 'RETARGETING' && (lead.retargetingNote || lead.retargetingDate) && (
          <div className="mb-3 bg-pink-500/10 border border-pink-500/20 rounded-lg p-2 text-pink-300 text-[11px] flex items-start gap-1.5">
            <Flame className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
            <div>
              {lead.retargetingDate && <div className="font-bold">Hedef Tarih: {lead.retargetingDate}</div>}
              <div className="line-clamp-2 text-pink-200/80">{lead.retargetingNote}</div>
            </div>
          </div>
        )}

        {/* Latest Note Badge (e.g. "AÇMADI") */}
        {lead.notes && lead.notes.length > 0 && (
          <div className="mb-3 bg-slate-950/90 border border-slate-800/90 rounded-lg px-2.5 py-1.5 text-[11px] text-indigo-300/90 font-medium italic flex items-center gap-1.5">
            <span className="text-indigo-400 font-bold shrink-0">💬</span>
            <span className="line-clamp-1">"{lead.notes[0].text}"</span>
          </div>
        )}
      </div>

      {/* Footer & Quick Actions */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1 text-[11px]">
          <Clock className="w-3 h-3 text-slate-600" />
          {new Date(lead.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
        </span>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* Quick WhatsApp Action */}
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
            title="WhatsApp üzerinden mesaj at"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </a>

          {/* Quick Call Action */}
          <a
            href={`tel:${lead.phone}`}
            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 transition-colors"
            title="Telefon et"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => onSelect(lead)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            title="Detayları gör"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
