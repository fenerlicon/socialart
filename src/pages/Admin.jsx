import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, DollarSign, Activity, FileText, MoreVertical, 
  Search, Filter, CheckCircle2, Clock, XCircle, AlertCircle, Trash2, Plus, X, LogOut,
  Briefcase, ClipboardList, UserCheck, MessageSquare, Target, CheckSquare, ListTodo
} from 'lucide-react';
import Login from './Login';

function Admin() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Giriş yapılmış mı kontrol et
    const userJson = localStorage.getItem('ajans_user');
    if (userJson) {
      setCurrentUser(JSON.parse(userJson));
    }
    setIsChecking(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ajans_user');
    setCurrentUser(null);
  };


  const [activeTab, setActiveTab] = useState('potansiyel'); // potansiyel, aktif, gorev
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Potansiyel Müşteriler
  const [potansiyel, setPotansiyel] = useState([
    { id: 1, name: 'Peak E-Ticaret', date: '06 Nisan 2026', platform: 'Instagram DM', service: '360° Sosyal Medya', rep: 'Ercan Ö.', reaction: 'İletişim iyi geçti, fiyat teklifi hazırlıyoruz.', status: 'Sıcak' },
    { id: 2, name: 'Gurme Restoran', date: '03 Nisan 2026', platform: 'WhatsApp', service: 'Kreatif Çekim', rep: 'Celal Ü.', reaction: 'Mekan tadilatta, 2 hafta sonra tekrar yazılacak.', status: 'Beklemede' },
    { id: 3, name: 'Next Araç Kiralama', date: '28 Mart 2026', platform: 'Mail', service: 'Google Ads', rep: 'Ercan Ö.', reaction: 'Bütçe yetersizliğinden ajans arayışını durdurdular.', status: 'Reddedildi' },
    { id: 4, name: 'Ege Seramik', date: '07 Nisan 2026', platform: 'Referans/Telefon', service: 'Kurumsal Kimlik', rep: 'Ercan Ö.', reaction: 'Çok olumlu, zoom toplantısı tarihi bekliyorlar.', status: 'Sıcak' },
  ]);

  // 2. Çalışılan Müşteriler
  const [aktifMusteriler, setAktifMusteriler] = useState([
    { id: 1, name: 'Vibe Akademi', package: 'Instagram Büyütme', progress: 65, completed: ['Rakip Analizi', 'Strateji Belirleme', 'Nisan İçerik Takvimi'], active: ['Reels Çekimleri', 'Post Tasarımları'], pending: ['Aylık Raporlama', 'Sponsorlu Reklam Çıkışı'] },
    { id: 2, name: 'Lumina Kozmetik', package: 'Web Geliştirme + SEO', progress: 30, completed: ['UI Tasarım Onayı', 'Domain/Hosting Kurulumu'], active: ['Frontend Kodlama', 'Ürün Veri Girişleri'], pending: ['SEO Optimizasyonu', 'Blog Sayfası Eğitimi', 'Yayına Alma'] },
  ]);

  // 3. İş Takip (Çalışanlar)
  const [isTakip, setIsTakip] = useState([
    { id: 1, rep: 'Ercan Özdemir', role: 'Kurucu', activeTasks: ['Yeni Müşteri (Ege Seramik) Toplantısı', 'Peak E-Ticaret teklif dosyası hazırlığı'], pendingTasks: ['Aylık ciro raporunu kontrol etmek', 'Ekibe Peak briefi vermek'], completedTasks: [] },
    { id: 2, rep: 'Celal Ünlü', role: 'Kurucu', activeTasks: ['Vibe Akademi Reels Kurgusu', 'Gurme Restoran yeni saha çekim planı'], pendingTasks: ['Saha çekimi için ekipman listesi çıkartmak', 'Önceki ayın projelerini arşivlemek'], completedTasks: [] },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', date: '', platform: '', service: '', rep: '', reaction: '', status: 'Beklemede' });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({ empId: '', task: '', taskType: 'pendingTasks' });

  const handleAddTask = (e) => {
    e.preventDefault();
    if(!taskFormData.empId || !taskFormData.task) return;
    
    setIsTakip(prev => prev.map(person => {
      if(person.id === parseInt(taskFormData.empId)) {
        if(taskFormData.taskType === 'activeTasks') {
          return { ...person, activeTasks: [...person.activeTasks, taskFormData.task] };
        } else {
          return { ...person, pendingTasks: [...person.pendingTasks, taskFormData.task] };
        }
      }
      return person;
    }));
    
    setIsTaskModalOpen(false);
    setTaskFormData({ empId: '', task: '', taskType: 'pendingTasks' });
  };

  const handleTaskStatusChange = (personId, taskText, currentList, newStatus) => {
    setIsTakip(prev => prev.map(person => {
      if(person.id !== personId) return person;
      let np = { ...person };
      if(!np.completedTasks) np.completedTasks = [];
      
      if(currentList === 'activeTasks') np.activeTasks = np.activeTasks.filter(t => t !== taskText);
      if(currentList === 'pendingTasks') np.pendingTasks = np.pendingTasks.filter(t => t !== taskText);
      if(currentList === 'completedTasks') np.completedTasks = np.completedTasks.filter(t => t !== taskText);

      if(newStatus === 'Yapıyorum') np.activeTasks.push(taskText);
      if(newStatus === 'Sırada') np.pendingTasks.push(taskText);
      if(newStatus === 'Yaptım') np.completedTasks.push(taskText);
      return np;
    }));
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
      return [
        { title: 'Toplam Takip Edilen Ekip', value: isTakip.length, icon: <UserCheck size={24} color="var(--primary)" /> },
        { title: 'Devam Eden Toplam Görev', value: isTakip.reduce((acc, curr) => acc + curr.activeTasks.length, 0), icon: <Target size={24} color="var(--accent)" /> }
      ];
    }
  };

  const getStatusBadge = (status) => {
    if(status === 'Sıcak') return <span style={{display: 'inline-block', padding: '6px 12px', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent)', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold'}}>{status}</span>;
    if(status === 'Beklemede' || status === 'Ertelendi') return <span style={{display: 'inline-block', padding: '6px 12px', background: 'rgba(255, 171, 0, 0.1)', color: '#ffab00', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold'}}>{status}</span>;
    if(status === 'Reddedildi') return <span style={{display: 'inline-block', padding: '6px 12px', background: 'rgba(255, 0, 85, 0.1)', color: 'var(--secondary)', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold'}}>{status}</span>;
    return <span>{status}</span>;
  };

  const handleAddPotansiyel = (e) => {
    e.preventDefault();
    const newEntry = {
      ...formData,
      id: Date.now(),
      date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
    };
    setPotansiyel([newEntry, ...potansiyel]);
    setIsAddModalOpen(false);
    setFormData({ name: '', date: '', platform: '', service: '', rep: '', reaction: '', status: 'Beklemede' });
  };

  if (isChecking) return null; // Ekranın parlamasını önlemek için

  if (!currentUser) {
    return <Login onLoginSuccess={() => setCurrentUser(JSON.parse(localStorage.getItem('ajans_user')))} />;
  }

  return (
    <div style={{ background: '#020202', minHeight: '100vh', paddingTop: '100px', paddingBottom: '50px' }}>
      <div className="container" style={{ maxWidth: '1400px' }}>
        
        {/* Header Alanı */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px' }}>MİY <span className="gradient-text">Merkezi</span></h1>
            <p style={{ color: 'var(--text-muted)' }}>Müşteri İlişkileri Yönetimi ve Ajans İş Takip Sistemi.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {currentUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: '50px', border: '1px solid var(--surface-border)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
                  {currentUser.name.charAt(0)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: '600', lineHeight: '1' }}>{currentUser.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px', lineHeight: '1' }}>{currentUser.role}</span>
                </div>
                <div style={{ width: '1px', height: '24px', background: 'var(--surface-border)', margin: '0 8px' }}></div>
                <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Çıkış Yap">
                  <LogOut size={18} />
                </button>
              </div>
            )}
            {activeTab === 'potansiyel' && (
              <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={18} style={{ marginRight: '8px' }} /> Yeni Müşteri Ekle
              </button>
            )}
            {activeTab === 'gorev' && currentUser?.role === 'Kurucu' && (
              <button className="btn btn-primary" onClick={() => setIsTaskModalOpen(true)}>
                <Plus size={18} style={{ marginRight: '8px' }} /> Yeni Görev Ata
              </button>
            )}
          </div>
        </div>

        {/* Tab Menüsü */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '16px', display: 'inline-flex', border: '1px solid var(--surface-border)', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveTab('potansiyel')}
            style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === 'potansiyel' ? 'var(--primary)' : 'transparent', color: activeTab === 'potansiyel' ? '#000' : '#ccc', border: 'none', cursor: 'pointer' }}
          >
            <Users size={18} style={{ display: 'inline', marginRight: '8px', marginBottom: '-4px' }} /> Potansiyel Müşteri Listesi
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
        </div>

        {/* İstatistikler */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {getStats().map((stat, idx) => (
            <div key={idx} className="glass" style={{ flex: '1', minWidth: '300px', padding: '24px', borderRadius: '20px', border: '1px solid var(--surface-border)' }}>
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

        {/* Tab 1: POTANSİYEL MÜŞTERİLER */}
        {activeTab === 'potansiyel' && (
          <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--surface-border)', paddingBottom: '20px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>FİRMA / LEAD</th>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>SON TEMAS & BEKLENEN HİZMET</th>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>İLETİŞİM KANALI</th>
                    <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>DURUM & MÜŞTERİ NOTU/TEPKİSİ</th>
                  </tr>
                </thead>
                <tbody>
                  {potansiyel.map((p, idx) => (
                    <tr key={p.id} style={{ borderBottom: idx !== potansiyel.length - 1 ? '1px solid var(--surface-border)' : 'none' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ fontWeight: '600', fontSize: '1.05rem', color: '#fff' }}>{p.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '4px' }}>Temsilci: {p.rep}</div>
                      </td>
                      <td style={{ padding: '20px 24px', color: '#ccc' }}>
                        <div style={{ fontWeight: '600', color: 'var(--accent)' }}>{p.service}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>{p.date}</div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <span style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                          <MessageSquare size={14} style={{ display: 'inline', marginRight: '6px', marginBottom: '-2px' }} />
                          {p.platform}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ marginBottom: '8px' }}>{getStatusBadge(p.status)}</div>
                        <div style={{ fontSize: '0.85rem', color: '#aaa', fontStyle: 'italic', maxWidth: '350px', lineHeight: '1.4' }}>"{p.reaction}"</div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '30px' }}>
            {aktifMusteriler.map((client) => (
              <div key={client.id} className="glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid var(--surface-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff' }}>{client.name}</h3>
                    <p style={{ color: 'var(--accent)', fontSize: '0.95rem', fontWeight: '500', marginTop: '4px' }}>{client.package}</p>
                  </div>
                  <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.02)', padding: '10px 15px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--secondary)' }}>%{client.progress}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 'bold' }}>PROJE İLERLEMESİ</div>
                  </div>
                </div>
                
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '30px', overflow: 'hidden' }}>
                  <div style={{ width: `${client.progress}%`, height: '100%', background: 'var(--secondary)', borderRadius: '10px' }}></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  <div style={{ background: 'rgba(0,230,118,0.05)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(0,230,118,0.1)' }}>
                    <h4 style={{ color: '#00e676', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckSquare size={14}/> Tamamlananlar</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#ccc', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {client.completed.map((task, i) => <li key={i} style={{lineHeight: '1.4'}}>✓ {task}</li>)}
                    </ul>
                  </div>
                  <div style={{ background: 'rgba(0,229,255,0.05)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(0,229,255,0.1)' }}>
                    <h4 style={{ color: 'var(--accent)', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={14}/> Çalışılanlar</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#ccc', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {client.active.map((task, i) => <li key={i} style={{lineHeight: '1.4'}}>▶ {task}</li>)}
                    </ul>
                  </div>
                  <div style={{ background: 'rgba(255,171,0,0.05)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,171,0,0.1)' }}>
                    <h4 style={{ color: '#ffab00', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14}/> Bekleyenler</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#ccc', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {client.pending.map((task, i) => <li key={i} style={{lineHeight: '1.4'}}>• {task}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: İŞ TAKİP SİSTEMİ */}
        {activeTab === 'gorev' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
            {isTakip.map((person) => (
              <div key={person.id} className="glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid var(--surface-border)', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
                  <div style={{ width: '56px', height: '56px', background: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: '800', fontSize: '1.5rem', boxShadow: '0 10px 20px rgba(var(--primary-rgb, 0,229,255), 0.3)' }}>
                    {person.rep.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff' }}>{person.rep}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '2px' }}>{person.role}</p>
                  </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <h4 style={{ color: 'var(--primary)', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                    <Activity size={16}/> Şu An Üzerinde Çalıştığı Görevler
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {person.activeTasks.map((task, i) => (
                      <div key={i} style={{ background: 'rgba(0, 229, 255, 0.05)', padding: '14px 18px', borderRadius: '12px', fontSize: '0.95rem', color: '#fff', borderLeft: '3px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{task}</span>
                        <select value="Yapıyorum" disabled={currentUser?.name !== person.rep} onChange={e => handleTaskStatusChange(person.id, task, 'activeTasks', e.target.value)} style={{ background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '0.8rem', fontWeight: 'bold', outline: 'none', cursor: currentUser?.name === person.rep ? 'pointer' : 'not-allowed', opacity: currentUser?.name === person.rep ? 1 : 0.6 }}>
                          <option value="Sırada">⏳ Sırada</option>
                          <option value="Yapıyorum">🔥 Yapıyorum</option>
                          <option value="Yaptım">✅ Yaptım</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <h4 style={{ color: '#ffab00', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                    <ListTodo size={16}/> Yapması Beklenenler (To-Do)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {person.pendingTasks.map((task, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '14px 18px', borderRadius: '12px', fontSize: '0.95rem', color: '#aaa', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{task}</span>
                        <select value="Sırada" disabled={currentUser?.name !== person.rep} onChange={e => handleTaskStatusChange(person.id, task, 'pendingTasks', e.target.value)} style={{ background: '#ffab00', color: '#000', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '0.8rem', fontWeight: 'bold', outline: 'none', cursor: currentUser?.name === person.rep ? 'pointer' : 'not-allowed', opacity: currentUser?.name === person.rep ? 1 : 0.6 }}>
                          <option value="Sırada">⏳ Sırada</option>
                          <option value="Yapıyorum">🔥 Yapıyorum</option>
                          <option value="Yaptım">✅ Yaptım</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {(person.completedTasks && person.completedTasks.length > 0) && (
                  <div>
                    <h4 style={{ color: '#00e676', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                      <CheckCircle2 size={16}/> Tamamladıkları
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {person.completedTasks.map((task, i) => (
                        <div key={i} style={{ background: 'rgba(0,230,118,0.05)', padding: '14px 18px', borderRadius: '12px', fontSize: '0.95rem', color: '#00e676', borderLeft: '3px solid #00e676', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }}>
                          <span style={{ textDecoration: 'line-through' }}>{task}</span>
                          <select value="Yaptım" disabled={currentUser?.name !== person.rep} onChange={e => handleTaskStatusChange(person.id, task, 'completedTasks', e.target.value)} style={{ background: '#00e676', color: '#000', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '0.8rem', fontWeight: 'bold', outline: 'none', cursor: currentUser?.name === person.rep ? 'pointer' : 'not-allowed', opacity: currentUser?.name === person.rep ? 1 : 0.6 }}>
                            <option value="Sırada">⏳ Sırada</option>
                            <option value="Yapıyorum">🔥 Yapıyorum</option>
                            <option value="Yaptım">✅ Yaptım</option>
                          </select>
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
                  <label style={{display: 'block', marginBottom:'8px', color: '#ccc', fontSize: '0.9rem'}}>Firma / Kişi Adı</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }} />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom:'8px', color: '#ccc', fontSize: '0.9rem'}}>İletişim Kanalı</label>
                  <select value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', appearance: 'none' }}>
                    <option value="">Seçiniz...</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram DM">Instagram DM</option>
                    <option value="Telefon">Telefon Görüşmesi</option>
                    <option value="Mail">E-posta</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label style={{display: 'block', marginBottom:'8px', color: '#ccc', fontSize: '0.9rem'}}>Beklenen Hizmet (Örn: Sosyal Medya Yönetimi)</label>
                <input type="text" required value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{display: 'block', marginBottom:'8px', color: '#ccc', fontSize: '0.9rem'}}>Temsilci / İlgilenen</label>
                  <input type="text" required value={formData.rep} onChange={e => setFormData({...formData, rep: e.target.value})} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }} />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom:'8px', color: '#ccc', fontSize: '0.9rem'}}>Aşama</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', appearance: 'none' }}>
                    <option value="Sıcak">Sıcak / Olumlu</option>
                    <option value="Beklemede">Beklemede / Kararsız</option>
                    <option value="Ertelendi">Ertelendi</option>
                    <option value="Reddedildi">Reddedildi</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{display: 'block', marginBottom:'8px', color: '#ccc', fontSize: '0.9rem'}}>Görüşme Neden Yarım Kaldı / Müşteri Ne Dedi?</label>
                <textarea rows="3" required value={formData.reaction} onChange={e => setFormData({...formData, reaction: e.target.value})} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', resize: 'vertical' }} placeholder="Fiyat çok geldi, eşiyle görüşecek vs." />
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
              
              <div>
                <label style={{display: 'block', marginBottom:'8px', color: '#ccc', fontSize: '0.9rem'}}>Çalışan / Personel</label>
                <select required value={taskFormData.empId} onChange={e => setTaskFormData({...taskFormData, empId: e.target.value})} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', appearance: 'none' }}>
                  <option value="">Ekip Üyesi Seçin...</option>
                  {isTakip.map(person => (
                    <option key={person.id} value={person.id}>{person.rep}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{display: 'block', marginBottom:'8px', color: '#ccc', fontSize: '0.9rem'}}>Görev Aşaması</label>
                <select value={taskFormData.taskType} onChange={e => setTaskFormData({...taskFormData, taskType: e.target.value})} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', appearance: 'none' }}>
                  <option value="pendingTasks">Bekleyen (To-Do) Yapılacaklar</option>
                  <option value="activeTasks">Acil - Şu An Yapılmalı</option>
                </select>
              </div>

              <div>
                <label style={{display: 'block', marginBottom:'8px', color: '#ccc', fontSize: '0.9rem'}}>Görev Açıklaması</label>
                <textarea rows="3" required value={taskFormData.task} onChange={e => setTaskFormData({...taskFormData, task: e.target.value})} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none', resize: 'vertical' }} placeholder="Projeyi hızlandırmak için yeni UI tasarımını tamamla..." />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '14px', fontSize: '1rem', marginTop: '10px' }}>Kaydet ve Listeye Ekle</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Admin;
