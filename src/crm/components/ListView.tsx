import React, { useState } from 'react';
import { Lead, StageId, PipelineType } from '../types/crm';
import { STAGES } from '../mock/initialData';
import { Zap, Globe, MessageSquare, Phone, ChevronRight, ArrowUpDown, Filter, Layers, DollarSign } from 'lucide-react';

interface ListViewProps {
  leads: Lead[];
  currentPipeline: PipelineType;
  onSelectLead: (lead: Lead) => void;
  onStageChange: (leadId: string, newStage: StageId) => void;
  onPipelineChange?: (leadId: string, newPipeline: 'PRODUCTION' | 'SOCIAL_MEDIA') => void;
}

export const ListView: React.FC<ListViewProps> = ({
  leads,
  currentPipeline,
  onSelectLead,
  onStageChange,
  onPipelineChange
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

  // Sorting logic
  const sortedLeads = [...stageFilteredLeads].sort((a, b) => {
    let valA: any = a[sortField as keyof Lead];
    let valB: any = b[sortField as keyof Lead];

    if (sortField === 'budget') {
      valA = currentPipeline === 'PRODUCTION' 
        ? a.productionDetails?.budget || 0 
        : a.socialMediaDetails?.monthlyBudget || 0;
      valB = currentPipeline === 'PRODUCTION' 
        ? b.productionDetails?.budget || 0 
        : b.socialMediaDetails?.monthlyBudget || 0;
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate sum of filtered budget
  const filteredBudgetSum = sortedLeads.reduce((sum, lead) => {
    const val = currentPipeline === 'PRODUCTION'
      ? lead.productionDetails?.budget || 0
      : lead.socialMediaDetails?.monthlyBudget || 0;
    return sum + val;
  }, 0);

  const toggleSort = (field: 'createdAt' | 'budget' | 'title') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      
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

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
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
                  <td colSpan={8} className="py-12 text-center text-slate-500">
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

                  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      {/* Title */}
                      <td className="py-4 px-4 font-bold text-slate-100 group-hover:text-indigo-400">
                        <div className="line-clamp-1 flex items-center gap-1.5">
                          <span>{lead.title}</span>
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
                              {lead.socialMediaDetails.platforms.join(', ')}
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

                      {/* Stage Select */}
                      <td className="py-4 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.stage}
                          onChange={(e) => onStageChange(lead.id, e.target.value as StageId)}
                          className={`border text-xs rounded-lg px-2.5 py-1 font-semibold cursor-pointer focus:outline-none bg-slate-950 ${stageObj?.badgeBg || 'bg-slate-800 text-slate-300 border-slate-700'}`}
                        >
                          {STAGES.map(s => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </td>

                      {/* Son Not Cell */}
                      <td className="py-4 px-4 max-w-[200px]">
                        {(() => {
                          let noteTxt = 'Form Doldurdu';
                          if (lead.notes && lead.notes.length > 0) {
                            const validNotes = lead.notes.filter(n => {
                              if (!n.text || typeof n.text !== 'string') return false;
                              const txt = n.text.trim();
                              if (txt.length < 2) return false;
                              if (/^\d{4}-\d{2}-\d{2}/.test(txt)) return false;
                              if (!isNaN(Date.parse(txt)) && (txt.length === 10 || txt.includes('T') || txt.includes('Z'))) return false;
                              return true;
                            });
                            if (validNotes.length > 0) {
                              // Önce anlamlı (20+ karakter) en yeni notu göster
                              const meaningful = validNotes.find(n => n.text.trim().length >= 20);
                              noteTxt = meaningful ? meaningful.text : validNotes[0].text;
                            }
                          }
                          return (
                            <div className="text-[11px] text-indigo-300 font-medium italic truncate" title={noteTxt}>
                              "{noteTxt}"
                            </div>
                          );
                        })()}
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-400">
                        <div>{lead.phone}</div>
                        <div className="text-[10px] text-slate-500">{lead.email}</div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                        {new Date(lead.createdAt).toLocaleDateString('tr-TR')}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
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
