import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import '../crm-tailwind.css';
import { supabase } from '../lib/supabase';
import { Header } from '../crm/components/Header';
import { KanbanBoard } from '../crm/components/KanbanBoard';
import { ListView } from '../crm/components/ListView';
import { AnalyticsView } from '../crm/components/AnalyticsView';
import { LeadDetailModal } from '../crm/components/LeadDetailModal';
import { NewLeadModal } from '../crm/components/NewLeadModal';
import { PipelineConfirmModal } from '../crm/components/PipelineConfirmModal';
import { STAGES } from '../crm/mock/initialData';

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

  const service = row.service || '';
  const pipeline = pipelineMap[service] ||
    (service.toLowerCase().includes('prodük') || service.toLowerCase().includes('video') || service.toLowerCase().includes('çekim')
      ? 'PRODUCTION' : 'SOCIAL_MEDIA');

  const rawStatus = String(row.stage || row.status || row.durum || '').trim();
  const stage = statusMap[rawStatus] || statusMap[rawStatus.toLowerCase()] || (['NEW', 'CONTACTED', 'WAITING', 'PROPOSAL_SENT', 'RETARGETING', 'WON', 'LOST'].includes(rawStatus) ? rawStatus : 'NEW');

  return {
    id: String(row.id),
    pipeline,
    title: row.name || row.company || 'İsimsiz Lead',
    contactName: row.rep || row.contact_name || '',
    email: row.email || '',
    phone: row.phone || '',
    city: row.city || '',
    source: row.source || 'MANUAL',
    stage,
    assignedTo: row.assigned_to || '',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
    notes: (() => {
      let parsedNotes = [];
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
                    parsedNotes.push({
                      id: item.id || `note-${Math.random()}`,
                      author: item.author || authorLabel,
                      text: t,
                      createdAt: item.createdAt || item.created_at || row.created_at || new Date().toISOString()
                    });
                  }
                } else if (typeof item === 'string' && item.trim() && !isInvalidNote(item)) {
                  if (!seenNoteTexts.has(item.trim())) {
                    seenNoteTexts.add(item.trim());
                    parsedNotes.push({
                      id: `note-${Math.random()}`,
                      author: authorLabel,
                      text: item.trim(),
                      createdAt: row.created_at || new Date().toISOString()
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
        parsedNotes.push({
          id: `note-${Math.random()}`,
          author: authorLabel,
          text: cleanText,
          createdAt: row.created_at || new Date().toISOString()
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
                parsedNotes.push({
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
            parsedNotes.push({
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

      // EVRENSEL AKILLI TARAMA: Standart dışındaki tüm string & object alanları da Not olarak çek!
      // Tarih, servis, sistem alanları gibi not olmayan sütunlar hariç tutulur
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
            // addNote already calls isInvalidNote inside
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

      // En yeni nota göre sırala (son eklenen en başta)
      parsedNotes.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      return parsedNotes;
    })(),
    activities: [],
    priority: 'MEDIUM',
    productionDetails: pipeline === 'PRODUCTION' ? {
      projectType: (row.service && (row.service.includes('Sunuculu') || row.service.includes('Sunucu'))) 
        ? 'Sunuculu Video' 
        : (row.service || 'Tanıtım Filmi'),
      budget: row.budget || null,
    } : undefined,
    socialMediaDetails: pipeline === 'SOCIAL_MEDIA' ? {
      monthlyBudget: row.budget || null,
      platforms: ['Instagram'],
      monthlyReelsCount: 0,
      industry: service,
    } : undefined,
    retargetingDate: row.retargeting_date || undefined,
    retargetingNote: row.retargeting_note || undefined,
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

// ----------------------------------------------------------------
// CRMPage Component
// ----------------------------------------------------------------
export default function CRMPage({ embedded = false }) {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPipeline, setCurrentPipeline] = useState('PRODUCTION');
  const [currentView, setCurrentView] = useState('KANBAN');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState('ALL');

  const [selectedLead, setSelectedLead] = useState(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Fetch leads from Supabase with Local Overrides Merge
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      let loadedLeads = [];
      if (!error && data && data.length > 0) {
        loadedLeads = data.map(mapDbRowToLead);
      }

      // Merge manual leads saved in LocalStorage first
      try {
        const storedManual = localStorage.getItem('socialart_crm_manual_leads');
        if (storedManual) {
          const manualLeadsList = JSON.parse(storedManual);
          if (Array.isArray(manualLeadsList)) {
            manualLeadsList.forEach(m => {
              if (!loadedLeads.some(l => l.id === m.id)) {
                loadedLeads.unshift(m);
              }
            });
          }
        }
      } catch (e) {
        // Ignore parse error
      }

      // Merge local stage, info & note overrides LAST to guarantee highest priority
      try {
        const storedOverrides = localStorage.getItem('crm_lead_overrides_v1');
        if (storedOverrides) {
          const overrides = JSON.parse(storedOverrides);
          loadedLeads = loadedLeads.map(l => {
            if (overrides[l.id]) {
              return { ...l, ...overrides[l.id] };
            }
            return l;
          });
        }
      } catch (e) {
        // Ignore JSON parse error
      }

      // Filter out deleted leads saved in LocalStorage
      try {
        const deletedIds = JSON.parse(localStorage.getItem('socialart_crm_deleted_lead_ids') || '[]');
        if (Array.isArray(deletedIds) && deletedIds.length > 0) {
          const deletedSet = new Set(deletedIds);
          loadedLeads = loadedLeads.filter(l => !deletedSet.has(l.id));
        }
      } catch (e) {
        // Ignore parse error
      }

      setLeads(loadedLeads);

      // Sync local manual leads & overrides to Supabase DB automatically so host has matching data
      try {
        const storedManual = localStorage.getItem('socialart_crm_manual_leads');
        if (storedManual) {
          const manualLeadsList = JSON.parse(storedManual);
          if (Array.isArray(manualLeadsList) && manualLeadsList.length > 0) {
            const dbPayloads = manualLeadsList.map(m => ({
              name: m.title || m.contactName,
              company: m.title,
              rep: m.contactName,
              phone: m.phone || '',
              email: m.email || '',
              city: m.city || 'İstanbul',
              service: m.pipeline === 'PRODUCTION' ? 'Prodüksiyon' : 'Sosyal Medya',
              stage: m.stage || 'NEW',
              status: stageToStatus[m.stage] || 'Sıcak',
              budget: m.productionDetails?.budget || m.socialMediaDetails?.monthlyBudget || m.budget || null,
              notes: m.notes,
              created_at: m.createdAt || new Date().toISOString()
            }));
            await supabase.from('leads').upsert(dbPayloads, { ignoreDuplicates: true }).catch(() => {});
          }
        }
      } catch (e) {
        console.warn('Auto sync local to Supabase error:', e);
      }
    } catch (err) {
      console.error('Lead fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // İlk yükleme
    fetchLeads();

    // ── Supabase Realtime: Yeni lead veya güncelleme anında gelsin ──
    const channel = supabase
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
      .subscribe();

    // ── Sayfa arka plandan geri gelince otomatik yenile ──
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchLeads();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchLeads]);

  // Helper to save overrides to localStorage
  const saveOverride = (leadId, partialData) => {
    try {
      const stored = localStorage.getItem('crm_lead_overrides_v1');
      const overrides = stored ? JSON.parse(stored) : {};
      overrides[leadId] = { ...(overrides[leadId] || {}), ...partialData };
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

    await supabase
      .from('leads')
      .update({ service: newService, updated_at: new Date().toISOString() })
      .eq('id', leadId);
  };

  // Stage change → sync to Supabase & LocalStorage
  const handleStageChange = async (leadId, newStage) => {
    const newStatus = stageToStatus[newStage];

    // Save to LocalStorage immediately to guarantee persistence on refresh
    saveOverride(leadId, { stage: newStage });

    // Also update stage in manual leads storage
    try {
      const storedManual = localStorage.getItem('socialart_crm_manual_leads');
      if (storedManual) {
        const manualLeadsList = JSON.parse(storedManual);
        if (Array.isArray(manualLeadsList)) {
          const updatedManual = manualLeadsList.map(m => m.id === leadId ? { ...m, stage: newStage } : m);
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
          updatedAt: new Date().toISOString(),
          activities: [
            {
              id: `act-${Date.now()}`,
              title: `Aşama "${STAGES.find(s => s.id === newStage)?.label || newStage}" olarak güncellendi`,
              date: new Date().toISOString(),
              type: 'STAGE_CHANGE'
            },
            ...lead.activities
          ]
        };
        if (selectedLead?.id === leadId) setSelectedLead(updated);
        return updated;
      }
      return lead;
    }));

    await supabase
      .from('leads')
      .update({ 
        status: newStatus,
        stage: newStage,
        updated_at: new Date().toISOString() 
      })
      .eq('id', leadId);
  };

  // Add note → sync to Supabase & LocalStorage
  const handleAddNote = async (leadId, noteText) => {
    const currentLead = leads.find(l => l.id === leadId);
    const repName = currentLead?.assignedTo || 'Celal';
    const newNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author: `${repName} (Temsilci Notu)`,
      text: noteText,
      createdAt: new Date().toISOString()
    };
    const updatedNotes = [newNote, ...(currentLead?.notes || [])];

    // Save to LocalStorage immediately to guarantee persistence on refresh
    saveOverride(leadId, { notes: updatedNotes });

    // Also update if it is in manual leads storage
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
      console.warn('Manual lead notes update error:', e);
    }

    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        const updated = { ...lead, notes: updatedNotes, updatedAt: new Date().toISOString() };
        if (selectedLead?.id === leadId) setSelectedLead(updated);
        return updated;
      }
      return lead;
    }));
    await supabase
      .from('leads')
      .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
      .eq('id', leadId);
  };

  // Delete note → sync to Supabase & LocalStorage
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

    await supabase
      .from('leads')
      .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
      .eq('id', leadId);
  };

  // Delete Lead Completely
  const handleDeleteLead = async (leadId) => {
    // Immediate UI Update
    setLeads(prev => prev.filter(l => l.id !== leadId));
    if (selectedLead?.id === leadId) setSelectedLead(null);

    // LocalStorage sync
    try {
      const deletedIds = JSON.parse(localStorage.getItem('socialart_crm_deleted_lead_ids') || '[]');
      if (!deletedIds.includes(leadId)) {
        deletedIds.push(leadId);
        localStorage.setItem('socialart_crm_deleted_lead_ids', JSON.stringify(deletedIds));
      }

      const storedManual = localStorage.getItem('socialart_crm_manual_leads');
      if (storedManual) {
        const manualLeadsList = JSON.parse(storedManual);
        if (Array.isArray(manualLeadsList)) {
          const updated = manualLeadsList.filter(m => m.id !== leadId);
          localStorage.setItem('socialart_crm_manual_leads', JSON.stringify(updated));
        }
      }
    } catch (e) {
      console.warn('Error syncing deleted lead to localStorage:', e);
    }

    showToast('Müşteri kaydı silindi');

    // Supabase DB Delete
    try {
      await supabase.from('leads').delete().eq('id', leadId);
    } catch (e) {
      console.warn('Supabase delete error:', e);
    }
  };

  // Update Assigned Staff
  const handleUpdateAssignedTo = async (leadId, newStaff) => {
    saveOverride(leadId, { assignedTo: newStaff });
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        const updated = { ...lead, assignedTo: newStaff, updatedAt: new Date().toISOString() };
        if (selectedLead?.id === leadId) setSelectedLead(updated);
        return updated;
      }
      return lead;
    }));
    await supabase
      .from('leads')
      .update({ assigned_to: newStaff, updated_at: new Date().toISOString() })
      .eq('id', leadId);
  };

  // Update Lead Info (Title, Contact, Phone, Email, City)
  const handleUpdateLeadInfo = async (leadId, updatedData) => {
    saveOverride(leadId, updatedData);
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        const updated = { ...lead, ...updatedData, updatedAt: new Date().toISOString() };
        if (selectedLead?.id === leadId) setSelectedLead(updated);
        return updated;
      }
      return lead;
    }));
    await supabase
      .from('leads')
      .update({
        title: updatedData.title,
        name: updatedData.contactName,
        phone: updatedData.phone,
        email: updatedData.email,
        city: updatedData.city,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);
  };

  // Update retargeting
  const handleUpdateRetargeting = async (leadId, date, note) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        const updated = { ...lead, stage: 'RETARGETING', retargetingDate: date, retargetingNote: note, updatedAt: new Date().toISOString() };
        if (selectedLead?.id === leadId) setSelectedLead(updated);
        return updated;
      }
      return lead;
    }));
    await supabase
      .from('leads')
      .update({ status: 'Ertelendi', retargeting_date: date, retargeting_note: note, updated_at: new Date().toISOString() })
      .eq('id', leadId);
  };

  // Update budget
  const handleUpdateBudget = async (leadId, newBudget) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        const isProd = lead.pipeline === 'PRODUCTION';
        const updated = {
          ...lead,
          productionDetails: isProd && lead.productionDetails ? { ...lead.productionDetails, budget: newBudget } : lead.productionDetails,
          socialMediaDetails: !isProd && lead.socialMediaDetails ? { ...lead.socialMediaDetails, monthlyBudget: newBudget } : lead.socialMediaDetails,
          updatedAt: new Date().toISOString()
        };
        if (selectedLead?.id === leadId) setSelectedLead(updated);
        return updated;
      }
      return lead;
    }));
    await supabase
      .from('leads')
      .update({ budget: newBudget, updated_at: new Date().toISOString() })
      .eq('id', leadId);
  };

  // Add manual lead → instant UI update + persistence in localStorage & Supabase
  const handleAddManualLead = async (leadData) => {
    const newStatus = stageToStatus[leadData.stage] || 'Geldi (Yeni Lead)';
    const nowIso = new Date().toISOString();
    const generatedId = `lead-manual-${Date.now()}`;

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
          author: 'Sistem',
          text: `Manuel Lead eklendi. ${leadData.contactName} (${leadData.phone})`,
          createdAt: nowIso
        }
      ],
      activities: [
        {
          id: `act-${Date.now()}`,
          title: 'Manuel Lead Eklenme Kaydı',
          date: nowIso,
          type: 'STAGE_CHANGE'
        }
      ]
    };

    // 1. Instant UI update
    setLeads(prev => [newLeadObj, ...prev]);
    setCurrentPipeline(leadData.pipeline);
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
      const { data, error } = await supabase
        .from('leads')
        .insert({
          name: leadData.title,
          rep: leadData.contactName,
          email: leadData.email || '',
          phone: leadData.phone,
          city: leadData.city || 'İstanbul',
          service: leadData.socialMediaDetails?.industry || (leadData.pipeline === 'PRODUCTION' ? 'Prodüksiyon' : 'Sosyal Medya'),
          status: newStatus,
          source: leadData.source || 'MANUAL',
          budget: leadData.productionDetails?.budget || leadData.socialMediaDetails?.monthlyBudget || null,
          notes: newLeadObj.notes,
          created_at: nowIso,
          updated_at: nowIso,
        })
        .select()
        .single();

      if (!error && data && data.id) {
        setLeads(prev => prev.map(l => l.id === generatedId ? { ...l, id: String(data.id) } : l));
      }
    } catch (err) {
      console.warn('Supabase insert failed (lead safely retained locally):', err);
    }
  };

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);

    let matchesFilter = true;
    if (selectedSourceFilter === 'INACTIVE') {
      if (lead.stage === 'WON' || lead.stage === 'LOST') {
        matchesFilter = false;
      } else {
        const lastDate = new Date(lead.updatedAt || lead.createdAt).getTime();
        const diffDays = Math.floor((new Date().getTime() - lastDate) / (1000 * 60 * 60 * 24));
        matchesFilter = diffDays >= 3;
      }
    } else if (selectedSourceFilter !== 'ALL') {
      matchesFilter = lead.source === selectedSourceFilter;
    }

    return matchesSearch && matchesFilter;
  });

  // Stats
  const pipelineLeads = leads.filter(l => l.pipeline === currentPipeline);
  const totalPipelineValue = pipelineLeads.reduce((acc, l) => {
    const v = currentPipeline === 'PRODUCTION'
      ? l.productionDetails?.budget || 0
      : l.socialMediaDetails?.monthlyBudget || 0;
    return acc + v;
  }, 0);

  const nowTime = new Date().getTime();
  const inactiveCount = pipelineLeads.filter(l => {
    if (l.stage === 'WON' || l.stage === 'LOST') return false;
    const lastDate = new Date(l.updatedAt || l.createdAt).getTime();
    const diffDays = Math.floor((nowTime - lastDate) / (1000 * 60 * 60 * 24));
    return diffDays >= 3;
  }).length;

  const stats = {
    totalLeads: pipelineLeads.length,
    totalPipelineValue,
    retargetingCount: pipelineLeads.filter(l => l.stage === 'RETARGETING').length,
    newCount: pipelineLeads.filter(l => l.stage === 'NEW').length,
    inactiveCount
  };

  return (
    <div className={embedded ? "bg-slate-950 text-slate-100 flex flex-col font-sans rounded-2xl overflow-hidden border border-slate-800" : "min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans"}>
      
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
        currentPipeline={currentPipeline}
        onPipelineChange={setCurrentPipeline}
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenNewLeadModal={() => setIsNewLeadModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSourceFilter={selectedSourceFilter}
        onSourceFilterChange={setSelectedSourceFilter}
        onGoToAdmin={() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/admin';
          }
        }}
        stats={stats}
      />

 

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
              />
            )}
            {currentView === 'LIST' && (
              <ListView
                leads={filteredLeads}
                currentPipeline={currentPipeline}
                onSelectLead={setSelectedLead}
                onStageChange={handleStageChange}
                onPipelineChange={handleRequestPipelineChange}
              />
            )}
            {currentView === 'ANALYTICS' && (
              <AnalyticsView
                leads={leads}
                currentPipeline={currentPipeline}
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
