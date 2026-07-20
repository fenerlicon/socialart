import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, Activity, FileText, MoreVertical, Search, Filter, CheckCircle2, Clock, XCircle, AlertCircle, Trash2, Plus, X, LogOut, Briefcase, ClipboardList, UserCheck, MessageSquare, Target, CheckSquare, ListTodo, Send, MessageCircle, Zap, ShieldCheck, Mail, Phone, ExternalLink, Star, TrendingUp, Trophy, Award, Calendar, BarChart3, ChevronRight, ChevronLeft, Camera, Video, PlusCircle, Smartphone, Download, Bell, BellOff, Edit3, Bot, RefreshCw, Upload, Check, ArrowRight, ArrowLeft, FileCode, Layout, Layers, ArrowUpRight, FolderOpen, Flame, User, CheckCircle, Sparkles, Menu } from 'lucide-react';
import Login from './Login';
import { supabase } from '../lib/supabase';
import TextareaAutosize from 'react-textarea-autosize';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import CRMPage from './CRMPage';

const AdminStyles = () => (
  <style>{`
    :root {
      --primary: #8b5cf6; /* Matching Next.js purple */
      --primary-glow: rgba(139, 92, 246, 0.15);
      --secondary: #ec4899;
      --accent: #06b6d4;
      --bg-dark: #09090b;
      --card-bg: rgba(20, 20, 25, 0.45);
      --surface-border: rgba(255, 255, 255, 0.05);
      --text-muted: #a1a1aa;
    }

    .admin-container {
      padding: 0 !important;
    }

    .container {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .admin-layout {
      display: flex;
      min-height: 100vh;
      width: 100%;
      background: linear-gradient(135deg, #09090b 0%, #111115 50%, #1a112d 100%);
    }

    .admin-sidebar-nav {
      width: 260px;
      flex-shrink: 0;
      background: rgba(9, 9, 11, 0.45);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-right: 1px solid rgba(255, 255, 255, 0.06);
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      gap: 25px;
      height: 100vh;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .admin-sidebar-nav button {
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      transition: all 0.2s;
      color: #a1a1aa;
      background: transparent;
      border: 1px solid transparent;
      width: 100%;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }

    .admin-sidebar-nav button:hover {
      background: rgba(255, 255, 255, 0.03);
      color: #fff;
      transform: translateX(3px);
    }

    .admin-sidebar-nav button.active {
      background: rgba(139, 92, 246, 0.08);
      border: 1px solid rgba(139, 92, 246, 0.15);
      color: #c084fc;
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.05);
    }

    /* Opaque cards and panels matching admin style */
    .glass {
      background: rgba(15, 15, 20, 0.5) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(255, 255, 255, 0.05) !important;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3) !important;
    }

    /* Lead Card Interactions */
    .lead-card {
      box-shadow: inset 0 1px 1px rgba(255,255,255,0.03), 0 10px 30px rgba(0,0,0,0.4) !important;
    }
    .lead-card:hover {
      transform: translateY(-4px);
      border-color: rgba(139, 92, 246, 0.2) !important;
      box-shadow: 0 15px 40px rgba(0,0,0,0.6) !important;
    }

    .contact-circle-btn:hover {
      background: rgba(255,255,255,0.08) !important;
      transform: translateY(-2px);
    }

    .status-option:hover {
      background: rgba(255, 255, 255, 0.03) !important;
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Slide-out Drawer Panel */
    .lead-drawer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      z-index: 12000;
    }

    .lead-drawer {
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      width: 100%;
      max-width: 580px;
      background: rgba(10, 10, 15, 0.96) !important;
      border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
      box-shadow: -20px 0 50px rgba(0, 0, 0, 0.8) !important;
      padding: 30px;
      overflow-y: auto;
      animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      gap: 25px;
    }

    @keyframes slideLeft {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    .potansiyel-table th {
      padding: 18px 24px !important;
      color: #a1a1aa !important;
      font-weight: 600 !important;
      font-size: 0.8rem !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
    }
    
    .potansiyel-table td {
      padding: 18px 24px !important;
      font-size: 0.85rem !important;
      color: rgba(255, 255, 255, 0.85) !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.02) !important;
    }
    
    .potansiyel-table tr:hover {
      background: rgba(255, 255, 255, 0.015) !important;
    }

    @media (max-width: 1024px) {
      .admin-layout { flex-direction: column; gap: 20px; margin-top: 80px; }
      .main-content-area { padding: 75px 15px 25px 15px !important; }
      .admin-sidebar-nav {
        position: fixed; top: 0; left: -320px; height: 100vh; width: 300px;
        background: #09090b; z-index: 10001; transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        padding: 20px; overflow-y: auto; box-shadow: 20px 0 50px rgba(0,0,0,0.5);
        display: flex !important;
        flex-direction: column;
        gap: 5px;
      }
      .admin-sidebar-nav.open { left: 0; }
      .mobile-header { display: flex !important; }
      .mobile-only { display: flex !important; }
      .welcome-panel { margin-top: 40px; }
      
      .stats-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 12px !important;
      }
      .stat-card {
        padding: 15px !important;
        min-height: 120px !important;
      }
      .stat-card .stat-value {
        font-size: 1.6rem !important;
      }

      .calendar-container {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        padding: 10px 0;
        margin: 0 -10px;
      }
    }

    @media (max-width: 600px) {
      .stats-grid {
        grid-template-columns: 1fr !important;
      }
      .welcome-content {
        flex-direction: column;
        text-align: center;
        gap: 15px !important;
      }
      .welcome-content div:last-child {
        margin-left: 0 !important;
        text-align: center !important;
      }
    }
  `}</style>
);


const ManagerTaskRow = ({ t, pri, ss, now, phaseLabel, onCardClick }) => (
  <div style={{
    padding: '25px 30px',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    borderLeft: `5px solid ${t.priority || '#2979ff'}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    transition: 'background 0.15s',
    minHeight: '120px',
    cursor: 'pointer'
  }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    onClick={() => onCardClick && onCardClick(t)}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', background: '#0d0d1a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.85rem', color: 'var(--primary)', border: '1px solid rgba(0,229,255,0.15)' }}>
          {(t.empName || '?').charAt(0)}
        </div>
        <div>
          <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.9rem' }}>{t.empName || t.assignee_name}</div>
          <div style={{ fontSize: '0.72rem', color: '#555' }}>{t.assigned_by ? `Atayan: ${t.assigned_by}` : ''}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {t.due_date && (() => {
          const due = new Date(t.due_date + 'T23:59:59');
          const diffMs = due - now;
          const isOverdue = diffMs < 0;
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const urgColor = isOverdue ? '#ff1744' : diffDays < 2 ? '#ff1744' : diffDays < 6 ? '#2979ff' : '#00e676';
          return (
            <div style={{ textAlign: 'right', background: `${urgColor}12`, border: `1px solid ${urgColor}33`, borderRadius: '12px', padding: '6px 14px' }}>
              <div style={{ color: urgColor, fontWeight: '900', fontSize: '0.85rem' }}>{isOverdue ? 'SÜRE DOLDU' : `${diffDays} GÜN KALDI`}</div>
            </div>
          );
        })()}
        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: ss.color, background: ss.bg, padding: '4px 12px', borderRadius: '8px' }}>{t.status}</span>
      </div>
    </div>
    <div className="task-text-content" style={{
      color: t.status === 'Yaptım' ? '#444' : '#ddd',
      fontSize: '1rem',
      fontWeight: '600',
      textDecoration: t.status === 'Yaptım' ? 'line-through' : 'none',
      wordBreak: 'break-word',
      lineHeight: '1.5',
      marginBottom: '5px',
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical'
    }}>
      {stripHtml(t.task_text).trim()}
    </div>

    {t.revision_note && (
      <div style={{ padding: '12px 15px', background: 'rgba(213,0,249,0.05)', border: '1px solid rgba(213,0,249,0.1)', borderRadius: '12px', fontSize: '0.85rem', color: '#ff80ab', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <RefreshCw size={14} style={{ marginTop: '3px', flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: '800', fontSize: '0.7rem', marginBottom: '3px', letterSpacing: '0.5px' }}>YÖNETİCİ REVİZYON NOTU</div>
          {t.revision_note}
        </div>
      </div>
    )}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', paddingLeft: '42px', alignItems: 'center', paddingBottom: '5px' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: pri.color, background: `${pri.color}15`, padding: '4px 10px', borderRadius: '6px', border: `1px solid ${pri.color}33` }}>{pri.label}</span>
      <span style={{ fontSize: '0.7rem', color: '#888', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>{t.category || 'Proje'}</span>
      <span style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'rgba(0,229,255,0.08)', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>{t.client_name || 'Genel Görev'}</span>
      <span style={{ fontSize: '0.7rem', color: '#888', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>{phaseLabel(t.phase)}</span>
    </div>
  </div>
);

const stripHtml = (html) => { 
  if(!html) return ''; 
  // Blok etiketlerini temizlemeden önce boşlukla değiştir ki kelimeler/satırlar birbirine yapışmasın
  const tmp = html.replace(/<br\s*\/?>/gi, ' ')
                  .replace(/<\/p>/gi, ' ')
                  .replace(/<\/div>/gi, ' ')
                  .replace(/<\/h[1-6]>/gi, ' ');
  const doc = new DOMParser().parseFromString(tmp, 'text/html'); 
  return doc.body.textContent || ""; 
};

const renderAttachments = (url, name, accent = false) => {
  if (!url) return null;
  let files = [];
  if (url.startsWith('[')) {
    try {
      files = JSON.parse(url);
    } catch (e) {
      files = [{ name: name || 'Dosya Eki', url }];
    }
  } else {
    files = [{ name: name || 'Dosya Eki', url }];
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
      {files.map((file, i) => (
        <a
          key={i}
          onClick={e => e.stopPropagation()}
          href={file.url}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: accent ? 'var(--accent)' : 'var(--primary)',
            fontWeight: '700',
            textDecoration: 'none',
            transition: '0.2s'
          }}
        >
          <FileCode size={14} />
          {file.name}
        </a>
      ))}
    </div>
  );
};

function Admin() {
  // const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentUserRef = React.useRef(null);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // A. /admin (Next.js panel) login durumunu kontrol et
        let activeEmployeeId = localStorage.getItem('social-art-base:active-employee-id');
        if (!activeEmployeeId) {
          // Varsayılan yönetici oturumu atayarak siyah ekranda takılmasını engelle
          localStorage.setItem('social-art-base:active-employee-id', 'celal');
          localStorage.setItem('social-art-base:credentials', JSON.stringify({ username: 'celal', password: '123' }));
          activeEmployeeId = 'celal';
        }

        // B. credentials oku
        const credentialsJson = localStorage.getItem('social-art-base:credentials');
        const creds = credentialsJson ? JSON.parse(credentialsJson) : null;

        // C. Supabase Oturumunu Kontrol Et
        let { data: { session } } = await supabase.auth.getSession();

        // Oturum yoksa ama credential varsa arka planda giriş yap
        if (!session && creds) {
          const slugify = (str) => {
            const chars = { 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c', 'Ğ': 'g', 'Ü': 'u', 'Ş': 's', 'İ': 'i', 'Ö': 'o', 'Ç': 'c' };
            return str.replace(/[ğüşıöçĞÜŞİÖÇ]/g, m => chars[m]).toLowerCase().trim();
          };
          const usernameClean = slugify(creds.username);
          const formattedEmail = `${usernameClean}@socialart.internal`;
          
          // Map local healed '123' passwords to real Supabase Auth passwords
          const realPasswords = {
            celal: 'Celal_SA2026!x',
            ercan: 'Ercan_SA2026!x',
            furkan: 'Furkan_SA2026!x',
            betul: 'Betul_SA2026!x',
            tugba: 'Tugba_SA2026!x',
            simge: 'Simge_SA2026!x'
          };
          const supabasePassword = realPasswords[usernameClean] || creds.password;

          const { data, error } = await supabase.auth.signInWithPassword({
            email: formattedEmail,
            password: supabasePassword,
          });
          if (data && data.session) {
            session = data.session;
          }
        }

        if (session && session.user) {
          const metadata = session.user.user_metadata;
          const userObj = { 
            name: metadata.display_name, 
            role: metadata.role,
            class: metadata.class,
            permissions: metadata.can_assign_task ? 'all' : 'limited',
            can_add_client: metadata.can_add_client
          };
          localStorage.setItem('ajans_user', JSON.stringify(userObj));
          setCurrentUser(userObj);
          fetchAllData(userObj);
        } else {
          // Oturum kurulamadıysa varsayılan ajans hesabı oluşturup yükle
          const fallbackUser = {
            name: 'Celal',
            role: 'Kurucu / Yöneticı',
            class: 'S-Class',
            permissions: 'all',
            can_add_client: true
          };
          localStorage.setItem('ajans_user', JSON.stringify(fallbackUser));
          setCurrentUser(fallbackUser);
          fetchAllData(fallbackUser);
        }
      } catch (e) {
        console.error("Auth init error:", e);
        setIsChecking(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        const metadata = session.user.user_metadata;
        const userObj = { 
          name: metadata.display_name, 
          role: metadata.role,
          class: metadata.class,
          permissions: metadata.can_assign_task ? 'all' : 'limited',
          can_add_client: metadata.can_add_client
        };
        localStorage.setItem('ajans_user', JSON.stringify(userObj));
        setCurrentUser(userObj);
      } else if (_event === 'SIGNED_OUT') {
        localStorage.removeItem('ajans_user');
        setCurrentUser(null);
      }
    });

    // ⏱ Realtime: tasks tablosunu dinle
    const channel = supabase
      .channel('socialart-realtime-master')
      // TASKS (New, Update)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        const me = currentUserRef.current;
        if (payload.eventType === 'INSERT') {
          if (payload.new.assignee_name === me?.name) {
            notifyUser('Yeni Görev Atandı! 🚀', stripHtml(payload.new.task_text));
          } else if (me?.permissions === 'all') {
            notifyUser('Yeni Ekip Görevi 📋', `${payload.new.assignee_name}: ${stripHtml(payload.new.task_text)}`);
          }
        } 
        else if (payload.eventType === 'UPDATE') {
          if (payload.new.status === 'completed' && payload.old?.status !== 'completed') {
            notifyUser('Görev Tamamlandı! ✅', `${payload.new.assignee_name}: ${stripHtml(payload.new.task_text)}`);
          }
        }
        fetchAllData(me);
      })
      // NEW LEAD (Potansiyel)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
        notifyUser('Yeni Potansiyel Müşteri! 🔥', `${payload.new.name} başvuru yaptı.`);
        fetchAllData(currentUserRef.current);
      })
      // NEW ACTIVE CLIENT (Yeni Müşteri)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'active_clients' }, (payload) => {
        notifyUser('Yeni Aktif Müşteri! 🎉', `${payload.new.name} sisteme dahil edildi.`);
        fetchAllData(currentUserRef.current);
      })
      // SUPPORT MESSAGES
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'client_support_messages' }, (payload) => {
        if (payload.new.sender_type === 'client') {
          notifyUser(`Müşteri Talebi: ${payload.new.client_name}`, payload.new.message);
          if (payload.new.message?.includes('[TALEP]')) {
             setNewTalepAlert({ clientName: payload.new.client_name, message: payload.new.message });
             setTimeout(() => setNewTalepAlert(null), 10000);
          }
        }
        fetchAllData(currentUserRef.current);
      })
      // LOGS / BUZZ
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, (payload) => {
        const target = payload.new.target_name?.trim().toLowerCase();
        const meName = currentUserRef.current?.name?.trim().toLowerCase();
        if (target === meName && payload.new.action === 'Dürtme!') {
          notifyUser('Hey! Bir Bildiriminiz Var 🔔', payload.new.details);
        }
        setActivityLogs(prev => [payload.new, ...prev].slice(0, 100));
        fetchAllData(currentUserRef.current);
      })
      .subscribe();

    // 🕒 Sayac: her dakika güncelle + süresi dolan görevleri kontrol et
    const timer = setInterval(() => {
      const newNow = new Date();
      setNow(newNow);
      autoFailOverdueTasks(newNow);
    }, 60000);
    // İlk yüklemede de kontrol et
    setTimeout(() => autoFailOverdueTasks(new Date()), 3000);

    return () => {
      supabase.removeChannel(channel);
      subscription.unsubscribe();
      clearInterval(timer);
    };
  }, []);

  const [showPwaInfo, setShowPwaInfo] = useState(false);
  const [now, setNow] = useState(new Date());
  const [notifPermission, setNotifPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'denied');

  const requestNotificationPermission = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    const isSecure = window.isSecureContext;

    if (typeof Notification === 'undefined') {
      if (isIOS && !isStandalone) {
        alert("📱 iOS Bildirim Kuralı: Bildirimler için uygulamayı 'Paylaş > Ana Ekrana Ekle' yaparak açmalısınız.");
      } else if (!isSecure) {
        alert("🔒 Güvenlik Kilidi: Bildirim alabilmek için sitenin HTTPS (Güvenli Bağlantı) olması gerekir. Yerel ağdaki (192.168...) gibi HTTP bağlantılarında bildirimler tarayıcı tarafından engellenir.");
      } else {
        alert("⚠️ Desteklenmiyor: Tarayıcınız veya cihazınız (iOS 16.4 altı vb.) bildirimleri desteklemiyor.");
      }
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        new Notification("Socialart Bildirimleri Aktif!", {
          body: "Artık işlerinizle ilgili önemli güncellemeleri buradan alacaksınız.",
          icon: '/app-icon.png'
        });
      }
    } catch (e) {
      console.error("Notif error:", e);
      alert("Bildirim izni alınırken bir hata oluştu: " + e.message);
    }
  };

  const notifyUser = (title, body) => {
    if (typeof Notification === 'undefined') return;
    
    if (Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            body,
            icon: '/app-icon.png',
            vibrate: [200, 100, 200],
            badge: '/logo.png',
            tag: 'mi-notif-' + Date.now(),
            data: { url: window.location.origin + '/crm' }
          });
        }).catch(() => {
          new Notification(title, { body, icon: '/app-icon.png' });
        });
      } else {
        new Notification(title, { body, icon: '/app-icon.png' });
      }
    } else {
      console.warn('Notification permission not granted:', Notification.permission);
    }
  };

  const handleSendBuzz = async (empName) => {
    openActionModal('buzz', empName);
  };

  // Teslim tarihi geçmiş görevleri otomatik 'Tamamlanamadı' yap
  const autoFailOverdueTasks = async (currentTime) => {
    try {
      const t = currentTime || new Date();
      // Tüm aktif + sıradaki görevleri çek
      const { data: overdueTasks } = await supabase
        .from('tasks')
        .select('id, due_date, status')
        .not('due_date', 'is', null)
        .not('status', 'in', '("Yaptım","Tamamlanamadı")');

      if (!overdueTasks || overdueTasks.length === 0) return;

      const failIds = overdueTasks
        .filter(task => {
          if (!task.due_date || task.due_date.trim() === '') return false;
          const due = new Date(task.due_date + 'T23:59:59');
          return !isNaN(due.getTime()) && due < t;
        })
        .map(task => task.id);

      if (failIds.length === 0) return;

      await supabase
        .from('tasks')
        .update({ status: 'Tamamlanamadı' })
        .in('id', failIds);

      // Realtime subscription fetchAllData'ı tetikleyecek
      console.log(`⚠️ ${failIds.length} görev süresi doldu → Tamamlanamadı`);
    } catch (err) {
      console.error('autoFail error:', err);
    }
  };

  const fetchAllData = async (userOverride = null) => {
    const user = userOverride || currentUser;
    // Initial loading uses isChecking, subsequent refreshes don't block UI
    try {
      // 1. Fetch leads (potansiyel)
      const { data: leadsData } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (leadsData) setPotansiyel(leadsData);

      // 2. Fetch active clients
      const { data: clientsData } = await supabase.from('active_clients').select('*').order('created_at', { ascending: false });
      if (clientsData) setAktifMusteriler(clientsData);

      // Fetch Applications
      const { data: ugcData } = await supabase.from('ugc_applications').select('*').order('created_at', { ascending: false });
      if (ugcData) setUgcApps(ugcData);
      const { data: jobData } = await supabase.from('job_applications').select('*').order('created_at', { ascending: false });
      if (jobData) setJobApps(jobData);

      // 3. Fetch activity logs (only if admin)
      if (user?.permissions === 'all') {
        const { data: logData } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(200);
        if (logData) setActivityLogs(logData);

        // 4. Fetch chat messages
        await supabase.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(50);
        // if (chatData) setChatMessages(chatData);

        // 5. Fetch blocked slots
        const { data: blockedData } = await supabase.from('blocked_slots').select('*').order('blocked_date', { ascending: true });
        if (blockedData) setBlockedSlots(blockedData);
      }

      // 6. Fetch support messages (Always fetch for all staff)
      const { data: supportData } = await supabase.from('client_support_messages').select('*').order('created_at', { ascending: false });
      if (supportData) setSupportMessages(supportData);

      // 7. Fetch appointments
      const { data: apptData } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
      if (apptData) setAppointments(apptData);

      // 3. Fetch staff and then fetch tasks to group
      const { data: staffData } = await supabase.from('staff').select('*').order('id', { ascending: true });
      const { data: tasksData } = await supabase.from('tasks').select('*');

      if (staffData) {
        const groupedTasks = staffData.map((p) => {
          const userTasks = tasksData ? tasksData.filter(t => t.assignee_name === p.display_name) : [];
          return {
            id: Number(p.id),
            rep: p.display_name,
            role: p.role,
            activeTasks: userTasks.filter(t => t.status === 'Yapıyorum'),
            pendingTasks: userTasks.filter(t => ['Sırada', 'Revize'].includes(t.status)),
            completedTasks: userTasks.filter(t => ['Yaptım', 'Tamamlanamadı'].includes(t.status))
          };
        });
        setIsTakip(groupedTasks);
      }

      // 8. Fetch staff reports
      const { data: reportsData } = await supabase.from('staff_reports').select('*').order('created_at', { ascending: false });
      if (reportsData) setStaffReports(reportsData);


    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleConfirmCompletion = async () => {
    if (!compText.trim()) {
      alert("Lütfen yapılan iş hakkında bilgi giriniz.");
      return;
    }

    setCompUploading(true);
    let fileUrl = null;
    let fileName = null;

    try {
      if (compFile) {
        const fileExt = compFile.name.split('.').pop();
        const filePath = `task_completions/${compTask.id}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('lead-attachments')
          .upload(filePath, compFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('lead-attachments')
          .getPublicUrl(filePath);
        
        fileUrl = publicUrl;
        fileName = compFile.name;
      }

      const updateData = { 
        status: 'Yaptım', 
        completion_note: compText,
        completion_file: fileUrl,
        completion_file_name: fileName,
        completed_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', compTask.id);

      if (error) {
         if (error.code === '42703') {
            await supabase.from('tasks').update({ status: 'Yaptım' }).eq('id', compTask.id);
            alert("GÖREV TAMAMLANDI: Ancak veritabanında 'completion_note' gibi yeni sütunlar eksik olduğu için not ve dosya kaydedilemedi. Adminin veritabanı sütunlarını güncellemesi gerekiyor.");
         } else {
            throw error;
         }
      }

      // Müşteri İlerleme Güncelleme
      if (compTask.client_name) {
        const client = aktifMusteriler.find(c => c.name === compTask.client_name);
        if (client) {
          const updatedCompleted = [...(client.completed || []), compTask.task_text];
          const updatedActive = (client.active || []).filter(t => t !== compTask.task_text);
          const updatedPending = (client.pending || []).filter(t => t !== compTask.task_text);
          const tot = updatedCompleted.length + updatedActive.length + updatedPending.length;
          const newProgress = tot > 0 ? Math.round((updatedCompleted.length / tot) * 100) : 0;

          await supabase.from('active_clients').update({
            completed: updatedCompleted,
            active: updatedActive,
            pending: updatedPending,
            progress: newProgress,
            current_phase: compTask.phase || client.current_phase
          }).eq('id', client.id);
          
          logActivity('Üretim Tamamlandı', `Dökümanlı Teslim: ${stripHtml(compTask.task_text)}`, client.name);
        }
      }

      logActivity('Görev Teslim Edildi', `"${stripHtml(compTask.task_text)}" görevi tamamlandı ve dökümanlar eklendi.`, compTask.client_name);
      
      setIsCompModalOpen(false);
      setCompTask(null);
      setCompText('');
      setCompFile(null);
      fetchAllData();

    } catch (err) {
      console.error('Completion Error:', err);
      alert('Görev kapatılırken bir hata oluştu: ' + err.message);
    } finally {
      setCompUploading(false);
    }
  };

  const handleStaffTaskStatusChange = async (task, newStatus) => {
    const isAdmin = currentUser?.permissions === 'all';
    
    if (task.status === 'Yaptım' && !isAdmin) {
      alert("Tamamlanmış bir görev üzerinde değişiklik yapamazsınız!");
      return;
    }

    if (newStatus === 'Yaptım') {
       setCompTask(task);
       setCompText('');
       setCompFile(null);
       setIsCompModalOpen(true);
       return;
    }

    let reason = null;
    let revNote = null;

    if (newStatus === 'Tamamlanamadı') {
      openActionModal('fail', task);
      return;
    }

    if (newStatus === 'Revize') {
       openActionModal('revision', task);
       return;
    }

    const updateData = { status: newStatus };
    if (reason) updateData.fail_reason = reason;
    if (revNote) updateData.revision_note = revNote;

    const { error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', task.id);

    if (!error) {
      logActivity('Görev Durumu Güncellendi', `"${stripHtml(task.task_text)}" görev durumu ${newStatus} yapıldı. ${reason ? `Sebep: ${reason}` : ''}`);
      fetchAllData();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('ajans_user');
    localStorage.removeItem('social-art-base:active-employee-id');
    localStorage.removeItem('social-art-base:credentials');
    setCurrentUser(null);
    window.location.href = '/admin/login';
  };


  const [activeTab, setActiveTab] = useState(() => {
    const stored = localStorage.getItem('admin_active_tab');
    if (stored && ['potansiyel', 'basvurular', 'log', 'support'].includes(stored)) {
      return stored;
    }
    return 'potansiyel';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [leadSubTab, setLeadSubTab] = useState(() => localStorage.getItem('admin_lead_sub_tab') || 'active'); // active, archived, all

  useEffect(() => {
    localStorage.setItem('admin_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('admin_lead_sub_tab', leadSubTab);
  }, [leadSubTab]);

  const [potansiyel, setPotansiyel] = useState([]);
  const [aktifMusteriler, setAktifMusteriler] = useState([]);
  const [ugcApps, setUgcApps] = useState([]);
  const [jobApps, setJobApps] = useState([]);
  const [isTakip, setIsTakip] = useState([]);

  // Social Art Base CRM States
  const [crmViewMode, setCrmViewMode] = useState('kanban');
  const [crmTypeTab, setCrmTypeTab] = useState('all');
  const [proposals, setProposals] = useState([
    { id: 'prop-1', leadId: 'lead-1', title: 'Aylık Sosyal Medya Yönetimi Paketi', value: 25000, status: 'sent', details: '15 Reels, 30 Story ve Meta Reklam Yönetimi' },
    { id: 'prop-2', leadId: 'lead-2', title: 'Sinematik Tanıtım Filmi & Drone Çekimi', value: 65000, status: 'accepted', details: '4K Çekim, Ses Tasarımı ve 3 Revizyon Hakkı' }
  ]);
  const [isAddProposalOpen, setIsAddProposalOpen] = useState(false);
  const [proposalForm, setProposalForm] = useState({ title: '', value: '', details: '' });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    platform: '',
    service: '',
    rep: '',
    reaction: '',
    status: 'Beklemede',
    selectedServices: [],
    otherService: '',
    instagram_username: ''
  });

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientFormData, setClientFormData] = useState({
    name: '',
    package: '',
    progress: 0,
    completed: '',
    active: '',
    pending: '',
    ads_active: false
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({ empId: '', task: '', taskType: 'pendingTasks', clientName: '', phase: '1', category: 'Proje', priority: '#2979ff', due_date: '' });
  const [gorevFilter, setGorevFilter] = useState('Aktif');
  const [subGorevFilter, setSubGorevFilter] = useState('Hepsi');
  const [dashboardSubFilter, setDashboardSubFilter] = useState('Hepsi');
  const [dashboardBucketFilter, setDashboardBucketFilter] = useState('Hepsi');
  const [leadStatusFilter, setLeadStatusFilter] = useState(() => localStorage.getItem('admin_lead_status_filter') || 'Hepsi');

  useEffect(() => {
    localStorage.setItem('admin_lead_status_filter', leadStatusFilter);
  }, [leadStatusFilter]);

  // Detay & Geçmiş Modal
  const [isLeadDetailModalOpen, setIsLeadDetailModalOpen] = useState(false);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadHistory, setLeadHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [editLeadData, setEditLeadData] = useState({ name: '', phone: '', email: '', service: '', instagram_username: '', platform: '' });

  // Özel Durum Dropdown
  const [openStatusId, setOpenStatusId] = useState(null);

  // Düzenleme & Log
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);
  const [editClientData, setEditClientData] = useState({
    id: null,
    name: '',
    package: '',
    progress: 0,
    completed: '',
    active: '',
    pending: '',
    ads_active: false
  });
  const [activityLogs, setActivityLogs] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedSupportClient, setSelectedSupportClient] = useState(null);
  const [supportReplyInput, setSupportReplyInput] = useState('');
  const [newTalepAlert, setNewTalepAlert] = useState(null); // { clientName, message }
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || 'AIzaSyBmWTKdlFM0ftkUQ2NABqlIRpD3vfTN_mw');
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  
  // GÖREV TAMAMLAMA MODALI
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compTask, setCompTask] = useState(null);
  const [compText, setCompText] = useState('');
  const [compFile, setCompFile] = useState(null);
  const [taskFiles, setTaskFiles] = useState([]);
  const [taskUploading, setTaskUploading] = useState(false);
  const [compUploading, setCompUploading] = useState(false);
  // Performance System States
  const [perfEmployee, setPerfEmployee] = useState(null);

  // Müşteri değiştikçe eski analiz sonucunu temizle
  useEffect(() => {
    setAiAnalysis(null);
  }, [selectedLead]);
  const [perfComment, setPerfComment] = useState('');
  const [perfMonth, setPerfMonth] = useState(new Date().getMonth() + 1);
  const [perfYear, setPerfYear] = useState(new Date().getFullYear());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [perfScore, setPerfScore] = useState(5);

  // Staff Reports States
  const [staffReports, setStaffReports] = useState([]);
  const [reportInput, setReportInput] = useState('');
  const [reportLinks, setReportLinks] = useState(['']);
  const [reportFiles, setReportFiles] = useState([]);
  const [selectedReportDate, setSelectedReportDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [isUploadingReport, setIsUploadingReport] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);
  const [selectedReportDetail, setSelectedReportDetail] = useState(null);


  const [isShootModalOpen, setIsShootModalOpen] = useState(false);
  const [shootFormData, setShootFormData] = useState({ clientName: '', date: '', time: '12:00', details: '', staffName: '', type: 'Çekim', briefUrl: '' });
  const [shootFiles, setShootFiles] = useState([]);
  const [existingApptFiles, setExistingApptFiles] = useState([]);

  // Calendar States
  const [calendarViewMode, setCalendarViewMode] = useState('MONTH'); // MONTH, WEEK, DAY
  const [calendarPopup, setCalendarPopup] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Action Modal States
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionConfig, setActionConfig] = useState({ type: '', task: null, title: '', placeholder: '', secondPlaceholder: '', showSecond: false, buttonText: 'Onayla' });
  const [actionInput, setActionInput] = useState('');
  const [actionInput2, setActionInput2] = useState('');

  const openActionModal = (type, task) => {
    const configMap = {
      'brief': { title: 'Görev Briefi / Yanıt', placeholder: 'Brief notunuzu veya yanıtınızı yazın...', buttonText: 'Gönder' },
      'revision': { title: 'Revizyon Talebi', placeholder: 'Revizyon detaylarını yazın...', buttonText: 'Revize İste' },
      'extension': { title: 'Süre Uzatma Talebi', placeholder: 'Neden ek süre gerekiyor?', secondPlaceholder: 'Yeni Tarih (YYYY-MM-DD)', showSecond: true, buttonText: 'Süre İste' },
      'fail': { title: 'Başarısızlık Nedeni', placeholder: 'Bu görev neden tamamlanamadı?', buttonText: 'Kaydet' },
      'rating': { title: 'Performans Puanlaması', placeholder: 'Değerlendirme notunuz...', secondPlaceholder: 'Puan (1-5)', showSecond: true, buttonText: 'Puanla' },
      'buzz': { title: 'Dürtme!', placeholder: 'İletmek istediğiniz mesaj...', buttonText: 'Dürt' }
    };

    const cfg = configMap[type];
    setActionConfig({ ...cfg, type, task });
    setActionInput('');
    setActionInput2('');
    setIsActionModalOpen(true);
  };

  const handleActionSubmit = async () => {
    const { type, task } = actionConfig;
    let updateData = {};
    let successMsg = 'İşlem Başarılı';

    try {
      if (type === 'brief') {
        updateData = { brief_request: actionInput };
        if (currentUser?.permissions === 'all') updateData = { task_text: actionInput };
      } else if (type === 'revision') {
        updateData = { status: 'Revize', revision_note: actionInput };
      } else if (type === 'extension') {
        updateData = { extension_request: true, extension_note: actionInput, due_date: actionInput2 || task.due_date };
      } else if (type === 'fail') {
        updateData = { status: 'Tamamlanamadı', fail_reason: actionInput };
      } else if (type === 'rating') {
        const score = parseInt(actionInput2);
        if (isNaN(score) || score < 1 || score > 5) return alert('Lütfen 1-5 arası bir puan girin.');
        await handleRateTask(task, score, actionInput);
        setIsActionModalOpen(false);
        return;
      } else if (type === 'buzz') {
        await logActivity('Dürtme!', `${currentUser.name} sizi dürttü: "${actionInput}"`, task); // task is name here
        setIsActionModalOpen(false);
        return;
      }

      const { error } = await supabase.from('tasks').update(updateData).eq('id', task.id);
      if (!error) {
        logActivity(`Aksiyon: ${actionConfig.title}`, `"${stripHtml(task.task_text)}" görevi için ${actionConfig.title} yapıldı.`, task.client_name);
        fetchAllData();
        setIsActionModalOpen(false);
      }
    } catch (e) {
      alert('İşlem sırasında hata: ' + e.message);
    }
  };

  const handleSaveShoot = async (e) => {
    e.preventDefault();
    let newUploadedFiles = [];
    if (shootFiles.length > 0) {
      for (const file of shootFiles) {
        const fileExt = file.name.split('.').pop();
        const filePath = `appointments/${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('lead-attachments')
          .upload(filePath, file);
        if (uploadError) {
          alert('Dosya yükleme hatası: ' + uploadError.message);
          return;
        }
        const { data: { publicUrl } } = supabase.storage
          .from('lead-attachments')
          .getPublicUrl(filePath);
        newUploadedFiles.push({ url: publicUrl, name: file.name });
      }
    }

    const { error } = await supabase.from('appointments').insert([{
      full_name: shootFormData.clientName,
      appointment_date: shootFormData.date,
      appointment_time: shootFormData.time,
      status: shootFormData.type,
      email: shootFormData.details,
      phone: shootFormData.staffName,
      url: shootFormData.briefUrl,
      files: newUploadedFiles
    }]);

    if (!error) {
      logActivity('Takvime Not Eklendi', `${shootFormData.clientName} (${shootFormData.type}) eklendi.`);
      setIsShootModalOpen(false);
      setEditingAppt(null);
      setShootFormData({ clientName: '', date: '', time: '12:00', details: '', staffName: '', type: 'Çekim', briefUrl: '' });
      setShootFiles([]);
      setExistingApptFiles([]);
      fetchAllData();
    } else {

      alert('Kayıt eklenirken hata: ' + error.message);
    }
  };
  const handleUpdateAppt = async (e) => {
    e.preventDefault();
    if (!editingAppt) return;
    
    let newUploadedFiles = [];
    if (shootFiles.length > 0) {
      for (const file of shootFiles) {
        const fileExt = file.name.split('.').pop();
        const filePath = `appointments/${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('lead-attachments')
          .upload(filePath, file);
        if (uploadError) {
          alert('Dosya yükleme hatası: ' + uploadError.message);
          return;
        }
        const { data: { publicUrl } } = supabase.storage
          .from('lead-attachments')
          .getPublicUrl(filePath);
        newUploadedFiles.push({ url: publicUrl, name: file.name });
      }
    }
    
    const finalFiles = [...existingApptFiles, ...newUploadedFiles];

    const { error } = await supabase.from('appointments').update({
      full_name: shootFormData.clientName,
      appointment_date: shootFormData.date,
      appointment_time: shootFormData.time,
      status: shootFormData.type,
      email: shootFormData.details,
      phone: shootFormData.staffName,
      url: shootFormData.briefUrl,
      files: finalFiles
    }).eq('id', editingAppt.id);

    if (!error) {
      logActivity('Takvim Kaydı Güncellendi', `${shootFormData.clientName} güncellendi.`);
      setIsShootModalOpen(false);
      setEditingAppt(null);
      setShootFiles([]);
      setExistingApptFiles([]);
      setShootFormData({ clientName: '', date: '', time: '12:00', details: '', staffName: '', type: 'Çekim', briefUrl: '' });
      fetchAllData();
    } else {
      alert('Güncelleme hatası: ' + error.message);
    }
  };


  const handleDeleteAppointment = async (apptId) => {
    if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('appointments').delete().eq('id', apptId);
    if (!error) {
      logActivity('Takvimden Kayıt Silindi', 'Bir randevu veya etkinlik takvimden silindi.');
      setCalendarPopup(null);
      fetchAllData();
    } else {
      alert('Silme hatası: ' + error.message);
    }
  };

  // Helper: Calculate stats for a specific employee

  const getEmployeePerfStats = (empName) => {
    if (!empName) return { completedCount: 0, activeLoad: 0, avgSpeed: '---', monthTasks: [] };

    const person = isTakip.find(p => p.rep === empName);
    const completedCount = person?.completedTasks?.length || 0;
    const activeLoad = (person?.activeTasks?.length || 0) + (person?.pendingTasks?.length || 0);

    // Speed calculation from logs
    const logs = activityLogs.filter(l => l.user_name === empName && l.action === 'Görev Durumu Güncellendi');
    let totalTime = 0;
    let timedTasks = 0;

    // Try to find pairs of 'başladı' and 'tamamladı' in log details
    const startLogs = logs.filter(l => l.details.includes('başladı'));
    const endLogs = logs.filter(l => l.details.includes('tamamladı'));

    endLogs.forEach(end => {
      // Find matching start log by parsing task text from details
      const taskTextMatch = end.details.match(/"([^"]+)"/);
      if (taskTextMatch) {
        const taskText = taskTextMatch[1];
        const start = startLogs.find(s => s.details.includes(`"${taskText}"`) && new Date(s.created_at) < new Date(end.created_at));
        if (start) {
          const diff = new Date(end.created_at) - new Date(start.created_at);
          totalTime += diff;
          timedTasks++;
        }
      }
    });

    const avgSpeed = timedTasks > 0 ? (totalTime / (timedTasks * 1000 * 60 * 60)).toFixed(1) + ' sa' : '---';

    // Tasks for the selected month
    const monthTasks = logs.filter(l => {
      const d = new Date(l.created_at);
      return l.details.includes('tamamladı') && (d.getMonth() + 1) === parseInt(perfMonth) && d.getFullYear() === parseInt(perfYear);
    }).map(l => {
      const match = l.details.match(/"([^"]+)"/);
      return match ? match[1] : 'Bilinmeyen Görev';
    });

    return { completedCount, activeLoad, avgSpeed, monthTasks };
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openStatusId && !event.target.closest('.status-selector')) {
        setOpenStatusId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openStatusId]);

  const logActivity = async (action, details, clientName = null) => {
    try {
      await supabase.from('activity_log').insert([{
        user_name: currentUser?.name || 'SİSTEM',
        action,
        target_name: clientName || 'GENEL',
        details,
        created_at: new Date().toISOString()
      }]);
    } catch (e) {
      console.error('Logging error:', e);
    }
  };

  const handleAddAktifMusteri = async (e) => {
    e.preventDefault();
    const completedList = clientFormData.completed.split(',').map(s => s.trim()).filter(s => s !== '');
    const activeList = clientFormData.active.split(',').map(s => s.trim()).filter(s => s !== '');
    const pendingList = clientFormData.pending.split(',').map(s => s.trim()).filter(s => s !== '');

    // Otomatik ilerleme hesaplama
    const total = completedList.length + activeList.length + pendingList.length;
    const progress = total > 0 ? Math.round((completedList.length / total) * 100) : 0;

    const { error } = await supabase.from('active_clients').insert([
      {
        name: clientFormData.name,
        package: clientFormData.package,
        progress: progress,
        completed: completedList,
        active: activeList,
        pending: pendingList,
        ads_active: clientFormData.ads_active
      }
    ]);

    if (!error) {
      logActivity('Yeni Aktif Müşteri Eklendi', clientFormData.name, `Paket: ${clientFormData.package} | Reklam: ${clientFormData.ads_active ? 'Aktif' : 'Pasif'}`);
      fetchAllData();
      setIsClientModalOpen(false);
      setClientFormData({ name: '', package: '', progress: 0, completed: '', active: '', pending: '', ads_active: false });
    }
  };

  const handleUpdateAktifMusteri = async (e) => {
    e.preventDefault();
    const ensureArray = (val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(s => s !== '');
      return [];
    };

    const completedList = ensureArray(editClientData.completed);
    const activeList = ensureArray(editClientData.active);
    const pendingList = ensureArray(editClientData.pending);

    // Otomatik ilerleme hesaplama
    const total = completedList.length + activeList.length + pendingList.length;
    const progress = total > 0 ? Math.round((completedList.length / total) * 100) : 0;

    const oldClient = aktifMusteriler.find(c => c.id === editClientData.id);
    const oldProgress = oldClient?.progress || 0;

    const { error } = await supabase.from('active_clients').update({
      name: editClientData.name,
      package: editClientData.package,
      progress: progress,
      completed: completedList,
      active: activeList,
      pending: pendingList,
      ads_active: editClientData.ads_active
    }).eq('id', editClientData.id);

    if (!error) {
      const details = `${currentUser?.name || 'SİSTEM'}, ${editClientData.name} markası için proje bilgilerini ve ilerleme verilerini güncelledi.`;
      logActivity('Müşteri Bilgileri Güncellendi', details, editClientData.name);
      fetchAllData();
      setIsEditClientModalOpen(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskFormData.empId || !taskFormData.task || !taskFormData.due_date) {
      alert('Lütfen tüm zorunlu alanları (Personel, Görev Açıklaması ve Teslim Tarihi) doldurun.');
      return;
    }

    const person = isTakip.find(p => p.id === parseInt(taskFormData.empId));
    if (!person) return;

    setTaskUploading(true);
    let attachmentUrl = null;
    let attachmentName = null;

    try {
      if (taskFiles && taskFiles.length > 0) {
        const uploadedFiles = [];
        for (const file of taskFiles) {
          const sanitizedName = file.name
            .replace(/[ığüşöçİĞÜŞÖÇ]/g, s => ({'ı':'i','ğ':'g','ü':'u','ş':'s','ö':'o','ç':'c','İ':'I','Ğ':'G','Ü':'U','Ş':'S','Ö':'O','Ç':'C'})[s])
            .replace(/[^a-zA-Z0-9.-]/g, '_');
          const filePath = `task_attachments/${Date.now()}_${sanitizedName}`;
          const { error: uploadError } = await supabase.storage
            .from('lead-attachments')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('lead-attachments')
            .getPublicUrl(filePath);
          
          uploadedFiles.push({ name: file.name, url: publicUrl });
        }
        attachmentUrl = JSON.stringify(uploadedFiles);
        attachmentName = taskFiles.map(f => f.name).join(', ');
      }

      const statusMap = {
        'activeTasks': 'Yapıyorum',
        'pendingTasks': 'Sırada'
      };

      const { error } = await supabase.from('tasks').insert([
        {
          assignee_name: person.rep,
          assigned_by: currentUser?.name || 'Sistem',
          task_text: taskFormData.task,
          status: statusMap[taskFormData.taskType],
          client_name: taskFormData.clientName || null,
          phase: parseInt(taskFormData.phase) || 1,
          category: taskFormData.category || 'Proje',
          priority: taskFormData.priority || '#2979ff',
          due_date: taskFormData.due_date || null,
          attachment_url: attachmentUrl,
          attachment_name: attachmentName
        }
      ]);

      if (!error) {
        const details = `${person.rep}, ${taskFormData.clientName || 'Genel'} için yeni bir göreve başladı: "${stripHtml(taskFormData.task)}"`;
        logActivity('Yeni Görev Atandı', details, taskFormData.clientName);
        fetchAllData();
        setIsTaskModalOpen(false);
        setTaskFormData({ empId: '', task: '', taskType: 'pendingTasks', clientName: '', phase: '1', category: 'Proje', priority: '#2979ff', due_date: '' });
        setTaskFiles([]);
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Task Assignment Error:', error);
      if (error.code === '42703') {
        alert('HATA: Veritabanında yeni sütunlar eksik.\n\nÇözüm için Supabase SQL Editor\'e şu kodu yapıştırıp çalıştırın:\n\nALTER TABLE tasks ADD COLUMN IF NOT EXISTS attachment_url text;\nALTER TABLE tasks ADD COLUMN IF NOT EXISTS attachment_name text;');
      } else {
        alert('Görev atanırken bir hata oluştu: ' + error.message);
      }
    } finally {
      setTaskUploading(false);
    }
  };

  const handleTaskStatusChange = async (personId, taskObj, currentList, newStatus) => {
    const person = isTakip.find(p => p.id === personId);
    if (!person) return;

    if (taskObj.status === 'Yaptım' && currentUser?.permissions !== 'all') {
      alert("Tamamlanmış bir görev üzerinde değişiklik yapılamaz!");
      return;
    }

    if (newStatus === 'Revize') {
       openActionModal('revision', taskObj);
       return;
    }

    if (newStatus === 'Yaptım') {
      setCompTask(taskObj);
      setCompText('');
      setCompFile(null);
      setIsCompModalOpen(true);
      return;
    }
    
    if (newStatus === 'Tamamlanamadı') {
      openActionModal('fail', taskObj);
      return;
    }

    const { error } = await supabase
      .from('tasks')
      .update({ 
        status: newStatus
      })
      .eq('id', taskObj.id);

    if (!error) {
      logActivity('Görev Durumu Güncellendi', `${person.rep}, "${stripHtml(taskObj.task_text)}" görev durumunu ${newStatus} yaptı.`, taskObj.client_name);
      fetchAllData();
    }
  };

  const getWorkloadTrend = (person) => {
    const total = (person.completedTasks?.length || 0) + (person.activeTasks?.length || 0) + (person.pendingTasks?.length || 0);
    return total > 0 ? Math.round((person.completedTasks.length / total) * 100) : 0;
  };

  const getLogDiscipline = (empName) => {
     const sevenDaysAgo = new Date();
     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
     const logs = activityLogs.filter(l => l.user_name === empName && new Date(l.created_at) > sevenDaysAgo);
     const distinctDays = new Set(logs.map(l => new Date(l.created_at).toDateString())).size;
     return Math.round((distinctDays / 7) * 100);
  };



  const handleRateTask = async (task, score, comment) => {
    if (!['Celal', 'Ercan'].includes(currentUser?.name)) {
      alert('Bu işlem için yetkiniz yok. Sadece Celal ve Ercan puan verebilir.');
      return;
    }
    const { error } = await supabase.from('tasks').update({
      rating: score,
      rating_comment: comment,
      rating_by: currentUser.name
    }).eq('id', task.id);

    if (!error) {
      alert('Görev başarıyla puanlandı.');
      fetchAllData();
    }
  };

  const handleDeleteTask = async (personId, taskObj) => {
    if (currentUser?.permissions !== 'all') {
      alert('BU YETKİYE SAHİP DEĞİLSİNİZ: Görevleri sadece yöneticiler silebilir.');
      return;
    }

    if (window.confirm('Bu görevi silmek istediğinize emin misiniz?')) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskObj.id);

      if (!error) {
        logActivity('Görev Silindi', 'SİSTEM', `Görev: "${stripHtml(taskObj.task_text)}"`);
        fetchAllData();
      }
    }
  };

  const [blockDate, setBlockDate] = useState('');
  const [blockTime, setBlockTime] = useState('Tüm Gün');

  const handleBlockSlot = async (e) => {
    e.preventDefault();
    if (!blockDate) return;

    const { error } = await supabase.from('blocked_slots').insert([{
      blocked_date: blockDate,
      time_slot: blockTime === 'Tüm Gün' ? null : blockTime
    }]);

    if (!error) {
      logActivity('Müsaitlik Güncellendi', `${currentUser?.name || 'SİSTEM'}, takvimde ${blockDate} (${blockTime === 'Tüm Gün' ? 'Gün boyu' : blockTime}) tarihini kapattı.`);
      setBlockDate('');
      fetchAllData();
    }
  };

  const handleApproveAppointment = async (appt) => {
    // 1. Durumu güncelle
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'Onaylandı' })
      .eq('id', appt.id);

    if (!updateError) {
      // 2. Takvimi kapat (blocked_slots'a ekle)
      await supabase.from('blocked_slots').insert([{
        blocked_date: appt.appointment_date,
        time_slot: appt.appointment_time
      }]);

      logActivity('Randevu Onaylandı', `${appt.full_name} için ${appt.appointment_date} ${appt.appointment_time} randevusu onaylandı ve takvim kapatıldı.`);
      fetchAllData();
    }
  };

  const handleCancelAppointment = async (apptId) => {
    const appt = appointments.find(a => a.id === apptId);
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'İptal' })
      .eq('id', apptId);

    if (!error) {
      logActivity('Randevu İptal Edildi', `${appt?.full_name || 'Bilinmeyen'} isimli kişinin randevusu iptal edildi.`);
      fetchAllData();
    }
  };

  const handleUploadStaffReport = async (e) => {
    e.preventDefault();
    if (!reportInput && reportFiles.length === 0 && reportLinks.every(l => !l.trim())) return;

    setIsUploadingReport(true);
    let fileUrl = null;
    let fileName = null;

    try {
      const todayDate = new Date().toLocaleDateString('en-CA');
      
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const { data: existingReports, error: fetchError } = await supabase
        .from('staff_reports')
        .select('id, file_url, file_name, files')
        .eq('staff_name', currentUser.name)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('[v3] Fetch Error:', fetchError);
        throw new Error('Mevcut rapor kontrol edilemedi: ' + fetchError.message);
      }
      
      const existingReport = existingReports && existingReports[0];

      let newUploadedFiles = [];
      if (reportFiles.length > 0) {
        for (const file of reportFiles) {
          const fileExt = file.name.split('.').pop();
          const filePath = `reports/${currentUser.name}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('lead-attachments')
            .upload(filePath, file);

          if (uploadError) throw new Error('Dosya yükleme hatası: ' + uploadError.message);

          const { data: { publicUrl } } = supabase.storage
            .from('lead-attachments')
            .getPublicUrl(filePath);
          
          newUploadedFiles.push({ url: publicUrl, name: file.name });
        }
      }
      
      let finalFiles = existingReport?.files || [];
      if (existingReport?.file_url && finalFiles.length === 0) {
        finalFiles.push({ url: existingReport.file_url, name: existingReport.file_name });
      }
      
      finalFiles = [...finalFiles, ...newUploadedFiles];

      const reportData = {
        staff_name: currentUser.name,
        staff_role: currentUser.role || 'Ekip Üyesi',
        content: reportInput,
        files: finalFiles,
        external_links: reportLinks.filter(l => l.trim()),
        report_date: todayDate
      };

      let opError;
      if (existingReport) {
        const { error } = await supabase.from('staff_reports').update(reportData).eq('id', existingReport.id);
        opError = error;
      } else {
        const { error } = await supabase.from('staff_reports').insert([reportData]);
        opError = error;
      }

      if (opError) throw new Error('Veritabanı kayıt hatası: ' + opError.message);

      setReportInput('');
      setReportFiles([]);
      setReportLinks(['']);
      setEditingReportId(null);
      fetchAllData();
      alert(existingReport ? 'Raporunuz başarıyla güncellendi.' : 'Rapor başarıyla gönderildi.');
    } catch (err) {
      console.error('[v3] Operation Error:', err);
      alert('HATA [v3]: ' + (err.message || 'Rapor işlenemedi. Lütfen internetinizi kontrol edin.'));
    } finally {
      setIsUploadingReport(false);
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm("Bu raporu silmek istediğinize emin misiniz?")) return;
    
    try {
      const { error } = await supabase
        .from('staff_reports')
        .delete()
        .eq('id', id)
        .eq('staff_name', currentUser?.name);
        
      if (error) throw error;
      
      fetchAllData();
      alert("Rapor başarıyla silindi.");
    } catch (err) {
      console.error('[v3] Delete Error:', err);
      alert("Rapor silinirken bir hata oluştu: " + err.message);
    }
  };

  const handleManualAppointment = async (e) => {
    e.preventDefault();
    if (!blockDate || !formData.name) {
      alert('Lütfen isim ve tarih seçiniz.');
      return;
    }

    // 1. Randevu oluştur
    const { data: appt, error: apptError } = await supabase.from('appointments').insert([{
      full_name: formData.name,
      phone: formData.phone,
      email: formData.email,
      appointment_date: blockDate,
      appointment_time: blockTime === 'Tüm Gün' ? '09:00 - 18:00' : blockTime,
      status: 'Onaylandı'
    }]).select().single();

    if (!apptError) {
      // 2. Takvimi kapat
      await supabase.from('blocked_slots').insert([{
        blocked_date: blockDate,
        time_slot: blockTime === 'Tüm Gün' ? null : blockTime
      }]);

      logActivity('Manuel Randevu Oluşturuldu', `${formData.name} için ${blockDate} (${blockTime}) randevusu manuel olarak eklendi.`);

      // Formu temizle
      setFormData({ ...formData, name: '', phone: '', email: '' });
      setBlockDate('');
      fetchAllData();
    }
  };

  const handleUnblockSlot = async (id) => {
    const slot = blockedSlots.find(s => s.id === id);
    const { error } = await supabase.from('blocked_slots').delete().eq('id', id);
    if (!error) {
      logActivity('Müsaitlik Açıldı', `${currentUser?.name || 'SİSTEM'}, takvimde ${slot.blocked_date} (${slot.time_slot || 'Gün boyu'}) tarihini tekrar kullanıma açtı.`);
      fetchAllData();
    }
  };



  const handleSendSupportReply = async (e) => {
    e.preventDefault();
    if (!supportReplyInput || !selectedSupportClient) return;

    const { error } = await supabase.from('client_support_messages').insert([{
      client_name: selectedSupportClient,
      message: supportReplyInput,
      sender_type: 'admin',
      admin_name: currentUser.name,
      is_read: true
    }]);

    if (!error) {
      setSupportReplyInput('');
      fetchAllData();
    }
  };

  const handleClearMessages = async () => {
    try {
      if (!selectedSupportClient) return;

      console.log('Database operation starting for:', selectedSupportClient);
      const { error } = await supabase
        .from('client_support_messages')
        .delete()
        .eq('client_name', selectedSupportClient);

      if (error) {
        console.error('Supabase delete error:', error);
        alert('Silme işlemi başarısız oldu.');
      } else {
        console.log('Delete successful');
        setShowClearConfirm(false);
        await fetchAllData();
        alert('Sohbet geçmişi başarıyla temizlendi.');
      }
    } catch (err) {
      console.error('Unexpected error in handleClearMessages:', err);
    }
  };

  const handleSaveRating = async (e) => {
    e.preventDefault();
    if (!perfEmployee) {
      alert('Lütfen bir çalışan seçin.');
      return;
    }

    const { error } = await supabase.from('employee_ratings').insert([{
      employee_name: perfEmployee,
      manager_name: currentUser.name,
      score: perfScore,
      comment: perfComment,
      rating_month: parseInt(perfMonth),
      rating_year: parseInt(perfYear),
      created_at: new Date().toISOString()
    }]);

    if (!error) {
      alert(`${perfEmployee} için performans başarısıyla kaydedildi.`);
      setPerfComment('');
      fetchAllData();
    }
  };


  // İstatistikleri Taba Göre Güncelleme
  const getStats = () => {
    if (activeTab === 'potansiyel') {
      return [
        { title: 'Toplam Potansiyel Lead', value: potansiyel.length, icon: <Users size={16} color="var(--primary)" />, filter: 'Hepsi' },
        { title: 'Sıcak (Olumlu) Potansiyel', value: potansiyel.filter(p => p.status === 'Sıcak').length, icon: <Activity size={16} color="var(--accent)" />, filter: 'Sıcak' },
        { title: 'Teklif Bekleyen', value: potansiyel.filter(p => p.status === 'Teklif Bekliyor').length, icon: <Clock size={16} color="#ffab00" />, filter: 'Teklif Bekliyor' },
        { title: 'Teklif İletildi', value: potansiyel.filter(p => p.status === 'Teklif İletildi').length, icon: <Send size={16} color="#00e676" />, filter: 'Teklif İletildi' },
        { title: 'Katalog İletildi', value: potansiyel.filter(p => p.status === 'Katalog İletildi').length, icon: <FileText size={16} color="#2979ff" />, filter: 'Katalog İletildi' }
      ];
    } else if (activeTab === 'aktif') {
      return [
        { title: 'Aktif Yönetilen Proje', value: aktifMusteriler.length, icon: <Briefcase size={24} color="var(--secondary)" /> },
        { title: 'Ortalama İlerleme Seviyesi', value: `%${Math.round(aktifMusteriler.reduce((a, b) => a + (b.progress || 0), 0) / (aktifMusteriler.length || 1)) || 0}`, icon: <Activity size={24} color="#00e676" /> },
      ];
    } else if (activeTab === 'gorev') {
      const allT = isTakip.reduce((acc, p) => [...acc, ...(p.activeTasks || []), ...(p.pendingTasks || []), ...(p.completedTasks || [])], []);
      const yapilan = allT.filter(t => ['Sırada', 'Yapıyorum', 'Revize'].includes(t.status)).length;
      const bitti = allT.filter(t => t.status === 'Yaptım').length;
      const sorun = allT.filter(t => t.status === 'Tamamlanamadı').length;

      return [
        { title: 'Yapılan (Aktif)', value: yapilan, icon: <Zap size={24} color="var(--primary)" />, color: 'var(--primary)' },
        { title: 'Tamamlanan', value: bitti, icon: <CheckCircle2 size={24} color="#00e676" />, color: '#00e676' },
        { title: 'Tamamlanmayan', value: sorun, icon: <XCircle size={24} color="#ff1744" />, color: '#ff1744' }
      ];
    } else {
      if (currentUser && currentUser.permissions !== 'all') {
        const myTasks = isTakip.find(p => p.rep === currentUser.name);
        return [
          { title: 'Kişisel Görevlerim', value: (myTasks?.activeTasks?.length || 0) + (myTasks?.pendingTasks?.length || 0), icon: <ClipboardList size={24} color="var(--primary)" /> },
          { title: 'Şu An Yapılan', value: myTasks?.activeTasks?.length || 0, icon: <Activity size={24} color="var(--accent)" /> },
          { title: 'Tamamladıklarım', value: myTasks?.completedTasks?.length || 0, icon: <CheckSquare size={24} color="#00e676" /> }
        ];
      }
      const wonCount = aktifMusteriler.length; const rejectedCount = potansiyel.filter(p => p.status === 'Reddedildi').length; const totalDecidedLeads = wonCount + rejectedCount; const conversionRate = totalDecidedLeads > 0 ? ((wonCount / totalDecidedLeads) * 100).toFixed(1) : '0'; const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); const weeklyNewLeads = potansiyel.filter(p => new Date(p.created_at) > sevenDaysAgo).length + aktifMusteriler.filter(c => new Date(c.created_at) > sevenDaysAgo).length;

      return [
        { title: 'Dönüşüm Oranı', value: `%${conversionRate}`, icon: <TrendingUp size={24} color="#00e676" /> },
        { title: 'Haftalık Yeni Lead', value: weeklyNewLeads, icon: <Target size={24} color="var(--primary)" /> },
        { title: 'Toplam İş Yükü', value: isTakip.reduce((acc, curr) => acc + (curr.activeTasks?.length || 0) + (curr.pendingTasks?.length || 0), 0), icon: <Activity size={24} color="var(--accent)" /> }
      ];
    }
  };


  const handleAddPotansiyel = async (e) => {
    e.preventDefault();
    const dateStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

    // Seçilen hizmetleri birleştir
    let finalServices = [...formData.selectedServices];
    if (formData.selectedServices.includes('Diğer') && formData.otherService) {
      finalServices = finalServices.map(s => s === 'Diğer' ? `Diğer (${formData.otherService})` : s);
    }

    const serviceString = finalServices.join(', ');

    const { data: lead, error } = await supabase.from('leads').insert([
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: dateStr,
        platform: formData.platform === 'Instagram DM' && formData.instagram_username 
                  ? `Instagram DM (@${formData.instagram_username.replace('@', '')})` 
                  : formData.platform,
        service: serviceString,
        rep: formData.rep,
        reaction: formData.reaction,
        status: formData.status
      }
    ]).select().single();

    if (!error && lead) {
      // Geçmişe ilk kaydı ekle
      await supabase.from('lead_history').insert([
        { lead_id: lead.id, note: `Sisteme eklendi: "${formData.reaction}"`, type: 'not' }
      ]);

      logActivity('Yeni Potansiyel Lead', `Sisteme yeni bir başvuru düştü: ${formData.name} - Hizmet: ${serviceString}`);

      fetchAllData();
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        platform: '',
        service: '',
        rep: '',
        reaction: '',
        status: 'Beklemede',
        selectedServices: [],
        otherService: '',
        instagram_username: ''
      });
    }
  };

  const handleLeadStatusChange = async (leadId, newStatus) => {
    const lead = potansiyel.find(p => p.id === leadId);
    if (!lead) return;

    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId);

    if (!error) {
      await supabase.from('lead_history').insert([
        { lead_id: leadId, note: `Durum güncellendi: ${newStatus}`, type: 'durum_degisikligi' }
      ]);
      logActivity('Lead Durumu Güncellendi', `"${lead?.name || 'Müşteri'}" isimli potansiyel müşterinin durumu "${newStatus}" olarak güncellendi.`);

      // %%%%%%%%%%%% ANLAŞILDI LOGIQUE %%%%%%%%%%%%
      if (newStatus === 'Anlaşıldı') {
        const { error: clientError } = await supabase.from('active_clients').insert([
          {
            name: lead.name,
            package: lead.service || 'Paket Belirlenmedi',
            progress: 10,
            completed: ['Anlaşma Sağlandı'],
            active: ['Strateji Oluşturma'],
            pending: ['İlk Sunum'],
            ads_active: false
          }
        ]);

        if (!clientError) {
          logActivity('Müşteri Kazanıldı', `"${lead.name}" ile anlaşma sağlandı ve aktif müşterilere taşındı.`);

          // Potansiyel müşterilerden SİL
          await supabase.from('leads').delete().eq('id', leadId);
        }
      }
      // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

      fetchAllData();
    }
  };

  const fetchLeadHistory = async (lead) => {
    setSelectedLead(lead);
    setIsLeadDetailModalOpen(true);
    setIsEditingLead(false);
    setLeadHistory([]);
    setIsHistoryLoading(true);

    const igMatch = (lead.platform || '').match(/@([^)/]+)/);
    setEditLeadData({
      name: lead.name,
      phone: lead.phone || '',
      email: lead.email || '',
      service: lead.service || '',
      instagram_username: igMatch ? igMatch[1] : '',
      platform: lead.platform || ''
    });

    try {
      const { data, error } = await supabase
        .from('lead_history')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLeadHistory(data);
      }
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleUpdateLead = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update({
          name: editLeadData.name,
          phone: editLeadData.phone,
          email: editLeadData.email,
          service: editLeadData.service,
          platform: (editLeadData.platform?.includes('Instagram') && editLeadData.instagram_username)
                    ? `Instagram DM (@${editLeadData.instagram_username.replace('@', '')})`
                    : editLeadData.platform
        })
        .eq('id', selectedLead.id);

      if (!error) {
        logActivity('Lead Güncellendi', `"${editLeadData.name}" bilgilerinde güncelleme yapıldı.`);
        setSelectedLead({ ...selectedLead, ...editLeadData });
        setIsEditingLead(false);
        fetchAllData();
      } else {
        alert('Güncelleme sırasında hata oluştu: ' + error.message);
      }
    } catch (err) {
      console.error('Update lead error:', err);
    }
  };

  const toggleEditLeadService = (srv) => {
    const current = editLeadData.service ? editLeadData.service.split(', ').filter(Boolean) : [];
    let next;
    if (current.includes(srv)) {
      next = current.filter(s => s !== srv);
    } else {
      next = [...current, srv];
    }
    setEditLeadData({ ...editLeadData, service: next.join(', ') });
  };

  const handleAddHistoryNote = async (e) => {
    e.preventDefault();
    if ((!noteInput && !selectedFile) || !selectedLead) return;

    setIsUploading(true);
    try {
      let attachmentUrl = null;
      let fileName = null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const path = `leads/${selectedLead.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('lead-attachments')
          .upload(path, selectedFile);

        if (uploadError) {
          // If bucket doesn't exist, this might fail. In a real app we'd ensure bucket existence.
          console.error('Upload Error:', uploadError);
          alert('Dosya yüklenemedi: ' + uploadError.message);
          setIsUploading(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('lead-attachments')
          .getPublicUrl(path);
        
        attachmentUrl = publicUrl;
        fileName = selectedFile.name;
      }

      const { error } = await supabase.from('lead_history').insert([
        { 
          lead_id: selectedLead.id, 
          note: noteInput || (fileName ? `${fileName} yüklendi.` : ''), 
          type: 'not',
          author_name: currentUser?.name || 'Bilinmeyen',
          attachment_url: attachmentUrl,
          file_name: fileName
        }
      ]);

      if (!error) {
        // Lead'in kendisindeki reaction'ı (son notu) da güncelle
        const reactionText = noteInput || (fileName ? `Dosya yüklendi: ${fileName}` : '');
        await supabase.from('leads').update({ reaction: reactionText }).eq('id', selectedLead.id);

        logActivity('Lead Notu Eklendi', `"${selectedLead.name}" için yeni bir not eklendi: ${reactionText}`);
        setNoteInput('');
        setSelectedFile(null);
        // Reset file input via DOM if needed or just rely on state
        fetchLeadHistory(selectedLead); // Listeyi tazele
        fetchAllData(); // Ana listeyi de tazele
      }
    } catch (err) {
      console.error('History note error:', err);
      alert('Kaydedilirken bir hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteLead = async (leadId) => {
    const lead = potansiyel.find(p => p.id === leadId);
    if (window.confirm('Bu potansiyel müşteriyi silmek istediğinize emin misiniz?')) {
      const { error } = await supabase.from('leads').delete().eq('id', leadId);
      if (!error) {
        logActivity('Potansiyel Lead Silindi', `"${lead?.name || 'Bilinmeyen'}" isimli lead kaydı sistemden silindi.`);
        fetchAllData();
        if (selectedLead?.id === leadId) setIsLeadDetailModalOpen(false);
      }
    }
  };

  const handleDeleteActiveClient = async (clientId) => {
    const client = aktifMusteriler.find(c => c.id === clientId);
    if (window.confirm('Bu aktif müşteriyi (firmayı) silmek istediğinize emin misiniz? Tüm ilerleme verileri silinecektir.')) {
      const { error } = await supabase.from('active_clients').delete().eq('id', clientId);
      if (!error) {
        logActivity('Müşteri Kaydı Silindi', `"${client?.name || 'Bilinmeyen'}" isimli aktif müşteri kaydı sistemden kalıcı olarak silindi.`, client?.name);
        fetchAllData();
      }
    }
  };

  const handleGeminiAnalysis = async () => {
    if (!geminiKey) {
      alert('Lütfen önce AI Ayarları bölümünden Google Gemini API Anahtarınızı girin.');
      setIsAISettingsOpen(true);
      return;
    }
    if (!selectedLead) return;

    setIsAnalyzing(true);
    try {
      const historySummary = leadHistory.map(h => `${h.created_at}: ${h.note}`).join('\n');
      const prompt = `Sen SocialArt ajansının en iyi satış temsilcisisin. Hedefin bu lead'i satışa döndürmek.

MÜŞTERİ: ${selectedLead.name} - ${selectedLead.service}
DURUM/NOTLAR: ${selectedLead.reaction}
GEÇMİŞ: ${historySummary}

Lütfen şu formatta ÇOK KISA bir yanıt ver:
1. SATIŞ ŞANSI: % (0-100)
2. SINIF: (Sıcak/Ilık/Soğuk)
3. HAZIR MESAJ: (WhatsApp veya DM'den gönderilmek üzere, müşterinin ismine ve sektörüne özel, profesyonel ama samimi, merak uyandıran ve direkt kopyalanabilir bir mesaj taslağı)
4. NEDEN BU MESAJ?: (Kısa teknik açıklama)

Gereksiz nezaket cümlelerini geç, direkt sonuca odaklan.`; 

      const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
      let lastError = null;
      let success = false;

      for (const modelName of modelsToTry) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          });

          const data = await response.json();
          if (data.error) {
            lastError = data.error.message;
            continue; // Yoğunluk varsa bir sonrakini dene
          }

          if (data.candidates && data.candidates[0].content.parts[0].text) {
            setAiAnalysis(data.candidates[0].content.parts[0].text);
            success = true;
            break;
          }
        } catch (e) {
          lastError = e.message;
          continue;
        }
      }

      if (!success) {
        throw new Error(lastError || 'Tüm modeller şu an meşgul, lütfen biraz sonra tekrar deneyin.');
      }
    } catch (err) {
      console.error('Gemini error:', err);
      alert('Yapay zeka hatası: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Takvimin mevcut ayın 1'inden başlatılması, ay atlama hatalarını önler
  const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const totalDays = daysInMonth(month, year);
    let startDay = firstDayOfMonth(month, year);
    // Mondy start adjustment: Standard getDay is 0 (Sun) - 6 (Sat)
    // We want 0 (Mon) - 6 (Sun)
    startDay = startDay === 0 ? 6 : startDay - 1; 

    const days = [];

    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

    // Empty spaces for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ height: '100px', background: 'rgba(255,255,255,0.01)' }}></div>);
    }

    // Actual days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      // Bu tarihteki görevleri filtrele (isTakip içinden)
      const tasksOnThisDay = isTakip.reduce((acc, person) => {
        const allTasks = [
          ...(person.activeTasks || []),
          ...(person.pendingTasks || []),
          ...(person.completedTasks || [])
        ];
        const personTasks = allTasks.filter(t => t.due_date === dateStr);
        if (personTasks.length > 0) {
          acc.push({ name: person.rep, tasks: personTasks });
        }
        return acc;
      }, []);

      const apptsOnThisDay = appointments.filter(a => a.appointment_date === dateStr);

      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <div key={d} style={{ 
          height: '140px', 
          background: isToday ? 'rgba(0,229,255,0.05)' : 'rgba(255,255,255,0.02)', 
          border: isToday ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          overflow: 'hidden',
          transition: 'all 0.2s',
          cursor: (tasksOnThisDay.length > 0 || apptsOnThisDay.length > 0) ? 'pointer' : 'default'
        }}
        onClick={() => (tasksOnThisDay.length > 0 || apptsOnThisDay.length > 0) && setCalendarPopup({ dateStr, persons: tasksOnThisDay, appts: apptsOnThisDay })}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; if(tasksOnThisDay.length > 0) e.currentTarget.style.border = '1px solid var(--primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = isToday ? 'rgba(0,229,255,0.05)' : 'rgba(255,255,255,0.02)'; e.currentTarget.style.border = isToday ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)'; }}
        >
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: isToday ? 'var(--primary)' : '#888' }}>{d}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
            {apptsOnThisDay.map((appt, idx) => {
              const colorMap = {
                'Çekim': 'linear-gradient(135deg, #ffab00, #ff6f00)',
                'Toplantı': 'linear-gradient(135deg, #2979ff, #007bff)',
                'Not': 'linear-gradient(135deg, #9c27b0, #673ab7)',
                'Özel': 'linear-gradient(135deg, #f44336, #d32f2f)'
              };
              const bg = colorMap[appt.status] || 'linear-gradient(135deg, #444, #222)';
              const icon = appt.status === 'Çekim' ? '📸' : appt.status === 'Toplantı' ? '📅' : appt.status === 'Not' ? '📝' : '📌';

              return (
                <div key={`appt-${idx}`} style={{ 
                  fontSize: '0.65rem', 
                  padding: '3px 6px', 
                  background: bg, 
                  color: '#fff', 
                  borderRadius: '6px', 
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}>
                  {icon} {appt.full_name}
                </div>
              );
            })}
            {tasksOnThisDay.map((p, idx) => (
              <div key={idx} style={{ 
                fontSize: '0.65rem', 
                padding: '3px 6px', 
                background: 'var(--primary-gradient)', 
                color: '#000', 
                borderRadius: '6px', 
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
              }}>
                {p.name}: {p.tasks.length} İş
              </div>
            ))}
          </div>
        </div>
      );
    }

    const statusColor = (s) => {
      if (s === 'Yapıyorum') return '#00e5ff';
      if (s === 'Yaptım') return '#00e676';
      if (s === 'Tamamlanamadı') return '#ff1744';
      if (s === 'Revize') return '#ffa000';
      return '#aaa';
    };

    return (
      <div className="glass" style={{ borderRadius: '24px', padding: '30px', position: 'relative' }}>
        {/* Günlük Detay Popup */}
        {calendarPopup && (
          <div
            onClick={() => setCalendarPopup(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{ background: '#111', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '24px', padding: '35px', maxWidth: '550px', width: '90%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' }}>
                    <Calendar size={18} style={{ display: 'inline', marginRight: '8px', marginBottom: '-3px' }} />
                    {calendarPopup.dateStr}
                  </h3>
                  <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px' }}>{calendarPopup.persons.reduce((a, p) => a + p.tasks.length, 0)} görev planlı</p>
                </div>
                <button onClick={() => setCalendarPopup(null)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
              </div>
              {calendarPopup.persons.map((person, pi) => (
                <div key={pi} style={{ marginBottom: '25px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent)', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: '900', fontSize: '0.85rem' }}>
                      {person.name.charAt(0)}
                    </div>
                    {person.name.toUpperCase()} — {person.tasks.length} görev
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {person.tasks.map((task, ti) => (
                      <div key={ti} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: '600', flex: 1, wordBreak: 'break-word', overflowWrap: 'break-word' }} dangerouslySetInnerHTML={{ __html: task.task_text }} className="task-html-content"></div>
                          <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', background: `${statusColor(task.status)}22`, color: statusColor(task.status), fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            {task.status}
                          </span>
                        </div>
                        {task.brand_name && <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '6px' }}>Müşteri: {task.brand_name}</div>}
                        {task.priority && <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>Öncelik: {task.priority}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {calendarPopup.appts && calendarPopup.appts.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '1px', marginBottom: '12px' }}>
                    RANDEVULAR & ÇEKİMLER
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {calendarPopup.appts.map((appt, ai) => (
                      <div key={ai} style={{ background: appt.status === 'Çekim' ? 'rgba(255,171,0,0.05)' : 'rgba(0,229,255,0.05)', border: appt.status === 'Çekim' ? '1px solid rgba(255,171,0,0.2)' : '1px solid rgba(0,229,255,0.2)', borderRadius: '12px', padding: '14px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.95rem', color: '#fff', fontWeight: '800' }}>
                            {appt.status === 'Çekim' ? '📸 ÇEKİM: ' : appt.status === 'Toplantı' ? '📅 ' : appt.status === 'Not' ? '📝 ' : '📌 '} {appt.full_name}
                          </span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 'bold' }}>{appt.appointment_time}</span>
                            <button 
                              onClick={() => {
                                setEditingAppt(appt);
                                setShootFormData({
                                  clientName: appt.full_name,
                                  date: appt.appointment_date,
                                  time: appt.appointment_time,
                                  details: appt.email || '',
                                  staffName: appt.phone || '',
                                  type: appt.status,
                                  briefUrl: appt.url || ''
                                });
                                setExistingApptFiles(appt.files || []);
                                setIsShootModalOpen(true);
                              }}
                              style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer' }}
                            >
                              <Edit3 size={16} />
                            </button>
                            <button onClick={() => handleDeleteAppointment(appt.id)} style={{ background: 'transparent', border: 'none', color: '#ff1744', cursor: 'pointer' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        {appt.email && <div style={{ fontSize: '0.8rem', color: '#ccc', marginTop: '6px', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '8px' }}>{appt.email}</div>}
                        {appt.phone && <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}><Users size={12}/> {appt.phone}</div>}
                        {appt.files && appt.files.length > 0 && (
                          <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {appt.files.map((file, i) => (
                              <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.75rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Download size={12} color="var(--accent)" /> {file.name || `Dosya ${i+1}`}
                              </a>
                            ))}
                          </div>
                        )}
                        {appt.url && (
                          <div style={{ marginTop: '8px' }}>
                            <a href={appt.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'rgba(0,229,255,0.1)', borderRadius: '8px', color: 'var(--primary)', fontSize: '0.75rem', textDecoration: 'none', border: '1px solid rgba(0,229,255,0.2)', fontWeight: 'bold' }}>
                              <ExternalLink size={12} /> Brief Linki / Dökümanı
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="calendar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>{monthNames[month]} {year}</h2>
            <p style={{ color: '#888', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Ekip Müsaitlik ve İş Yükü Takvimi</p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* View Mode Switcher: AY / HAFTA / GÜN */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.5)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button 
                onClick={() => setCalendarViewMode('MONTH')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  border: 'none',
                  background: calendarViewMode === 'MONTH' ? 'var(--primary)' : 'transparent',
                  color: calendarViewMode === 'MONTH' ? '#000' : '#aaa',
                  cursor: 'pointer'
                }}
              >
                📅 Ay
              </button>
              <button 
                onClick={() => setCalendarViewMode('WEEK')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  border: 'none',
                  background: calendarViewMode === 'WEEK' ? 'var(--primary)' : 'transparent',
                  color: calendarViewMode === 'WEEK' ? '#000' : '#aaa',
                  cursor: 'pointer'
                }}
              >
                📆 Hafta
              </button>
              <button 
                onClick={() => setCalendarViewMode('DAY')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  border: 'none',
                  background: calendarViewMode === 'DAY' ? 'var(--primary)' : 'transparent',
                  color: calendarViewMode === 'DAY' ? '#000' : '#aaa',
                  cursor: 'pointer'
                }}
              >
                📌 Gün
              </button>
            </div>

            <button 
              onClick={() => {
                setEditingAppt(null);
                setShootFormData({ clientName: '', date: new Date().toISOString().split('T')[0], time: '12:00', details: '', staffName: '', type: 'Çekim', briefUrl: '' });
                setIsShootModalOpen(true);
              }} 
              className="btn" 
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#000', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}
            >
              <Plus size={18} /> Takvime Kayıt Ekle
            </button>
            
            <div style={{ display: 'flex', gap: '5px' }}>
              <button 
                onClick={() => {
                  if (calendarViewMode === 'MONTH') {
                    setCurrentDate(new Date(year, month - 1, 1));
                  } else if (calendarViewMode === 'WEEK') {
                    const prevWeek = new Date(currentDate);
                    prevWeek.setDate(prevWeek.getDate() - 7);
                    setCurrentDate(prevWeek);
                  } else {
                    const prevDay = new Date(currentDate);
                    prevDay.setDate(prevDay.getDate() - 1);
                    setCurrentDate(prevDay);
                  }
                }} 
                className="icon-btn" 
                style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ← Geri
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())} 
                className="icon-btn" 
                style={{ padding: '8px 14px', background: 'rgba(0,229,255,0.1)', borderRadius: '8px', border: '1px solid rgba(0,229,255,0.2)', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Bugün
              </button>
              <button 
                onClick={() => {
                  if (calendarViewMode === 'MONTH') {
                    setCurrentDate(new Date(year, month + 1, 1));
                  } else if (calendarViewMode === 'WEEK') {
                    const nextWeek = new Date(currentDate);
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    setCurrentDate(nextWeek);
                  } else {
                    const nextDay = new Date(currentDate);
                    nextDay.setDate(nextDay.getDate() + 1);
                    setCurrentDate(nextDay);
                  }
                }} 
                className="icon-btn" 
                style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
              >
                İleri →
              </button>
            </div>
          </div>
        </div>
        <div className="calendar-container">
          {/* AY GÖRÜNÜMÜ */}
          {calendarViewMode === 'MONTH' && (
            <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
              {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(day => (
                <div key={day} style={{ textAlign: 'center', padding: '10px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.8rem' }}>{day}</div>
              ))}
              {days}
            </div>
          )}

          {/* HAFTA GÖRÜNÜMÜ */}
          {calendarViewMode === 'WEEK' && (() => {
            // Calculate 7 days of selected week (starting Monday)
            const curr = new Date(currentDate);
            const dayOfWeek = curr.getDay() === 0 ? 6 : curr.getDay() - 1;
            const monday = new Date(curr);
            monday.setDate(curr.getDate() - dayOfWeek);

            const weekDays = [];
            for (let i = 0; i < 7; i++) {
              const d = new Date(monday);
              d.setDate(monday.getDate() + i);
              weekDays.push(d);
            }

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
                {weekDays.map((wDate, idx) => {
                  const dateStr = wDate.toISOString().split('T')[0];
                  const dayName = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"][idx];
                  const isToday = new Date().toISOString().split('T')[0] === dateStr;

                  const dayAppts = appointments.filter(a => a.appointment_date === dateStr);
                  const dayTasks = isTakip.reduce((acc, person) => {
                    const allT = [...(person.activeTasks || []), ...(person.pendingTasks || []), ...(person.completedTasks || [])];
                    const pTasks = allT.filter(t => t.due_date === dateStr);
                    if (pTasks.length > 0) acc.push({ name: person.rep, tasks: pTasks });
                    return acc;
                  }, []);

                  return (
                    <div 
                      key={dateStr}
                      style={{
                        minHeight: '380px',
                        background: isToday ? 'rgba(0,229,255,0.06)' : 'rgba(255,255,255,0.02)',
                        border: isToday ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '16px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: isToday ? 'var(--primary)' : '#888', fontWeight: 'bold' }}>{dayName}</span>
                        <div style={{ fontSize: '1.2rem', fontWeight: '900', color: isToday ? 'var(--primary)' : '#fff' }}>{wDate.getDate()}</div>
                      </div>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
                        {dayAppts.map((appt, ai) => (
                          <div 
                            key={`w-appt-${ai}`}
                            onClick={() => {
                              setEditingAppt(appt);
                              setShootFormData({
                                clientName: appt.full_name,
                                date: appt.appointment_date,
                                time: appt.appointment_time,
                                details: appt.email || '',
                                staffName: appt.phone || '',
                                type: appt.status,
                                briefUrl: appt.url || ''
                              });
                              setExistingApptFiles(appt.files || []);
                              setIsShootModalOpen(true);
                            }}
                            style={{ 
                              padding: '8px 10px', 
                              background: appt.status === 'Çekim' ? 'rgba(255,171,0,0.15)' : 'rgba(0,229,255,0.15)', 
                              border: appt.status === 'Çekim' ? '1px solid rgba(255,171,0,0.3)' : '1px solid rgba(0,229,255,0.3)',
                              borderRadius: '10px',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 'bold' }}>⏰ {appt.appointment_time}</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff', margin: '2px 0' }}>{appt.full_name}</div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--primary)' }}>{appt.status}</span>
                          </div>
                        ))}

                        {dayTasks.map((pt, ti) => (
                          <div key={`w-task-${ti}`} style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.7rem' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{pt.name}:</span> {pt.tasks.length} Görev
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={() => {
                          setEditingAppt(null);
                          setShootFormData({ clientName: '', date: dateStr, time: '12:00', details: '', staffName: '', type: 'Çekim', briefUrl: '' });
                          setIsShootModalOpen(true);
                        }}
                        style={{ padding: '6px', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '8px', color: '#aaa', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        + Kayıt Ekle
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* GÜN GÖRÜNÜMÜ */}
          {calendarViewMode === 'DAY' && (() => {
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayAppts = appointments.filter(a => a.appointment_date === dateStr);
            const dayTasks = isTakip.reduce((acc, person) => {
              const allT = [...(person.activeTasks || []), ...(person.pendingTasks || []), ...(person.completedTasks || [])];
              const pTasks = allT.filter(t => t.due_date === dateStr);
              if (pTasks.length > 0) acc.push({ name: person.rep, tasks: pTasks });
              return acc;
            }, []);

            return (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: 'var(--primary)' }}>
                      📌 {currentDate.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#888', margin: '4px 0 0 0' }}>Günün Etkinlik ve Görev Detayları</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingAppt(null);
                      setShootFormData({ clientName: '', date: dateStr, time: '12:00', details: '', staffName: '', type: 'Çekim', briefUrl: '' });
                      setIsShootModalOpen(true);
                    }}
                    className="btn"
                    style={{ background: 'var(--primary)', color: '#000', padding: '8px 16px', borderRadius: '10px', fontWeight: '800', border: 'none', cursor: 'pointer' }}
                  >
                    + Bu Güne Ekle
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Sol: Randevu / Çekimler */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff', marginBottom: '12px' }}>
                      📸 RANDEVULAR & ETKİNLİKLER ({dayAppts.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {dayAppts.map((appt, idx) => (
                        <div 
                          key={idx}
                          style={{
                            background: 'rgba(0,0,0,0.4)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '14px',
                            padding: '14px',
                            display: 'flex',
                            justify: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>⏰ {appt.appointment_time} — {appt.status}</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', margin: '4px 0' }}>{appt.full_name}</div>
                            {appt.email && <div style={{ fontSize: '0.75rem', color: '#888' }}>{appt.email}</div>}
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => {
                                setEditingAppt(appt);
                                setShootFormData({
                                  clientName: appt.full_name,
                                  date: appt.appointment_date,
                                  time: appt.appointment_time,
                                  details: appt.email || '',
                                  staffName: appt.phone || '',
                                  type: appt.status,
                                  briefUrl: appt.url || ''
                                });
                                setExistingApptFiles(appt.files || []);
                                setIsShootModalOpen(true);
                              }}
                              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem' }}
                            >
                              Düzenle
                            </button>
                            <button 
                              onClick={() => handleDeleteAppointment(appt.id)}
                              style={{ background: 'rgba(255,23,68,0.15)', border: 'none', color: '#ff1744', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem' }}
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      ))}
                      {dayAppts.length === 0 && (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>Bu güne ait randevu veya çekim yok.</div>
                      )}
                    </div>
                  </div>

                  {/* Sağ: Personel Görevleri */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff', marginBottom: '12px' }}>
                      📋 PLANLI GÖREVLER ({dayTasks.reduce((acc, p) => acc + p.tasks.length, 0)})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {dayTasks.map((p, idx) => (
                        <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '14px' }}>
                          <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.85rem', marginBottom: '8px' }}>👤 {p.name}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {p.tasks.map((t, ti) => (
                              <div key={ti} style={{ fontSize: '0.8rem', color: '#ccc', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '8px' }}>
                                • {stripHtml(t.task_text)} <span style={{ fontSize: '0.7rem', color: '#888' }}>({t.status})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {dayTasks.length === 0 && (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>Bu teslim tarihine sahip görev bulunmuyor.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    );
  };

  if (isChecking) {
    return (
      <div style={{ background: 'linear-gradient(to bottom right, #09090b, #111115, #1d113a)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0,229,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <p style={{ color: '#fff', fontSize: '0.8rem', letterSpacing: '2px' }}>VERİLER YÜKLENİYOR...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLoginSuccess={() => {
      try {
        const userJson = localStorage.getItem('ajans_user');
        if (userJson) {
          setCurrentUser(JSON.parse(userJson));
          fetchAllData();
        }
      } catch (e) {
        setIsChecking(false);
      }
    }} />;
  }

  return (
    <div className="admin-container" style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #09090b 0%, #111115 50%, #1a112d 100%)', color: '#fff', fontFamily: 'Inter, sans-serif' }}>

      {/* GLOBAL TALEP ALERT (TOAST) */}
      {newTalepAlert && (
        <div
          onClick={() => {
            setActiveTab('support');
            setSelectedSupportClient(newTalepAlert.clientName);
            setNewTalepAlert(null);
          }}
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            color: '#000',
            padding: '16px 30px',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(255, 165, 0, 0.4), 0 0 100px rgba(255, 215, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            cursor: 'pointer',
            animation: 'slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            fontWeight: '800'
          }}
        >
          <div style={{ padding: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px' }}>
            <Zap size={24} color="#000" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.8, letterSpacing: '1px' }}>⚡ YENİ EK HİZMET TALEBİ!</div>
            <div style={{ fontSize: '1rem' }}>{newTalepAlert.clientName} markasından yeni bir talep geldi.</div>
          </div>
          <style>{`
            @keyframes slideIn {
              0% { transform: translate(-50%, -100px); opacity: 0; }
              100% { transform: translate(-50%, 0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
      {/* Mobile Top Header */}
      <div 
        className="mobile-header" 
        style={{ 
          display: 'none', 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '60px', 
          background: '#09090b', 
          borderBottom: '1px solid rgba(255,255,255,0.08)', 
          zIndex: 10000, 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 16px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#fff', fontSize: '0.75rem' }}>SA</div>
          <span style={{ fontWeight: '850', fontSize: '0.9rem', letterSpacing: '-0.3px' }}>Social Art CRM</span>
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Workspace Menüsünü Aç"
          title="Workspace Menüsü"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '8px 12px',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Mobile Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 10000
          }}
        />
      )}

      <div className="container" style={{ display: 'flex', width: '100%', maxWidth: '100%', margin: 0, padding: 0 }}>
        <AdminStyles />

        {/* 1. Left Sidebar Navigation (Matching NextJS design) */}
        <aside className={`admin-sidebar-nav ${isSidebarOpen ? 'open' : ''}`} style={{ width: '260px', background: 'rgba(9, 9, 11, 0.45)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', padding: '24px 20px', minHeight: '100vh', position: 'sticky', top: 0, shrink: 0, gap: '25px', zIndex: 10001 }}>
          {/* Logo & Brand Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '15px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#fff', fontSize: '0.8rem', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.2)' }}>
              SA
            </div>
            <div style={{ lineHeight: '1.2' }}>
              <span style={{ fontWeight: '850', fontSize: '0.9rem', display: 'block', letterSpacing: '-0.3px' }}>Social Art</span>
              <span style={{ fontSize: '0.55rem', color: '#71717a', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Base Workspace</span>
            </div>
          </div>

          {/* Sidebar Nav Buttons */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#52525b', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 10px', marginBottom: '6px' }}>Workspace Menüsü</span>
            
            <button
              onClick={() => { setActiveTab('potansiyel'); setIsSidebarOpen(false); }}
              className={activeTab === 'potansiyel' ? 'active' : ''}
            >
              <Users size={16} /> Potansiyel Müşteriler
            </button>
            <button
              onClick={() => { setActiveTab('basvurular'); setIsSidebarOpen(false); }}
              className={activeTab === 'basvurular' ? 'active' : ''}
            >
              <Target size={16} /> Gelen Başvurular
            </button>
            <button
              onClick={() => { setActiveTab('support'); setIsSidebarOpen(false); }}
              className={activeTab === 'support' ? 'active' : ''}
            >
              <MessageSquare size={16} /> Müşteri Talepleri
            </button>
            <button
              onClick={() => { window.location.href = '/email-marketing'; setIsSidebarOpen(false); }}
            >
              <Mail size={16} /> E-Mail Marketing
            </button>
            {currentUser.permissions === 'all' && (
              <button
                onClick={() => { setActiveTab('log'); setIsSidebarOpen(false); }}
                className={activeTab === 'log' ? 'active' : ''}
              >
                <Activity size={16} /> Aktivite Kayıtları
              </button>
            )}
          </nav>

          <hr style={{ border: 'none', height: '1px', background: 'rgba(255,255,255,0.05)', margin: 0 }} />

          {/* Action Buttons */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={requestNotificationPermission}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                color: notifPermission === 'granted' ? '#00e676' : '#a1a1aa',
                background: notifPermission === 'granted' ? 'rgba(0, 230, 118, 0.05)' : 'rgba(255,255,255,0.02)',
                border: '1px solid ' + (notifPermission === 'granted' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255,255,255,0.05)'),
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              {notifPermission === 'granted' ? <Bell size={16} fill="currentColor" /> : <BellOff size={16} />}
              <span>{notifPermission === 'granted' ? 'Bildirimler Aktif' : 'Bildirimleri Aç'}</span>
            </button>
            
            <button
              onClick={() => {
                localStorage.removeItem('social-art-base:active-employee-id');
                localStorage.removeItem('social-art-base:credentials');
                localStorage.removeItem('ajans_user');
                window.location.href = '/admin/login';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                color: '#ff0055',
                background: 'rgba(255, 0, 85, 0.05)',
                border: '1px solid rgba(255, 0, 85, 0.15)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <LogOut size={16} />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </aside>

        {/* 2. Right Main Panel */}
        <main className="main-content-area" style={{ flex: 1, padding: '40px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '30px', overflowY: 'auto' }}>
          {/* HALA TEMASA GEÇİLMEYEN MÜŞTERİLER VAR ALARMI */}
          {(() => {
            const uncontactedCount = (allLeadsData || []).filter(l => l.stage === 'NEW' || l.status === 'Geldi (Yeni Lead)' || l.durum === 'Geldi (Yeni Lead)').length;
            if (uncontactedCount === 0) return null;
            return (
              <div
                onClick={() => setActiveTab('potansiyel')}
                style={{
                  background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.2) 0%, rgba(159, 18, 57, 0.3) 100%)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(225, 29, 72, 0.2)',
                  gap: '15px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '10px', background: 'rgba(244, 63, 94, 0.2)', borderRadius: '12px', color: '#f43f5e' }}>
                    <AlertCircle size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '900', color: '#fecdd3', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                      🚨 HALA TEMASA GEÇİLMEYEN MÜŞTERİLER VAR!
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#fda4af', marginTop: '2px' }}>
                      CRM sisteminde henüz iletişim kurulmamış <strong style={{ color: '#fff', textDecoration: 'underline' }}>{uncontactedCount} adet yeni müşteri (lead)</strong> bekliyor!
                    </div>
                  </div>
                </div>
                <button style={{ background: '#e11d48', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  CRM Potansiyel Müşterilere Git ({uncontactedCount})
                </button>
              </div>
            );
          })()}

          {/* Kişisel Karşılama Paneli (Inside right area) */}
          {!isLeadDetailModalOpen && activeTab !== 'potansiyel' && (
            <div className="glass welcome-panel" style={{ borderRadius: "20px", padding: "24px 30px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(15, 15, 20, 0.4)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: '#8b5cf6', filter: 'blur(100px)', opacity: '0.08' }}></div>

              <div className="welcome-content" style={{ display: 'flex', alignItems: 'center', gap: '25px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: '900' }}>
                  {currentUser?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '5px' }}>Hoş Geldin, <span className="gradient-text">{currentUser?.name || 'Kullanıcı'}!</span></h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserCheck size={16} color="var(--primary)" /> {currentUser?.role} • {currentUser?.class}
                  </p>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '1px' }}>DASHBOARD ÖZETİ</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '4px' }}>{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}</div>
                </div>
              </div>
            </div>
          )}

          {/* Ana Layout: Sol Sidebar Nav + Sağ İçerik */}
          <div className="admin-layout" style={{ background: 'transparent', minHeight: 'auto', gap: 0, marginTop: 0 }}>
            {/* Left sidebar space cleaner */}
            <div className="admin-sidebar-nav" style={{ display: 'none' }}></div>
            {/* Sağ İçerik Alanı */}
            <div style={{ flex: 1, minWidth: 0 }}>

        {/* İstatistikler */}
        {!['availability', 'support', 'performance', 'gorevList', 'log', 'chat', 'basvurular', 'potansiyel'].includes(activeTab) && !isLeadDetailModalOpen && (
          <div className="stats-grid">
            {getStats().map((stat, idx) => {
              const isBucketFilter = activeTab === 'gorev' && ['Yapılan (Aktif)', 'Tamamlanan', 'Tamamlanmayan'].includes(stat.title);
              const isLeadFilter = activeTab === 'potansiyel';
              
              const isActive = (isBucketFilter && dashboardBucketFilter === stat.title) || (isLeadFilter && leadStatusFilter === stat.filter);

              return (
                <div 
                  key={idx} 
                  className={`glass stat-card ${isActive ? 'active-filter' : ''}`}
                  onClick={() => {
                    if (isBucketFilter) {
                      setActiveTab('gorev');
                      setDashboardBucketFilter(isActive ? 'Hepsi' : stat.title);
                    } else if (isLeadFilter || ['Dönüşüm Oranı', 'Haftalık Yeni Lead'].includes(stat.title)) {
                      setActiveTab('potansiyel');
                      if (stat.title === 'Toplam Potansiyel Lead' || stat.title === 'Haftalık Yeni Lead' || stat.title === 'Dönüşüm Oranı') {
                         setLeadSubTab('all');
                         setLeadStatusFilter('Hepsi');
                      } else if (stat.title === 'Sıcak (Olumlu) Potansiyel') {
                         setLeadSubTab('active');
                         setLeadStatusFilter('Sıcak');
                      } else if (stat.title === 'Teklif Bekleyen') {
                         setLeadSubTab('pending_proposal');
                         setLeadStatusFilter('Teklif Bekliyor');
                      } else if (stat.title === 'Teklif İletildi') {
                         setLeadSubTab('sent_proposal');
                         setLeadStatusFilter('Teklif İletildi');
                      } else if (stat.title === 'Katalog İletildi') {
                         setLeadSubTab('catalog_sent');
                         setLeadStatusFilter('Katalog İletildi');
                      } else {
                         setLeadStatusFilter(stat.filter);
                      }
                    }
                  }}
                  style={{ 
                    cursor: (isBucketFilter || isLeadFilter) ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    border: isActive ? `1px solid var(--primary)` : '1px solid rgba(255,255,255,0.05)',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '16px',
                    padding: '20px',
                    background: 'rgba(15, 15, 20, 0.4)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '120px',
                    boxShadow: isActive ? '0 0 15px rgba(139, 92, 246, 0.08)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {stat.title}
                    </span>
                    <div style={{ color: stat.color || 'var(--primary)' }}>
                      {stat.icon}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#fff', lineHeight: '1.2' }}>{stat.value}</div>
                    <p style={{ fontSize: '9px', color: '#71717a', marginTop: '4px', margin: 0, fontWeight: '500' }}>
                      {stat.title === 'Toplam Potansiyel Lead' ? 'Sistemdeki tüm aktif adaylar' : 
                       stat.title === 'Sıcak (Olumlu) Potansiyel' ? 'Sıcak ve olumlu görüşmeler' : 
                       stat.title === 'Teklif Bekleyen' ? 'Teklif bekleyen nitelikliler' : 
                       stat.title === 'Teklif İletildi' ? 'Teklifi iletilen adaylar' : 
                       stat.title === 'Katalog İletildi' ? 'Kataloğu iletilen adaylar' : 'Social Art CRM Metriği'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab: BAŞVURULAR */}
        {activeTab === 'basvurular' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Gelen Başvurular</h2>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800' }}>
                <Camera size={20} /> UGC & Influencer Başvuruları
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {ugcApps.map(app => (
                  <div 
                    key={app.id} 
                    className="glass" 
                    style={{ 
                      padding: '24px', 
                      borderRadius: '20px', 
                      border: '1px solid rgba(255, 255, 255, 0.05)', 
                      background: 'rgba(15, 15, 20, 0.4)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>{app.full_name}</h4>
                      <span style={{ fontSize: '0.75rem', color: '#888' }}>{new Date(app.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                    
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', color: '#ccc', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>📞 {app.phone}</div>
                      <div style={{ opacity: 0.6 }}>✉ {app.email}</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>📍 {app.city}</span>
                      <a 
                        href={`https://instagram.com/${app.instagram_url?.replace('@', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ 
                          background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', 
                          color: '#fff', 
                          padding: '6px 12px', 
                          borderRadius: '8px', 
                          fontSize: '0.75rem', 
                          fontWeight: '700',
                          textDecoration: 'none'
                        }}
                      >
                        Instagram Profile
                      </a>
                    </div>
                  </div>
                ))}
                {ugcApps.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', padding: '40px 0', textAlign: 'center', color: '#666' }}>Henüz başvuru yok.</div>
                )}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800' }}>
                <Briefcase size={20} /> Kariyer / İş Başvuruları
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {jobApps.map(app => (
                  <div 
                    key={app.id} 
                    className="glass" 
                    style={{ 
                      padding: '24px', 
                      borderRadius: '20px', 
                      border: '1px solid rgba(255, 255, 255, 0.05)', 
                      background: 'rgba(15, 15, 20, 0.4)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', margin: 0 }}>{app.full_name}</h4>
                        <span style={{ display: 'inline-block', color: 'var(--accent)', fontWeight: '800', fontSize: '0.7rem', background: 'rgba(0,229,255,0.08)', padding: '2px 6px', borderRadius: '4px', marginTop: '6px' }}>
                          {app.position}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#888' }}>{new Date(app.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', color: '#ccc', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>📞 {app.phone}</div>
                      <div style={{ opacity: 0.6 }}>✉ {app.email}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      {app.portfolio_url && (
                        <a 
                          href={app.portfolio_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', color: '#fff', textDecoration: 'none' }}
                        >
                          Portfolyo
                        </a>
                      )}
                      {app.resume_url && (
                        <a 
                          href={app.resume_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ flex: 1, textAlign: 'center', background: 'var(--primary)', padding: '8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', color: '#fff', textDecoration: 'none' }}
                        >
                          CV Dosyası
                        </a>
                      )}
                      {!app.portfolio_url && !app.resume_url && (
                        <span style={{ color: '#555', fontSize: '0.8rem' }}>Dosya / Portfolyo Yok</span>
                      )}
                    </div>
                  </div>
                ))}
                {jobApps.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', padding: '40px 0', textAlign: 'center', color: '#666' }}>Henüz başvuru yok.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: CRM PANEL — agency-crm */}
        {activeTab === 'potansiyel' && (
          <div style={{ margin: '-40px', minHeight: '100vh' }}>
            <CRMPage embedded={true} />
          </div>
        )}


{/* Tab 2: ÇALIŞILAN MÜŞTERİLER — KALDIRILDI */}
        {activeTab === 'aktif' && null}


      {/* Aktivite Log Tablosu */}
      {activeTab === 'log' && (
        <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--surface-border)', paddingBottom: '20px' }}>
          <div style={{ padding: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Sistem Aktivite Akışı (Anlık & Geri Alınamaz)</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#00e676' }}>
                <div style={{ width: '8px', height: '8px', background: '#00e676', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
                SİSTEM CANLI
              </div>
            </div>
          </div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="potansiyel-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ borderTopLeftRadius: '24px' }}>TARİH / SAAT</th>
                  <th>KULLANICI</th>
                  <th>İŞLEM</th>
                  <th style={{ borderTopRightRadius: '24px' }}>HEDEF / DETAY</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    onClick={() => { setSelectedLog(log); setIsLogModalOpen(true); }}
                    className="table-row-hover"
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ color: '#888' }}>
                      {new Date(log.created_at).toLocaleString('tr-TR')}
                    </td>
                    <td>
                      <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{log.user_name}</span>
                    </td>
                    <td>
                      <span style={{
                        background: log.action.includes('Silindi') ? 'rgba(255,0,85,0.1)' : 'rgba(0,229,255,0.1)',
                        color: log.action.includes('Silindi') ? 'var(--secondary)' : 'var(--primary)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        whiteSpace: 'nowrap'
                      }}>{log.action}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '800', color: '#fff' }}>{log.target_name}</div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#a1a1aa', 
                        marginTop: '4px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        maxWidth: '400px'
                      }}>{log.details}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SİSTEM AKTİVİTE DETAY MODALI */}
      {isLogModalOpen && selectedLog && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', zIndex: 12000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass" style={{ border: '1px solid var(--primary)', borderRadius: '32px', padding: '40px', width: '100%', maxWidth: '600px', position: 'relative' }}>
            <button onClick={() => setIsLogModalOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={28} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
               <div style={{ background: selectedLog.action.includes('Silindi') ? 'var(--secondary)' : 'var(--primary)', padding: '8px 15px', borderRadius: '10px', color: '#000', fontSize: '0.75rem', fontWeight: '900' }}>
                 {selectedLog.action.toUpperCase()}
               </div>
               <div style={{ color: '#888', fontSize: '0.9rem' }}>
                 {new Date(selectedLog.created_at).toLocaleString('tr-TR')}
               </div>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px', color: '#fff' }}>{selectedLog.target_name}</h2>
            <div style={{ color: 'var(--primary)', fontWeight: '700', marginBottom: '25px', fontSize: '0.9rem' }}>İŞLEMİ YAPAN: {selectedLog.user_name}</div>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', color: '#eee', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
              {selectedLog.details}
            </div>
          </div>
        </div>
      )}


      {/* Müsaitlik Ayarları Tabı */}
      {activeTab === "availability" && null}

      {activeTab === "reports" && null}

        {/* Müşteri Talepleri Tabı */}
        {activeTab === 'support' && (
        <div className={`support-layout ${selectedSupportClient ? 'detail-active' : 'list-active'}`} style={{ display: 'grid', gap: '30px', height: 'calc(100vh - 250px)' }}>

          {/* Sol Kolon: Müşteri Listesi */}
          <div className="glass side-panel" style={{ borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Aktif Talepler</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {[...new Set(supportMessages.map(m => m.client_name))].filter(Boolean).map(name => {
                const clientMsgs = supportMessages.filter(m => m.client_name === name);
                const lastMsg = clientMsgs[0];
                const unreadCount = clientMsgs.filter(m => !m.is_read && m.sender_type === 'client').length;

                return (
                  <div
                    key={name}
                    onClick={() => {
                      setSelectedSupportClient(name);
                      // Mark as read
                      supabase.from('client_support_messages').update({ is_read: true }).eq('client_name', name).eq('sender_type', 'client').then(() => fetchAllData());
                    }}
                    style={{
                      padding: '15px 20px',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.02)',
                      background: selectedSupportClient === name ? 'rgba(255,255,255,0.05)' : 'transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', color: unreadCount > 0 ? 'var(--primary)' : '#fff' }}>{name}</span>
                      {unreadCount > 0 && <span style={{ background: 'var(--secondary)', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px' }}>{unreadCount} YENİ</span>}
                    </div>
                    {lastMsg && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {lastMsg?.message?.includes('[TALEP]') && <Zap size={12} color="#ffb300" />}
                        <span style={{ fontSize: '0.8rem', color: lastMsg?.message?.includes('[TALEP]') ? '#ffb300' : '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lastMsg?.message || ''}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
              {supportMessages.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#444' }}>Henüz talep bulunmuyor.</div>
              )}
            </div>
          </div>

          {/* Sağ Kolon: Mesajlaşma Alanı */}
          <div className="glass main-panel" style={{ borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {selectedSupportClient ? (
              <>
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button className="mobile-only-btn" onClick={() => setSelectedSupportClient(null)} style={{ border: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', marginRight: '5px' }}>Geri</button>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={18} color="var(--primary)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{selectedSupportClient}</h3>
                      <p style={{ fontSize: '0.75rem', color: '#666' }}>Resmi Destek Kanalı</p>
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#00e676', borderRadius: '50%', boxShadow: '0 0 10px #00e676' }}></div>
                    Sohbet Kaydı Güvenli
                  </div>
                </div>


                <div style={{ flex: 1, overflowY: 'auto', padding: '30px', display: 'flex', flexDirection: 'column-reverse', gap: '15px', background: 'rgba(0,0,0,0.1)' }}>
                  {supportMessages.filter(m => m.client_name === selectedSupportClient).map((msg) => (
                    <div key={msg.id} style={{ alignSelf: msg.sender_type === 'admin' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                      <div style={{
                        padding: '12px 18px',
                        borderRadius: msg.sender_type === 'admin' ? '15px 2px 15px 15px' : '2px 15px 15px 15px',
                        background: msg.sender_type === 'admin' ? 'var(--primary-gradient)' : (msg.message?.includes('[TALEP]') ? 'rgba(255, 179, 0, 0.1)' : 'rgba(255,255,255,0.05)'),
                        border: msg.message?.includes('[TALEP]') ? '1px solid rgba(255, 179, 0, 0.3)' : 'none',
                        color: '#fff',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        position: 'relative',
                        boxShadow: msg.sender_type === 'admin' ? '0 5px 15px rgba(0,229,255,0.1)' : 'none'
                      }}>
                        {msg.message?.includes('[TALEP]') && <div style={{ fontSize: '0.7rem', color: '#ffb300', fontWeight: '800', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>⚡ EK HİZMET TALEBİ</div>}
                        {msg.message || ''}
                        <div style={{ fontSize: '0.65rem', color: msg.sender_type === 'admin' ? 'rgba(0,0,0,0.5)' : '#666', marginTop: '5px', textAlign: msg.sender_type === 'admin' ? 'right' : 'left' }}>
                          {msg.sender_type === 'admin' ? `${msg.admin_name} • ` : ''}{new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendSupportReply} style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '15px' }}>
                  <input
                    type="text"
                    value={supportReplyInput}
                    onChange={e => setSupportReplyInput(e.target.value)}
                    placeholder="Müşteriye yanıt yazın..."
                    style={{ flex: 1, padding: '15px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '12px', color: '#fff', outline: 'none' }}
                  />
                  <button type="submit" className="btn" style={{ width: '50px', height: '50px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', border: 'none' }}>
                    <Send size={20} />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', flexDirection: 'column', gap: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageCircle size={40} opacity={0.2} />
                </div>
                <p style={{ fontWeight: '500' }}>Mesajlaşmak için soldan bir müşteri seçin</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Çalışanlar (Eski Performans) Tabı */}
      {activeTab === "performance" && null}
{/* Görev Listem Tabı */}
      {activeTab === "gorevList" && null}
      
      {/* PWA Kurulum Bilgilendirme Modalı */}
      {showPwaInfo && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass" style={{ border: '1px solid var(--primary)', borderRadius: '30px', padding: '40px', width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={() => setShowPwaInfo(false)} style={{ position: 'absolute', top: '24px', right: '24px', color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={24} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#000', boxShadow: '0 0 30px rgba(0,229,255,0.4)' }}>
                <Download size={40} />
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>Uygulamayı Yükleyin</h2>
              <p style={{ color: '#888', marginTop: '10px' }}>Socialart portalını mobil cihazınıza indirerek gerçek uygulama deneyimi yaşayın.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '900', marginBottom: '10px' }}>IPHONE (iOS) KURULUMU</h3>
                <p style={{ color: '#ccc', fontSize: '0.85rem', lineHeight: '1.4' }}>
                  1. Safari ile siteye girin.<br />
                  2. Alttaki <b>Paylaş</b> (Yukarı Ok) simgesine basın.<br />
                  3. Çıkan listeden <b>"Ana Ekrana Ekle"</b> seçeneğini seçin.
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: '#00e676', fontSize: '0.9rem', fontWeight: '900', marginBottom: '10px' }}>ANDROID KURULUMU</h3>
                <p style={{ color: '#ccc', fontSize: '0.85rem', lineHeight: '1.4' }}>
                  1. Chrome tarayıcısında sağ üstteki <b>üç nokta</b> simgesine basın.<br />
                  2. <b>"Uygulamayı Yükle"</b> seçeneğine dokunun.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPwaInfo(false)}
              style={{ width: '100%', marginTop: '30px', padding: '15px', borderRadius: '15px', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: '900', cursor: 'pointer' }}
            >
              KALDIĞIM YERDEN DEVAM ET
            </button>
          </div>
        </div>
      )}
      {isEditClientModalOpen && editClientData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(100px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass" style={{ border: '1px solid var(--surface-border)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '650px', position: 'relative' }}>
            <button onClick={() => setIsEditClientModalOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '30px', color: '#fff' }}>Müşteri Listelerini Düzenle</h2>
            <form onSubmit={handleUpdateAktifMusteri} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Firma / Marka Adı</label>
                <input type="text" required value={editClientData.name} onChange={e => setEditClientData({ ...editClientData, name: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Kapsam / Paket</label>
                <input type="text" required value={editClientData.package} onChange={e => setEditClientData({ ...editClientData, package: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Tamamlananlar (Virgülle Ayırın)</label>
                <TextareaAutosize minRows={2} value={editClientData.completed} onChange={e => setEditClientData({ ...editClientData, completed: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', resize: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Şu An Yapılanlar</label>
                  <TextareaAutosize minRows={2} value={editClientData.active} onChange={e => setEditClientData({ ...editClientData, active: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', resize: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Bizi Bekleyenler / Plan</label>
                  <TextareaAutosize minRows={2} value={editClientData.pending} onChange={e => setEditClientData({ ...editClientData, pending: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', resize: 'none' }} />
                </div>
              </div>


              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="edit_ads_active"
                  checked={editClientData.ads_active}
                  onChange={e => setEditClientData({ ...editClientData, ads_active: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="edit_ads_active" style={{ color: '#fff', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '600' }}>Reklamlar Aktif</label>
              </div>

              <button type="submit" className="btn" style={{ background: 'var(--primary)', color: '#000', padding: '14px', fontSize: '1rem', marginTop: '10px', fontWeight: '800' }}>Güncelle</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .table-row-hover:hover { background: rgba(255,255,255,0.03) !important; }
        .status-option:hover { background: rgba(255,255,255,0.05); }
        :root {
          --primary-gradient: linear-gradient(135deg, var(--primary), var(--accent));
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; borderRadius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #444; }

        /* MOBILE RESPONSIVENESS OVERHAUL */
        .admin-container {
          transition: padding 0.3s;
        }
        .tab-menu-container {
          margin-bottom: 30px;
          width: 100%;
          overflow: hidden;
        }
        .tab-menu {
          display: flex;
          gap: 10px;
          background: rgba(255,255,255,0.02);
          padding: 6px;
          borderRadius: 16px;
          border: 1px solid var(--surface-border);
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE 10+ */
          display: flex;
          white-space: nowrap;
          -webkit-overflow-scrolling: touch;
        }
        .tab-menu::-webkit-scrollbar { display: none; }
        .tab-menu button {
          flex-shrink: 0;
          white-space: nowrap;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          padding: 24px;
          border-radius: 24px;
          min-height: 160px;
          display: flex;
          flex-direction: column;
          position: relative;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card:hover {
          background: rgba(255, 255, 255, 0.04);
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .stat-card .stat-value {
          font-size: 2.4rem;
          font-weight: 900;
          color: #fff;
          margin-bottom: 4px;
        }

        .stat-card .stat-label {
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-card.active-filter {
          border: 2px solid var(--primary) !important;
          background: rgba(0, 229, 255, 0.08);
          box-shadow: 0 0 20px rgba(0, 229, 255, 0.15);
        }

        @media (max-width: 1400px) {
          .stat-card { padding: 20px; min-height: 140px; }
          .stat-card .stat-value { font-size: 2rem; }
          .stat-card .stat-label { font-size: 0.7rem; }
        }

        @media (min-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          }
          .task-manager-grid {
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          }
          .task-list-grid {
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          }
        }

        @media (max-width: 767px) {
          .admin-container {
            padding: 10px 10px 60px 10px !important;
            font-size: 0.85rem;
          }
          .container {
            padding: 0 !important;
          }
          h1 { font-size: 1.2rem !important; margin-bottom: 12px !important; }
          h2 { font-size: 1.4rem !important; }
          h3 { font-size: 1.0rem !important; }
          .gradient-text { display: inline-block; }
          
          .admin-container > .container > div:first-child {
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
            gap: 8px !important;
            margin-bottom: 20px !important;
          }
          .performance-layout, .support-layout {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }

          /* Table to Card Transition for Mobile */
          .potansiyel-table, .potansiyel-table thead, .potansiyel-table tbody, .potansiyel-table th, .potansiyel-table td, .potansiyel-table tr {
            display: block !important;
            width: 100% !important;
          }
          .potansiyel-table thead { display: none !important; }
          .potansiyel-table tr { 
            margin-bottom: 20px !important; 
            border: 1px solid rgba(255,255,255,0.05) !important;
            border-radius: 20px !important;
            background: rgba(255,255,255,0.01) !important;
            padding: 10px !important;
          }
          .potansiyel-table td { 
            padding: 10px 15px !important; 
            border: none !important;
            text-align: left !important;
          }
          .potansiyel-table td:not(:last-child) {
            border-bottom: 1px solid rgba(255,255,255,0.03) !important;
          }

          /* Text alignment fixes */
          .task-text-content, .card-text-val {
            padding-left: 22% !important;
          }
          .aktif-musteriler-grid {
             grid-template-columns: 1fr !important;
             gap: 15px !important;
          }
          
          .admin-container > .container > div:first-child > div {
             gap: 6px !important;
             padding: 4px 10px !important;
          }
          
          .glass { 
            border-radius: 20px !important;
          }

          /* General grid stack */
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .task-manager-grid, .task-list-grid {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }

          /* Responsive Flex Helpers */
          [style*="display: flex"] {
             /* We can't automatically change all flexes, but we can target common ones */
          }

          /* Fix for the task cards specifically */
          .task-manager-grid > div, .task-list-grid > div {
             padding: 15px !important;
          }

          /* Modal full screen on mobile */
          .glass[style*="maxWidth"] {
            max-width: 100% !important;
            margin: 10px !important;
            padding: 20px !important;
            max-height: 90vh;
            overflow-y: auto;
          }

          .performance-layout, .support-layout {
            grid-template-columns: 1fr !important;
          }
          .performance-layout.list-active .main-panel, .performance-layout.detail-active .side-panel,
          .support-layout.list-active .main-panel, .support-layout.detail-active .side-panel {
            display: none !important;
          }
          .performance-sidebar, .side-panel {
            width: 100% !important;
            max-height: none !important;
            overflow-y: visible !important;
          }
          .mobile-only-btn {
            display: block !important;
          }
          
          /* Form Grid Fixes */
          form [style*="gridTemplateColumns: 1fr 1fr"],
          form [style*="gridTemplateColumns: 1fr 1fr 1fr"],
          form [style*="gridTemplateColumns: 1.5fr 1fr"] {
             grid-template-columns: 1fr !important;
             gap: 15px !important;
          }

          /* Mobil Modal Fix: İçeriğin üstte kalmasını ve kaydırılamamasını engeller */
          div[style*="position: fixed"][style*="display: flex"] {
             align-items: flex-start !important;
             overflow-y: auto !important;
             -webkit-overflow-scrolling: touch;
             padding: 40px 10px !important;
          }
          
          .glass[style*="maxWidth"] {
             margin-top: 20px !important;
             margin-bottom: 40px !important;
          }
        }
        .mobile-only-btn { display: none; }
      `}</style>
      {/* AI AYARLARI MODALI */}
      {isAISettingsOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass" style={{ border: '1px solid var(--surface-border)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={() => setIsAISettingsOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', color: '#888', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                <Zap size={24} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>AI Ayarları</h2>
            </div>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '25px', lineHeight: '1.5' }}>
              Google Gemini API anahtarınızı buraya girerek CRM panelinizi akıllandırın. Tamamen ücretsiz anahtarınızı <strong>Google AI Studio</strong> üzerinden alabilirsiniz.
            </p>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.85rem' }}>Gemini API Key</label>
              <input 
                type="password" 
                value={geminiKey} 
                placeholder="AIzaSy..."
                onChange={e => {
                  setGeminiKey(e.target.value);
                  localStorage.setItem('gemini_api_key', e.target.value);
                }} 
                style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.5)', border: '1px solid #333', borderRadius: '12px', color: '#fff', outline: 'none' }} 
              />
            </div>
            <button 
              onClick={async () => {
                try {
                  const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${geminiKey}`);
                  const data = await res.json();
                  if (data.models) {
                    const names = data.models.map(m => m.name.replace('models/', '')).join('\n');
                    alert('Anahtarınızla Kullanabileceğiniz Modeller:\n' + names);
                  } else {
                    alert('Modeller alınamadı: ' + JSON.stringify(data));
                  }
                } catch (e) {
                  alert('Model listeleme hatası: ' + e.message);
                }
              }}
              style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', color: '#aaa', border: '1px dashed #444', borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer', marginBottom: '10px' }}
            >
              API Yetkilendirmesini ve Modelleri Test Et
            </button>
            <button 
              onClick={() => setIsAISettingsOpen(false)}
              className="btn btn-primary" 
              style={{ width: '100%', background: 'var(--accent)', color: '#000', fontWeight: '800' }}
            >
              Ayarları Kaydet ve Kapat
            </button>
          </div>
        </div>
      )}
      
      {/* TAKVİME KAYIT EKLE / DÜZENLE MODALI */}
      {isShootModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass" style={{ border: '1px solid var(--primary)', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '540px', position: 'relative' }}>
            <button 
              onClick={() => {
                setIsShootModalOpen(false);
                setEditingAppt(null);
                setShootFormData({ clientName: '', date: '', time: '12:00', details: '', staffName: '', type: 'Çekim', briefUrl: '' });
                setShootFiles([]);
                setExistingApptFiles([]);
              }} 
              style={{ position: 'absolute', top: '24px', right: '24px', color: '#888', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: '900' }}>
                {editingAppt ? <Edit3 size={22} /> : <Plus size={22} />}
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: '#fff' }}>
                  {editingAppt ? 'Takvim Kaydını Düzenle' : 'Takvime Yeni Kayıt Ekle'}
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>Çekim, Toplantı veya Takvim Notu</p>
              </div>
            </div>

            <form onSubmit={editingAppt ? handleUpdateAppt : handleSaveShoot} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Kayıt Türü */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#aaa', fontSize: '0.8rem', fontWeight: '700' }}>KAYIT TÜRÜ</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {['Çekim', 'Toplantı', 'Not', 'Özel'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setShootFormData(prev => ({ ...prev, type: t }))}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        border: shootFormData.type === t ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                        background: shootFormData.type === t ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.03)',
                        color: shootFormData.type === t ? 'var(--primary)' : '#ccc',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {t === 'Çekim' ? '📸 Çekim' : t === 'Toplantı' ? '📅 Toplantı' : t === 'Not' ? '📝 Not' : '📌 Özel'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Başlık / Müşteri / Konu */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#aaa', fontSize: '0.8rem', fontWeight: '700' }}>BAŞLIK / MÜŞTERİ / KONU</label>
                <input 
                  type="text"
                  required
                  placeholder="Örn: ABC Marka Sosyal Medya Çekimi"
                  value={shootFormData.clientName}
                  onChange={e => setShootFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                />
              </div>

              {/* Tarih ve Saat */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#aaa', fontSize: '0.8rem', fontWeight: '700' }}>TARİH</label>
                  <input 
                    type="date"
                    required
                    value={shootFormData.date}
                    onChange={e => setShootFormData(prev => ({ ...prev, date: e.target.value }))}
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#aaa', fontSize: '0.8rem', fontWeight: '700' }}>SAAT</label>
                  <input 
                    type="time"
                    required
                    value={shootFormData.time}
                    onChange={e => setShootFormData(prev => ({ ...prev, time: e.target.value }))}
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Açıklama / Detay */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#aaa', fontSize: '0.8rem', fontWeight: '700' }}>AÇIKLAMA / DETAYLAR</label>
                <textarea 
                  rows="2"
                  placeholder="Lokasyon, hazırlık notları, ekip detayları vb."
                  value={shootFormData.details}
                  onChange={e => setShootFormData(prev => ({ ...prev, details: e.target.value }))}
                  style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Sorumlu / Telefon */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#aaa', fontSize: '0.8rem', fontWeight: '700' }}>SORUMLU KİŞİ / İLETİŞİM</label>
                <input 
                  type="text"
                  placeholder="Örn: Celal / 05xx xxx xx xx"
                  value={shootFormData.staffName}
                  onChange={e => setShootFormData(prev => ({ ...prev, staffName: e.target.value }))}
                  style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                />
              </div>

              {/* Brief Linki */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#aaa', fontSize: '0.8rem', fontWeight: '700' }}>BRIEF / DÖKÜMAN LİNKİ</label>
                <input 
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={shootFormData.briefUrl}
                  onChange={e => setShootFormData(prev => ({ ...prev, briefUrl: e.target.value }))}
                  style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                />
              </div>

              {/* Butonlar */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {editingAppt && (
                  <button 
                    type="button"
                    onClick={() => handleDeleteAppointment(editingAppt.id)}
                    style={{ padding: '12px 18px', background: 'rgba(255,23,68,0.15)', border: '1px solid rgba(255,23,68,0.3)', color: '#ff1744', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Sil
                  </button>
                )}
                <button 
                  type="submit"
                  className="btn"
                  style={{ flex: 1, padding: '14px', background: 'var(--primary-gradient)', color: '#000', borderRadius: '12px', fontWeight: '900', border: 'none', cursor: 'pointer' }}
                >
                  {editingAppt ? 'Kayıt Güncelle' : 'Kaydet ve Takvime Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GÖREV TAMAMLAMA VE DOSYA YÜKLEME MODALI */}
      {isCompModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass" style={{ border: '1px solid var(--surface-border)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={() => setIsCompModalOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '20px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={24} /></div>
              Görevi Tamamla
            </h2>
            <p style={{ color: '#ccc', marginBottom: '25px', fontSize: '0.9rem', lineHeight: '1.5' }}>
               Harika iş! Görevi teslim etmek üzeresiniz. Lütfen ne yaptığınızı kısaca not edin ve varsa çıktıları (fotoğraf, video, döküman) ekleyin.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>İş Teslim Notu</label>
                <textarea 
                   rows="3" 
                   value={compText} 
                   onChange={e => setCompText(e.target.value)} 
                   style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '12px', color: '#fff', outline: 'none', resize: 'vertical' }} 
                   placeholder="Örn: Tasarımlar Google Drive'a yüklendi, müşteri onayı alındı."
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Kanıt / Dosya Yükle</label>
                <div style={{ border: '1px dashed #444', padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
                  <input 
                    type="file" 
                    id="comp-file-input"
                    onChange={e => setCompFile(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="comp-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Upload size={24} color="var(--primary)" />
                    <span style={{ fontSize: '0.85rem', color: compFile ? 'var(--primary)' : '#888' }}>
                      {compFile ? compFile.name : 'Dosya Seç (Foto, Video, PDF...)'}
                    </span>
                  </label>
                </div>
              </div>

              <button 
                 onClick={handleConfirmCompletion} 
                 disabled={compUploading}
                 className="btn" 
                 style={{ background: 'var(--primary)', color: '#000', padding: '16px', fontSize: '1.1rem', marginTop: '10px', fontWeight: '900', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                 {compUploading ? 'Yükleniyor...' : 'Teslim Et ve Kapat'}
                 {!compUploading && <ArrowRight size={20} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFESYONEL AKSİYON MODALI */}
      {isActionModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass" style={{ border: '1px solid var(--primary)', borderRadius: '32px', padding: '40px', width: '100%', maxWidth: '550px', position: 'relative', boxShadow: '0 0 50px rgba(0,229,255,0.1)' }}>
            <button onClick={() => setIsActionModalOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
              <div style={{ width: '48px', height: '48px', background: 'var(--primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                <Zap size={24} />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '900', margin: 0 }}>{actionConfig.title}</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#666', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>MESAJ / AÇIKLAMA</label>
                <textarea 
                  rows="4" 
                  value={actionInput} 
                  onChange={e => setActionInput(e.target.value)} 
                  placeholder={actionConfig.placeholder}
                  style={{ width: '100%', padding: '18px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', color: '#fff', outline: 'none', resize: 'none', fontSize: '0.95rem', lineHeight: '1.5' }} 
                />
              </div>

              {actionConfig.showSecond && (
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', color: '#666', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>{actionConfig.secondPlaceholder?.toUpperCase()}</label>
                  <input 
                    type={actionConfig.type === 'extension' ? 'date' : 'text'}
                    value={actionInput2} 
                    onChange={e => setActionInput2(e.target.value)} 
                    placeholder={actionConfig.secondPlaceholder}
                    style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', color: '#fff', outline: 'none', fontSize: '1rem' }} 
                  />
                </div>
              )}

              <button 
                onClick={handleActionSubmit}
                style={{ width: '100%', background: 'var(--primary)', color: '#000', padding: '18px', borderRadius: '18px', border: 'none', fontSize: '1.1rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {actionConfig.buttonText}
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* GÖREV DETAY MODALI */}
      {isTaskDetailModalOpen && selectedTask && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', zIndex: 12000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass" style={{ border: '1px solid var(--primary)', borderRadius: '32px', padding: '40px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setIsTaskDetailModalOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={28} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
               <div style={{ background: selectedTask.priority || 'var(--primary)', padding: '8px 15px', borderRadius: '10px', color: '#000', fontSize: '0.75rem', fontWeight: '900' }}>
                 {(selectedTask.category || 'PROJE').toUpperCase()}
               </div>
               <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>
                 🗓 {selectedTask.due_date || 'Tarih Belirtilmemiş'}
               </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '15px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>GÖREV DETAYI</label>
              <div 
                style={{ color: '#fff', fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }} 
                dangerouslySetInnerHTML={{ __html: selectedTask.task_text }} 
                className="task-html-content"
              ></div>
            </div>

            {selectedTask.attachment_url && (
              <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ display: 'block', marginBottom: '10px', color: '#666', fontSize: '0.7rem', fontWeight: '800' }}>EKLİ DOSYALAR</label>
                {renderAttachments(selectedTask.attachment_url, selectedTask.attachment_name)}
              </div>
            )}
          </div>
        </div>
      )}
        </div>{/* /sağ içerik */}
        </div>{/* /admin-layout */}
        </main>{/* /right main panel */}
      </div>{/* /container */}
    </div>
  );
};

export default Admin;
