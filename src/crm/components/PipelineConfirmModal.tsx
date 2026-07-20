import React from 'react';
import { RefreshCw, AlertCircle, X, Check } from 'lucide-react';
import { Lead } from '../types/crm';

interface PipelineConfirmModalProps {
  lead: Lead | null;
  targetPipeline: 'PRODUCTION' | 'SOCIAL_MEDIA' | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PipelineConfirmModal: React.FC<PipelineConfirmModalProps> = ({
  lead,
  targetPipeline,
  onConfirm,
  onCancel
}) => {
  if (!lead || !targetPipeline) return null;

  const targetName = targetPipeline === 'PRODUCTION' ? 'Prodüksiyon' : 'Sosyal Medya';
  const currentName = lead.pipeline === 'PRODUCTION' ? 'Prodüksiyon' : 'Sosyal Medya';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-100">Kanal Değişikliği Onayı</h3>
            <p className="text-xs text-slate-400">Müşterinin CRM boru hattını güncelliyorsunuz</p>
          </div>
          <button
            onClick={onCancel}
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lead Summary Card */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Müşteri / Firma:</span>
            <span className="font-bold text-slate-100 text-sm">{lead.title}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Yetkili:</span>
            <span className="text-slate-300">{lead.contactName || 'Belirtilmedi'}</span>
          </div>
          
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between font-bold">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">{currentName}</span>
            <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">{targetName}</span>
          </div>
        </div>

        {/* Info Text */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Bu işlem müşteriyi <strong>{targetName}</strong> kanalına taşıyacak ve Kanban görünümünü güncelleyecektir.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-slate-800 transition-all"
          >
            İptal Et
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Check className="w-4 h-4" />
            <span>Kanalı Değiştir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
