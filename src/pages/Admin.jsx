import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, DollarSign, Activity, FileText, MoreVertical,
  Search, Filter, CheckCircle2, Clock, XCircle, AlertCircle, Trash2, Plus, X, LogOut,
  Briefcase, ClipboardList, UserCheck, MessageSquare, Target, CheckSquare, ListTodo, Send, MessageCircle, Zap, ShieldCheck,
  Star, TrendingUp, Trophy, Award, Calendar, BarChart3, ChevronRight, Camera, Video, PlusCircle, Smartphone, Download,
  Bell, BellOff, Edit3
} from 'lucide-react';
import Login from './Login';
import { supabase } from '../lib/supabase';

const ManagerTaskRow = ({ t, pri, ss, now, phaseLabel }) => (
  <div style={{
    padding: '25px 30px',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    borderLeft: `5px solid ${t.priority || '#2979ff'}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    transition: 'background 0.15s',
    minHeight: '120px'
  }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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
      marginBottom: '5px'
    }}>
      {t.task_text}
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', paddingLeft: '42px', alignItems: 'center', paddingBottom: '5px' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: pri.color, background: `${pri.color}15`, padding: '4px 10px', borderRadius: '6px', border: `1px solid ${pri.color}33` }}>{pri.label}</span>
      <span style={{ fontSize: '0.7rem', color: '#888', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>{t.category || 'Proje'}</span>
      <span style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'rgba(0,229,255,0.08)', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>{t.client_name || 'Genel Görev'}</span>
      <span style={{ fontSize: '0.7rem', color: '#888', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>{phaseLabel(t.phase)}</span>
    </div>
  </div>
);

function Admin() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    try {
      const userJson = localStorage.getItem('ajans_user');
      if (userJson) {
        const parsed = JSON.parse(userJson);
        if (parsed && parsed.name) {
          setCurrentUser(parsed);
          fetchAllData(parsed);
        } else {
          setIsChecking(false);
        }
      } else {
        setIsChecking(false);
      }
    } catch (e) {
      console.error("Localstorage parse error:", e);
      localStorage.removeItem('ajans_user');
      setIsChecking(false);
    }

    // ⏱ Realtime: tasks tablosunu dinle
    // 🔔 Realtime Bildirim ve Veri Takibi
    const channel = supabase
      .channel('mi-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new.assignee_name === currentUser?.name) {
          notifyUser('Yeni Görev Atandı! 🚀', payload.new.task_text);
        }
        fetchAllData();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'client_support_messages' }, (payload) => {
        if (payload.new.sender_type === 'client') {
          notifyUser(`Müşteri Talebi: ${payload.new.client_name}`, payload.new.message.substring(0, 50) + '...');
        }
        fetchAllData();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, (payload) => {
        if (payload.new.target_name === currentUser?.name && payload.new.action === 'Dürtme!') {
          notifyUser('Hey! Bir Bildiriminiz Var 🔔', payload.new.details);
        }
        fetchAllData();
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
          icon: '/apple-touch-icon.png'
        });
      }
    } catch (e) {
      console.error("Notif error:", e);
      alert("Bildirim izni alınırken bir hata oluştu: " + e.message);
    }
  };

  const notifyUser = (title, body) => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/apple-touch-icon.png'
      });
    }
  };

  const handleSendBuzz = async (empName) => {
    const msg = window.prompt(`${empName} kişisine ne iletmek istersiniz?`, "Sizi bekliyoruz! 🚀");
    if (!msg) return;

    await logActivity('Dürtme!', `${currentUser.name} sizi dürttü: "${msg}"`, empName);
    alert(`${empName} başarıyla dürtüldü!`);
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
          const due = new Date(task.due_date + 'T23:59:59');
          return due < t;
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

      // 3. Fetch activity logs (only if admin)
      if (user?.permissions === 'all') {
        const { data: logData } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(200);
        if (logData) setActivityLogs(logData);

        // 4. Fetch chat messages
        const { data: chatData } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(50);
        if (chatData) setChatMessages(chatData);

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

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleStaffTaskStatusChange = async (task, newStatus) => {
    let reason = null;
    if (newStatus === 'Tamamlanamadı') {
      reason = window.prompt("Bu görev neden tamamlanamadı? Lütfen kısa bir açıklama yazın:");
      if (!reason) {
        alert("Açıklama girmeden görevi başarısız olarak işaretleyemezsiniz.");
        return;
      }
    }

    const updateData = { status: newStatus };
    if (reason) updateData.fail_reason = reason;

    const { error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', task.id);

    if (!error) {
      logActivity('Görev Durumu Güncellendi', `"${task.task_text}" görev durumu ${newStatus} yapıldı. ${reason ? `Sebep: ${reason}` : ''}`);
      fetchAllData();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ajans_user');
    setCurrentUser(null);
  };


  const [activeTab, setActiveTab] = useState('potansiyel'); // potansiyel, aktif, gorev
  const [searchTerm, setSearchTerm] = useState('');

  const [potansiyel, setPotansiyel] = useState([]);
  const [aktifMusteriler, setAktifMusteriler] = useState([]);
  const [isTakip, setIsTakip] = useState([]);

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
    otherService: ''
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
  const [gorevFilter, setGorevFilter] = useState('Tumu');

  // Detay & Geçmiş Modal
  const [isLeadDetailModalOpen, setIsLeadDetailModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadHistory, setLeadHistory] = useState([]);
  const [noteInput, setNoteInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [editLeadData, setEditLeadData] = useState({ name: '', phone: '', email: '', service: '' });

  // Özel Durum Dropdown
  const [openStatusId, setOpenStatusId] = useState(null);

  // Düzenleme & Log
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [editClientData, setEditClientData] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedSupportClient, setSelectedSupportClient] = useState(null);
  const [supportReplyInput, setSupportReplyInput] = useState('');
  const [newTalepAlert, setNewTalepAlert] = useState(null); // { clientName, message }
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Performance System States
  const [ratings, setRatings] = useState([]);
  const [perfEmployee, setPerfEmployee] = useState(null);
  const [perfScore, setPerfScore] = useState(5);
  const [perfComment, setPerfComment] = useState('');
  const [perfMonth, setPerfMonth] = useState(new Date().getMonth() + 1);
  const [perfYear, setPerfYear] = useState(new Date().getFullYear());

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
    // Realtime chat subscription
    const chatChannel = supabase
      .channel('chat_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        payload => {
          setChatMessages(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    // Realtime activity log subscription
    const logChannel = supabase
      .channel('log_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' },
        payload => {
          setActivityLogs(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    const supportChannel = supabase
      .channel('support_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'client_support_messages'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setSupportMessages(prev => [payload.new, ...prev]);
          // GLOBAL ALERT for Service Requests
          if (payload.new.message?.includes('[TALEP]')) {
            setNewTalepAlert({
              clientName: payload.new.client_name,
              message: payload.new.message
            });
            setTimeout(() => setNewTalepAlert(null), 8000);
          }
        } else {
          fetchAllData();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(logChannel);
      supabase.removeChannel(supportChannel);
    };
  }, []);

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
    if (!taskFormData.empId || !taskFormData.task) return;

    const person = isTakip.find(p => p.id === parseInt(taskFormData.empId));
    if (!person) return;

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
        due_date: taskFormData.due_date || null
      }
    ]);

    if (!error) {
      const details = `${person.rep}, ${taskFormData.clientName || 'Genel'} için yeni bir göreve başladı: "${taskFormData.task}"`;
      logActivity('Yeni Görev Atandı', details, taskFormData.clientName);
      fetchAllData();
      setIsTaskModalOpen(false);
      setTaskFormData({ empId: '', task: '', taskType: 'pendingTasks', clientName: '', phase: '1', category: 'Proje', priority: '#2979ff', due_date: '' });
    } else {
      console.error('Task Assignment Error:', error);
      if (error.code === '42703') {
        alert('HATA: Veritabanında yeni sütunlar eksik.\n\nÇözüm için Supabase SQL Editor\'e şu kodu yapıştırıp çalıştırın:\n\nALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority text DEFAULT \'#2979ff\';\nALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date text;');
      } else {
        alert('Görev atanırken bir hata oluştu: ' + error.message);
      }
    }
  };

  const handleTaskStatusChange = async (personId, taskObj, currentList, newStatus) => {
    const person = isTakip.find(p => p.id === personId);
    if (!person) return;

    const oldStatus = currentList === 'activeTasks' ? 'Yapıyorum' : currentList === 'pendingTasks' ? 'Sırada' : taskObj.status;

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskObj.id);

    if (!error) {
      let logMsg = '';
      if (newStatus === 'Yaptım') {
        logMsg = `${person.rep}, ${taskObj.client_name || 'proje'} üzerindeki görevi başarıyla tamamladı: "${taskObj.task_text}"`;
      } else if (newStatus === 'Yapıyorum') {
        logMsg = `${person.rep}, ${taskObj.client_name || 'proje'} üzerindeki göreve başladı: "${taskObj.task_text}"`;
      } else {
        logMsg = `${person.rep}, ${taskObj.client_name || 'proje'} üzerindeki görevi sıraya aldı.`;
      }

      logActivity('Görev Durumu Güncellendi', logMsg, taskObj.client_name);

      // AUTO-PROGRESS: If task is moved to 'Yaptım' and has a client, update client progress
      if (newStatus === 'Yaptım' && taskObj.client_name) {
        const client = aktifMusteriler.find(c => c.name === taskObj.client_name);
        if (client) {
          const updatedCompleted = [...(client.completed || []), taskObj.task_text];
          const updatedActive = (client.active || []).filter(t => t !== taskObj.task_text);
          const updatedPending = (client.pending || []).filter(t => t !== taskObj.task_text);

          const tot = updatedCompleted.length + updatedActive.length + updatedPending.length;
          const newProgress = tot > 0 ? Math.round((updatedCompleted.length / tot) * 100) : 0;

          await supabase.from('active_clients').update({
            completed: updatedCompleted,
            active: updatedActive,
            pending: updatedPending,
            progress: newProgress,
            current_phase: taskObj.phase || client.current_phase
          }).eq('id', client.id);

          // Müşteriye özel log (Client Portal için)
          if (taskObj.phase && taskObj.phase > client.current_phase) {
            logActivity('Aşama Güncellendi', `${client.name} markası yeni bir evreye geçti: ${taskObj.phase}. Evre`, client.name);
          } else {
            logActivity('Üretim Tamamlandı', `Üretim aşaması tamamlandı: ${taskObj.task_text}`, client.name);
          }
        }
      }

      fetchAllData();
    }
  };

  const handleRequestBrief = async (task) => {
    if (task.brief_request) {
      alert('Bu görev için zaten brief talebinde bulunulmuş.');
      return;
    }
    const brief = window.prompt('Brief talebiniz (Açıklama giriniz):');
    if (brief === null || brief.trim() === '') return;

    const { error } = await supabase.from('tasks').update({ brief_request: brief }).eq('id', task.id);
    if (!error) {
      logActivity('Brief Talebi', `${currentUser.name}, "${task.task_text}" görevi için brief talebinde bulundu.`, task.client_name);
      alert('İstekleriniz iletildi');
      fetchAllData();
    }
  };

  const handleRequestExtension = async (task) => {
    if (task.extension_request) {
      alert('Bu görev için zaten ek süre talebinde bulunulmuş.');
      return;
    }
    const reason = window.prompt('Ek süre talebiniz (Neden ve istenilen tarih):');
    if (reason === null || reason.trim() === '') return;

    const { error } = await supabase.from('tasks').update({ extension_request: reason }).eq('id', task.id);
    if (!error) {
      logActivity('Ek Süre Talebi', `${currentUser.name}, "${task.task_text}" görevi için ek süre talebinde bulundu.`, task.client_name);
      alert('İstekleriniz iletildi');
      fetchAllData();
    }
  };

  const handleRateTask = async (task, score, comment) => {
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
        logActivity('Görev Silindi', 'SİSTEM', `Görev: "${taskObj.task_text}"`);
        fetchAllData();
      }
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const { error } = await supabase.from('chat_messages').insert([{
      user_name: currentUser.name,
      message: chatInput.trim()
    }]);

    if (!error) {
      setChatInput('');
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
    } else {
      console.error('Rating save error:', error);
      alert('Kaydedilirken bir hata oluştu.');
    }
  };

  // İstatistikleri Taba Göre Güncelleme
  const getStats = () => {
    if (activeTab === 'potansiyel') {
      return [
        { title: 'Toplam Potansiyel Lead', value: potansiyel.length, icon: <Users size={24} color="var(--primary)" /> },
        { title: 'Sıcak (Olumlu) Potansiyel', value: potansiyel.filter(p => p.status === 'Sıcak').length, icon: <Activity size={24} color="var(--accent)" /> },
        { title: 'Beklemede', value: potansiyel.filter(p => p.status === 'Beklemede').length, icon: <Clock size={24} color="#ffab00" /> }
      ];
    } else if (activeTab === 'aktif') {
      return [
        { title: 'Aktif Yönetilen Proje', value: aktifMusteriler.length, icon: <Briefcase size={24} color="var(--secondary)" /> },
        { title: 'Ortalama İlerleme Seviyesi', value: `%${Math.round(aktifMusteriler.reduce((a, b) => a + b.progress, 0) / aktifMusteriler.length) || 0}`, icon: <Activity size={24} color="#00e676" /> },
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
      return [
        { title: 'Toplam Takip Edilen Ekip', value: isTakip.length, icon: <UserCheck size={24} color="var(--primary)" /> },
        { title: 'Devam Eden Toplam Görev', value: isTakip.reduce((acc, curr) => acc + curr.activeTasks.length, 0), icon: <Target size={24} color="var(--accent)" /> }
      ];
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Sıcak') return <span style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent)', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>{status}</span>;
    if (status === 'Beklemede' || status === 'Ertelendi') return <span style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(255, 171, 0, 0.1)', color: '#ffab00', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>{status}</span>;
    if (status === 'Reddedildi') return <span style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(255, 0, 85, 0.1)', color: 'var(--secondary)', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>{status}</span>;
    return <span>{status}</span>;
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
        platform: formData.platform,
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
        otherService: ''
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
            package: lead.project || 'Paket Belirlenmedi',
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
    const { data, error } = await supabase
      .from('lead_history')
      .select('*')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setLeadHistory(data);
      setEditLeadData({
        name: lead.name,
        phone: lead.phone || '',
        email: lead.email || '',
        service: lead.service || ''
      });
      setIsLeadDetailModalOpen(true);
      setIsEditingLead(false);
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
          service: editLeadData.service
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

  if (isChecking) {
    return (
      <div style={{ background: '#020202', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
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
    <div className="admin-container" style={{ background: '#020202', minHeight: '100vh', paddingTop: '100px', paddingBottom: '50px', position: 'relative' }}>

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
      <div className="container">

        {/* Üst Header: Sistem Durumu & Çıkış */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="/logo.png" alt="Logo" style={{ height: '32px', width: 'auto' }} />
              <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>Socialart <span className="gradient-text" style={{ fontSize: '0.9rem', opacity: 0.7 }}>MİY v1.0</span></h1>
            </div>
            <button
              onClick={requestNotificationPermission}
              style={{
                background: notifPermission === 'granted' ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.03)',
                color: notifPermission === 'granted' ? 'var(--primary)' : '#666',
                border: '1px solid ' + (notifPermission === 'granted' ? 'var(--primary)' : 'var(--surface-border)'),
                padding: '10px',
                borderRadius: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s'
              }}
              title={notifPermission === 'granted' ? 'Bildirimler Aktif' : 'Bildirimleri Etkinleştir'}
            >
              {notifPermission === 'granted' ? <Bell size={20} fill="var(--primary)" /> : <BellOff size={20} />}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '6px 16px', borderRadius: '50px', border: '1px solid var(--surface-border)' }}>
              <div style={{ width: '8px', height: '8px', background: '#00e676', borderRadius: '50%', boxShadow: '0 0 10px #00e676' }}></div>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>Database Connect: Supabase Active</span>
              <div style={{ width: '1px', height: '16px', background: 'var(--surface-border)', margin: '0 8px' }}></div>
              <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Çıkış Yap">
                <LogOut size={16} />
              </button>
            </div>
            {activeTab === 'potansiyel' && (
              <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={18} style={{ marginRight: '8px' }} /> Yeni Müşteri Ekle
              </button>
            )}
            {activeTab === 'aktif' && (
              <button className="btn btn-primary" onClick={() => setIsClientModalOpen(true)} style={{ background: 'var(--accent)', color: '#000' }}>
                <Plus size={18} style={{ marginRight: '8px' }} /> Yeni Aktif Müşteri
              </button>
            )}
            {activeTab === 'gorev' && currentUser && currentUser.permissions === 'all' && (
              <button className="btn btn-primary" onClick={() => setIsTaskModalOpen(true)}>
                <Plus size={18} style={{ marginRight: '8px' }} /> Yeni Görev Ata
              </button>
            )}
          </div>
        </div>

        {/* Kişisel Karşılama Paneli */}
        <div className="glass" style={{ borderRadius: '24px', padding: '30px', marginBottom: '40px', border: '1px solid var(--surface-border)', background: 'linear-gradient(135deg, rgba(0,229,255,0.05) 0%, rgba(255,0,85,0.02) 100%)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--primary)', filter: 'blur(100px)', opacity: '0.1' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '25px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '18px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '1.8rem', fontWeight: '900', boxShadow: '0 10px 30px rgba(0,229,255,0.3)' }}>
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

        {/* Tab Menüsü */}
        <div className="tab-menu-container">
          <div className="tab-menu">
            <button
              onClick={() => setActiveTab('potansiyel')}
              style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === 'potansiyel' ? 'var(--primary)' : 'transparent', color: activeTab === 'potansiyel' ? '#000' : '#ccc', border: 'none', cursor: 'pointer' }}
            >
              <Users size={18} style={{ display: 'inline', marginRight: '8px', marginBottom: '-4px' }} /> Potansiyel Müşteriler
            </button>
            <button
              onClick={() => setActiveTab('aktif')}
              style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === 'aktif' ? 'var(--accent)' : 'transparent', color: activeTab === 'aktif' ? '#000' : '#ccc', border: 'none', cursor: 'pointer' }}
            >
              <Briefcase size={18} style={{ display: 'inline', marginRight: '8px', marginBottom: '-4px' }} /> Çalışılan Müşteriler
            </button>
            <button
              onClick={() => setActiveTab('gorev')}
              style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === 'gorev' ? 'var(--secondary)' : 'transparent', color: activeTab === 'gorev' ? '#fff' : '#ccc', border: 'none', cursor: 'pointer' }}
            >
              <ClipboardList size={18} style={{ display: 'inline', marginRight: '8px', marginBottom: '-4px' }} /> İş Takip Sistemi
            </button>
            {currentUser.permissions === 'all' && (
              <button
                onClick={() => setActiveTab('log')}
                style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === 'log' ? 'var(--primary)' : 'transparent', color: activeTab === 'log' ? '#000' : '#ccc', border: 'none', cursor: 'pointer' }}
              >
                <Activity size={18} style={{ display: 'inline', marginRight: '8px', marginBottom: '-4px' }} /> Aktivite Kayıtları
              </button>
            )}
            <button
              onClick={() => setActiveTab('chat')}
              style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === 'chat' ? 'var(--secondary)' : 'transparent', color: activeTab === 'chat' ? '#fff' : '#ccc', border: 'none', cursor: 'pointer' }}
            >
              <MessageSquare size={18} style={{ display: 'inline', marginRight: '8px', marginBottom: '-4px' }} /> Ekip Sohbeti
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === 'availability' ? '#ffab00' : 'transparent', color: activeTab === 'availability' ? '#000' : '#ccc', border: 'none', cursor: 'pointer' }}
            >
              <Clock size={18} style={{ display: 'inline', marginRight: '8px', marginBottom: '-4px' }} /> Müsaitlik
            </button>
            <button
              onClick={() => setActiveTab('support')}
              style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === 'support' ? '#00e676' : 'transparent', color: activeTab === 'support' ? '#000' : '#ccc', border: 'none', cursor: 'pointer', position: 'relative' }}
            >
              <MessageCircle size={18} style={{ display: 'inline', marginRight: '8px', marginBottom: '-4px' }} /> Müşteri Talepleri
              {supportMessages.filter(m => !m.is_read && m.sender_type === 'client').length > 0 && (
                <span style={{ position: 'absolute', top: '5px', right: '5px', background: 'var(--secondary)', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid var(--bg-color)' }}></span>
              )}
            </button>
            {currentUser?.permissions === 'all' && (
              <button
                onClick={() => setActiveTab('performance')}
                style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === 'performance' ? 'var(--accent)' : 'transparent', color: activeTab === 'performance' ? '#000' : '#ccc', border: 'none', cursor: 'pointer' }}
              >
                <Users size={18} style={{ display: 'inline', marginRight: '8px', marginBottom: '-4px' }} /> Çalışanlar
              </button>
            )}
            <button
              onClick={() => setActiveTab('gorevList')}
              style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === 'gorevList' ? 'var(--primary)' : 'transparent', color: activeTab === 'gorevList' ? '#000' : '#ccc', border: 'none', cursor: 'pointer' }}
            >
              <ListTodo size={18} style={{ display: 'inline', marginRight: '8px', marginBottom: '-4px' }} /> Görev Listem
            </button>
          </div>
        </div>

        {/* İstatistikler */}
        {!['availability', 'support', 'performance', 'gorevList', 'log', 'chat'].includes(activeTab) && (
          <div className="stats-grid">
            {getStats().map((stat, idx) => (
              <div key={idx} className="glass stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {stat.icon}
                  </div>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '4px' }}>{stat.value}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{stat.title}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 1: POTANSİYEL MÜŞTERİLER */}
        {activeTab === 'potansiyel' && (
          <div className="glass" style={{ borderRadius: '24px', overflow: 'visible', border: '1px solid var(--surface-border)', paddingBottom: '20px' }}>
            <div style={{ overflowX: 'visible' }}>
              <table className="potansiyel-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem', borderTopLeftRadius: '24px' }}>FİRMA / LEAD</th>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>SON TEMAS & BEKLENEN HİZMET</th>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>İLETİŞİM KANALI</th>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem', borderTopRightRadius: '24px' }}>DURUM & SON NOT</th>
                  </tr>
                </thead>
                <tbody>
                  {potansiyel.map((p, idx) => (
                    <tr key={p.id} style={{ borderBottom: idx !== potansiyel.length - 1 ? '1px solid var(--surface-border)' : 'none', cursor: 'pointer', transition: 'background 0.2s' }} className="table-row-hover">
                      <td style={{ padding: '20px 24px' }} onClick={() => fetchLeadHistory(p)}>
                        <div className="card-text-val" style={{ fontWeight: '700', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.status === 'Sıcak' ? '#00e676' : p.status === 'Beklemede' ? '#ffab00' : '#ff0055' }}></div>
                          {p.name}
                        </div>
                        <div className="card-text-val" style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>{p.email} | {p.phone}</div>
                        <div className="card-text-val" style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '6px', fontWeight: '500' }}>Temsilci: {p.rep}</div>
                      </td>
                      <td style={{ padding: '20px 24px', color: '#ccc' }} onClick={() => fetchLeadHistory(p)}>
                        <div className="card-text-val" style={{ fontWeight: '600', color: 'var(--accent)', fontSize: '0.9rem' }}>{p.service}</div>
                        <div className="card-text-val" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={12} /> {p.date}
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px' }} onClick={() => fetchLeadHistory(p)}>
                        <span className="card-text-val" style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 14px', borderRadius: '10px', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.05)', display: 'inline-block' }}>
                          <MessageSquare size={14} style={{ display: 'inline', marginRight: '8px', marginBottom: '-2px' }} />
                          {p.platform}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <div className="card-text-val" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          {/* Özel Durum Seçici (Native select yerine) */}
                          <div className="status-selector" style={{ position: 'relative' }}>
                            <button
                              onClick={() => setOpenStatusId(openStatusId === p.id ? null : p.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(255,255,255,0.03)',
                                color: p.status === 'Sıcak' ? '#00e676' : p.status === 'Reddedildi' ? '#ff0055' : '#ffab00',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '8px 16px',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                width: '160px',
                                justifyContent: 'space-between'
                              }}
                            >
                              <span>
                                {p.status === 'Anlaşıldı' ? '🤝 ' : p.status === 'Sıcak' ? '🔥 ' : p.status === 'Beklemede' ? '⏳ ' : p.status === 'Ertelendi' ? '📅 ' : '❌ '}
                                {p.status}
                              </span>
                              <div style={{ transform: openStatusId === p.id ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>▼</div>
                            </button>

                            {openStatusId === p.id && (
                              <div className="glass" style={{
                                position: 'absolute',
                                top: 'calc(100% + 10px)',
                                left: 0,
                                width: '180px',
                                background: '#111',
                                border: '1px solid #333',
                                borderRadius: '14px',
                                overflow: 'hidden',
                                zIndex: 50,
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                padding: '6px'
                              }}>
                                {[
                                  { val: 'Anlaşıldı', label: '🤝 Anlaşıldı (Aktife Aktar)', color: 'var(--primary)' },
                                  { val: 'Sıcak', label: '🔥 Sıcak / Olumlu', color: '#00e676' },
                                  { val: 'Beklemede', label: '⏳ Beklemede', color: '#ffab00' },
                                  { val: 'Ertelendi', label: '📅 Ertelendi', color: '#ffab00' },
                                  { val: 'Reddedildi', label: '❌ Reddedildi', color: '#ff0055' }
                                ].map(opt => (
                                  <div
                                    key={opt.val}
                                    onClick={() => {
                                      handleLeadStatusChange(p.id, opt.val);
                                      setOpenStatusId(null);
                                    }}
                                    style={{
                                      padding: '10px 14px',
                                      color: opt.color,
                                      fontSize: '0.85rem',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      borderRadius: '8px',
                                      transition: 'background 0.2s'
                                    }}
                                    className="status-option"
                                  >
                                    {opt.label}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div style={{ fontSize: '0.85rem', color: '#aaa', fontStyle: 'italic', maxWidth: '210px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => fetchLeadHistory(p)}>
                            "{p.reaction}"
                          </div>

                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => fetchLeadHistory(p)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '5px' }}>
                              <MoreVertical size={18} />
                            </button>

                            {currentUser.permissions === 'all' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteLead(p.id); }}
                                style={{ background: 'transparent', border: 'none', color: '#ff0055', cursor: 'pointer', padding: '5px', opacity: 0.6 }}
                                title="Sil"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: ÇALIŞILAN MÜŞTERİLER */}
        {activeTab === 'aktif' && (
          <div className="glass" style={{ borderRadius: '24px', overflow: 'visible', border: '1px solid var(--surface-border)', paddingBottom: '20px' }}>
            <div style={{ overflowX: 'visible' }}>
              <table className="potansiyel-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem', borderTopLeftRadius: '24px' }}>MARKA / PAKET</th>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>PROJE İLERLEMESİ</th>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>REKLAM DURUMU</th>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem', borderTopRightRadius: '24px' }}>İŞ LİSTELERİ & AKSİYON</th>
                  </tr>
                </thead>
                <tbody>
                  {aktifMusteriler.map((client, idx) => (
                    <tr key={client.id} style={{ borderBottom: idx !== aktifMusteriler.length - 1 ? '1px solid var(--surface-border)' : 'none', transition: 'background 0.2s' }} className="table-row-hover">
                      <td style={{ padding: '20px 24px' }}>
                        <div className="card-text-val" style={{ fontWeight: '700', fontSize: '1.2rem', color: '#fff' }}>{client.name}</div>
                        <div className="card-text-val" style={{ fontSize: '0.85rem', color: 'var(--accent)', marginTop: '4px' }}>{client.package}</div>
                      </td>
                      <td style={{ padding: '20px 24px', minWidth: '200px' }}>
                        <div className="card-text-val" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ width: `${client.progress}%`, height: '100%', background: 'var(--secondary)', borderRadius: '10px' }}></div>
                          </div>
                          <span style={{ fontWeight: '800', color: 'var(--secondary)', fontSize: '0.9rem' }}>%{client.progress}</span>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <div className="card-text-val" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: client.ads_active ? '#00e676' : '#666' }}></div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: client.ads_active ? '#00e676' : '#888' }}>
                            {client.ads_active ? 'REKLAM AKTİF' : 'REKLAM PASİF'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <div className="card-text-val" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <span title="Tamamlanan" style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', background: 'rgba(0,230,118,0.1)', color: '#00e676' }}>{client.completed.length} Bitti</span>
                            <span title="Devam Eden" style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', background: 'rgba(0,229,255,0.1)', color: 'var(--primary)' }}>{client.active.length} Aktif</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => {
                                setEditClientData({
                                  id: client.id,
                                  name: client.name,
                                  package: client.package,
                                  completed: client.completed.join(', '),
                                  active: client.active.join(', '),
                                  pending: client.pending.join(', '),
                                  ads_active: client.ads_active || false
                                });
                                setIsEditClientModalOpen(true);
                              }}
                              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}
                            >
                              <MoreVertical size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteActiveClient(client.id)}
                              style={{ background: 'rgba(255,23,68,0.05)', border: '1px solid rgba(255,23,68,0.1)', color: '#ff1744', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: İŞ TAKİP SİSTEMİ */}
        {activeTab === 'gorev' && (
          <div className="task-manager-grid">
            {[...isTakip].sort((a, b) => {
              if (a.rep === currentUser?.name) return -1;
              if (b.rep === currentUser?.name) return 1;
              return 0;
            }).map((person) => (
              <div key={person.id} className="glass" style={{
                padding: '30px',
                borderRadius: '24px',
                border: person.rep === currentUser.name ? '2px solid var(--primary)' : '1px solid var(--surface-border)',
                position: 'relative',
                background: person.rep === currentUser.name ? 'rgba(0,229,255,0.03)' : 'rgba(255,255,255,0.01)'
              }}>
                {person.rep === currentUser.name && (
                  <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--primary)', color: '#000', fontSize: '0.7rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px' }}>SİZİN PANELİNİZ</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
                  <div style={{ width: '56px', height: '56px', background: person.rep === currentUser.name ? 'var(--primary)' : '#333', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: person.rep === currentUser.name ? '#000' : '#fff', fontWeight: '800', fontSize: '1.5rem' }}>
                    {person.rep.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff' }}>{person.rep}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '2px' }}>{person.role}</p>
                  </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <h4 style={{ color: 'var(--primary)', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                    <Activity size={16} /> Şu An Üzerinde Çalıştığı Görevler
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {person.activeTasks.map((t, i) => (
                      <div key={t.id} style={{ background: 'rgba(0, 229, 255, 0.05)', padding: '14px 18px', borderRadius: '12px', fontSize: '0.95rem', color: '#fff', borderLeft: '3px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <div style={{ width: '4px', height: '20px', background: t.priority || '#2979ff', borderRadius: '2px', flexShrink: 0 }}></div>
                          <span style={{ fontWeight: '500', wordBreak: 'break-word', flex: 1, minWidth: '150px' }}>{t.task_text}</span>
                          <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', color: '#888', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{(t.category || 'Proje').toUpperCase()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <select value={t.status} disabled={currentUser?.name !== t.assignee_name} onChange={e => handleTaskStatusChange(person.id, t, 'activeTasks', e.target.value)} style={{ background: '#00e676', color: '#000', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '0.8rem', fontWeight: 'bold', outline: 'none', cursor: (currentUser?.name === t.assignee_name) ? 'pointer' : 'not-allowed', opacity: (currentUser?.name === t.assignee_name) ? 1 : 0.6 }}>
                            <option value="Yapıyorum">🔥 Yapıyorum</option>
                            <option value="Revize">🔄 Revize</option>
                            <option value="Yaptım">✅ Yaptım</option>
                            <option value="Tamamlanamadı">❌ Tamamlanamadı</option>
                          </select>
                          {(currentUser?.name === t.assignee_name) && (
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <button onClick={() => handleRequestBrief(t)} title="Brief İste" style={{ padding: '4px 8px', borderRadius: '6px', background: t.brief_request ? '#ff4081' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', fontSize: '0.7rem', cursor: 'pointer' }}>
                                <FileText size={12} />
                              </button>
                              <button onClick={() => handleRequestExtension(t)} title="Ek Süre İste" style={{ padding: '4px 8px', borderRadius: '6px', background: t.extension_request ? '#ffab00' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', fontSize: '0.7rem', cursor: 'pointer' }}>
                                <Clock size={12} />
                              </button>
                            </div>
                          )}
                          {currentUser?.permissions === 'all' && (
                            <button onClick={() => handleDeleteTask(person.id, t)} style={{ background: 'transparent', border: 'none', color: '#ff0055', cursor: 'pointer', padding: '5px' }}>
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        {t.client_name && (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.7rem', background: 'rgba(0,229,255,0.1)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{t.client_name}</span>
                              <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', color: '#888', padding: '2px 8px', borderRadius: '4px' }}>
                                {t.phase === 1 ? '1. Evre: Planlama' : t.phase === 2 ? '2. Evre: Prodüksiyon' : t.phase === 3 ? '3. Evre: Kreatif/Kurgu' : t.phase === 4 ? '4. Evre: Onay/Revize' : t.phase === 5 ? '5. Evre: Yayın/Rapor' : `${t.phase}. Evre`}
                              </span>
                            </div>
                            {t.due_date && (
                              <span style={{ fontSize: '0.7rem', color: t.priority || '#2979ff', fontWeight: 'bold' }}>🗓 {t.due_date}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <h4 style={{ color: '#ffab00', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                    <ListTodo size={16} /> Yapması Beklenenler (To-Do)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {person.pendingTasks.map((t, i) => (
                      <div key={t.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '14px 18px', borderRadius: '12px', fontSize: '0.95rem', color: '#aaa', border: '1px dashed rgba(255,255,255,0.1)', borderLeft: `3px solid ${t.priority || '#2979ff'}`, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                            <div style={{ width: '4px', height: '20px', background: t.priority || '#2979ff', borderRadius: '2px', flexShrink: 0 }}></div>
                            <span style={{ wordBreak: 'break-word' }}>{t.task_text}</span>
                            <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', color: '#888', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', flexShrink: 0 }}>{(t.category || 'Proje').toUpperCase()}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            <select value={t.status} disabled={currentUser?.name !== t.assignee_name} onChange={e => handleTaskStatusChange(person.id, t, 'pendingTasks', e.target.value)} style={{ background: '#ffab00', color: '#000', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '0.8rem', fontWeight: 'bold', outline: 'none', cursor: (currentUser?.name === t.assignee_name) ? 'pointer' : 'not-allowed', opacity: (currentUser?.name === t.assignee_name) ? 1 : 0.6 }}>
                              <option value="Sırada">⏳ Sırada</option>
                              <option value="Yapıyorum">🔥 Yapıyorum</option>
                              <option value="Revize">🔄 Revize</option>
                              <option value="Yaptım">✅ Yaptım</option>
                              <option value="Tamamlanamadı">❌ Tamamlanamadı</option>
                            </select>
                            {(currentUser?.name === person.rep || currentUser?.permissions === 'all') && (
                              <button onClick={() => handleDeleteTask(person.id, t)} style={{ background: 'transparent', border: 'none', color: '#ff0055', cursor: 'pointer', padding: '5px' }}>
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                        {t.client_name && (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.7rem', background: 'rgba(255,171,0,0.1)', color: '#ffab00', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{t.client_name}</span>
                              <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', color: '#888', padding: '2px 8px', borderRadius: '4px' }}>
                                {t.phase === 1 ? '1. Evre: Planlama' : t.phase === 2 ? '2. Evre: Prodüksiyon' : t.phase === 3 ? '3. Evre: Kreatif/Kurgu' : t.phase === 4 ? '4. Evre: Onay/Revize' : t.phase === 5 ? '5. Evre: Yayın/Rapor' : `${t.phase}. Evre`}
                              </span>
                            </div>
                            {t.due_date && (
                              <span style={{ fontSize: '0.7rem', color: t.priority || '#2979ff', fontWeight: 'bold' }}>🗓 {t.due_date}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {(person.completedTasks && person.completedTasks.length > 0) && (
                  <div>
                    <h4 style={{ color: '#00e676', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                      <CheckCircle2 size={16} /> Tamamladıkları
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {person.completedTasks.map((t, i) => (
                        <div key={t.id} style={{ background: 'rgba(0,230,118,0.05)', padding: '14px 18px', borderRadius: '12px', fontSize: '0.95rem', color: '#00e676', borderLeft: `3px solid ${t.priority || '#00e676'}`, display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.75, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                              <div style={{ width: '4px', height: '18px', background: t.priority || '#00e676', borderRadius: '2px', flexShrink: 0 }}></div>
                              <span style={{ textDecoration: 'line-through', wordBreak: 'break-word' }}>{t.task_text}</span>
                              <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', color: '#00e676', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', border: '1px solid rgba(0,230,118,0.2)', flexShrink: 0 }}>{(t.category || 'Proje').toUpperCase()}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                              <select value={t.status} disabled={currentUser?.name !== t.assignee_name} onChange={e => handleTaskStatusChange(person.id, t, 'completedTasks', e.target.value)} style={{ background: t.status === 'Yaptım' ? '#00e676' : '#666', color: '#000', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '0.8rem', fontWeight: 'bold', outline: 'none', cursor: (currentUser?.name === t.assignee_name) ? 'pointer' : 'not-allowed', opacity: (currentUser?.name === t.assignee_name) ? 1 : 0.6 }}>
                                <option value="Sırada">⏳ Sırada</option>
                                <option value="Yapıyorum">🔥 Yapıyorum</option>
                                <option value="Revize">🔄 Revize</option>
                                <option value="Yaptım">✅ Yaptım</option>
                                <option value="Tamamlanamadı">❌ Tamamlanamadı</option>
                              </select>
                              {currentUser?.permissions === 'all' && (
                                <button onClick={() => handleDeleteTask(person.id, t)} style={{ background: 'transparent', border: 'none', color: '#ff0055', cursor: 'pointer', padding: '5px' }}>
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                          {t.due_date && (
                            <span style={{ fontSize: '0.7rem', color: t.priority || '#2979ff', fontWeight: 'bold', paddingLeft: '12px' }}>🗓 Teslim: {t.due_date}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Potansiyel Müşteri Ekleme Modalı */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass" style={{ border: '1px solid var(--surface-border)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '600px', position: 'relative' }}>
            <button onClick={() => setIsAddModalOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '30px', color: '#fff' }}>Yeni Lead Kaydı</h2>
            <form onSubmit={handleAddPotansiyel} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Firma / Kişi Adı</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>İletişim Kanalı</label>
                  <select value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', appearance: 'none' }}>
                    <option value="">Seçiniz...</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram DM">Instagram DM</option>
                    <option value="Telefon">Telefon Görüşmesi</option>
                    <option value="Mail">E-posta</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>E-posta Adresi</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }} placeholder="ornek@sirket.com" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Telefon</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }} placeholder="05XX XXX XX XX" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '12px', color: '#ccc', fontSize: '0.9rem' }}>Beklenen Hizmetler (Birden fazla seçilebilir)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid #333' }}>
                  {[
                    '360° Sosyal Medya Yönetimi',
                    'Kreatif İçerik / Çekim',
                    'Meta & Google Reklam',
                    'Web Tasarım / Yazılım',
                    'Marka Kimliği Tasarımı',
                    'Influencer Marketing',
                    'Video Prodüksiyon',
                    'Diğer'
                  ].map((service) => (
                    <label key={service} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#eee' }}>
                      <input
                        type="checkbox"
                        checked={formData.selectedServices.includes(service)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...formData.selectedServices, service]
                            : formData.selectedServices.filter(s => s !== service);
                          setFormData({ ...formData, selectedServices: updated });
                        }}
                        style={{ accentColor: 'var(--primary)' }}
                      />
                      {service}
                    </label>
                  ))}
                </div>
                {formData.selectedServices.includes('Diğer') && (
                  <div style={{ marginTop: '12px' }}>
                    <input
                      type="text"
                      placeholder="Lütfen diğer hizmeti belirtin..."
                      value={formData.otherService}
                      onChange={e => setFormData({ ...formData, otherService: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'rgba(0,229,255,0.05)', border: '1px solid var(--primary)', borderRadius: '8px', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Temsilci / İlgilenen</label>
                  <input type="text" required value={formData.rep} onChange={e => setFormData({ ...formData, rep: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Aşama</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', appearance: 'none' }}>
                    <option value="Sıcak">Sıcak / Olumlu</option>
                    <option value="Beklemede">Beklemede / Kararsız</option>
                    <option value="Ertelendi">Ertelendi</option>
                    <option value="Reddedildi">Reddedildi</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Görüşme Neden Yarım Kaldı / Müşteri Ne Dedi?</label>
                <textarea rows="3" required value={formData.reaction} onChange={e => setFormData({ ...formData, reaction: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', resize: 'vertical' }} placeholder="Fiyat çok geldi, eşiyle görüşecek vs." />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '14px', fontSize: '1rem', marginTop: '10px' }}>Kaydet ve Listeye Ekle</button>
            </form>
          </div>
        </div>
      )}

      {/* Görev Atama Modalı */}
      {isTaskModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass" style={{ border: '1px solid var(--surface-border)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={() => setIsTaskModalOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '30px', color: '#fff' }}>Personele Görev Ata</h2>
            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Marka / Müşteri</label>
                  <select value={taskFormData.clientName} onChange={e => setTaskFormData({ ...taskFormData, clientName: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', appearance: 'none' }}>
                    <option value="">Genel Görev</option>
                    {aktifMusteriler.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Kategori</label>
                  <select value={taskFormData.category} onChange={e => setTaskFormData({ ...taskFormData, category: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', appearance: 'none' }}>
                    <option value="Proje">📂 Proje Bazlı</option>
                    <option value="Fotoğraf">📸 Fotoğraf</option>
                    <option value="Video">🎥 Video</option>
                    <option value="Reklam">🚀 Reklam</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Süreç Evresi</label>
                  <select value={taskFormData.phase} onChange={e => setTaskFormData({ ...taskFormData, phase: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', appearance: 'none' }}>
                    <option value="1">1. Evre: Planlama</option>
                    <option value="2">2. Evre: Prodüksiyon</option>
                    <option value="3">3. Evre: Kreatif/Kurgu</option>
                    <option value="4">4. Evre: Onay/Revize</option>
                    <option value="5">5. Evre: Yayın/Rapor</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Görevin Önceliği (Süreye Göre)</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {[
                      { color: '#ff1744', label: 'ACİL (1-2 GÜN)', val: '#ff1744' },
                      { color: '#2979ff', label: 'NORMAL (3-6 GÜN)', val: '#2979ff' },
                      { color: '#00e676', label: 'ESNEK (7+ GÜN)', val: '#00e676' }
                    ].map(p => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setTaskFormData({ ...taskFormData, priority: p.val })}
                        style={{
                          flex: 1,
                          padding: '10px 5px',
                          background: taskFormData.priority === p.val ? p.color : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${p.color}`,
                          borderRadius: '8px',
                          color: taskFormData.priority === p.val ? '#000' : p.color,
                          fontSize: '0.65rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Teslim Tarihi (Ops.)</label>
                  <input
                    type="date"
                    value={taskFormData.due_date}
                    onChange={e => setTaskFormData({ ...taskFormData, due_date: e.target.value })}
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Çalışan / Personel</label>
                <select required value={taskFormData.empId} onChange={e => setTaskFormData({ ...taskFormData, empId: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', appearance: 'none' }}>
                  <option value="">Ekip Üyesi Seçin...</option>
                  {isTakip.map(person => (
                    <option key={person.id} value={person.id}>{person.rep}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Görev Aşaması</label>
                <select value={taskFormData.taskType} onChange={e => setTaskFormData({ ...taskFormData, taskType: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', appearance: 'none' }}>
                  <option value="pendingTasks">Bekleyen (To-Do) Yapılacaklar</option>
                  <option value="activeTasks">Acil - Şu An Yapılmalı</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Görev Açıklaması</label>
                <textarea rows="3" required value={taskFormData.task} onChange={e => setTaskFormData({ ...taskFormData, task: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', resize: 'vertical' }} placeholder="Projeyi hızlandırmak için yeni UI tasarımını tamamla..." />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '14px', fontSize: '1rem', marginTop: '10px' }}>Kaydet ve Listeye Ekle</button>
            </form>
          </div>
        </div>
      )}

      {/* Aktif Müşteri Ekleme Modalı */}
      {isClientModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(100px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass" style={{ border: '1px solid var(--surface-border)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '650px', position: 'relative' }}>
            <button onClick={() => setIsClientModalOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '30px', color: '#fff' }}>Yeni Aktif Müşteri Dosyası</h2>
            <form onSubmit={handleAddAktifMusteri} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Firma Adı</label>
                  <input type="text" required value={clientFormData.name} onChange={e => setClientFormData({ ...clientFormData, name: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Kapsam / Paket</label>
                  <input type="text" required value={clientFormData.package} onChange={e => setClientFormData({ ...clientFormData, package: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }} placeholder="E-ticaret Yönetimi vb." />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#ccc', fontSize: '0.9rem' }}>İlerleme Durumu (Otomatik Hesaplanır)</label>
                  <div style={{ background: 'var(--accent)', color: '#000', padding: '4px 10px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800' }}>
                    %{(() => {
                      const c = clientFormData.completed.split(',').filter(s => s.trim() !== '').length;
                      const a = clientFormData.active.split(',').filter(s => s.trim() !== '').length;
                      const p = clientFormData.pending.split(',').filter(s => s.trim() !== '').length;
                      const tot = c + a + p;
                      return tot > 0 ? Math.round((c / tot) * 100) : 0;
                    })()}
                  </div>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', width: '100%' }}>
                  <div style={{
                    height: '100%',
                    background: 'var(--accent)',
                    borderRadius: '10px',
                    transition: 'width 0.3s ease',
                    width: (() => {
                      const c = clientFormData.completed.split(',').filter(s => s.trim() !== '').length;
                      const a = clientFormData.active.split(',').filter(s => s.trim() !== '').length;
                      const p = clientFormData.pending.split(',').filter(s => s.trim() !== '').length;
                      const tot = c + a + p;
                      return `${tot > 0 ? Math.round((c / tot) * 100) : 0}%`;
                    })()
                  }}></div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Tamamlananlar (Virgülle Ayırın)</label>
                <textarea rows="2" value={clientFormData.completed} onChange={e => setClientFormData({ ...clientFormData, completed: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', resize: 'vertical' }} placeholder="Logolar onaylandı, Web sitesi yayında" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Şu An Yapılanlar</label>
                  <textarea rows="2" value={clientFormData.active} onChange={e => setClientFormData({ ...clientFormData, active: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }} placeholder="Reels kurguları, Blog yazımı" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Bizi Bekleyenler / Plan</label>
                  <textarea rows="2" value={clientFormData.pending} onChange={e => setClientFormData({ ...clientFormData, pending: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }} placeholder="Raporlama süreci, Saha çekimi" />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="new_ads_active"
                  checked={clientFormData.ads_active}
                  onChange={e => setClientFormData({ ...clientFormData, ads_active: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="new_ads_active" style={{ color: '#fff', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '600' }}>Reklamlar Aktif</label>
              </div>

              <button type="submit" className="btn" style={{ background: 'var(--accent)', color: '#000', padding: '14px', fontSize: '1rem', marginTop: '10px', fontWeight: '800' }}>Projeyi Kaydet</button>
            </form>
          </div>
        </div>
      )}
      {/* Müşteri Detay & Geçmiş Modalı */}
      {isLeadDetailModalOpen && selectedLead && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(100px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass" style={{ border: '1px solid var(--surface-border)', borderRadius: '32px', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

            <button onClick={() => setIsLeadDetailModalOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', color: '#888', background: 'transparent', border: 'none', cursor: 'pointer', zIndex: 10 }}>
              <X size={24} />
            </button>

            <div style={{ padding: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
              {!isEditingLead ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '1.5rem', fontWeight: '900' }}>{selectedLead.name.charAt(0)}</div>
                    <div>
                      <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#fff' }}>{selectedLead.name}</h2>
                      <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>{selectedLead.service}</span>
                        <span style={{ fontSize: '0.9rem', color: '#888' }}>•</span>
                        <span style={{ fontSize: '0.9rem', color: '#888' }}>{selectedLead.phone || 'Telefon Yok'}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsEditingLead(true)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #444', color: '#fff', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Edit3 size={18} /> Düzenle
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateLead} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <input 
                      value={editLeadData.name} 
                      onChange={e => setEditLeadData({...editLeadData, name: e.target.value})}
                      placeholder="İsim Soyisim"
                      style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid #444', borderRadius: '10px', color: '#fff' }}
                    />
                    <input 
                      value={editLeadData.phone} 
                      onChange={e => setEditLeadData({...editLeadData, phone: e.target.value})}
                      placeholder="Telefon"
                      style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid #444', borderRadius: '10px', color: '#fff' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <input 
                      value={editLeadData.email} 
                      onChange={e => setEditLeadData({...editLeadData, email: e.target.value})}
                      placeholder="E-posta"
                      style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid #444', borderRadius: '10px', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px' }}>İlgilenilen Hizmetler:</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid #333' }}>
                      {[
                        "Sosyal Medya Yönetimi",
                        "Video / Reels Prodüksiyon",
                        "Reklam Yönetimi",
                        "Web / Yazılım",
                        "Kurumsal Kimlik",
                        "Fotoğraf Çekimi",
                        "Sunuculu Tanıtım",
                        "Grafik Tasarım",
                        "Influencer Marketing"
                      ].map(srv => {
                        const isChecked = editLeadData.service?.split(', ').includes(srv);
                        return (
                          <label key={srv} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: isChecked ? 'var(--primary)' : '#ccc' }}>
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleEditLeadService(srv)}
                              style={{ accentColor: 'var(--primary)' }}
                            />
                            {srv}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px' }}>Kaydet</button>
                    <button type="button" onClick={() => setIsEditingLead(false)} style={{ background: 'transparent', color: '#888', padding: '8px 20px' }}>Vazgeç</button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Content - Scrollable */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>

              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MessageSquare size={18} color="var(--primary)" /> Süreç Notu Ekle / Güncelle
                </h3>
                <form onSubmit={handleAddHistoryNote} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Müşteriyle son görüşme ne durumda? Bir not bırakın..."
                    style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid #333', borderRadius: '15px', color: '#fff', outline: 'none', resize: 'none' }}
                    rows="2"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input
                        type="file"
                        id="lead-file-upload"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        style={{ display: 'none' }}
                        accept=".pdf,.png,.jpg,.jpeg"
                      />
                      <label 
                        htmlFor="lead-file-upload" 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          padding: '10px 15px', 
                          background: 'rgba(255,255,255,0.05)', 
                          border: '1px solid #444', 
                          borderRadius: '10px', 
                          color: '#ccc', 
                          fontSize: '0.85rem', 
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Camera size={16} />
                        {selectedFile ? selectedFile.name : 'Dosya Ekle (PDF, PNG, JPG)'}
                        {selectedFile && <X size={14} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedFile(null); }} style={{ marginLeft: 'auto' }} />}
                      </label>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={isUploading}
                        style={{ padding: '0 30px', height: '42px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        {isUploading ? 'Yükleniyor...' : 'Kaydet'}
                      </button>
                      {currentUser.permissions === 'all' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteLead(selectedLead.id)}
                          style={{ padding: '0 15px', height: '42px', background: 'rgba(255,0,85,0.1)', color: 'var(--secondary)', border: '1px solid rgba(255,0,85,0.2)', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Kaydı Sil
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              <div>
                <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Activity size={18} color="var(--accent)" /> Geçmiş Hareketler & Zaman Çizelgesi
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {leadHistory.map((history, idx) => (
                    <div key={history.id} style={{ display: 'flex', gap: '20px', borderLeft: idx === leadHistory.length - 1 ? 'none' : '2px solid rgba(255,255,255,0.05)', marginLeft: '10px', paddingLeft: '30px', paddingBottom: '30px', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-7px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: history.type === 'durum_degisikligi' ? 'var(--accent)' : 'var(--primary)', boxShadow: `0 0 10px ${history.type === 'durum_degisikligi' ? 'var(--accent)' : 'var(--primary)'}` }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#888', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{new Date(history.created_at).toLocaleString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          {history.author_name && <span style={{ color: 'var(--primary)' }}>İŞLEMİ YAPAN: {history.author_name}</span>}
                        </div>
                        <div style={{ color: history.type === 'durum_degisikligi' ? '#ccc' : '#fff', fontSize: '1rem', lineHeight: '1.5', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.03)' }}>
                          {history.note}
                          {history.attachment_url && (
                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                              <a 
                                href={history.attachment_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '8px', 
                                  color: 'var(--primary)', 
                                  textDecoration: 'none',
                                  fontSize: '0.9rem',
                                  fontWeight: 'bold',
                                  background: 'rgba(0,229,255,0.1)',
                                  padding: '8px 14px',
                                  borderRadius: '10px',
                                  border: '1px solid rgba(0,229,255,0.2)'
                                }}
                              >
                                {history.file_name?.toLowerCase().endsWith('.pdf') ? <FileText size={16} /> : <Camera size={16} />}
                                {history.file_name || 'Eki Görüntüle'}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {leadHistory.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Kayıtlı geçmiş bulunamadı.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Aktivite Log Tablosu */}
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
              <button onClick={fetchAllData} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem' }}>Verileri Tazele</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>TARİH / SAAT</th>
                  <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>KULLANICI</th>
                  <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>İŞLEM</th>
                  <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>HEDEF / DETAY</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map((log, idx) => (
                  <tr key={log.id} style={{ borderBottom: idx !== activityLogs.length - 1 ? '1px solid var(--surface-border)' : 'none' }}>
                    <td style={{ padding: '15px 24px', fontSize: '0.85rem', color: '#888' }}>
                      {new Date(log.created_at).toLocaleString('tr-TR')}
                    </td>
                    <td style={{ padding: '15px 24px' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{log.user_name}</span>
                    </td>
                    <td style={{ padding: '15px 24px' }}>
                      <span style={{
                        background: log.action.includes('Silindi') ? 'rgba(255,0,85,0.1)' : 'rgba(0,229,255,0.1)',
                        color: log.action.includes('Silindi') ? 'var(--secondary)' : 'var(--primary)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>{log.action}</span>
                    </td>
                    <td style={{ padding: '15px 24px' }}>
                      <div style={{ fontWeight: '600', color: '#fff' }}>{log.target_name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>{log.details}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ekip Sohbeti Tabı */}
      {activeTab === 'chat' && (
        <div className="glass" style={{ borderRadius: '24px', height: 'calc(100vh - 250px)', minHeight: '600px', display: 'flex', flexDirection: 'column', border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
          <div style={{ padding: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Ekip Sohbeti</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ekip üyeleriyle anlık mesajlaşın</p>
            </div>
          </div>

          {/* Mesaj Listesi */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '30px', display: 'flex', flexDirection: 'column-reverse', gap: '20px', background: 'rgba(0,0,0,0.1)' }}>
            {chatMessages.map((msg) => (
              <div key={msg.id} style={{ alignSelf: msg.user_name === currentUser.name ? 'flex-end' : 'flex-start', maxWidth: '70%', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.user_name === currentUser.name ? 'flex-end' : 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: '800' }}>{msg.user_name}</span>
                    <span style={{ fontSize: '0.65rem', color: '#555' }}>{new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: msg.user_name === currentUser.name ? '20px 2px 20px 20px' : '2px 20px 20px 20px',
                    background: msg.user_name === currentUser.name ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.03)',
                    color: msg.user_name === currentUser.name ? '#000' : '#fff',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    boxShadow: msg.user_name === currentUser.name ? '0 5px 15px rgba(0,229,255,0.2)' : 'none',
                    border: msg.user_name === currentUser.name ? 'none' : '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Alanı */}
          <form onSubmit={handleSendChatMessage} style={{ padding: '25px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '15px', background: 'rgba(0,0,0,0.2)' }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Örn: Merhaba ekip, bugünkü toplantı saat kaçta?"
              style={{ flex: 1, padding: '15px 20px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '15px', color: '#fff', outline: 'none', fontSize: '1rem' }}
            />
            <button type="submit" style={{ width: '55px', height: '55px', borderRadius: '15px', background: 'var(--primary-gradient)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#000', boxShadow: '0 5px 15px rgba(0,229,255,0.3)', transition: 'transform 0.2s' }}>
              <Send size={24} />
            </button>
          </form>
        </div>
      )}

      {/* Müsaitlik Ayarları Tabı */}
      {activeTab === 'availability' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

          {/* Üst Kısım: Randevu Bekleyenler */}
          <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255, 171, 0, 0.2)' }}>
            <div style={{ padding: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255, 171, 0, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={20} color="#ffab00" /> Siteden Gelen Randevu Talepleri (Bekleyenler)
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#ffab00', fontWeight: 'bold' }}>{appointments.filter(a => a.status === 'Beklemede').length} YENİ TALEP</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>MÜŞTERİ BİLGİSİ</th>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>İSTENEN TARİH / SAAT</th>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>HİZMETLER</th>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'right' }}>İŞLEMLER</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.filter(a => a.status === 'Beklemede').map((appt) => (
                    <tr key={appt.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                      <td style={{ padding: '15px 24px' }}>
                        <div style={{ fontWeight: '700', color: '#fff' }}>{appt.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>{appt.email} | {appt.phone}</div>
                      </td>
                      <td style={{ padding: '15px 24px' }}>
                        <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{appt.appointment_date}</div>
                        <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{appt.appointment_time}</div>
                      </td>
                      <td style={{ padding: '15px 24px', fontSize: '0.8rem', color: '#ccc' }}>
                        {appt.services}
                      </td>
                      <td style={{ padding: '15px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleApproveAppointment(appt)}
                            style={{ background: '#00e676', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
                          >
                            ONAYLA & KAPAT
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(appt.id)}
                            style={{ background: 'rgba(255,0,85,0.1)', color: 'var(--secondary)', border: '1px solid rgba(255,0,85,0.2)', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
                          >
                            İPTAL ET
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {appointments.filter(a => a.status === 'Beklemede').length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Bekleyen randevu talebi bulunmuyor.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '30px' }}>

            {/* Alt Sol: Manuel Randevu / Tarih Kapatma */}
            <div className="glass" style={{ borderRadius: '24px', padding: '30px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Plus size={20} color="var(--primary)" /> Manuel Randevu Ekle / Blokla
              </h3>

              <form onSubmit={handleManualAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.85rem' }}>Müşteri Ad Soyad</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }} placeholder="Örn: Mehmet Öz" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.85rem' }}>E-posta</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.85rem' }}>Telefon</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }} />
                  </div>
                </div>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '5px 0' }}></div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.85rem' }}>Tarih Seçin</label>
                  <input
                    type="date"
                    required
                    value={blockDate}
                    onChange={e => setBlockDate(e.target.value)}
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.85rem' }}>Saat Dilimi</label>
                  <select
                    value={blockTime}
                    onChange={e => setBlockTime(e.target.value)}
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }}
                  >
                    <option value="Tüm Gün">🚀 Tüm Gün (Full Kapalı)</option>
                    <option value="09:00 - 10:00">09:00 - 10:00</option>
                    <option value="10:00 - 11:00">10:00 - 11:00</option>
                    <option value="11:00 - 12:00">11:00 - 12:00</option>
                    <option value="12:00 - 13:00">12:00 - 13:00</option>
                    <option value="13:00 - 14:00">13:00 - 14:00</option>
                    <option value="14:00 - 15:00">14:00 - 15:00</option>
                    <option value="15:00 - 16:00">15:00 - 16:00</option>
                    <option value="16:00 - 17:00">16:00 - 17:00</option>
                    <option value="17:00 - 18:00">17:00 - 18:00</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={currentUser?.permissions !== 'all'}
                  style={{ fontWeight: '800', padding: '15px', opacity: currentUser?.permissions === 'all' ? 1 : 0.5, cursor: currentUser?.permissions === 'all' ? 'pointer' : 'not-allowed' }}
                >
                  {currentUser?.permissions === 'all' ? 'Randevu Ekle & Takvimi Kapat' : 'Yalnızca Yönetici İşlem Yapabilir'}
                </button>
              </form>
            </div>

            {/* Alt Sağ: Mevcut Kapatmalar */}
            <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
              <div style={{ padding: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Kapalı / Dolu Randevu Dilimleri</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
                      <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>TARİH</th>
                      <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>SAAT DİLİMİ</th>
                      <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>DURUM</th>
                      <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'right' }}>İŞLEM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockedSlots.map((slot) => (
                      <tr key={slot.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                        <td style={{ padding: '15px 24px', color: '#fff', fontWeight: '600' }}>{slot.blocked_date}</td>
                        <td style={{ padding: '15px 24px', color: '#aaa' }}>{slot.time_slot || 'Tüm Gün'}</td>
                        <td style={{ padding: '15px 24px' }}>
                          <span style={{ background: 'rgba(255,0,85,0.1)', color: 'var(--secondary)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>DOLU / KAPALI</span>
                        </td>
                        <td style={{ padding: '15px 24px', textAlign: 'right' }}>
                          {currentUser.permissions === 'all' && (
                            <button
                              onClick={() => handleUnblockSlot(slot.id)}
                              style={{ background: 'rgba(0,230,118,0.1)', color: '#00e676', border: '1px solid rgba(0,230,118,0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}
                            >
                              Geri Aç
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {blockedSlots.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Şu an kapatılmış bir tarih bulunmuyor.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

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
                  {currentUser?.permissions === 'all' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!showClearConfirm ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowClearConfirm(true);
                          }}
                          style={{
                            background: 'rgba(255,0,85,0.1)',
                            color: 'var(--secondary)',
                            border: '1px solid rgba(255,0,85,0.2)',
                            padding: '8px 15px',
                            borderRadius: '10px',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                          }}
                        >
                          <Trash2 size={16} /> Kanalı Temizle
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearMessages();
                            }}
                            style={{
                              background: 'var(--secondary)',
                              color: '#fff',
                              border: 'none',
                              padding: '8px 15px',
                              borderRadius: '10px',
                              fontSize: '0.8rem',
                              fontWeight: '800',
                              cursor: 'pointer',
                              boxShadow: '0 0 15px rgba(255,0,85,0.4)'
                            }}
                          >
                            ⚠️ SİLMEYİ ONAYLA
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowClearConfirm(false);
                            }}
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              color: '#fff',
                              border: '1px solid rgba(255,255,255,0.1)',
                              padding: '8px 15px',
                              borderRadius: '10px',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            İPTAL
                          </button>
                        </>
                      )}
                    </div>
                  )}
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
      {activeTab === 'performance' && (
        <div className={`performance-layout ${perfEmployee ? 'detail-active' : 'list-active'}`} style={{ display: 'grid', gap: '30px', animation: 'fadeIn 0.5s ease' }}>

          {/* Sol Kolon: Çalışan Listesi */}
          <div className="side-panel" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div className="glass" style={{ borderRadius: '24px', padding: '25px', position: 'sticky', top: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={20} color="var(--primary)" /> Ekip Üyeleri
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {isTakip.map((emp) => (
                  <div
                    key={emp.rep}
                    onClick={() => setPerfEmployee(emp.rep)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '16px',
                      background: perfEmployee === emp.rep ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.02)',
                      color: perfEmployee === emp.rep ? '#000' : '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700' }}>{emp.rep}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{emp.role}</div>
                    </div>
                    <ChevronRight size={18} opacity={0.5} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Çalışan Detayları, Talepler ve Puanlama */}
          <div className="main-panel">
            {perfEmployee ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <button className="mobile-only-btn" onClick={() => setPerfEmployee(null)} style={{ border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', marginBottom: '10px', fontWeight: 'bold' }}>← Personele Dön</button>
                {/* Üst Başlık ve Genel Skor */}
                <div className="glass" style={{ borderRadius: '24px', padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '5px' }}>{perfEmployee}</h2>
                    <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={16} /> Çalışan Portalı & Performans Takibi
                    </p>
                    {currentUser?.permissions === 'all' && (
                      <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                        <button
                          onClick={() => handleSendBuzz(perfEmployee)}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: '900', cursor: 'pointer', transition: '0.3s' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <Zap size={18} fill="#000" /> DÜRT / BİLDİRİM GÖNDER
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '5px' }}>GENEL PERFORMANS</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {(() => {
                        const empTasks = isTakip.find(e => e.rep === perfEmployee);
                        const allTasks = [...empTasks.activeTasks, ...empTasks.pendingTasks, ...empTasks.completedTasks];
                        const ratedTasks = allTasks.filter(t => t.rating);
                        const avg = ratedTasks.length > 0 ? (ratedTasks.reduce((a, b) => a + b.rating, 0) / ratedTasks.length).toFixed(1) : '---';
                        return <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)' }}>{avg} <span style={{ fontSize: '1.2rem' }}>⭐</span></div>;
                      })()}
                    </div>
                  </div>
                </div>

                {/* Önemli Talepler Bölümü (Brief & Ek Süre) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                  <div className="glass" style={{ borderRadius: '24px', padding: '25px', border: '1px solid rgba(255, 64, 129, 0.2)' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#ff4081', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={18} /> Brief Talepleri
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {(() => {
                        const emp = isTakip.find(e => e.rep === perfEmployee);
                        const briefRequests = [...emp.activeTasks, ...emp.pendingTasks].filter(t => t.brief_request);
                        return briefRequests.length > 0 ? briefRequests.map(t => (
                          <div key={t.id} style={{ padding: '15px', background: 'rgba(255,64,129,0.05)', borderRadius: '15px', border: '1px solid rgba(255,64,129,0.1)' }}>
                            <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '5px' }}>{t.task_text}</div>
                            <div style={{ fontSize: '0.8rem', color: '#aaa', fontStyle: 'italic', marginBottom: '10px' }}>"{t.brief_request}"</div>

                            {t.brief_response ? (
                              <div style={{ fontSize: '0.8rem', color: '#00e676', background: 'rgba(0,230,118,0.1)', padding: '8px', borderRadius: '8px' }}>
                                <b>Yanıtınız:</b> {t.brief_response}
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                  id={`brief-resp-${t.id}`}
                                  placeholder="Brief yanıtınızı buraya yazın..."
                                  style={{ flex: 1, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
                                />
                                <button
                                  onClick={async () => {
                                    const val = document.getElementById(`brief-resp-${t.id}`).value;
                                    if (!val) return;
                                    const { error } = await supabase.from('tasks').update({ brief_response: val }).eq('id', t.id);
                                    if (error) alert('HATA: ' + error.message);
                                    else { alert('Yanıt iletildi.'); fetchAllData(); }
                                  }}
                                  style={{ padding: '8px 15px', background: '#ff4081', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                                >
                                  Yanıtla
                                </button>
                              </div>
                            )}
                          </div>
                        )) : <p style={{ color: '#444', fontSize: '0.85rem' }}>Bekleyen brief talebi yok.</p>;
                      })()}
                    </div>
                  </div>

                  <div className="glass" style={{ borderRadius: '24px', padding: '25px', border: '1px solid rgba(255, 171, 0, 0.2)' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#ffab00', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Clock size={18} /> Ek Süre Talepleri
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {(() => {
                        const emp = isTakip.find(e => e.rep === perfEmployee);
                        const timeRequests = [...emp.activeTasks, ...emp.pendingTasks].filter(t => t.extension_request);
                        return timeRequests.length > 0 ? timeRequests.map(t => (
                          <div key={t.id} style={{ padding: '15px', background: 'rgba(255,171,0,0.05)', borderRadius: '15px', border: '1px solid rgba(255,171,0,0.1)' }}>
                            <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '5px' }}>{t.task_text}</div>
                            <div style={{ fontSize: '0.8rem', color: '#aaa', fontStyle: 'italic', marginBottom: '10px' }}>"{t.extension_request}"</div>

                            {t.extension_response ? (
                              <div style={{ fontSize: '0.8rem', color: '#ffab00', background: 'rgba(255,171,0,0.1)', padding: '8px', borderRadius: '8px' }}>
                                <b>Yanıtınız:</b> {t.extension_response}
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                  id={`ext-resp-${t.id}`}
                                  placeholder="Örn: Onaylandı +2 gün"
                                  style={{ flex: 1, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
                                />
                                <button
                                  onClick={async () => {
                                    const val = document.getElementById(`ext-resp-${t.id}`).value;
                                    if (!val) return;
                                    const { error } = await supabase.from('tasks').update({ extension_response: val }).eq('id', t.id);
                                    if (error) alert('HATA: ' + error.message);
                                    else { alert('Yanıt iletildi.'); fetchAllData(); }
                                  }}
                                  style={{ padding: '8px 15px', background: '#ffab00', border: 'none', borderRadius: '8px', color: '#000', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                                >
                                  Yanıtla
                                </button>
                              </div>
                            )}
                          </div>
                        )) : <p style={{ color: '#444', fontSize: '0.85rem' }}>Bekleyen ek süre talebi yok.</p>;
                      })()}
                    </div>
                  </div>
                </div>

                {/* Görev Durum Özetleri (Elindeki, Tamamlanan, Başarısız) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px', marginTop: '25px' }}>
                  <div className="glass" style={{ borderRadius: '24px', padding: '25px', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Zap size={18} /> Elindeki İşler
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(() => {
                        const emp = isTakip.find(e => e.rep === perfEmployee);
                        const currentTasks = [...emp.activeTasks, ...emp.pendingTasks];
                        return currentTasks.length > 0 ? currentTasks.map(t => (
                          <div key={t.id} style={{ fontSize: '0.85rem', color: '#ccc', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div> {t.task_text}
                          </div>
                        )) : <p style={{ color: '#444', fontSize: '0.8rem' }}>Şu an devam eden iş yok.</p>;
                      })()}
                    </div>
                  </div>

                  <div className="glass" style={{ borderRadius: '24px', padding: '25px', border: '1px solid rgba(0, 230, 118, 0.2)' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#00e676', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle2 size={18} /> Tamamladığı İşler
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(() => {
                        const emp = isTakip.find(e => e.rep === perfEmployee);
                        const doneTasks = (emp.completedTasks || []).filter(t => t.status === 'Yaptım');
                        return doneTasks.length > 0 ? doneTasks.map(t => (
                          <div key={t.id} style={{ fontSize: '0.85rem', color: '#ccc', padding: '8px 12px', background: 'rgba(0,230,118,0.03)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckSquare size={14} color="#00e676" /> {t.task_text}
                          </div>
                        )) : <p style={{ color: '#444', fontSize: '0.8rem' }}>Henüz tamamlanan iş yok.</p>;
                      })()}
                    </div>
                  </div>

                  <div className="glass" style={{ borderRadius: '24px', padding: '25px', border: '1px solid rgba(255, 23, 68, 0.2)' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#ff1744', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <XCircle size={18} /> Tamamlayamadığı İşler
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(() => {
                        const emp = isTakip.find(e => e.rep === perfEmployee);
                        const failedTasks = (emp.completedTasks || []).filter(t => t.status === 'Tamamlanamadı');
                        return failedTasks.length > 0 ? failedTasks.map(t => (
                          <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '12px', background: 'rgba(255,23,68,0.03)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.85rem', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <AlertCircle size={14} color="#ff1744" /> {t.task_text}
                            </div>
                            {t.fail_reason && (
                              <div style={{ fontSize: '0.75rem', color: '#999', fontStyle: 'italic', paddingLeft: '22px' }}>
                                <b>Sebep:</b> {t.fail_reason}
                              </div>
                            )}
                          </div>
                        )) : <p style={{ color: '#444', fontSize: '0.8rem' }}>Maalesef tamamlanamayan iş yok. Harika!</p>;
                      })()}
                    </div>
                  </div>
                </div>

                <div style={{ height: '5px' }}></div>

                {/* Görev Başarı ve Puanlama Tablosu */}
                <div className="glass" style={{ borderRadius: '24px', padding: '30px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ClipboardList size={20} color="var(--primary)" /> İş Karnesi ve Puanlama
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {(() => {
                      const emp = isTakip.find(e => e.rep === perfEmployee);
                      // Sadece tamamlanan ve tamamlanamayanları göster (Puanlama için)
                      const tasksToRate = [...emp.completedTasks, ...([...emp.activeTasks, ...emp.pendingTasks].filter(t => t.status === 'Tamamlanamadı'))];

                      return tasksToRate.length > 0 ? tasksToRate.map(t => (
                        <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', minHeight: '150px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900', background: t.status === 'Yaptım' ? 'rgba(0,230,118,0.1)' : 'rgba(255,23,68,0.1)', color: t.status === 'Yaptım' ? '#00e676' : '#ff1744' }}>
                                {t.status === 'Yaptım' ? 'TAMAMLANDI' : 'GECİKTİ / BAŞARISIZ'}
                              </span>
                              <span style={{ color: '#666', fontSize: '0.8rem', fontWeight: '700' }}>{t.client_name || 'Genel'}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#444', fontWeight: '700' }}>
                              {t.due_date ? `Teslim: ${t.due_date}` : 'Tarih yok'}
                            </div>
                          </div>

                          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', wordBreak: 'break-word', lineHeight: '1.4' }}>
                            {t.task_text}
                          </div>

                          <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              {t.rating ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill={s <= t.rating ? 'var(--primary)' : 'transparent'} color={s <= t.rating ? 'var(--primary)' : '#444'} />)}
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#aaa', fontStyle: 'italic' }}>"{t.rating_comment || 'Not yok'}"</div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    const score = window.prompt(`${t.task_text} için puan (1-5):`, '5');
                                    const comment = window.prompt('Değerlendirme notu:', '');
                                    if (score) handleRateTask(t, parseInt(score), comment);
                                  }}
                                  style={{ padding: '10px 20px', borderRadius: '12px', background: 'var(--primary)', color: '#000', border: 'none', fontSize: '0.85rem', fontWeight: '900', cursor: 'pointer' }}
                                >
                                  Puan Ver
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )) : <p style={{ textAlign: 'center', padding: '40px', color: '#444' }}>Henüz puanlanacak bir iş kaydı bulunamadı.</p>;
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', flexDirection: 'column', gap: '20px' }}>
                <Users size={60} opacity={0.1} />
                <p>Detayları görmek için soldan bir çalışan seçin.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Görev Listem Tabı */}
      {activeTab === 'gorevList' && (() => {
        const isAdmin = currentUser?.permissions === 'all';

        // Tüm görevleri topla
        const rawTasks = isTakip.flatMap(p => [
          ...p.activeTasks.map(t => ({ ...t, empName: p.rep })),
          ...p.pendingTasks.map(t => ({ ...t, empName: p.rep })),
          ...p.completedTasks.map(t => ({ ...t, empName: p.rep }))
        ]);

        // Çalışan: sadece kendi görevleri | Yönetici: hepsi
        const allTasks = isAdmin
          ? rawTasks
          : rawTasks.filter(t => t.empName === currentUser?.name || t.assignee_name === currentUser?.name);

        const filterMap = {
          'Tumu': () => true,
          'Tamamlanan': t => t.status === 'Yaptım',
          'DevamEden': t => ['Yapıyorum', 'Sırada'].includes(t.status),
          'Revize': t => t.status === 'Revize',
          'Tamamlanamayan': t => t.status === 'Tamamlanamadı',
        };
        const filteredTasks = allTasks.filter(filterMap[gorevFilter] || (() => true));

        const totalTamamlanan = allTasks.filter(t => t.status === 'Yaptım').length;
        const totalDevam = allTasks.filter(t => ['Yapıyorum', 'Sırada'].includes(t.status)).length;
        const totalRevize = allTasks.filter(t => t.status === 'Revize').length;
        const totalBitmis = allTasks.filter(t => t.status === 'Tamamlanamadı').length;

        const priorityLabel = (p) => {
          if (p === '#ff1744') return { label: 'ACİL', color: '#ff1744' };
          if (p === '#00e676') return { label: 'ESNEK', color: '#00e676' };
          return { label: 'NORMAL', color: '#2979ff' };
        };
        const phaseLabel = (ph) => {
          const map = { 1: '1. Evre: Planlama', 2: '2. Evre: Prodüksiyon', 3: '3. Evre: Kreatif/Kurgu', 4: '4. Evre: Onay/Revize', 5: '5. Evre: Yayın/Rapor' };
          return map[ph] || `${ph}. Evre`;
        };
        const statusStyle = (s) => {
          const map = { 'Yaptım': { bg: 'rgba(0,230,118,0.15)', color: '#00e676' }, 'Yapıyorum': { bg: 'rgba(0,229,255,0.15)', color: '#00e5ff' }, 'Sırada': { bg: 'rgba(255,171,0,0.15)', color: '#ffab00' }, 'Revize': { bg: 'rgba(213,0,249,0.15)', color: '#d500f9' }, 'Tamamlanamadı': { bg: 'rgba(255,23,68,0.15)', color: '#ff1744' } };
          return map[s] || { bg: 'rgba(255,255,255,0.05)', color: '#888' };
        };

        const filterButtons = [
          { key: 'Tumu', label: 'Tümü', count: allTasks.length, color: '#aaa' },
          { key: 'Tamamlanan', label: 'Tamamlanan', count: totalTamamlanan, color: '#00e676' },
          { key: 'DevamEden', label: 'Devam Eden', count: totalDevam, color: '#00e5ff' },
          { key: 'Revize', label: 'Revize', count: totalRevize, color: '#d500f9' },
          { key: 'Tamamlanamayan', label: 'Tamamlanamayan', count: totalBitmis, color: '#ff1744' },
        ];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', animation: 'fadeIn 0.5s ease' }}>

            {/* Detaylı Metrik Paneli */}
            <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 2fr' : '1fr', gap: '24px' }}>

              {/* Sol: Kategori ve Durum Özeti */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {(() => {
                  const urgentCount = allTasks.filter(t => t.priority === '#ff1744' && t.status !== 'Yaptım').length;
                  const photoCount = allTasks.filter(t => (t.category || '').toLowerCase().includes('foto')).length;
                  const videoCount = allTasks.filter(t => (t.category || '').toLowerCase().includes('video')).length;
                  const otherCount = allTasks.length - (photoCount + videoCount);

                  const statsData = [
                    { label: 'FOTOĞRAF İŞLERİ', count: photoCount, color: 'var(--primary)', icon: <Camera size={18} /> },
                    { label: 'VİDEO İŞLERİ', count: videoCount, color: 'var(--accent)', icon: <Video size={18} /> },
                    { label: 'ACİL BEKLEYEN', count: urgentCount, color: '#ff1744', icon: <AlertCircle size={18} /> },
                    { label: 'DİĞER İŞLER', count: otherCount, color: '#aaa', icon: <PlusCircle size={18} /> },
                  ];

                  return statsData.map((s, i) => (
                    <div key={i} className="glass" style={{ padding: '20px', borderRadius: '18px', borderLeft: `4px solid ${s.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>{s.count}</div>
                        <div style={{ fontSize: '0.6rem', fontWeight: '800', color: '#666', letterSpacing: '1px', marginTop: '4px' }}>{s.label}</div>
                      </div>
                      <div style={{ color: s.color, opacity: 0.3 }}>{s.icon}</div>
                    </div>
                  ));
                })()}
              </div>

              {/* Sağ: Durum ve Ekip Dağılımı (Admin için Dağılım, Çalışan için Kendi Durumları) */}
              <div className="glass" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '1px', color: '#888' }}>
                    {isAdmin ? 'EKİP GÖREV DAĞILIMI' : 'ALDİĞİM PUANLAR'}
                  </h4>
                </div>

                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                  {isAdmin ? (
                    // ADMIN GÖRÜNÜMÜ: Ekip Dağılımı
                    isTakip.map(emp => {
                      const empTasks = rawTasks.filter(t => t.empName === emp.rep);
                      const active = empTasks.filter(t => t.status !== 'Yaptım').length;
                      if (active === 0) return null;
                      return (
                        <div key={emp.rep} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '10px 18px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'var(--primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.9rem' }}>
                            {emp.rep.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{emp.rep}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold' }}>{active} Aktif İş</div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // ÇALIŞAN GÖRÜNÜMÜ: Aldığım Puanlar
                    <div style={{ display: 'flex', alignItems: 'center', gap: '40px', width: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {(() => {
                            const rated = allTasks.filter(t => t.rating > 0);
                            const avg = rated.length > 0 ? (rated.reduce((a, b) => a + b.rating, 0) / rated.length).toFixed(1) : '0.0';
                            return avg;
                          })()}
                          <Star size={24} fill="var(--primary)" />
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#555', fontWeight: '800', letterSpacing: '1px' }}>GENEL PERFORMANS PUANIM</div>
                      </div>

                      <div style={{ width: '1px', height: '50px', background: 'rgba(255,255,255,0.05)' }}></div>

                      <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '5px', flex: 1 }}>
                        {allTasks.filter(t => t.rating > 0).sort((a, b) => new Date(b.due_date) - new Date(a.due_date)).slice(0, 5).map(t => (
                          <div key={t.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', minWidth: '150px' }}>
                            <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                              {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill={s <= t.rating ? 'var(--primary)' : 'transparent'} color={s <= t.rating ? 'var(--primary)' : '#333'} />)}
                            </div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.task_text}</div>
                          </div>
                        ))}
                        {allTasks.filter(t => t.rating > 0).length === 0 && <p style={{ color: '#444', fontSize: '0.8rem' }}>Henüz puanlanmış bir işiniz bulunmuyor.</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Görev Listesi Kartı */}
            <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>

              {/* Başlık + Filtre Butonları */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h3 style={{ fontWeight: '800', fontSize: '1.05rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <ListTodo size={18} color="var(--primary)" />
                    {isAdmin ? 'Tüm Ekip Görevleri' : `${currentUser?.name}'in Görev Listesi`}
                    {isAdmin && (
                      <span style={{ fontSize: '0.65rem', background: 'rgba(0,229,255,0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '5px', fontWeight: '700', letterSpacing: '1px' }}>YÖNETİCİ</span>
                    )}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#555' }}>{filteredTasks.length} kayıt gösteriliyor</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {filterButtons.map(fb => (
                    <button
                      key={fb.key}
                      onClick={() => setGorevFilter(fb.key)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${fb.color}55`,
                        background: gorevFilter === fb.key ? fb.color : 'rgba(255,255,255,0.02)',
                        color: gorevFilter === fb.key ? '#000' : fb.color,
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {fb.label}
                      <span style={{
                        background: gorevFilter === fb.key ? 'rgba(0,0,0,0.2)' : `${fb.color}22`,
                        color: gorevFilter === fb.key ? '#000' : fb.color,
                        borderRadius: '6px',
                        padding: '1px 6px',
                        fontSize: '0.7rem',
                        fontWeight: '900'
                      }}>{fb.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Görev Listesi Başlangıç */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.02)' }}>
                {isAdmin ? (
                  // %%%%%%%%%%%% ADMIN GÖRÜNÜMÜ: SIRALI LİSTELER %%%%%%%%%%%%
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* 1. AKTİF İŞLER */}
                    <div style={{ padding: '15px 24px', background: 'rgba(0,229,255,0.05)', color: 'var(--primary)', fontWeight: '900', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', borderBottom: '1px solid rgba(0,229,255,0.1)' }}>🔥🔥 AKTİF / DEVAM EDEN GÖREVLER</div>
                    {allTasks.filter(t => ['Yapıyorum', 'Sırada', 'Revize'].includes(t.status)).length > 0 ? (
                      allTasks.filter(t => ['Yapıyorum', 'Sırada', 'Revize'].includes(t.status)).map((t, i) => (
                        <ManagerTaskRow key={i} t={t} pri={priorityLabel(t.priority)} ss={statusStyle(t.status)} now={now} phaseLabel={phaseLabel} />
                      ))
                    ) : <div style={{ padding: '30px', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>Şu an aktif görev bulunmuyor.</div>}

                    {/* 2. TAMAMLANANLAR */}
                    <div style={{ padding: '15px 24px', background: 'rgba(0,230,118,0.05)', color: '#00e676', fontWeight: '900', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', borderBottom: '1px solid rgba(0,230,118,0.1)', marginTop: '20px' }}>✅ TAMAMLANAN GÖREVLER</div>
                    {allTasks.filter(t => t.status === 'Yaptım').length > 0 ? (
                      allTasks.filter(t => t.status === 'Yaptım').map((t, i) => (
                        <ManagerTaskRow key={i} t={t} pri={priorityLabel(t.priority)} ss={statusStyle(t.status)} now={now} phaseLabel={phaseLabel} />
                      ))
                    ) : <div style={{ padding: '30px', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>Henüz tamamlanan görev yok.</div>}

                    {/* 3. TAMAMLANAMAYANLAR */}
                    <div style={{ padding: '15px 24px', background: 'rgba(255,23,68,0.05)', color: '#ff1744', fontWeight: '900', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,23,68,0.1)', marginTop: '20px' }}>❌ BAŞARISIZ / TAMAMLANAMAYANLAR</div>
                    {allTasks.filter(t => t.status === 'Tamamlanamadı').length > 0 ? (
                      allTasks.filter(t => t.status === 'Tamamlanamadı').map((t, i) => (
                        <ManagerTaskRow key={i} t={t} pri={priorityLabel(t.priority)} ss={statusStyle(t.status)} now={now} phaseLabel={phaseLabel} />
                      ))
                    ) : <div style={{ padding: '30px', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>Başarısız kayıt bulunmuyor.</div>}
                  </div>
                ) : (
                  // %%%%%%%%%%%% ÇALIŞAN GÖRÜNÜMÜ: DETAYLI KARTLAR %%%%%%%%%%%%
                  <div className="task-list-grid" style={{ padding: '20px', background: 'rgba(0,0,0,0.1)' }}>
                    {filteredTasks.length > 0 ? filteredTasks.map((t, i) => (
                      <div key={i} className="glass" style={{ padding: '28px', borderRadius: '24px', border: `1px solid ${priorityLabel(t.priority).color}22`, borderLeft: `6px solid ${priorityLabel(t.priority).color}`, position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Kart Üst Bilgi */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: '900', background: 'rgba(255,255,255,0.08)', color: '#aaa', padding: '6px 12px', borderRadius: '8px', letterSpacing: '1px' }}>
                            {t.category?.toUpperCase() || 'PROJE'}
                          </span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', border: `1px solid ${priorityLabel(t.priority).color}`, color: priorityLabel(t.priority).color, padding: '4px 12px', borderRadius: '10px' }}>
                              {priorityLabel(t.priority).label}
                            </span>
                          </div>
                        </div>

                        {/* Görev Açıklaması (BÜYÜK VE NET) */}
                        <div style={{
                          fontSize: '1.35rem',
                          fontWeight: '800',
                          color: t.status === 'Yaptım' ? '#444' : '#fff',
                          lineHeight: '1.5',
                          textDecoration: t.status === 'Yaptım' ? 'line-through' : 'none',
                          wordBreak: 'break-word',
                          padding: '5px 0'
                        }}>
                          {t.task_text}
                        </div>

                        {/* Marka ve Evre Bilgisi */}
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                          <div style={{ background: 'rgba(0,229,255,0.05)', padding: '10px 15px', borderRadius: '12px', border: '1px solid rgba(0,229,255,0.1)' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '4px' }}>MARKA / MÜŞTERİ</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>{t.client_name || 'Genel Görev'}</div>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.65rem', color: '#666', fontWeight: 'bold', marginBottom: '4px' }}>SÜREÇ EVRESİ</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>{phaseLabel(t.phase)}</div>
                          </div>
                        </div>

                        {/* Teslim Tarihi ve Sayaç */}
                        {t.due_date && (
                          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px dotted rgba(255,255,255,0.1)' }}>
                            <div>
                              <div style={{ fontSize: '0.65rem', color: '#555', fontWeight: 'bold' }}>TESLİM TARİHİ</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff' }}>{t.due_date}</div>
                            </div>
                            {(() => {
                              const due = new Date(t.due_date + 'T23:59:59');
                              const diffMs = due - now;
                              const isOverdue = diffMs < 0;
                              if (isOverdue) return <div style={{ color: '#ff1744', fontWeight: '900', fontSize: '0.75rem' }}>SÜRESİ DOLDU!</div>;
                              return (
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: '0.65rem', color: '#555', fontWeight: 'bold' }}>KALAN SÜRE</div>
                                  <div style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '1rem' }}>{Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))} Gün Kaldı</div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* YÖNETİCİ CEVAPLARI (GERİ BİLDİRİM) */}
                        {(t.brief_response || t.extension_response) && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '15px', background: 'rgba(0,230,118,0.02)', borderRadius: '15px', border: '1px solid rgba(0,230,118,0.1)' }}>
                            {t.brief_response && (
                              <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
                                <span style={{ color: '#ff4081', fontWeight: 'bold' }}>Brief Yanıtı:</span> {t.brief_response}
                              </div>
                            )}
                            {t.extension_response && (
                              <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
                                <span style={{ color: '#ffab00', fontWeight: 'bold' }}>Süre Yanıtı:</span> {t.extension_response}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Aksiyon Alanı */}
                        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleRequestBrief(t)} style={{ padding: '8px 12px', borderRadius: '10px', background: t.brief_request ? '#ff4081' : 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                              Brief İste
                            </button>
                            <button onClick={() => handleRequestExtension(t)} style={{ padding: '8px 12px', borderRadius: '10px', background: t.extension_request ? '#ffab00' : 'rgba(255,255,255,0.05)', color: t.extension_request ? '#000' : '#fff', border: 'none', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                              Süre İste
                            </button>
                          </div>

                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <select
                              value={t.status}
                              onChange={e => handleStaffTaskStatusChange(t, e.target.value)}
                              style={{
                                padding: '8px 15px',
                                background: statusStyle(t.status).bg,
                                color: statusStyle(t.status).color,
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '0.8rem',
                                fontWeight: '900',
                                outline: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="Sırada">⏳ Sırada</option>
                              <option value="Yapıyorum">🔥 Yapıyorum</option>
                              <option value="Revize">🔄 Revize</option>
                              <option value="Yaptım">✅ Yaptım</option>
                              <option value="Tamamlanamadı">❌ Başarısız</option>
                            </select>
                          </div>
                        </div>

                      </div>
                    )) : <div style={{ padding: '100px', gridColumn: '1/-1', textAlign: 'center', color: '#444', fontSize: '1.2rem' }}>Henüz atanmış bir göreviniz bulunmuyor.</div>}
                  </div>
                )}
              </div>
            </div>

          </div>
        );
      })()}
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
              <p style={{ color: '#888', marginTop: '10px' }}>Socialart CRM portalını mobil cihazınıza indirerek gerçek uygulama deneyimi yaşayın.</p>
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
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 'bold' }}>FİRMA: {editClientData.name}</label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Kapsam / Paket</label>
                <input type="text" required value={editClientData.package} onChange={e => setEditClientData({ ...editClientData, package: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Tamamlananlar (Virgülle Ayırın)</label>
                <textarea rows="2" value={editClientData.completed} onChange={e => setEditClientData({ ...editClientData, completed: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Şu An Yapılanlar</label>
                  <textarea rows="2" value={editClientData.active} onChange={e => setEditClientData({ ...editClientData, active: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Bizi Bekleyenler / Plan</label>
                  <textarea rows="2" value={editClientData.pending} onChange={e => setEditClientData({ ...editClientData, pending: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }} />
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
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 40px;
        }

        @media (min-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
          .stats-grid, .task-manager-grid, .task-list-grid {
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
        }
        .mobile-only-btn { display: none; }
      `}</style>
    </div>
  );
}

export default Admin;
