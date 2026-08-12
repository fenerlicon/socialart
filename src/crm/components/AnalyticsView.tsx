import React from 'react';
import { Lead, PipelineType } from '../types/crm';
import { STAGES } from '../mock/initialData';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Flame, 
  Zap, 
  Globe, 
  Trophy, 
  Target,
  ArrowUpRight
} from 'lucide-react';

interface AnalyticsViewProps {
  leads: Lead[];
  currentPipeline: PipelineType;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  leads,
  currentPipeline
}) => {
  const pipelineLeads = leads.filter(l => l.pipeline === currentPipeline);

  // Financial calculations
  const getLeadNumericBudget = (l: Lead) => {
    const rawVal = currentPipeline === 'PRODUCTION' 
      ? l.productionDetails?.budget 
      : l.socialMediaDetails?.monthlyBudget;
    return (typeof rawVal === 'number' && !isNaN(rawVal))
      ? rawVal
      : (parseFloat(String(rawVal || '').replace(/[^0-9.-]+/g, '')) || 0);
  };

  const totalValue = pipelineLeads.reduce((acc, l) => Number(acc) + getLeadNumericBudget(l), 0);

  const wonLeads = pipelineLeads.filter(l => l.stage === 'WON');
  const wonValue = wonLeads.reduce((acc, l) => Number(acc) + getLeadNumericBudget(l), 0);

  const retargetingLeads = pipelineLeads.filter(l => l.stage === 'RETARGETING');
  const retargetingValue = retargetingLeads.reduce((acc, l) => Number(acc) + getLeadNumericBudget(l), 0);

  const conversionRate = pipelineLeads.length > 0
    ? Math.round((wonLeads.length / pipelineLeads.length) * 100)
    : 0;

  const avgDealSize = pipelineLeads.length > 0
    ? Math.round(totalValue / pipelineLeads.length)
    : 0;

  // Source breakdown
  const metaCount = pipelineLeads.filter(l => l.source === 'META_ADS').length;
  const webCount = pipelineLeads.filter(l => l.source === 'WEBSITE').length;
  const manualCount = pipelineLeads.filter(l => l.source === 'MANUAL').length;

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue Potential */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Toplam Pipeline Hacmi</span>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
              ₺{totalValue.toLocaleString('tr-TR')}
              {currentPipeline === 'SOCIAL_MEDIA' && <span className="text-xs font-normal text-slate-400"> /ay</span>}
            </h3>
            <span className="text-[11px] text-slate-500 mt-1 block">Aktif {pipelineLeads.length} potansiyel müşteri</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Won Sales Revenue */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Kazanılan Satış Ciro</span>
            <h3 className="text-2xl font-extrabold text-indigo-400 mt-1">
              ₺{wonValue.toLocaleString('tr-TR')}
            </h3>
            <span className="text-[11px] text-emerald-400 mt-1 font-bold flex items-center gap-1">
              <Trophy className="w-3 h-3" /> {wonLeads.length} Anlaşma İmzalandı
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Retargeting Pool */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Retargeting Havuzu</span>
            <h3 className="text-2xl font-extrabold text-pink-400 mt-1">
              ₺{retargetingValue.toLocaleString('tr-TR')}
            </h3>
            <span className="text-[11px] text-pink-300 mt-1 block">{retargetingLeads.length} İleride Görüşülecek Lead</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Kazanma Dönüşüm Oranı</span>
            <h3 className="text-2xl font-extrabold text-blue-400 mt-1">
              %{conversionRate}
            </h3>
            <span className="text-[11px] text-slate-500 mt-1 block">Ort. İş Büyüklüğü: ₺{avgDealSize.toLocaleString('tr-TR')}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Grid: Funnel + Lead Source Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Stage Conversion Funnel (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-100">Satış Aşaması Huni (Funnel) Dağılımı</h3>
              <p className="text-xs text-slate-400">Her bir aşamada bekleyen bütçe ve lead adetleri</p>
            </div>
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="space-y-3 pt-2">
            {STAGES.map((st) => {
              const stageLeads = pipelineLeads.filter(l => l.stage === st.id);
              const stageVal = stageLeads.reduce((acc, l) => {
                const v = currentPipeline === 'PRODUCTION' 
                  ? l.productionDetails?.budget || 0
                  : l.socialMediaDetails?.monthlyBudget || 0;
                return acc + v;
              }, 0);

              const percent = totalValue > 0 ? Math.round((stageVal / totalValue) * 100) : 0;

              return (
                <div key={st.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-200">
                      <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${st.color}`} />
                      <span>{st.label}</span>
                      <span className="text-slate-500 font-normal">({stageLeads.length} Lead)</span>
                    </div>
                    <span className="font-extrabold text-slate-300">
                      ₺{stageVal.toLocaleString('tr-TR')} ({percent}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${st.color} transition-all duration-500`}
                      style={{ width: `${Math.max(percent, stageLeads.length > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead Source Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-100">Lead Kaynakları Analizi</h3>
            <p className="text-xs text-slate-400">Müşteriler nereden geliyor?</p>
          </div>

          <div className="space-y-3 pt-2">
            
            {/* Meta Ads Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-200">Meta Ads (FB/IG)</h4>
                  <span className="text-xs text-slate-400">Sosyal Medya Reklamları</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-base text-blue-400">{metaCount}</span>
                <span className="text-xs text-slate-500 block">Lead</span>
              </div>
            </div>

            {/* Website Form Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-200">Web Sitesi Formu</h4>
                  <span className="text-xs text-slate-400">Organik / Site Trafiği</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-base text-purple-400">{webCount}</span>
                <span className="text-xs text-slate-500 block">Lead</span>
              </div>
            </div>

            {/* Manual / Referans Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-200">Manuel / Referans</h4>
                  <span className="text-xs text-slate-400">Tavsiye & Doğrudan İletişim</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-base text-slate-300">{manualCount}</span>
                <span className="text-xs text-slate-500 block">Lead</span>
              </div>
            </div>

          </div>

          {/* Tips Box */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-300">
            💡 <strong>İpucu:</strong> Meta Ads'ten gelen lead'lerin dönüşüm hızını artırmak için ilk 15 dakika içerisinde WhatsApp veya Telefon ile dönüş yapın.
          </div>
        </div>

      </div>

    </div>
  );
};
