export type PipelineType = 'PRODUCTION' | 'SOCIAL_MEDIA';

export type StageId = 
  | 'NEW'             // Geldi / Yeni Lead
  | 'CONTACTED'       // İletişime Geçildi
  | 'PROPOSAL_SENT'   // Teklif Gönderildi
  | 'WAITING'         // Teklif Bekliyor
  | 'RETARGETING'     // Retargeting / İleride Görüşülecek
  | 'WON'             // Kazanıldı (Satış Yapıldı)
  | 'LOST';           // Kaybedildi

export type LeadSource = 'META_ADS' | 'GOOGLE_ADS' | 'WEBSITE' | 'MANUAL' | 'AI_AGENT';

export interface LeadNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  type?: 'note' | 'log';
  actionType?: 'STAGE_CHANGE' | 'QUALIFIED' | 'BUDGET_UPDATE' | 'RETARGETING' | 'NOTE' | 'ASSIGNED' | 'INFO_UPDATE' | 'CALL' | 'WHATSAPP';
  oldValue?: string;
  newValue?: string;
}

export interface LeadActivity {
  id: string;
  title: string;
  date: string;
  type: 'STAGE_CHANGE' | 'NOTE' | 'CALL' | 'EMAIL' | 'PROPOSAL' | 'QUALIFIED' | 'BUDGET_UPDATE' | 'RETARGETING' | 'ASSIGNED' | 'INFO_UPDATE' | 'WHATSAPP';
  author?: string;
  details?: string;
}

export interface ProductionDetails {
  projectType: 'Tanıtım Filmi' | 'Sunuculu Video' | 'Reklam Çekimi' | 'Müzik Klipi' | 'Etkinlik Çekimi' | 'Ürün / Fotoğraf';
  estimatedDurationDays?: number;
  shootingLocation?: string;
  budget?: number | null;
}

export interface SocialMediaDetails {
  monthlyBudget?: number | null;
  platforms: Array<'Instagram' | 'TikTok' | 'LinkedIn' | 'YouTube' | 'Facebook'>;
  monthlyReelsCount: number;
  industry: string;
}

export interface Lead {
  id: string;
  pipeline: PipelineType;
  title: string; // Şirket / Proje veya Müşteri Adı
  contactName: string;
  email: string;
  phone: string;
  city?: string;
  source: LeadSource;
  platform?: string;
  adName?: string;
  adId?: string;
  adsetName?: string;
  adsetId?: string;
  campaignName?: string;
  campaignId?: string;
  isOrganic?: boolean;
  metaCampaignName?: string;
  stage: StageId;
  assignedTo?: string; // Temsilci
  createdAt: string;
  updatedAt: string;
  notes: LeadNote[];
  activities: LeadActivity[];
  
  // Pipeline specific details
  productionDetails?: ProductionDetails;
  socialMediaDetails?: SocialMediaDetails;
  
  // General info
  lossReason?: string;
  retargetingDate?: string;
  retargetingNote?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isQualified?: boolean;
  tags?: string[];
}

export interface StageConfig {
  id: StageId;
  label: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  description: string;
}

export interface RetargetingStatus {
  type: 'TODAY' | 'OVERDUE' | 'TOMORROW' | 'UPCOMING';
  label: string;
  formattedDate: string;
  diffDays: number;
  note?: string;
  badgeClass: string;
  cardBorderClass: string;
}

export function getRetargetingStatus(lead: Partial<Lead>): RetargetingStatus | null {
  if (!lead.retargetingDate && !lead.retargetingNote) return null;
  
  const dateStr = String(lead.retargetingDate || '').trim();
  if (!dateStr) {
    return {
      type: 'UPCOMING',
      label: '📅 Retargeting Planı',
      formattedDate: 'Tarih belirtilmedi',
      diffDays: 999,
      note: lead.retargetingNote,
      badgeClass: 'bg-pink-500/15 text-pink-300 border-pink-500/30 font-semibold',
      cardBorderClass: 'border-pink-500/30'
    };
  }

  let targetDate: Date | null = null;
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [y, m, d] = dateStr.split('T')[0].split('-').map(Number);
    targetDate = new Date(y, m - 1, d);
  } else if (/^\d{2}[./]\d{2}[./]\d{4}/.test(dateStr)) {
    const parts = dateStr.split(/[./]/).map(Number);
    targetDate = new Date(parts[2], parts[1] - 1, parts[0]);
  } else {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) targetDate = parsed;
  }

  if (!targetDate || isNaN(targetDate.getTime())) {
    return {
      type: 'UPCOMING',
      label: '📅 Retargeting Planı',
      formattedDate: dateStr,
      diffDays: 999,
      note: lead.retargetingNote,
      badgeClass: 'bg-pink-500/15 text-pink-300 border-pink-500/30 font-semibold',
      cardBorderClass: 'border-pink-500/30'
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const diffDays = Math.round((targetDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const formattedDate = targetDate.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  if (diffDays === 0) {
    return {
      type: 'TODAY',
      label: '🔔 BUGÜN ARANACAK!',
      formattedDate,
      diffDays,
      note: lead.retargetingNote,
      badgeClass: 'bg-gradient-to-r from-rose-600/30 to-amber-600/30 text-amber-200 border-amber-500/70 shadow-lg shadow-amber-500/20 animate-pulse font-black',
      cardBorderClass: 'border-amber-500/60 shadow-amber-500/10'
    };
  } else if (diffDays < 0) {
    return {
      type: 'OVERDUE',
      label: `⚠️ ARAMA GECİKTİ (${Math.abs(diffDays)} gün önce)`,
      formattedDate,
      diffDays,
      note: lead.retargetingNote,
      badgeClass: 'bg-rose-500/25 text-rose-200 border-rose-500/60 shadow-md shadow-rose-500/15 font-black',
      cardBorderClass: 'border-rose-500/50'
    };
  } else if (diffDays === 1) {
    return {
      type: 'TOMORROW',
      label: '📅 Yarın Aranacak',
      formattedDate,
      diffDays,
      note: lead.retargetingNote,
      badgeClass: 'bg-purple-500/20 text-purple-200 border-purple-500/40 font-bold',
      cardBorderClass: 'border-purple-500/30'
    };
  } else {
    return {
      type: 'UPCOMING',
      label: `📅 ${diffDays} gün sonra (${formattedDate})`,
      formattedDate,
      diffDays,
      note: lead.retargetingNote,
      badgeClass: 'bg-slate-800/90 text-slate-300 border-slate-700/80 font-medium',
      cardBorderClass: 'border-slate-700/40'
    };
  }
}
