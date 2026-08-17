import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Lock, ShieldAlert, Search } from 'lucide-react';
import { supabase, supabaseLeads } from '../lib/supabase';
import { Header } from '../crm/components/Header';
import { KanbanBoard } from '../crm/components/KanbanBoard';
import { ListView } from '../crm/components/ListView';
import { AnalyticsView } from '../crm/components/AnalyticsView';
import { LeadDetailModal } from '../crm/components/LeadDetailModal';
import { NewLeadModal } from '../crm/components/NewLeadModal';
import { PipelineConfirmModal } from '../crm/components/PipelineConfirmModal';
import { STAGES, INITIAL_LEADS } from '../crm/mock/initialData';

// ----------------------------------------------------------------
// DB → Lead type mapping
// ----------------------------------------------------------------
function mapDbRowToLead(row) {
  const statusMap = {
    'Sıcak': 'NEW',
    'Yeni': 'NEW',
    'new': 'NEW',
    'NEW': 'NEW',
    'Geldi (Yeni Lead)': 'NEW',
    'İlk İletişim': 'CONTACTED',
    'contacted': 'CONTACTED',
    'CONTACTED': 'CONTACTED',
    'Görüşülüyor': 'CONTACTED',
    'Görüşme Yapıldı': 'CONTACTED',
    'Görüşüldü': 'CONTACTED',
    'Teklif Bekliyor': 'WAITING',
    'Beklemede': 'WAITING',
    'waiting': 'WAITING',
    'WAITING': 'WAITING',
    'Teklif İletildi': 'PROPOSAL_SENT',
    'Teklif Gönderildi': 'PROPOSAL_SENT',
    'Teklif Verildi': 'PROPOSAL_SENT',
    'Katalog İletildi': 'PROPOSAL_SENT',
    'proposal_sent': 'PROPOSAL_SENT',
    'PROPOSAL_SENT': 'PROPOSAL_SENT',
    'negotiating': 'PROPOSAL_SENT',
    'Teklif': 'PROPOSAL_SENT',
    'Ertelendi': 'RETARGETING',
    'retargeting': 'RETARGETING',
    'RETARGETING': 'RETARGETING',
    'Takipte': 'RETARGETING',
    'Yeniden Ulaşılacak': 'RETARGETING',
    'Anlaşıldı': 'WON',
    'Kazanıldı': 'WON',
    'won': 'WON',
    'WON': 'WON',
    'Satış Yapıldı': 'WON',
    'Reddedildi': 'LOST',
    'Kaybedildi': 'LOST',
    'Olumsuz': 'LOST',
    'İptal': 'LOST',
    'lost': 'LOST',
    'LOST': 'LOST'
  };

  const pipelineMap = {
    'Meta Reklam': 'SOCIAL_MEDIA',
    'Sosyal Medya': 'SOCIAL_MEDIA',
    'Prodüksiyon': 'PRODUCTION',
    'Video Prodüksiyon': 'PRODUCTION',
    'UGC': 'SOCIAL_MEDIA',
    'SEO': 'SOCIAL_MEDIA',
    'Dijital Pazarlama': 'SOCIAL_MEDIA',
  };

  const service = row.service || row.hizmet || '';

  // 1. Pipeline Determination (Prioritize explicit row.pipeline if present)
  let pipeline = row.pipeline;
  if (!pipeline || (pipeline !== 'PRODUCTION' && pipeline !== 'SOCIAL_MEDIA')) {
    pipeline = pipelineMap[service] ||
      (service.toLowerCase().includes('prodük') || service.toLowerCase().includes('video') || service.toLowerCase().includes('çekim')
        ? 'PRODUCTION' : 'SOCIAL_MEDIA');
  }

  // 2. Stage / Status Determination (Prioritize explicit row.status over legacy row.stage)
  const rawStatus = String(row.status || row.durum || row.stage || '').trim();
  const stage = statusMap[rawStatus] || statusMap[rawStatus.toLowerCase()] || (['NEW', 'CONTACTED', 'WAITING', 'PROPOSAL_SENT', 'RETARGETING', 'WON', 'LOST'].includes(rawStatus) ? rawStatus : 'NEW');

  const parsedNotes = (() => {
    // Fast path: if Supabase already stored proper note objects, use them directly
    if (Array.isArray(row.notes) && row.notes.length > 0 && typeof row.notes[0] === 'object' && row.notes[0].text) {
      return row.notes.map(n => {
        let cleanAuthor = n.author || row.rep || row.assigned_to || 'Celal';
        if (cleanAuthor.startsWith('-')) cleanAuthor = (row.rep || row.assigned_to || 'Celal') + ' (Temsilci Notu)';
        const textLower = String(n.text || '').toLowerCase();
        const isLog = n.type === 'log' || 
          textLower.includes('aşama') || 
          textLower.includes('kaliteli lead') || 
          textLower.includes('bütçe') || 
          textLower.includes('retargeting') ||
          textLower.includes('temsilci');
        return {
          id: n.id || `note-${Math.random()}`,
          author: cleanAuthor,
          text: n.text,
          createdAt: n.createdAt || n.created_at || new Date().toISOString(),
          type: n.type || (isLog ? 'log' : 'note'),
          actionType: n.actionType || (
            textLower.includes('aşama') ? 'STAGE_CHANGE' :
            textLower.includes('kaliteli') ? 'QUALIFIED' :
            textLower.includes('bütçe') ? 'BUDGET_UPDATE' :
            textLower.includes('retargeting') ? 'RETARGETING' :
            textLower.includes('temsilci') ? 'ASSIGNED' : undefined
          ),
          oldValue: n.oldValue,
          newValue: n.newValue
        };
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    let notesArr = [];
    const seenNoteTexts = new Set();
    const seenNoteIds = new Set();
    
    const isInvalidNote = (txt) => {
      if (!txt || typeof txt !== 'string') return true;
      const clean = txt.trim();
      if (clean.length < 2) return true;
      // Check if string is ISO Date or Date-Time string like 2026-07-05T04:59:17
      if (/^\d{4}-\d{2}-\d{2}/.test(clean)) return true;
      if (!isNaN(Date.parse(clean)) && (clean.length === 10 || clean.includes('T') || clean.includes('Z'))) return true;
      // Filter boolean/number strings
      if (clean === 'true' || clean === 'false' || clean === 'null' || clean === 'undefined') return true;
      return false;
    };

    const defaultRepName = row.rep || row.assigned_to || 'Celal';
    const defaultAuthorLabel = `${defaultRepName} (Temsilci Notu)`;
    const fallbackNoteIso = row.updated_at || row.created_at || new Date().toISOString();

    const extractDateFromText = (text, defaultIso) => {
      if (text && typeof text === 'string') {
        const match = text.match(/(\d{2})[./](\d{2})[./](\d{4})/) || text.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
          let parsedDate;
          if (match[3] && match[3].length === 4) {
            parsedDate = new Date(`${match[3]}-${match[2]}-${match[1]}`);
          } else {
            parsedDate = new Date(match[0]);
          }
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString();
          }
        }
      }
      return defaultIso;
    };

    const addNote = (text, authorLabel = defaultAuthorLabel) => {
      if (!text || typeof text !== 'string' || isInvalidNote(text)) return;
      const cleanText = text.trim();
      if (seenNoteTexts.has(cleanText)) return; // prevent exact duplicate notes

      if (cleanText.startsWith('[') || cleanText.startsWith('{')) {
        try {
          const parsed = JSON.parse(cleanText);
          if (Array.isArray(parsed)) {
            parsed.forEach(item => {
              if (typeof item === 'object' && item !== null) {
                const t = item.text || item.content || item.note || item.message || '';
                if (t && !isInvalidNote(t) && !seenNoteTexts.has(t)) {
                  seenNoteTexts.add(t);
                  const noteDate = item.createdAt || item.created_at || item.date || extractDateFromText(t, fallbackNoteIso);
                  notesArr.push({
                    id: item.id || `note-${Math.random()}`,
                    author: item.author || authorLabel,
                    text: t,
                    createdAt: noteDate
                  });
                }
              } else if (typeof item === 'string' && item.trim() && !isInvalidNote(item)) {
                if (!seenNoteTexts.has(item.trim())) {
                  seenNoteTexts.add(item.trim());
                  const noteDate = extractDateFromText(item.trim(), fallbackNoteIso);
                  notesArr.push({
                    id: `note-${Math.random()}`,
                    author: authorLabel,
                    text: item.trim(),
                    createdAt: noteDate
                  });
                }
              }
            });
            return;
          }
        } catch (e) {
          // Not valid JSON, process as plain string
        }
      }

      seenNoteTexts.add(cleanText);
      const noteDate = extractDateFromText(cleanText, fallbackNoteIso);
      notesArr.push({
        id: `note-${Math.random()}`,
        author: authorLabel,
        text: cleanText,
        createdAt: noteDate
      });
    };

    // Tüm olası not sütunları (detaylar, mesajlar, notlar)
    const allPossibleNoteKeys = [
      'notes', 'note', 'internal_notes', 'details', 'message', 'description', 
      'comments', 'temsilci_notu', 'aciklama', 'gorusme_notlari', 'notlar', 
      'gorusme_gecmisi', 'history', 'remark', 'remarks', 'content', 'user_notes',
      'staff_notes', 'agent_notes', 'lead_notes', 'lead_note', 'notes_text',
      'custom_fields', 'not_gecmisi', 'latest_note', 'last_note'
    ];

    allPossibleNoteKeys.forEach(key => {
      const val = row[key];
      if (!val) return;

      if (Array.isArray(val)) {
        val.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            const t = item.text || item.note || item.content || item.message || '';
            const noteId = item.id || `note-${Math.random()}`;
            if (t && !isInvalidNote(t) && !seenNoteIds.has(noteId)) {
              seenNoteIds.add(noteId);
              notesArr.push({
                id: noteId,
                author: item.author || item.user || item.rep || defaultAuthorLabel,
                text: t,
                createdAt: item.createdAt || item.created_at || item.date || row.created_at || new Date().toISOString()
              });
            }
          } else if (typeof item === 'string') {
            addNote(item, defaultAuthorLabel);
          }
        });
      } else if (typeof val === 'object' && val !== null) {
        const t = val.text || val.note || val.content || val.message || '';
        const noteId = val.id || `note-${Math.random()}`;
        if (t && !isInvalidNote(t) && !seenNoteIds.has(noteId)) {
          seenNoteIds.add(noteId);
          notesArr.push({
            id: noteId,
            author: val.author || val.user || defaultAuthorLabel,
            text: t,
            createdAt: val.createdAt || val.created_at || row.created_at || new Date().toISOString()
          });
        }
      } else {
        addNote(String(val), defaultAuthorLabel);
      }
    });

    // EVRENSEL AKILLI TARAMA
    const standardNonNoteKeys = new Set([
      'id', 'name', 'full_name', 'company', 'title', 'email', 'phone', 'city', 
      'budget', 'status', 'stage', 'source', 'pipeline', 'created_at', 'updated_at', 
      'assigned_to', 'priority', 'retargeting_date', 'retargeting_note',
      'meta_campaign_name', 'ads_active', 'monthly_fee', 'payment_day',
      'service', 'hizmet', 'service_type', 'form_type', 'form_date',
      'submitted_at', 'date', 'timestamp', 'time', 'ip', 'ip_address',
      'url', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
      'ad_id', 'adset_id', 'campaign_id', 'form_id', 'lead_id',
      'field_data', 'retailer_item_id', 'partner_name'
    ]);

    for (const [key, value] of Object.entries(row)) {
      if (!standardNonNoteKeys.has(key) && value) {
        if (typeof value === 'string') {
          addNote(value, defaultAuthorLabel);
        } else if (Array.isArray(value)) {
          value.forEach(item => {
            if (typeof item === 'string') addNote(item, defaultAuthorLabel);
            else if (typeof item === 'object' && item !== null) {
              const t = item.text || item.note || item.content || item.message || '';
              if (t) addNote(t, item.author || defaultAuthorLabel);
            }
          });
        } else if (typeof value === 'object' && value !== null) {
          const t = value.text || value.note || value.content || value.message || '';
          if (t) addNote(t, value.author || defaultAuthorLabel);
        }
      }
    }

    // En yeni nota göre sırala
    notesArr.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return notesArr;
  })();

  // Akıllı En Son İşlem Tarihi Belirleme (Notlar, Güncelleme veya Oluşturulma)
  let latestActivityIso = row.updated_at || row.created_at || new Date().toISOString();
  let maxTime = new Date(latestActivityIso).getTime();

  if (parsedNotes.length > 0 && parsedNotes[0].createdAt) {
    const noteTime = new Date(parsedNotes[0].createdAt).getTime();
    if (!isNaN(noteTime) && noteTime > maxTime) {
      maxTime = noteTime;
      latestActivityIso = parsedNotes[0].createdAt;
    }
  }

  if (row.retargeting_date) {
    const rtTime = new Date(row.retargeting_date).getTime();
    if (!isNaN(rtTime) && rtTime > maxTime) {
      maxTime = rtTime;
      latestActivityIso = row.retargeting_date;
    }
  }

  // Accurate source detection (Meta Ads, Google Ads, Web, AI Agent, Manual)
  let resolvedSource = 'MANUAL';
  const rawPlatform = String(row.platform || '').trim();
  const rawPlatformLower = rawPlatform.toLowerCase();
  const rawReaction = String(row.reaction || '').toLowerCase();
  const rawService = String(row.service || '').toLowerCase();

  if (
    rawPlatformLower.includes('meta') || 
    rawPlatformLower.includes('instagram') || 
    rawPlatformLower.includes('facebook') ||
    rawReaction.includes('meta form') ||
    rawReaction.includes('instagram')
  ) {
    resolvedSource = 'META_ADS';
  } else if (
    rawPlatformLower.includes('google') || 
    rawPlatformLower.includes('ads') || 
    rawService.includes('google_ads') ||
    rawReaction.includes('google')
  ) {
    resolvedSource = 'GOOGLE_ADS';
  } else if (
    rawPlatformLower.includes('web') || 
    rawPlatformLower.includes('site') || 
    rawPlatformLower.includes('bireysel') ||
    rawReaction.includes('form dolduruldu') ||
    rawReaction.includes('web form') ||
    rawReaction.includes('online')
  ) {
    resolvedSource = 'WEBSITE';
  } else if (
    rawPlatformLower.includes('chatgpt') || 
    rawPlatformLower.includes('ai')
  ) {
    resolvedSource = 'AI_AGENT';
  } else if (
    rawPlatform.toUpperCase() === 'MANUAL' || 
    rawPlatformLower.includes('manuel') || 
    rawReaction.includes('manuel lead')
  ) {
    resolvedSource = 'MANUAL';
  } else if (row.source) {
    resolvedSource = row.source;
  }

  // Extract ad & campaign display names
  // Campaign & Ad names: strictly use actual marketing campaign / ad data without pretending form answers are campaigns
  const actualCampaignName = row.campaign_name || (row.campaign_id ? `Kampanya #${row.campaign_id}` : undefined);
  const actualAdsetName = row.adset_name || (row.adset_id ? `Set #${row.adset_id}` : undefined);
  const actualAdName = row.ad_name || (row.ad_id ? `Reklam #${row.ad_id}` : undefined);

  return {
    id: String(row.id),
    pipeline,
    title: row.name || row.company || 'İsimsiz Lead',
    contactName: row.rep || row.contact_name || '',
    email: row.email || '',
    phone: row.phone || '',
    city: row.city || '',
    service: row.service || '',
    source: resolvedSource,
    platform: rawPlatform || (resolvedSource === 'META_ADS' ? 'Meta Ads (Instagram)' : resolvedSource),
    adName: actualAdName,
    adId: row.ad_id || undefined,
    adsetName: actualAdsetName,
    adsetId: row.adset_id || undefined,
    campaignName: actualCampaignName,
    campaignId: row.campaign_id || undefined,
    isOrganic: Boolean(row.is_organic),
    stage,
    assignedTo: row.rep || row.assigned_to || '',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: latestActivityIso,
    notes: parsedNotes,
    activities: [],
    priority: 'MEDIUM',
    productionDetails: pipeline === 'PRODUCTION' ? {
      projectType: (row.service && (row.service.includes('Sunuculu') || row.service.includes('Sunucu'))) 
        ? 'Sunuculu Video' 
        : (row.service || 'Tanıtım Filmi'),
      budget: (row.budget !== null && row.budget !== undefined && row.budget !== '')
        ? (typeof row.budget === 'number' && !isNaN(row.budget) ? row.budget : (parseFloat(String(row.budget).replace(/[^0-9.-]+/g, '')) || null))
        : null,
    } : undefined,
    socialMediaDetails: pipeline === 'SOCIAL_MEDIA' ? {
      monthlyBudget: (row.budget !== null && row.budget !== undefined && row.budget !== '')
        ? (typeof row.budget === 'number' && !isNaN(row.budget) ? row.budget : (parseFloat(String(row.budget).replace(/[^0-9.-]+/g, '')) || null))
        : null,
      platforms: ['Instagram'],
      monthlyReelsCount: 0,
      industry: service,
    } : undefined,
    retargetingDate: row.retargeting_date || undefined,
    retargetingNote: row.retargeting_note || undefined,
    isQualified: Boolean(row.is_qualified || (Array.isArray(row.tags) && row.tags.includes('kaliteli'))),
    tags: Array.isArray(row.tags) ? row.tags : [],
  };
}

const stageToStatus = {
  'NEW': 'Sıcak',
  'CONTACTED': 'İlk İletişim',
  'WAITING': 'Teklif Bekliyor',
  'PROPOSAL_SENT': 'Teklif İletildi',
  'RETARGETING': 'Ertelendi',
  'WON': 'Anlaşıldı',
  'LOST': 'Reddedildi',
};

// Helper to determine currently active logged-in employee name
export function getActiveStaffName() {
  try {
    const userStr = localStorage.getItem('ajans_user') || localStorage.getItem('socialart_user') || localStorage.getItem('social-art-base:credentials');
    if (userStr) {
      const parsed = JSON.parse(userStr);
      if (parsed.name) return parsed.name;
      if (parsed.full_name) return parsed.full_name;
      if (parsed.username) return parsed.username;
    }
    const empId = localStorage.getItem('social-art-base:active-employee-id');
    if (empId) {
      const employees = JSON.parse(localStorage.getItem('social-art-base:employees') || '[]');
      const found = employees.find(e => e.id === empId);
      if (found?.name) return found.name;
    }
  } catch (e) {}
  return 'Furkan';
}

// ----------------------------------------------------------------
// CRMPage Component
// ----------------------------------------------------------------
export default function CRMPage({ embedded = false }) {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔒 Security & Auth Guard: Verify active employee session
  const [hasValidSession, setHasValidSession] = useState(() => {
    try {
      if (typeof window === 'undefined') return true;
      const activeId = localStorage.getItem('social-art-base:active-employee-id') ||
                       localStorage.getItem('ajans_user') ||
                       localStorage.getItem('socialart_user') ||
                       localStorage.getItem('social-art-base:credentials');
      return Boolean(activeId);
    } catch {
      return false;
    }
  });

  const [currentPipeline, setCurrentPipeline] = useState(() => {
    try {
      return localStorage.getItem('socialart_crm_active_pipeline') || 'PRODUCTION';
    } catch {
      return 'PRODUCTION';
    }
  });

  const [currentView, setCurrentView] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        return 'LIST';
      }
      return localStorage.getItem('socialart_crm_active_view') || 'KANBAN';
    } catch {
      return 'LIST';
    }
  });

  const handlePipelineTabChange = (p) => {
    setCurrentPipeline(p);
    try { localStorage.setItem('socialart_crm_active_pipeline', p); } catch {}
  };

  const handleViewTabChange = (v) => {
    setCurrentView(v);
    try { localStorage.setItem('socialart_crm_active_view', v); } catch {}
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState('ALL');
  const [isQualityOnlyFilter, setIsQualityOnlyFilter] = useState(false);

  const [selectedLead, setSelectedLead] = useState(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Helper to sync local manual leads & overrides to Supabase DB automatically
  const syncLocalChangesToSupabase = async (manualLeads, overrides) => {
    try {
      // 1. Sync manual leads (like Diffea) to Supabase DB
      if (Array.isArray(manualLeads) && manualLeads.length > 0) {
        const rowsToInsert = manualLeads.map(m => ({
          title: m.title || m.contactName,
          name: m.title || m.contactName,
          rep: m.contactName || '',
          phone: m.phone || '',
          email: m.email || '',
          city: m.city || 'İstanbul',
          service: m.pipeline === 'PRODUCTION' ? 'Prodüksiyon' : 'Sosyal Medya',
          pipeline: m.pipeline || 'PRODUCTION',
          stage: m.stage || 'NEW',
          platform: m.source || 'MANUAL',
          status: stageToStatus[m.stage] || 'Sıcak',
          notes: m.notes || [],
          created_at: m.createdAt || new Date().toISOString()
        }));
        await supabaseLeads.from('leads').upsert(rowsToInsert, { ignoreDuplicates: true }).catch(() => {});
      }

      // 2. Sync stage overrides to Supabase DB
      if (overrides && Object.keys(overrides).length > 0) {
        for (const [targetQueryId, ov] of Object.entries(overrides)) {
          const updateObj = {};
          // Convert string ID to numeric ID if possible for Postgres compatibility
          const numericId = Number(targetQueryId);
          const cleanQueryId = !isNaN(numericId) && numericId > 0 ? numericId : targetQueryId;

          await supabaseLeads.from('leads').update(updateObj).eq('id', cleanQueryId).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Auto sync to Supabase error:', err);
    }
  };

  // Fetch leads from Supabase with Local Overrides Merge & Automatic DB Sync
  const fetchLeads = useCallback(async () => {
    if (!hasValidSession && !embedded) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabaseLeads
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        showToast('Müşteri listesi çekilirken hata oluştu: ' + error.message, 'error');
        return;
      }

      let loadedLeads = [];
      if (data && data.length > 0) {
        const deletedIds = new Set(JSON.parse(localStorage.getItem('socialart_crm_deleted_lead_ids') || '[]').map(String));

        loadedLeads = data
          .filter(row => {
            if (deletedIds.has(String(row.id))) return false;
            if (row.status === 'ARŞİV' || row.status === 'SİLİNDİ') return false;
            return true;
          })
          .map(mapDbRowToLead);
      }

      setLeads(loadedLeads);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // İlk yükleme
    fetchLeads();

    // ── Supabase Realtime: Yeni lead veya güncelleme anında gelsin ──
    const channel = supabaseLeads
      .channel('crm-leads-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leads' },
        (payload) => {
          if (!payload.new) return;
          const newLead = mapDbRowToLead(payload.new);
          // LocalStorage override varsa uygula
          try {
            const stored = localStorage.getItem('crm_lead_overrides_v1');
            const overrides = stored ? JSON.parse(stored) : {};
            const merged = overrides[newLead.id] ? { ...newLead, ...overrides[newLead.id] } : newLead;
            setLeads(prev => {
              // Zaten listede varsa ekleme
              if (prev.some(l => l.id === merged.id)) return prev;
              return [merged, ...prev];
            });
            setNotification(`🔔 Yeni Lead: ${newLead.title || newLead.contactName || 'Yeni Müşteri'}`);
            setTimeout(() => setNotification(null), 5000);
          } catch {
            setLeads(prev => {
              if (prev.some(l => l.id === newLead.id)) return prev;
              return [newLead, ...prev];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'leads' },
        (payload) => {
          if (!payload.new) return;
          let updatedLead = mapDbRowToLead(payload.new);
          try {
            const storedOverrides = localStorage.getItem('crm_lead_overrides_v1');
            if (storedOverrides) {
              const overrides = JSON.parse(storedOverrides);
              if (overrides[updatedLead.id]) {
                updatedLead = { ...updatedLead, ...overrides[updatedLead.id] };
              }
            }
          } catch (e) {}
          setLeads(prev => prev.map(l => l.id === updatedLead.id ? { ...updatedLead } : l));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'leads' },
        (payload) => {
          if (!payload.old || !payload.old.id) return;
          const delId = String(payload.old.id);
          setLeads(prev => prev.filter(l => String(l.id) !== delId));
          if (selectedLead?.id === delId) setSelectedLead(null);
        }
      )
      .subscribe();

    // ── Sayfa arka plandan geri gelince otomatik yenile ──
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchLeads();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // URL Param Handler (pipeline, filter, leadId)
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const pipelineParam = urlParams.get('pipeline');
        const viewParam = urlParams.get('view');
        const filterParam = urlParams.get('filter');
        const stageParam = urlParams.get('stage');

        if (pipelineParam && (pipelineParam === 'PRODUCTION' || pipelineParam === 'SOCIAL_MEDIA')) {
          setCurrentPipeline(pipelineParam);
        }
        if (viewParam && ['KANBAN', 'LIST', 'ANALYTICS'].includes(viewParam.toUpperCase())) {
          setCurrentView(viewParam.toUpperCase());
        }
      }
    } catch (e) {
      console.warn('URL param parse error:', e);
    }

    return () => {
      supabaseLeads.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchLeads]);

  // Helper to save overrides to localStorage
  const saveOverride = (leadId, partialData) => {
    try {
      const stored = localStorage.getItem('crm_lead_overrides_v1');
      const overrides = stored ? JSON.parse(stored) : {};
      const nowIso = new Date().toISOString();
      overrides[leadId] = {
        ...(overrides[leadId] || {}),
        ...partialData,
        updatedAt: nowIso
      };
      localStorage.setItem('crm_lead_overrides_v1', JSON.stringify(overrides));
    } catch (e) {
      console.error('Save override error:', e);
    }
  };

  // Pipeline Confirmation Modal State
  const [pipelineConfirmState, setPipelineConfirmState] = useState({
    lead: null,
    targetPipeline: null,
  });

  // Trigger modal when user clicks switch pipeline button
  const handleRequestPipelineChange = (leadId, newPipeline) => {
    const targetLead = leads.find(l => l.id === leadId);
    if (targetLead) {
      setPipelineConfirmState({ lead: targetLead, targetPipeline: newPipeline });
    }
  };

  // Confirm switch pipeline → sync to Supabase
  const handleConfirmPipelineChange = async () => {
    const { lead: targetLead, targetPipeline: newPipeline } = pipelineConfirmState;
    if (!targetLead || !newPipeline) return;

    const leadId = targetLead.id;
    const newService = newPipeline === 'PRODUCTION' ? 'Prodüksiyon' : 'Sosyal Medya';
    
    saveOverride(leadId, { pipeline: newPipeline });

    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        const updated = {
          ...lead,
          pipeline: newPipeline,
          productionDetails: newPipeline === 'PRODUCTION' ? (lead.productionDetails || { projectType: 'Tanıtım Filmi', budget: null }) : undefined,
          socialMediaDetails: newPipeline === 'SOCIAL_MEDIA' ? (lead.socialMediaDetails || { monthlyBudget: null, platforms: ['Instagram'], monthlyReelsCount: 0, industry: 'Sosyal Medya' }) : undefined,
          updatedAt: new Date().toISOString()
        };
        if (selectedLead?.id === leadId) setSelectedLead(updated);
        return updated;
      }
      return lead;
    }));

    setPipelineConfirmState({ lead: null, targetPipeline: null });
    showToast(`"${targetLead.title}" ${newPipeline === 'PRODUCTION' ? 'Prodüksiyon' : 'Sosyal Medya'} kanalına taşındı!`);

    const { error } = await supabaseLeads
      .from('leads')
      .update({
        pipeline: newPipeline,
        service: newService
      })
      .eq('id', leadId);

    if (error) {
      console.error('Supabase pipeline update error:', error);
      showToast('Kanal güncelleme hatası: ' + error.message, 'warning');
    }
  };

  // Helper to log actions into activity_log table for real-time activity stream
  const logActivity = async (action, details, targetName = 'GENEL') => {
    let userName = 'Furkan';
    try {
      const userStr = localStorage.getItem('ajans_user') || localStorage.getItem('social-art-base:credentials');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        userName = parsed.name || parsed.username || 'Furkan';
      }
    } catch {}

    const newLogRecord = {
      user_name: userName,
      action,
      target_name: targetName || 'GENEL',
      details,
      created_at: new Date().toISOString()
    };
    try {
      await supabaseLeads.from('activity_log').insert([newLogRecord]);
    } catch (e) {}
    try {
      await supabase.from('activity_log').insert([newLogRecord]);
    } catch (e) {}
  };

  // Stage change → sync to Supabase & LocalStorage
  const handleStageChange = async (leadId, newStage) => {
    const newStatus = stageToStatus[newStage];
    const currentLead = leads.find(l => String(l.id) === String(leadId));
    const leadDisplayName = currentLead?.title || currentLead?.contactName || 'Müşteri';
    const oldStageObj = STAGES.find(s => s.id === currentLead?.stage);
    const newStageObj = STAGES.find(s => s.id === newStage);
    const oldStageLabel = oldStageObj?.label || currentLead?.stage || 'Yeni Lead';
    const newStageLabel = newStageObj?.label || newStage;
    const staffName = getActiveStaffName();
    const nowIso = new Date().toISOString();

    const stageLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author: staffName,
      text: `Mevcut satış aşaması "${oldStageLabel}" ➔ "${newStageLabel}" olarak güncellendi.`,
      createdAt: nowIso,
      type: 'log',
      actionType: 'STAGE_CHANGE',
      oldValue: oldStageLabel,
      newValue: newStageLabel
    };

    const updatedNotes = [stageLog, ...(currentLead?.notes || [])];

    // Save to LocalStorage immediately to guarantee persistence on refresh
    saveOverride(leadId, { stage: newStage, notes: updatedNotes });

    // Also update stage in manual leads storage
    try {
      const storedManual = localStorage.getItem('socialart_crm_manual_leads');
      if (storedManual) {
        const manualLeadsList = JSON.parse(storedManual);
        if (Array.isArray(manualLeadsList)) {
          const updatedManual = manualLeadsList.map(m => m.id === leadId ? { ...m, stage: newStage, notes: updatedNotes } : m);
          localStorage.setItem('socialart_crm_manual_leads', JSON.stringify(updatedManual));
        }
      }
    } catch (e) {
      console.warn('Manual lead stage update error:', e);
    }

    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        const updated = {
          ...lead,
          stage: newStage,
          notes: updatedNotes,
          updatedAt: nowIso,
          activities: [
            {
              id: `act-${Date.now()}`,
              title: `Aşama "${newStageLabel}" olarak güncellendi`,
              date: nowIso,
              type: 'STAGE_CHANGE',
              author: staffName
            },
            ...lead.activities
          ]
        };
        if (selectedLead?.id === leadId) setSelectedLead(updated);
        return updated;
      }
      return lead;
    }));

    logActivity('Lead Aşaması Güncellendi', `"${leadDisplayName}" aşaması ${newStage} (${newStatus}) olarak güncellendi. (${staffName})`, leadDisplayName);

    await supabaseLeads
      .from('leads')
      .update({ 
        status: newStatus,
        stage: newStage,
        notes: updatedNotes
      })
      .eq('id', leadId);

    // Automatic Finance Integration: When a Production Lead is moved to WON, sync to finance_client_payments & finance_production_projects
    if (newStage === 'WON' && (currentLead?.pipeline === 'PRODUCTION' || currentPipeline === 'PRODUCTION')) {
      try {
        const rawAmount = currentLead?.productionDetails?.budget || currentLead?.budget;
        const numAmount = (typeof rawAmount === 'number' && !isNaN(rawAmount))
          ? rawAmount
          : (parseFloat(String(rawAmount || '').replace(/[^0-9.-]+/g, '')) || 0);

        const leadTitle = currentLead?.title || currentLead?.contactName || 'İsimsiz Proje';
        const clientName = currentLead?.contactName || currentLead?.title || 'Müşteri';
        const todayDate = new Date().toISOString().split('T')[0];
        const periodStr = new Date().toISOString().slice(0, 7);

        // 1. Insert into finance_client_payments (if amount > 0)
        if (numAmount > 0) {
          const { error: paymentError } = await supabase.from('finance_client_payments').insert([{
            client_id: 99999, // Diğer / Harici Gelir
            amount: numAmount, // CRM'deki Gelir Tutarı
            payment_date: todayDate,
            payment_type: 'Havale',
            period: periodStr, // Örn: '2026-08'
            notes: `[CRM Prodüksiyon Kazanıldı] ${leadTitle} (${clientName})`,
            kdv_rate: 20
          }]);
          if (paymentError) {
            console.error('Supabase finance_client_payments insert error:', paymentError);
          }
        }

        // 2. Insert into finance_production_projects
        const { error: projectError } = await supabase.from('finance_production_projects').insert([{
          title: leadTitle,
          client_name: clientName,
          budget: numAmount,
          status: 'ongoing',
          date: todayDate
        }]);
        if (projectError) {
          console.error('Supabase finance_production_projects insert error:', projectError);
        }

        showToast(
          numAmount > 0
            ? `🎉 "${leadTitle}" Kazanıldı! ₺${numAmount.toLocaleString('tr-TR')} gelir tutarı Finans Paneline ve Prodüksiyon Projelerine otomatik aktarıldı.`
            : `🎉 "${leadTitle}" Kazanıldı! Proje Finans Prodüksiyon listesine aktarıldı.`
        );
      } catch (finErr) {
        console.error('Error syncing to finance on WON:', finErr);
      }
    }
  };

  // Add note → Supabase (primary) + LocalStorage (backup)
  const handleAddNote = async (leadId, noteText, customAuthor = null) => {
    const currentLead = leads.find(l => l.id === leadId);
    const leadDisplayName = currentLead?.title || currentLead?.contactName || 'Müşteri';
    const repName = customAuthor || getActiveStaffName() || currentLead?.assignedTo || 'Celal';
    const nowIso = new Date().toISOString();
    const newNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author: repName,
      text: noteText,
      createdAt: nowIso,
      type: 'note',
      actionType: 'NOTE'
    };
    const updatedNotes = [newNote, ...(currentLead?.notes || [])];

    saveOverride(leadId, { notes: updatedNotes });

    try {
      const storedManual = localStorage.getItem('socialart_crm_manual_leads');
      if (storedManual) {
        const manualLeadsList = JSON.parse(storedManual);
        if (Array.isArray(manualLeadsList)) {
          const updatedManual = manualLeadsList.map(m => m.id === leadId ? { ...m, notes: updatedNotes } : m);
          localStorage.setItem('socialart_crm_manual_leads', JSON.stringify(updatedManual));
        }
      }
    } catch (e) {}

    // Update UI immediately
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        const updated = { 
          ...lead, 
          notes: updatedNotes, 
          updatedAt: nowIso,
          activities: [
            {
              id: `act-${Date.now()}`,
              title: `Yeni temsilci notu eklendi (${repName})`,
              date: nowIso,
              type: 'NOTE',
              author: repName,
              details: noteText
            },
            ...lead.activities
          ]
        };
        if (selectedLead?.id === leadId) setSelectedLead(updated);
        return updated;
      }
      return lead;
    }));

    logActivity('Lead Notu Eklendi', `"${leadDisplayName}" için ${repName} tarafından yeni not eklendi: "${noteText.slice(0, 100)}"`, leadDisplayName);

    // Save to Supabase (primary storage)
    const { error } = await supabaseLeads
      .from('leads')
      .update({ notes: updatedNotes })
      .eq('id', leadId);

    if (error) {
      console.error('Not kaydedilemedi, localStorage yedeğe alındı:', error.message);
      // Fallback: save to localStorage if Supabase fails
      saveOverride(leadId, { notes: updatedNotes });
    } else {
      // Also keep localStorage in sync
      saveOverride(leadId, { notes: updatedNotes });
    }
  };

  // Delete note → Supabase (primary) + LocalStorage (backup)
  const handleDeleteNote = async (leadId, noteId) => {
    const currentLead = leads.find(l => l.id === leadId);
    if (!currentLead) return;

    const updatedNotes = (currentLead.notes || []).filter(n => n.id !== noteId);

    saveOverride(leadId, { notes: updatedNotes });

    try {
      const storedManual = localStorage.getItem('socialart_crm_manual_leads');
      if (storedManual) {
        const manualLeadsList = JSON.parse(storedManual);
        if (Array.isArray(manualLeadsList)) {
          const updatedManual = manualLeadsList.map(m => m.id === leadId ? { ...m, notes: updatedNotes } : m);
          localStorage.setItem('socialart_crm_manual_leads', JSON.stringify(updatedManual));
        }
      }
    } catch (e) {
      console.warn('Manual lead notes delete error:', e);
    }

    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        const updated = { ...lead, notes: updatedNotes, updatedAt: new Date().toISOString() };
        if (selectedLead?.id === leadId) setSelectedLead(updated);
        return updated;
      }
      return lead;
    }));

    showToast('Not silindi!');

    await supabaseLeads
      .from('leads')
      .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
      .eq('id', leadId);
  };

  // Delete Lead Completely (Real SQL Delete from Supabase)
  const handleDeleteLead = async (leadId) => {
    // 1. Optimistic UI Update
    setLeads(prev => prev.filter(l => String(l.id) !== String(leadId)));
    if (selectedLead?.id === leadId) setSelectedLead(null);

    // 2. LocalStorage sync
    try {
      const deletedIds = JSON.parse(localStorage.getItem('socialart_crm_deleted_lead_ids') || '[]');
      if (!deletedIds.includes(String(leadId))) {
        deletedIds.push(String(leadId));
        localStorage.setItem('socialart_crm_deleted_lead_ids', JSON.stringify(deletedIds));
      }

      const storedManual = localStorage.getItem('socialart_crm_manual_leads');
      if (storedManual) {
        const manualLeadsList = JSON.parse(storedManual);
        if (Array.isArray(manualLeadsList)) {
          const updated = manualLeadsList.filter(m => String(m.id) !== String(leadId));
          localStorage.setItem('socialart_crm_manual_leads', JSON.stringify(updated));
        }
      }

      // Clear any stored override for this lead
      const storedOverrides = localStorage.getItem('crm_lead_overrides_v1');
      if (storedOverrides) {
        const overrides = JSON.parse(storedOverrides);
        delete overrides[leadId];
        delete overrides[String(leadId)];
        localStorage.setItem('crm_lead_overrides_v1', JSON.stringify(overrides));
      }
    } catch (e) {
      console.warn('Error syncing deleted lead to localStorage:', e);
    }

    // 3. Real SQL DELETE Execution in Supabase Database
    try {
      const numericId = Number(leadId);
      const queryId = !isNaN(numericId) && numericId > 0 ? numericId : leadId;
      const targetLead = leads.find(l => String(l.id) === String(leadId));
      const leadDisplayName = targetLead?.title || targetLead?.contactName || 'Müşteri';

      const { error } = await supabaseLeads
        .from('leads')
        .delete()
        .eq('id', queryId);

      if (error) {
        console.error('Supabase delete error:', error);
        showToast('Müşteri silinirken veritabanı hatası oluştu: ' + error.message, 'error');
        fetchLeads();
      } else {
        logActivity('Potansiyel Lead Silindi', `"${leadDisplayName}" potansiyel müşteri kaydı veritabanından silindi.`, leadDisplayName);
        showToast('Müşteri kaydı veritabanından kalıcı olarak silindi.');
      }
    } catch (e) {
      console.error('Supabase delete exception:', e);
      showToast('Silme işlemi başarısız: ' + (e.message || 'Bilinmeyen hata'), 'error');
      fetchLeads();
    }
  };

  // Update Assigned Staff
  const handleUpdateAssignedTo = async (leadId, newStaff) => {
    const targetLead = leads.find(l => String(l.id) === String(leadId));
    const leadDisplayName = targetLead?.title || targetLead?.contactName || 'Müşteri';
    const staffName = getActiveStaffName();
    const nowIso = new Date().toISOString();

    const assignLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author: staffName,
      text: `Temsilci sorumlusu "${newStaff}" olarak atandı.`,
      createdAt: nowIso,
      type: 'log',
      actionType: 'ASSIGNED'
    };
    const updatedNotes = [assignLog, ...(targetLead?.notes || [])];

    saveOverride(leadId, { assignedTo: newStaff, notes: updatedNotes });

    try {
      const storedManual = localStorage.getItem('socialart_crm_manual_leads');
      if (storedManual) {
        const manualLeadsList = JSON.parse(storedManual);
        if (Array.isArray(manualLeadsList)) {
          const updatedManual = manualLeadsList.map(m => m.id === leadId ? { ...m, assignedTo: newStaff, notes: updatedNotes } : m);
          localStorage.setItem('socialart_crm_manual_leads', JSON.stringify(updatedManual));
        }
      }
    } catch (e) {}

    setLeads(prev => prev.map(lead => {
      if (String(lead.id) === String(leadId)) {
        const updated = { 
          ...lead, 
          assignedTo: newStaff, 
          notes: updatedNotes, 
          updatedAt: nowIso,
          activities: [
            {
              id: `act-${Date.now()}`,
              title: `Temsilci "${newStaff}" olarak atandı`,
              date: nowIso,
              type: 'ASSIGNED',
              author: staffName
            },
            ...lead.activities
          ]
        };
        if (selectedLead?.id === leadId) setSelectedLead(updated);
        return updated;
      }
      return lead;
    }));

    try {
      const numericId = Number(leadId);
      const queryId = !isNaN(numericId) && numericId > 0 ? numericId : leadId;

      const { error } = await supabaseLeads
        .from('leads')
        .update({ rep: newStaff, notes: updatedNotes, updated_at: nowIso })
        .eq('id', queryId);

      if (error) {
        console.error('Failed to update rep in Supabase:', error);
        showToast('Temsilci güncellenirken hata oluştu: ' + error.message, 'error');
      } else {
        logActivity('Temsilci Atandı', `"${leadDisplayName}" müşterisine ${newStaff} temsilci olarak atandı. (${staffName})`, leadDisplayName);
        showToast(`Temsilci "${newStaff}" olarak güncellendi.`);
      }
    } catch (e) {
      console.error('Update assigned staff error:', e);
      showToast('Temsilci güncellenemedi: ' + e.message, 'error');
    }
  };

  // Update Lead Info (Title, Contact, Phone, Email, City)
  const handleUpdateLeadInfo = async (leadId, updatedData) => {
    const currentLead = leads.find(l => String(l.id) === String(leadId));
    const staffName = getActiveStaffName();
    const nowIso = new Date().toISOString();

    const infoLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author: staffName,
      text: `Müşteri bilgileri güncellendi (${updatedData.title || updatedData.contactName || ''}).`,
      createdAt: nowIso,
      type: 'log',
      actionType: 'INFO_UPDATE'
    };
    const updatedNotes = [infoLog, ...(currentLead?.notes || [])];

    saveOverride(leadId, { ...updatedData, notes: updatedNotes });

    try {
      const storedManual = localStorage.getItem('socialart_crm_manual_leads');
      if (storedManual) {
        const manualLeadsList = JSON.parse(storedManual);
        if (Array.isArray(manualLeadsList)) {
          const updatedManual = manualLeadsList.map(m => m.id === leadId ? { ...m, ...updatedData, notes: updatedNotes } : m);
          localStorage.setItem('socialart_crm_manual_leads', JSON.stringify(updatedManual));
        }
      }
    } catch (e) {}

    setLeads(prev => prev.map(lead => {
      if (String(lead.id) === String(leadId)) {
        const updated = { 
          ...lead, 
          ...updatedData, 
          notes: updatedNotes, 
          updatedAt: nowIso,
          activities: [
            {
              id: `act-${Date.now()}`,
              title: 'Müşteri bilgileri güncellendi',
              date: nowIso,
              type: 'INFO_UPDATE',
              author: staffName
            },
            ...lead.activities
          ]
        };
        if (selectedLead?.id === leadId) setSelectedLead(updated);
        return updated;
      }
      return lead;
    }));

    try {
      const numericId = Number(leadId);
      const queryId = !isNaN(numericId) && numericId > 0 ? numericId : leadId;
      await supabaseLeads
        .from('leads')
        .update({
          title: updatedData.title,
          name: updatedData.contactName,
          phone: updatedData.phone,
          email: updatedData.email,
          city: updatedData.city,
          notes: updatedNotes,
          updated_at: nowIso
        })
        .eq('id', queryId);
    } catch (e) {
      console.warn('Supabase info update error:', e);
    }
  };

  // Update retargeting
  const handleUpdateRetargeting = async (leadId, date, note) => {
    const currentLead = leads.find(l => String(l.id) === String(leadId));
    const staffName = getActiveStaffName();
    const nowIso = new Date().toISOString();
    const dateFormatted = date ? new Date(date).toLocaleDateString('tr-TR') : 'Tarih belirtilmedi';

    const rtLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author: staffName,
      text: `Retargeting / Yeniden Görüşme planlandı (${dateFormatted})${note ? `: "${note}"` : ''}.`,
      createdAt: nowIso,
      type: 'log',
      actionType: 'RETARGETING'
    };
    const updatedNotes = [rtLog, ...(currentLead?.notes || [])];

    saveOverride(leadId, { stage: 'RETARGETING', retargetingDate: date, retargetingNote: note, notes: updatedNotes });

    try {
      const storedManual = localStorage.getItem('socialart_crm_manual_leads');
      if (storedManual) {
        const manualLeadsList = JSON.parse(storedManual);
        if (Array.isArray(manualLeadsList)) {
          const updatedManual = manualLeadsList.map(m => m.id === leadId ? { ...m, stage: 'RETARGETING', retargetingDate: date, retargetingNote: note, notes: updatedNotes } : m);
          localStorage.setItem('socialart_crm_manual_leads', JSON.stringify(updatedManual));
        }
      }
    } catch (e) {}

    setLeads(prev => prev.map(lead => {
      if (String(lead.id) === String(leadId)) {
        const updated = { 
          ...lead, 
          stage: 'RETARGETING', 
          retargetingDate: date, 
          retargetingNote: note, 
          notes: updatedNotes, 
          updatedAt: nowIso,
          activities: [
            {
              id: `act-${Date.now()}`,
              title: `Retargeting planlandı (${dateFormatted})`,
              date: nowIso,
              type: 'RETARGETING',
              author: staffName,
              details: note
            },
            ...lead.activities
          ]
        };
        if (selectedLead?.id === leadId) setSelectedLead(updated);
        return updated;
      }
      return lead;
    }));

    try {
      const numericId = Number(leadId);
      const queryId = !isNaN(numericId) && numericId > 0 ? numericId : leadId;
      await supabaseLeads
        .from('leads')
        .update({ 
          status: 'Ertelendi', 
          stage: 'RETARGETING',
          retargeting_date: date, 
          retargeting_note: note, 
          notes: updatedNotes, 
          updated_at: nowIso 
        })
        .eq('id', queryId);
    } catch (e) {
      console.warn('Supabase retargeting update error:', e);
    }
  };

  // Update budget
  const handleUpdateBudget = async (leadId, newBudget) => {
    const currentLead = leads.find(l => String(l.id) === String(leadId));
    const isProd = currentLead?.pipeline === 'PRODUCTION';
    const staffName = getActiveStaffName();
    const nowIso = new Date().toISOString();

    const budgetLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author: staffName,
      text: newBudget 
        ? `Bütçe detayları ₺${newBudget.toLocaleString('tr-TR')} olarak güncellendi.`
        : `Bütçe bilgisi sıfırlandı.`,
      createdAt: nowIso,
      type: 'log',
      actionType: 'BUDGET_UPDATE'
    };
    const updatedNotes = [budgetLog, ...(currentLead?.notes || [])];

    saveOverride(leadId, { budget: newBudget, notes: updatedNotes });

    try {
      const storedManual = localStorage.getItem('socialart_crm_manual_leads');
      if (storedManual) {
        const manualLeadsList = JSON.parse(storedManual);
        if (Array.isArray(manualLeadsList)) {
          const updatedManual = manualLeadsList.map(m => m.id === leadId ? { ...m, budget: newBudget, notes: updatedNotes } : m);
          localStorage.setItem('socialart_crm_manual_leads', JSON.stringify(updatedManual));
        }
      }
    } catch (e) {}

    setLeads(prev => prev.map(lead => {
      if (String(lead.id) === String(leadId)) {
        const updated = {
          ...lead,
          budget: newBudget,
          notes: updatedNotes,
          productionDetails: isProd ? { ...(lead.productionDetails || {}), budget: newBudget } : lead.productionDetails,
          socialMediaDetails: !isProd ? { ...(lead.socialMediaDetails || {}), monthlyBudget: newBudget } : lead.socialMediaDetails,
          updatedAt: nowIso,
          activities: [
            {
              id: `act-${Date.now()}`,
              title: newBudget ? `Bütçe ₺${newBudget.toLocaleString('tr-TR')} olarak güncellendi` : 'Bütçe sıfırlandı',
              date: nowIso,
              type: 'BUDGET_UPDATE',
              author: staffName
            },
            ...lead.activities
          ]
        };
        if (selectedLead?.id === leadId) setSelectedLead(updated);
        return updated;
      }
      return lead;
    }));

    try {
      const numericId = Number(leadId);
      const queryId = !isNaN(numericId) && numericId > 0 ? numericId : leadId;
      await supabaseLeads
        .from('leads')
        .update({ budget: newBudget, notes: updatedNotes, updated_at: nowIso })
        .eq('id', queryId);
    } catch (e) {
      console.warn('Supabase budget update error:', e);
    }
  };

  // Add manual lead → instant UI update + persistence in localStorage & Supabase
  const handleAddManualLead = async (leadData) => {
    const newStatus = stageToStatus[leadData.stage] || 'Geldi (Yeni Lead)';
    const nowIso = new Date().toISOString();
    const generatedId = `lead-manual-${Date.now()}`;
    const leadDisplayName = leadData.title || leadData.contactName || 'İsimsiz Müşteri';
    const staffName = getActiveStaffName();

    const newLeadObj = {
      id: generatedId,
      pipeline: leadData.pipeline,
      title: leadData.title,
      contactName: leadData.contactName,
      email: leadData.email || '',
      phone: leadData.phone,
      city: leadData.city || 'İstanbul',
      source: leadData.source || 'MANUAL',
      stage: leadData.stage || 'NEW',
      priority: leadData.priority || 'MEDIUM',
      assignedTo: leadData.assignedTo || 'Celal',
      createdAt: nowIso,
      updatedAt: nowIso,
      productionDetails: leadData.productionDetails,
      socialMediaDetails: leadData.socialMediaDetails,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: staffName,
          text: `Manuel Lead eklendi. ${leadData.contactName} (${leadData.phone})`,
          createdAt: nowIso,
          type: 'log',
          actionType: 'INFO_UPDATE'
        }
      ],
      activities: [
        {
          id: `act-${Date.now()}`,
          title: 'Manuel Lead Eklenme Kaydı',
          date: nowIso,
          type: 'STAGE_CHANGE',
          author: staffName
        }
      ]
    };

    // 1. Instant UI update
    setLeads(prev => [newLeadObj, ...prev]);
    setCurrentPipeline(leadData.pipeline);
    logActivity('Yeni Potansiyel Lead', `Yeni müşteri adayı eklendi: ${leadDisplayName} (${leadData.pipeline === 'PRODUCTION' ? 'Prodüksiyon' : 'Sosyal Medya'})`, leadDisplayName);
    showToast(`"${leadData.title}" başarıyla CRM'e eklendi!`);

    // 2. Save to LocalStorage
    try {
      const storedLocal = localStorage.getItem('socialart_crm_manual_leads');
      const manualLeadsList = storedLocal ? JSON.parse(storedLocal) : [];
      localStorage.setItem('socialart_crm_manual_leads', JSON.stringify([newLeadObj, ...manualLeadsList]));
    } catch (e) {
      console.warn('LocalStorage error saving manual lead:', e);
    }

    // 3. Sync to Supabase in background
    try {
      const parsedBudget = Number(leadData.productionDetails?.budget || leadData.socialMediaDetails?.monthlyBudget) || null;
      const { data, error } = await supabaseLeads
        .from('leads')
        .insert({
          title: leadData.title || leadData.contactName || 'İsimsiz Müşteri',
          name: leadData.title || leadData.contactName || 'İsimsiz Müşteri',
          rep: leadData.contactName || '',
          email: leadData.email || '',
          phone: leadData.phone || '',
          city: leadData.city || 'İstanbul',
          service: leadData.socialMediaDetails?.industry || (leadData.pipeline === 'PRODUCTION' ? 'Prodüksiyon' : 'Sosyal Medya'),
          status: newStatus,
          stage: leadData.stage || 'NEW',
          pipeline: leadData.pipeline || 'PRODUCTION',
          platform: leadData.source || 'MANUAL',
          budget: parsedBudget,
          reaction: parsedBudget ? `Bütçe: ₺${parsedBudget.toLocaleString('tr-TR')}` : 'Manuel Lead Eklendi',
          notes: newLeadObj.notes || [],
          created_at: nowIso,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase manual lead insert error:', error);
        showToast('Müşteri veritabanına eklenirken bir uyarı oluştu: ' + error.message, 'warning');
      } else if (data && data.id) {
        setLeads(prev => prev.map(l => l.id === generatedId ? { ...l, id: String(data.id) } : l));
      }
    } catch (err) {
      console.error('Supabase insert exception:', err);
    }
  };

  // Toggle Lead Quality (for Meta Custom / Lookalike Audience export)
  const handleToggleQualified = async (leadId) => {
    const targetLead = leads.find(l => String(l.id) === String(leadId));
    if (!targetLead) return;
    const nextVal = !targetLead.isQualified;
    const staffName = getActiveStaffName();
    const nowIso = new Date().toISOString();

    const qualLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author: staffName,
      text: nextVal 
        ? `Lead "🌟 Kaliteli Lead (Meta Lookalike / Custom Audience)" olarak işaretlendi.`
        : `Lead "Kaliteli Lead" işareti kaldırıldı.`,
      createdAt: nowIso,
      type: 'log',
      actionType: 'QUALIFIED'
    };
    const updatedNotes = [qualLog, ...(targetLead.notes || [])];

    saveOverride(leadId, { isQualified: nextVal, notes: updatedNotes });

    try {
      const storedManual = localStorage.getItem('socialart_crm_manual_leads');
      if (storedManual) {
        const manualLeadsList = JSON.parse(storedManual);
        if (Array.isArray(manualLeadsList)) {
          const updatedManual = manualLeadsList.map(m => m.id === leadId ? { ...m, isQualified: nextVal, notes: updatedNotes } : m);
          localStorage.setItem('socialart_crm_manual_leads', JSON.stringify(updatedManual));
        }
      }
    } catch (e) {}

    // 1. Instant UI update
    setLeads(prev => prev.map(l => {
      if (String(l.id) === String(leadId)) {
        const updated = {
          ...l,
          isQualified: nextVal,
          notes: updatedNotes,
          updatedAt: nowIso,
          activities: [
            {
              id: `act-${Date.now()}`,
              title: nextVal ? '🌟 Kaliteli Lead olarak işaretlendi' : 'Kaliteli Lead işareti kaldırıldı',
              date: nowIso,
              type: 'QUALIFIED',
              author: staffName
            },
            ...l.activities
          ]
        };
        if (selectedLead && String(selectedLead.id) === String(leadId)) {
          setSelectedLead(updated);
        }
        return updated;
      }
      return l;
    }));

    logActivity(
      nextVal ? 'Kaliteli Lead İşaretlendi' : 'Kaliteli Lead İşareti Kaldırıldı',
      `"${targetLead.title}" adlı müşteri ${staffName} tarafından ${nextVal ? '⭐ Kaliteli (Meta Audience)' : 'Normal'} olarak güncellendi.`,
      targetLead.title
    );

    showToast(
      nextVal
        ? `⭐ "${targetLead.title}" Kaliteli Lead olarak işaretlendi (Meta Audience için hazır)!`
        : `"${targetLead.title}" Kaliteli işareti kaldırıldı.`
    );

    // 2. Supabase DB update
    try {
      const numericId = parseInt(leadId, 10);
      const queryId = !isNaN(numericId) && numericId > 0 ? numericId : leadId;
      await supabaseLeads
        .from('leads')
        .update({
          is_qualified: nextVal,
          notes: updatedNotes,
          updated_at: nowIso
        })
        .eq('id', queryId);
    } catch (err) {
      console.error('Error in handleToggleQualified:', err);
    }
  };

  // Export Meta Ads Manager Customer List CSV
  const handleExportQualityLeads = (onlyQualified = true) => {
    const exportSource = leads.filter(l => l.pipeline === currentPipeline && (onlyQualified ? l.isQualified : true));

    if (exportSource.length === 0) {
      showToast('Henüz kaliteli olarak işaretlenmiş lead bulunmuyor. Leadlerin üzerindeki ⭐ butonuna basarak işaretleyebilirsiniz.', 'warning');
      return;
    }

    // Standard Meta Ads Manager Headers for Customer List / Lookalike Audience
    const csvHeaders = ['fn', 'ln', 'phone', 'email', 'ct', 'value', 'service', 'platform', 'lead_id', 'created_at'];

    const csvRows = exportSource.map(lead => {
      // Name normalization
      const rawName = String(lead.contactName || lead.title || '').trim();
      const nameParts = rawName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Phone normalization for Meta (E.164 without +, standard: 905xxxxxxxxx)
      let rawPhone = String(lead.phone || '').replace(/[^0-9]/g, '');
      if (rawPhone.startsWith('05')) {
        rawPhone = '9' + rawPhone;
      } else if (rawPhone.startsWith('5') && rawPhone.length === 10) {
        rawPhone = '90' + rawPhone;
      }

      // Email normalization
      const rawEmail = String(lead.email || '').trim().toLowerCase();

      // City normalization
      const rawCity = String(lead.city || 'istanbul').trim().toLowerCase();

      // Value / Budget for value-based Lookalike
      const rawBudget = lead.pipeline === 'PRODUCTION'
        ? lead.productionDetails?.budget
        : lead.socialMediaDetails?.monthlyBudget;
      const numBudget = (typeof rawBudget === 'number' && !isNaN(rawBudget)) ? rawBudget : '';

      return [
        `"${firstName.replace(/"/g, '""')}"`,
        `"${lastName.replace(/"/g, '""')}"`,
        `"${rawPhone}"`,
        `"${rawEmail.replace(/"/g, '""')}"`,
        `"${rawCity.replace(/"/g, '""')}"`,
        `"${numBudget}"`,
        `"${(lead.adName || lead.productionDetails?.projectType || lead.socialMediaDetails?.industry || '').replace(/"/g, '""')}"`,
        `"${(lead.platform || lead.source || '').replace(/"/g, '""')}"`,
        `"${lead.id}"`,
        `"${lead.createdAt ? new Date(lead.createdAt).toISOString().slice(0, 10) : ''}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [csvHeaders.join(','), ...csvRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `meta_kaliteli_leadler_${currentPipeline.toLowerCase()}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`📥 ${exportSource.length} Kaliteli Lead Meta Lookalike CSV formatında indirildi!`);
  };

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const getLeadLastActivityTime = (lead) => {
    let latestTime = 0;

    if (lead.updatedAt) {
      const t = new Date(lead.updatedAt).getTime();
      if (!isNaN(t) && t > latestTime) latestTime = t;
    }

    if (Array.isArray(lead.notes) && lead.notes.length > 0) {
      lead.notes.forEach(n => {
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
      lead.activities.forEach(a => {
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

    return latestTime > 0 ? latestTime : new Date().getTime();
  };

  // Filter leads (search, source, inactivity, quality)
  const filteredLeads = leads.filter(lead => {
    if (!lead) return false;
    const titleStr = String(lead.title || '');
    const contactStr = String(lead.contactName || '');
    const phoneStr = String(lead.phone || '');
    const queryStr = String(searchQuery || '');

    const matchesSearch =
      titleStr.toLowerCase().includes(queryStr.toLowerCase()) ||
      contactStr.toLowerCase().includes(queryStr.toLowerCase()) ||
      phoneStr.includes(queryStr);

    let matchesFilter = true;
    if (selectedSourceFilter === 'INACTIVE') {
      if (lead.stage === 'WON' || lead.stage === 'LOST') {
        matchesFilter = false;
      } else {
        const lastTime = getLeadLastActivityTime(lead);
        const diffDays = Math.floor((new Date().getTime() - lastTime) / (1000 * 60 * 60 * 24));
        matchesFilter = diffDays >= 3;
      }
    } else if (selectedSourceFilter !== 'ALL') {
      matchesFilter = lead.source === selectedSourceFilter;
    }

    const matchesQuality = !isQualityOnlyFilter || Boolean(lead.isQualified);

    return matchesSearch && matchesFilter && matchesQuality;
  });

  // Stats
  const pipelineLeads = leads.filter(l => l.pipeline === currentPipeline);
  const totalPipelineValue = pipelineLeads.reduce((acc, l) => {
    const rawVal = currentPipeline === 'PRODUCTION'
      ? l.productionDetails?.budget
      : l.socialMediaDetails?.monthlyBudget;
    const numVal = (typeof rawVal === 'number' && !isNaN(rawVal))
      ? rawVal
      : (parseFloat(String(rawVal || '').replace(/[^0-9.-]+/g, '')) || 0);
    return Number(acc) + numVal;
  }, 0);

  const nowTime = new Date().getTime();
  const inactiveCount = pipelineLeads.filter(l => {
    if (l.stage === 'WON' || l.stage === 'LOST') return false;
    const lastTime = getLeadLastActivityTime(l);
    const diffDays = Math.floor((nowTime - lastTime) / (1000 * 60 * 60 * 24));
    return diffDays >= 3;
  }).length;

  const stats = {
    totalLeads: pipelineLeads.length,
    totalPipelineValue,
    retargetingCount: pipelineLeads.filter(l => l.stage === 'RETARGETING').length,
    newCount: pipelineLeads.filter(l => l.stage === 'NEW').length,
    inactiveCount
  };
  // 🔒 Security Guard: Render unauthorized screen if active employee session is missing
  if (!hasValidSession && !embedded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-black text-rose-400 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" /> CRM Güvenlik Duvarı Engeli
            </div>
            <h2 className="text-xl font-black text-white">Oturum Açmanız Gerekiyor</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Müşteri veritabanı ve CRM gizli bilgileri koruma altındadır. Lütfen yetkili ajans hesabınızla panele giriş yapın.
            </p>
          </div>
          <button
            onClick={() => { window.location.href = '/login'; }}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            Panele Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? "bg-slate-950 text-slate-100 flex flex-col font-sans rounded-2xl overflow-hidden border border-slate-800 touch-pan-y" : "min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans touch-pan-y"}>
      
      {/* Loading bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 animate-pulse" />
      )}

      {/* Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-2xl border border-emerald-400/30 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="ml-2 opacity-80 hover:opacity-100">✕</button>
        </div>
      )}

      {/* CRM Header */}
      <Header
        embedded={embedded}
        currentPipeline={currentPipeline}
        onPipelineChange={handlePipelineTabChange}
        currentView={currentView}
        onViewChange={handleViewTabChange}
        onOpenNewLeadModal={() => setIsNewLeadModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSourceFilter={selectedSourceFilter}
        onSourceFilterChange={setSelectedSourceFilter}
        isQualityOnlyFilter={isQualityOnlyFilter}
        onToggleQualityOnly={() => setIsQualityOnlyFilter(prev => !prev)}
        qualifiedCount={pipelineLeads.filter(l => l.isQualified).length}
        onExportQualityLeads={handleExportQualityLeads}
        onGoToAdmin={() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/admin';
          }
        }}
        stats={stats}
      />

      {/* Mobile Main CRM Controls Bar (< md) */}
      <div className="md:hidden p-3 bg-slate-950 border-b border-slate-800/80 space-y-3">
        {/* Row 1: Pipeline Switcher & + Lead Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold flex-1">
            <button
              onClick={() => handlePipelineTabChange('PRODUCTION')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                currentPipeline === 'PRODUCTION'
                  ? 'bg-purple-600 text-white font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎬 Prodüksiyon
            </button>
            <button
              onClick={() => handlePipelineTabChange('SOCIAL_MEDIA')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                currentPipeline === 'SOCIAL_MEDIA'
                  ? 'bg-purple-600 text-white font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📱 Sosyal Medya
            </button>
          </div>

          <button
            onClick={() => setIsNewLeadModalOpen(true)}
            className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all shrink-0"
          >
            + Ekle
          </button>
        </div>

        {/* Row 2: 2x2 Compact Metric Cards */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Toplam Potansiyel</span>
            <span className="text-sm font-black text-white mt-0.5 block">{stats.totalLeads} Lead</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Yeni Gelenler</span>
            <span className="text-sm font-black text-cyan-400 mt-0.5 block">{stats.newCount} Lead</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kazanılan (Won)</span>
            <span className="text-sm font-black text-emerald-400 mt-0.5 block">
              {leads.filter(l => l.stage === 'WON' || l.stage === 'CLOSED').length} Marka
            </span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Portföy Hacmi</span>
            <span className="text-sm font-black text-purple-400 mt-0.5 block">
              ₺{stats.totalPipelineValue.toLocaleString('tr-TR')}
            </span>
          </div>
        </div>

        {/* Row 3: Quality Filter & Export Quick Buttons (Mobile) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setIsQualityOnlyFilter(prev => !prev)}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border ${
              isQualityOnlyFilter
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 border-yellow-400'
                : 'bg-slate-900 text-amber-300 border-amber-500/40'
            }`}
          >
            <span>{isQualityOnlyFilter ? '⭐ Kaliteliler Açık' : `⭐ Kaliteliler (${pipelineLeads.filter(l => l.isQualified).length})`}</span>
          </button>
          <button
            onClick={handleExportQualityLeads}
            className="py-2 px-3 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-500/40 flex items-center justify-center gap-1.5 shadow-md"
          >
            <span>📥 Meta İndir</span>
          </button>
        </div>

        {/* Row 4: Search Bar & View Mode Switcher (Pano / Liste) */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Müşteri veya tel ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl pl-8 pr-3 py-2 outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs font-bold shrink-0">
            <button
              onClick={() => handleViewTabChange('KANBAN')}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                currentView === 'KANBAN' ? 'bg-purple-600 text-white font-black' : 'text-slate-400'
              }`}
            >
              Pano
            </button>
            <button
              onClick={() => handleViewTabChange('LIST')}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                currentView === 'LIST' ? 'bg-purple-600 text-white font-black' : 'text-slate-400'
              }`}
            >
              Liste
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <main className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 text-sm font-semibold gap-3">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            Supabase&apos;den lead verileri yükleniyor...
          </div>
        ) : (
          <>
            {currentView === 'KANBAN' && (
              <KanbanBoard
                leads={filteredLeads}
                currentPipeline={currentPipeline}
                onSelectLead={setSelectedLead}
                onStageChange={handleStageChange}
                onPipelineChange={handleRequestPipelineChange}
                onOpenNewLeadModal={() => setIsNewLeadModalOpen(true)}
                onToggleQualified={handleToggleQualified}
              />
            )}
            {currentView === 'LIST' && (
              <ListView
                leads={filteredLeads}
                currentPipeline={currentPipeline}
                onSelectLead={setSelectedLead}
                onStageChange={handleStageChange}
                onPipelineChange={handleRequestPipelineChange}
                onToggleQualified={handleToggleQualified}
              />
            )}
            {currentView === 'ANALYTICS' && (
              <AnalyticsView
                leads={leads}
                currentPipeline={currentPipeline}
                onSelectLead={setSelectedLead}
                onToggleQualified={handleToggleQualified}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateStage={handleStageChange}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
        onDeleteLead={handleDeleteLead}
        onUpdateRetargeting={handleUpdateRetargeting}
        onUpdateBudget={handleUpdateBudget}
        onUpdateAssignedTo={handleUpdateAssignedTo}
        onUpdateLeadInfo={handleUpdateLeadInfo}
        onToggleQualified={handleToggleQualified}
      />
      <NewLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onAddLead={handleAddManualLead}
        defaultPipeline={currentPipeline}
      />
      <PipelineConfirmModal
        lead={pipelineConfirmState.lead}
        targetPipeline={pipelineConfirmState.targetPipeline}
        onConfirm={handleConfirmPipelineChange}
        onCancel={() => setPipelineConfirmState({ lead: null, targetPipeline: null })}
      />
    </div>
  );
}
