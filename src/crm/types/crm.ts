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
}

export interface LeadActivity {
  id: string;
  title: string;
  date: string;
  type: 'STAGE_CHANGE' | 'NOTE' | 'CALL' | 'EMAIL' | 'PROPOSAL';
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
