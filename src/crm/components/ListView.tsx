import React, { useState } from 'react';
import { Lead, StageId, PipelineType, getRetargetingStatus, getLatestLeadNote } from '../types/crm';
import { STAGES } from '../mock/initialData';
import { Zap, Globe, MessageSquare, Phone, ChevronRight, ArrowUpDown, Filter, Layers, DollarSign, Star, Target, Flame } from 'lucide-react';

interface ListViewProps {
  leads: Lead[];
  currentPipeline: PipelineType;
  onSelectLead: (lead: Lead) => void;
  onStageChange: (leadId: string, newStage: StageId) => void;
  onPipelineChange?: (leadId: string, newPipeline: 'PRODUCTION' | 'SOCIAL_MEDIA') => void;
  onToggleQualified?: (leadId: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  leads,
  currentPipeline,
  onSelectLead,
  onStageChange,
  onPipelineChange,
  onToggleQualified
}) => {
  const [selectedStageFilter, setSelectedStageFilter] = useState<StageId | 'ALL'>('ALL');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'createdAt' | 'budget' | 'title'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const pipelineLeads = leads.filter(l => l.pipeline === currentPipeline);

  // Stage filtering
  const stageFilteredLeads = pipelineLeads.filter(lead => {
    const matchesStage = selectedStageFilter === 'ALL' || lead.stage === selectedStageFilter;
    const matchesPriority = selectedPriorityFilter === 'ALL' || lead.priority === selectedPriorityFilter;
    return matchesStage && matchesPriority;
  });

  const getLeadNumericBudget = (lead: Lead) => {
    const raw = currentPipeline === 'PRODUCTION' 
      ? lead.productionDetails?.budget 
      : lead.socialMediaDetails?.monthlyBudget;
    return (typeof raw === 'number' && !isNaN(raw))
      ? raw
      : (parseFloat(String(raw || '').replace(/[^0-9.-]+/g, '')) || 0);
  };

  // Sorting logic
  const sortedLeads = [...stageFilteredLeads].sort((a, b) => {
    let valA: any = a[sortField as keyof Lead];
    let valB: any = b[sortField as keyof Lead];

    if (sortField === 'budget') {
      valA = getLeadNumericBudget(a);
      valB = getLeadNumericBudget(b);
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate sum of filtered budget
  const filteredBudgetSum = sortedLeads.reduce((sum, lead) => Number(sum) + getLeadNumericBudget(lead), 0);

  const toggleSort = (field: 'createdAt' | 'budget' | 'title') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4 touch-pan-y">
      
      {/* Quick Stage Filter Badges Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3">
        
        {/* Stage Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedStageFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
              selectedStageFilter === 'ALL'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tüm Aşamalar</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-slate-300">
              {pipelineLeads.length}
            </span>
          </button>

          {STAGES.map((st) => {
            const count = pipelineLeads.filter(l => l.stage === st.id).length;
            const isSelected = selectedStageFilter === st.id;

            return (
              <button
                key={st.id}
                onClick={() => setSelectedStageFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                  isSelected
                    ? `${st.badgeBg} border-current shadow-sm`
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${st.color}`} />
                <span>{st.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Priority Filter & Filter Summary */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
          
          {/* Priority Select */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Öncelik:</span>
            <select
              value={selectedPriorityFilter}
              onChange={(e) => setSelectedPriorityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">Tüm Öncelikler</option>
              <option value="URGENT">🔥 Acil</option>
              <option value="HIGH">Yüksek</option>
              <option value="MEDIUM">Orta</option>
              <option value="LOW">Düşük</option>
            </select>
          </div>

          {/* Filter Stats Pill */}
          <div className="bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 text-xs flex items-center gap-2">
            <span className="text-slate-400 font-medium">Listelenen:</span>
            <span className="font-extrabold text-indigo-400">{sortedLeads.length} Lead</span>
            <span className="text-slate-600">•</span>
            <span className="font-extrabold text-emerald-400">
              ₺{filteredBudgetSum.toLocaleString('tr-TR')}
            </span>
          </div>

        </div>

      </div>

      {/* Mobile Lead Card Feed (Visible on screens < md) */}
      <div className="md:hidden space-y-2 px-1 pb-[calc(120px+env(safe-area-inset-bottom))]">
        {sortedLeads.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            Seçilen filtrelere uygun müşteri bulunamadı.
          </div>
        ) : (
          sortedLeads.map((lead) => {
            const stageObj = STAGES.find(s => s.id === lead.stage);
            const isProduction = currentPipeline === 'PRODUCTION';
            const budget = isProduction
              ? lead.productionDetails?.budget
              : lead.socialMediaDetails?.monthlyBudget;
            const cleanPhone = lead.phone ? String(lead.phone).replace(/[^0-9]/g, '') : '';

            return (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3 active:scale-[0.99] transition-all cursor-pointer shadow-md"
              >
                {/* Avatar / Initial */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-900/80 to-slate-900 border border-purple-500/30 flex items-center justify-center font-black text-sm text-purple-300 shrink-0 shadow-inner">
                  {(String(lead.title || 'M')).charAt(0).toUpperCase()}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  {/* Top Row: Title + Stage/Source Pill */}
                  <div className="flex items-center justify-between gap-1.5">
                    <h3 className="font-extrabold text-xs text-white truncate leading-tight">
                      {lead.title}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      {(() => {
                        const rt = getRetargetingStatus(lead);
                        if (!rt) return null;
                        return (
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md border ${
                            rt.type === 'TODAY' ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse' :
                            rt.type === 'OVERDUE' ? 'bg-rose-500 text-white border-rose-400' :
                            'bg-pink-500/20 text-pink-300 border-pink-500/30'
                          }`}>
                            {rt.type === 'TODAY' ? '🔥 Bugün' : rt.type === 'OVERDUE' ? '⚠️ Gecikti' : '📅 Retargeting'}
                          </span>
                        );
                      })()}
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${stageObj?.badgeBg || 'bg-slate-800 text-slate-300'}`}>
                        {stageObj?.label || lead.stage}
                      </span>
                    </div>
                  </div>

                  {/* Subtitle Row: Contact / Category & Budget */}
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                    <span className="truncate">
                      {lead.contactName || lead.company || 'Müşteri'} • {isProduction ? (lead.productionDetails?.projectType || 'Prodüksiyon') : (lead.socialMediaDetails?.industry || 'Sosyal Medya')}
                    </span>
                    {budget && budget > 0 ? (
                      <span className="font-black text-emerald-400 text-xs shrink-0">
                        ₺{budget.toLocaleString('tr-TR')}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic shrink-0">Bütçe yok</span>
                    )}
                  </div>
                </div>

                {/* Right Action Chevron */}
                <div className="text-slate-500 shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Main Table (Visible on Desktop >= md) */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('title')}>
                  <div className="flex items-center gap-1.5">
                    <span>Müşteri / Şirket Adı</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Kaynak</th>
                <th className="py-3.5 px-4">Detay & Hizmet</th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('budget')}>
                  <div className="flex items-center gap-1.5">
                    <span>Bütçe</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Satış Aşaması</th>
                <th className="py-3.5 px-4">Son Görüşme / Not</th>
                <th className="py-3.5 px-4">İletişim Bilgileri</th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('createdAt')}>
                  <div className="flex items-center gap-1.5">
                    <span>Tarih</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {sortedLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Seçilen filtrelere uygun lead bulunamadı.
                  </td>
                </tr>
              ) : (
                sortedLeads.map((lead) => {
                  const stageObj = STAGES.find(s => s.id === lead.stage);
                  const isProduction = currentPipeline === 'PRODUCTION';
                  const budget = isProduction
                    ? lead.productionDetails?.budget
                    : lead.socialMediaDetails?.monthlyBudget;

                  const cleanPhone = lead.phone ? String(lead.phone).replace(/[^0-9]/g, '') : '';

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      {/* Title */}
                      <td className="py-4 px-4 font-bold text-slate-100 group-hover:text-indigo-400">
                        <div className="line-clamp-1 flex items-center gap-1.5 flex-wrap">
                          <span>{lead.title}</span>
                          {lead.isQualified && (
                            <span className="text-[10px] px-2 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              Kaliteli
                            </span>
                          )}
                          {lead.priority === 'URGENT' && <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-extrabold">ACİL 🔥</span>}
                        </div>
                        <div className="text-[11px] font-normal text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>{lead.contactName}</span>
                          {lead.city && <span>• {lead.city}</span>}
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {lead.source === 'META_ADS' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Zap className="w-3 h-3" />
                            Meta Ads
                          </span>
                        )}
                        {lead.source === 'WEBSITE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <Globe className="w-3 h-3" />
                            Web Formu
                          </span>
                        )}
                        {lead.source === 'MANUAL' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            Manuel
                          </span>
                        )}
                      </td>

                      {/* Details */}
                      <td className="py-4 px-4">
                        {isProduction && lead.productionDetails && (
                          <span className="text-slate-300 font-medium">{lead.productionDetails.projectType}</span>
                        )}
                        {!isProduction && lead.socialMediaDetails && (
                          <div>
                            <div className="text-slate-300 font-medium">{lead.socialMediaDetails.industry}</div>
                            <div className="text-[10px] text-slate-500">
                              {Array.isArray(lead.socialMediaDetails.platforms)
                                ? lead.socialMediaDetails.platforms.join(', ')
                                : String(lead.socialMediaDetails.platforms || '')}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Budget */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {budget && budget > 0 ? (
                          <span className="font-extrabold text-emerald-400">
                            ₺{budget.toLocaleString('tr-TR')}
                            {!isProduction && <span className="text-[10px] text-slate-500 font-normal"> /ay</span>}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic font-medium px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                            Bütçe Belirtilmedi
                          </span>
                        )}
                      </td>

                      {/* Stage Select & Retargeting Status */}
                      <td className="py-4 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          <select
                            value={lead.stage}
                            onChange={(e) => onStageChange(lead.id, e.target.value as StageId)}
                            className={`border text-xs rounded-lg px-2.5 py-1 font-semibold cursor-pointer focus:outline-none bg-slate-950 block ${stageObj?.badgeBg || 'bg-slate-800 text-slate-300 border-slate-700'}`}
                          >
                            {STAGES.map(s => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                          </select>
                          {(() => {
                            const rt = getRetargetingStatus(lead);
                            if (!rt) return null;
                            return (
                              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 ${
                                rt.type === 'TODAY' ? 'bg-amber-500 text-slate-950 border-amber-400 font-black animate-pulse' :
                                rt.type === 'OVERDUE' ? 'bg-rose-500/25 text-rose-200 border-rose-500/50 font-black' :
                                'bg-pink-500/15 text-pink-300 border-pink-500/30'
                              }`} title={rt.note || rt.label}>
                                <Flame className="w-3 h-3 shrink-0" />
                                <span className="truncate max-w-[140px]">{rt.label}</span>
                              </div>
                            );
                          })()}
                        </div>
                      </td>

                      {/* Son Not Cell */}
                      <td className="py-4 px-4 max-w-[220px]">
                        {(() => {
                          const noteTxt = getLatestLeadNote(lead);
                          return (
                            <div className="text-[11px] text-slate-300 line-clamp-2 italic font-sans" title={noteTxt}>
                              &ldquo;{noteTxt}&rdquo;
                            </div>
                          );
                        })()}
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          {cleanPhone && (
                            <a
                              href={`tel:${cleanPhone}`}
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                              title="Müşteriyi Ara"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-colors"
                              title="WhatsApp Mesaj Gönder"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <span className="text-[11px] text-slate-400 ml-1">{lead.phone || '-'}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('tr-TR') : '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {onToggleQualified && (
                            <button
                              onClick={() => onToggleQualified(lead.id)}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                lead.isQualified
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                                  : 'bg-slate-800 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border-slate-700'
                              }`}
                              title={lead.isQualified ? "Kaliteli işaretini kaldır" : "Kaliteli Lead (Meta Hedef Kitle için) olarak işaretle"}
                            >
                              <Star className={`w-3.5 h-3.5 ${lead.isQualified ? 'fill-amber-400 text-amber-400' : ''}`} />
                            </button>
                          )}
                          {onPipelineChange && (
                            <button
                              onClick={() => {
                                const targetPipeline = isProduction ? 'SOCIAL_MEDIA' : 'PRODUCTION';
                                onPipelineChange(lead.id, targetPipeline);
                              }}
                              className={`text-[10px] font-extrabold px-2 py-1 rounded border transition-all ${
                                isProduction
                                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20'
                                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20'
                              }`}
                              title={isProduction ? "Sosyal Medya Kanalına Taşı" : "Prodüksiyon Kanalına Taşı"}
                            >
                              {isProduction ? "➔ Sosyal Medya" : "➔ Prodüksiyon"}
                            </button>
                          )}
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 transition-colors"
                            title="Arayın"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => onSelectLead(lead)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                            title="İncele"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
