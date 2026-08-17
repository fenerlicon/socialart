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
  ArrowRight,
  Star,
  Target
} from 'lucide-react';
import { Lead, StageId, getRetargetingStatus, getLatestLeadNote } from '../types/crm';
import { STAGES } from '../mock/initialData';

interface LeadCardProps {
  lead: Lead;
  onSelect: (lead) => void;
  onStageChange: (leadId: string, newStage: StageId) => void;
  onPipelineChange?: (leadId: string, newPipeline: 'PRODUCTION' | 'SOCIAL_MEDIA') => void;
  onToggleQualified?: (leadId: string) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onSelect,
  onStageChange,
  onPipelineChange,
  onToggleQualified
}) => {
  const isProduction = lead.pipeline === 'PRODUCTION';
  const retargetingStatus = getRetargetingStatus(lead);

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
    let latestTime = 0;

    if (lead.updatedAt) {
      const t = new Date(lead.updatedAt).getTime();
      if (!isNaN(t) && t > latestTime) latestTime = t;
    }

    if (Array.isArray(lead.notes) && lead.notes.length > 0) {
      lead.notes.forEach((n: any) => {
        const noteDateStr = n.createdAt || n.created_at || n.date || n.timestamp;
        if (noteDateStr) {
          const t = new Date(noteDateStr).getTime();
          if (!isNaN(t) && t > latestTime) latestTime = t;
        }

        if (n.text && typeof n.text === 'string') {
          const match = n.text.match(/(\d{2})[./](\d{2})[./](\d{4})/) || n.text.match(/(\d{4})-(\d{2})-(\d{2})/);
          if (match) {
            let parsedDate;
            if (match[3] && match[3].length === 4) {
              parsedDate = new Date(`${match[3]}-${match[2]}-${match[1]}`);
            } else {
              parsedDate = new Date(match[0]);
            }
            if (!isNaN(parsedDate.getTime()) && parsedDate.getTime() > latestTime) {
              latestTime = parsedDate.getTime();
            }
          }
        }
      });
    }

    if (lead.retargetingDate) {
      const t = new Date(lead.retargetingDate).getTime();
      if (!isNaN(t) && t > latestTime) latestTime = t;
    }

    if (Array.isArray(lead.activities) && lead.activities.length > 0) {
      lead.activities.forEach((a: any) => {
        if (a.date) {
          const t = new Date(a.date).getTime();
          if (!isNaN(t) && t > latestTime) latestTime = t;
        }
      });
    }

    if (latestTime === 0 && lead.createdAt) {
      const t = new Date(lead.createdAt).getTime();
      if (!isNaN(t)) latestTime = t;
    }

    const lastDate = latestTime > 0 ? new Date(latestTime) : new Date();
    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - lastDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysInactive = getDaysInactive();
  const isInactiveAlert = daysInactive >= 3 && lead.stage !== 'WON' && lead.stage !== 'LOST' && !retargetingStatus;

  const getLatestNoteDisplay = () => {
    return getLatestLeadNote(lead);
  };

  return (
    <div 
      onClick={() => onSelect(lead)}
      className={`group relative bg-slate-900/90 hover:bg-slate-800/90 border rounded-2xl p-3.5 sm:p-4 transition-all duration-200 shadow-md hover:shadow-xl cursor-pointer flex flex-col justify-between ${
        retargetingStatus?.type === 'TODAY'
          ? 'border-amber-500/90 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500/50 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-amber-950/30'
          : retargetingStatus?.type === 'OVERDUE'
          ? 'border-rose-500/80 shadow-md shadow-rose-500/15 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-rose-950/30'
          : lead.isQualified
          ? 'border-amber-500/50 shadow-amber-500/10 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-amber-950/20'
          : isInactiveAlert ? 'border-amber-500/50 shadow-amber-500/5' : 'border-slate-800/90 hover:border-slate-700'
      }`}
    >
      {/* Retargeting Today / Overdue Alert Banner on Top */}
      {retargetingStatus?.type === 'TODAY' && (
        <div className="mb-2.5 bg-gradient-to-r from-rose-600/30 via-amber-600/30 to-orange-600/30 border border-amber-500/80 rounded-xl px-3 py-1.5 text-amber-200 text-[11px] font-black flex items-center justify-between shadow-lg shadow-amber-500/20 animate-pulse">
          <span className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>BUGÜN ARANACAK ({retargetingStatus.formattedDate})</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/40 text-amber-100 font-black border border-amber-400/50">
            🔔 Görüşme
          </span>
        </div>
      )}

      {retargetingStatus?.type === 'OVERDUE' && (
        <div className="mb-2.5 bg-rose-500/20 border border-rose-500/60 rounded-xl px-3 py-1.5 text-rose-300 text-[11px] font-black flex items-center justify-between shadow-md shadow-rose-500/10">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-rose-400" />
            <span>ARAMA GECİKTİ ({Math.abs(retargetingStatus.diffDays)} gün önce)</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-200 font-extrabold">
            ⚠️ Acil
          </span>
        </div>
      )}

      {/* Inactivity Warning Banner on Top (if not retargeting) */}
      {isInactiveAlert && (
        <div className="mb-2.5 bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 rounded-xl px-3 py-1 text-amber-300 text-[11px] font-bold flex items-center justify-between animate-pulse">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Takip Bekliyor ({daysInactive} gündür işlem yok)
          </span>
          <span className="text-amber-400">⚠️</span>
        </div>
      )}

      {/* Header Info */}
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-2 flex-wrap">
          {/* Source & Quality Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {lead.source === 'META_ADS' && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Zap className="w-3 h-3 text-blue-400" />
                Meta Ads
              </span>
            )}
            {lead.source === 'GOOGLE_ADS' && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Target className="w-3 h-3 text-emerald-400" />
                Google Ads
              </span>
            )}
            {lead.source === 'WEBSITE' && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Globe className="w-3 h-3 text-purple-400" />
                Web
              </span>
            )}
            {lead.source === 'AI_AGENT' && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20">
                AI Asistan
              </span>
            )}
            {lead.source === 'MANUAL' && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                Manuel
              </span>
            )}

            {/* Quality Star Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleQualified && onToggleQualified(lead.id);
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                lead.isQualified
                  ? 'bg-amber-500/25 text-amber-300 border-amber-500/60 shadow-sm shadow-amber-500/30 font-black'
                  : 'bg-slate-800/80 hover:bg-amber-500/10 text-slate-400 hover:text-amber-300 border-slate-700/60'
              }`}
              title={lead.isQualified ? "Kaliteli işaretini kaldır" : "Kaliteli Lead (Meta Hedef Kitle) olarak işaretle"}
            >
              <Star className={`w-3 h-3 ${lead.isQualified ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
              <span>{lead.isQualified ? '⭐ Kaliteli' : '+ Kaliteli'}</span>
            </button>

            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border ${getPriorityColor()}`}>
              {lead.priority}
            </span>
          </div>

          {/* Pipeline Switcher & Stage Select */}
          <div className="flex items-center gap-1 shrink-0">
            {onPipelineChange && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const targetPipeline = isProduction ? 'SOCIAL_MEDIA' : 'PRODUCTION';
                  onPipelineChange(lead.id, targetPipeline);
                }}
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border transition-all ${
                  isProduction
                    ? 'bg-purple-500/15 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
                    : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30'
                }`}
                title={isProduction ? "Sosyal Medya Kanalına Taşı" : "Prodüksiyon Kanalına Taşı"}
              >
                {isProduction ? "➔ SM" : "➔ Prod"}
              </button>
            )}

            <select
              value={lead.stage}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                onStageChange(lead.id, e.target.value as StageId);
              }}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-[11px] font-bold rounded-lg px-2 py-0.5 cursor-pointer hover:border-slate-600 focus:outline-none"
            >
              {STAGES.map(st => (
                <option key={st.id} value={st.id}>{st.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Title & Contact */}
        <h3 className="font-extrabold text-sm sm:text-base text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
          {lead.title}
        </h3>
        <p className="text-xs text-slate-400 mb-2.5 flex items-center gap-1.5 mt-0.5 font-medium">
          <span>{lead.contactName}</span>
          {lead.city && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{lead.city}</span>
            </>
          )}
        </p>

        {/* Pipeline Specific Details Box */}
        <div className="bg-slate-950/70 rounded-xl p-2.5 mb-2.5 border border-slate-800/80 text-xs space-y-1">
          {isProduction && (
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 font-medium">{lead.productionDetails?.projectType || 'Prodüksiyon'}</span>
              <span className={`font-extrabold ${isBudgetSet ? 'text-emerald-400 text-sm' : 'text-slate-500 italic font-normal text-[11px]'}`}>
                {getBudgetDisplay()}
              </span>
            </div>
          )}

          {!isProduction && (
            <div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-medium">{lead.socialMediaDetails?.industry || 'Sosyal Medya'}</span>
                <span className={`font-extrabold ${isBudgetSet ? 'text-emerald-400 text-sm' : 'text-slate-500 italic font-normal text-[11px]'}`}>
                  {getBudgetDisplay()}
                </span>
              </div>
              {lead.socialMediaDetails?.platforms && lead.socialMediaDetails.platforms.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {lead.socialMediaDetails.platforms.map(plat => (
                    <span key={plat} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                      {plat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Retargeting Note & Plan Box (Visible on ANY lead with retargeting info) */}
        {retargetingStatus && (
          <div className={`mb-2.5 rounded-xl p-2.5 text-[11px] space-y-1 border ${
            retargetingStatus.type === 'TODAY'
              ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 shadow-md shadow-amber-500/10'
              : retargetingStatus.type === 'OVERDUE'
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-200 shadow-md shadow-rose-500/10'
              : retargetingStatus.type === 'TOMORROW'
              ? 'bg-purple-950/30 border-purple-500/40 text-purple-200'
              : 'bg-pink-500/10 border-pink-500/30 text-pink-300'
          }`}>
            <div className="flex items-center justify-between font-extrabold">
              <span className="flex items-center gap-1.5">
                <Flame className={`w-3.5 h-3.5 ${
                  retargetingStatus.type === 'TODAY' ? 'text-amber-400 fill-amber-400' :
                  retargetingStatus.type === 'OVERDUE' ? 'text-rose-400' : 'text-pink-400'
                }`} />
                <span>Retargeting Planı</span>
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                retargetingStatus.type === 'TODAY' ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50' :
                retargetingStatus.type === 'OVERDUE' ? 'bg-rose-500/30 text-rose-200 border border-rose-400/50' :
                'bg-slate-900 text-slate-300'
              }`}>
                {retargetingStatus.label}
              </span>
            </div>
            {lead.retargetingNote && (
              <p className="text-[11px] text-slate-300 font-medium pl-5 line-clamp-2 italic">
                &ldquo;{lead.retargetingNote}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Latest Note Badge */}
        <div className="mb-2.5 bg-slate-950/90 border border-slate-800/90 rounded-xl px-2.5 py-1.5 text-[11px] text-indigo-300/90 font-medium italic flex items-center gap-1.5">
          <span className="text-indigo-400 font-bold shrink-0">💬</span>
          <span className="line-clamp-1">"{getLatestNoteDisplay()}"</span>
        </div>
      </div>

      {/* Footer & Touch-Friendly Quick Actions */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          <Clock className="w-3 h-3 text-slate-500" />
          {new Date(lead.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
        </span>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Quick WhatsApp Action */}
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all flex items-center gap-1 text-[11px] font-bold active:scale-95"
            title="WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WP</span>
          </a>

          {/* Quick Call Action */}
          <a
            href={`tel:${lead.phone}`}
            className="px-2.5 py-1.5 rounded-xl bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/30 transition-all flex items-center gap-1 text-[11px] font-bold active:scale-95"
            title="Telefon"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ara</span>
          </a>

          <button
            onClick={() => onSelect(lead)}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all border border-slate-700/60 active:scale-95"
            title="Detay"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
