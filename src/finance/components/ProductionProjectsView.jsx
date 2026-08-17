import React, { useState, useEffect } from 'react';
import { Plus, Video, Film, Users, DollarSign, Calendar, CheckCircle, Trash2, Edit, AlertTriangle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ProductionProjectsView({ 
  clients = [],
  period,
  onAddExpense,
  onRecordClientPayment
}) {
  // Local state for projects (backed by Supabase + localStorage fallback)
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('socialart_production_projects');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 1,
        title: 'Gurme Reklam Filmi Çekimi',
        client_name: 'Mall Of Gurme',
        budget: 45000,
        status: 'completed', // 'ongoing', 'completed'
        date: '2026-08-01',
        costs: [
          { id: 101, title: 'Drone Operatörü & Çekim', category: 'Freelancer', amount: 8000 },
          { id: 102, title: 'Kamera / Işık Kiralama', category: 'Ekipman', amount: 6000 },
          { id: 103, title: 'Kurgu & Renk (Colorist)', category: 'Post-Prodüksiyon', amount: 5000 },
          { id: 104, title: 'Mekan & Catering', category: 'Lojistik', amount: 3500 }
        ]
      }
    ];
  });

  // Supabase initial load
  useEffect(() => {
    const loadFromSupabase = async () => {
      try {
        const { data, error } = await supabase.from('finance_production_projects').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          const formatted = data.map(d => ({
            id: d.id,
            title: d.title,
            client_name: d.client_name,
            budget: parseFloat(d.budget) || 0,
            status: d.status,
            date: d.date,
            costs: Array.isArray(d.costs) ? d.costs : []
          }));
          setProjects(formatted);
          localStorage.setItem('socialart_production_projects', JSON.stringify(formatted));
        }
      } catch (err) {}
    };
    loadFromSupabase();
  }, []);

  const saveProjects = async (updated) => {
    setProjects(updated);
    localStorage.setItem('socialart_production_projects', JSON.stringify(updated));
  };

  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddCostModal, setShowAddCostModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [expandedProjectId, setExpandedProjectId] = useState(1);

  // New Project Form
  const [projectTitle, setProjectTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [projectBudget, setProjectBudget] = useState('');
  const [projectDate, setProjectDate] = useState(new Date().toISOString().split('T')[0]);

  // New Cost Form
  const [costTitle, setCostTitle] = useState('');
  const [costCategory, setCostCategory] = useState('Freelancer'); // Freelancer, Ekipman, Post-Prodüksiyon, Lojistik, Oyuncu/Model
  const [costAmount, setCostAmount] = useState('');

  // Handle Add Project
  const handleAddProjectSubmit = (e) => {
    e.preventDefault();
    if (!projectTitle || !projectBudget || parseFloat(projectBudget) <= 0) return;

    const newProject = {
      id: Date.now(),
      title: projectTitle,
      client_name: clientName || 'Harici Müşteri',
      budget: parseFloat(projectBudget),
      status: 'ongoing',
      date: projectDate,
      costs: []
    };

    const updated = [newProject, ...projects];
    saveProjects(updated);
    setShowAddProjectModal(false);
    setProjectTitle('');
    setClientName('');
    setProjectBudget('');
  };

  // Handle Add Cost to Project
  const handleAddCostSubmit = (e) => {
    e.preventDefault();
    if (!selectedProject || !costTitle || !costAmount || parseFloat(costAmount) <= 0) return;

    const newCost = {
      id: Date.now(),
      title: costTitle,
      category: costCategory,
      amount: parseFloat(costAmount)
    };

    const updated = projects.map(p => {
      if (p.id === selectedProject.id) {
        return { ...p, costs: [...p.costs, newCost] };
      }
      return p;
    });

    saveProjects(updated);

    // Auto add to global expenses
    if (onAddExpense) {
      onAddExpense({
        amount: parseFloat(costAmount),
        category: costCategory === 'Freelancer' ? 'Diğer / Harici Gider' : 'Ofis Gideri',
        expense_date: new Date().toISOString().split('T')[0],
        period,
        payment_method: 'Banka',
        description: `[Prodüksiyon Masrafı - ${selectedProject.title}] ${costTitle} (${costCategory})`
      });
    }

    setShowAddCostModal(false);
    setSelectedProject(null);
    setCostTitle('');
    setCostAmount('');
  };

  // Delete Project
  const handleDeleteProject = (id) => {
    const updated = projects.filter(p => p.id !== id);
    saveProjects(updated);
    setProjectToDelete(null);
  };

  // Calculate Summary Stats
  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
  const totalCosts = projects.reduce((acc, p) => acc + p.costs.reduce((ca, c) => ca + c.amount, 0), 0);
  const netProfit = totalBudget - totalCosts;
  const averageMargin = totalBudget > 0 ? Math.round((netProfit / totalBudget) * 100) : 0;

  return (
    <div className="production-projects-view">
      {/* Top Filter & Actions */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Film size={20} className="text-accent" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Prodüksiyon Projeleri & Tedarikçi Hakedişleri</h3>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddProjectModal(true)}>
          <Plus size={16} />
          <span>Yeni Prodüksiyon Projesi</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="glass-card">
          <span className="form-label" style={{ margin: 0 }}>Toplam Proje Bütçeleri</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: '6px' }}>
            {totalBudget.toLocaleString('tr-TR')} ₺
          </h2>
        </div>

        <div className="glass-card">
          <span className="form-label" style={{ margin: 0 }}>Toplam Ekip & Tedarikçi Masrafı</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-danger)', marginTop: '6px' }}>
            -{totalCosts.toLocaleString('tr-TR')} ₺
          </h2>
        </div>

        <div className="glass-card">
          <span className="form-label" style={{ margin: 0 }}>Net Prodüksiyon Karı</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: netProfit >= 0 ? '#10b981' : '#ef4444', marginTop: '6px' }}>
            {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString('tr-TR')} ₺
          </h2>
        </div>

        <div className="glass-card">
          <span className="form-label" style={{ margin: 0 }}>Ortalama Kar Marjı</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: averageMargin >= 50 ? '#10b981' : '#f59e0b', marginTop: '6px' }}>
            %{averageMargin}
          </h2>
        </div>
      </div>

      {/* Projects List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {projects.length === 0 ? (
          <div className="glass-card empty-state">
            <Video size={48} style={{ color: 'var(--text-muted)' }} />
            <h4 className="empty-state-title">Henüz Prodüksiyon Projesi Girilmedi</h4>
            <p>Reklam filmi, klip veya lansman çekimlerinizi ekleyerek ekip masraflarını ve net projenin karını takip edin.</p>
          </div>
        ) : (
          projects.map(project => {
            const projectCostTotal = project.costs.reduce((acc, c) => acc + c.amount, 0);
            const projectProfit = project.budget - projectCostTotal;
            const margin = project.budget > 0 ? Math.round((projectProfit / project.budget) * 100) : 0;
            const isExpanded = expandedProjectId === project.id;

            return (
              <div className="glass-card" key={project.id} style={{ padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                {/* Project Header Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>{project.title}</h3>
                      <span className="badge" style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8', fontWeight: 600 }}>
                        {project.client_name}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Tarih: {new Date(project.date).toLocaleDateString('tr-TR')} · Gider Kalemi Sayısı: {project.costs.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>NET PROJE KARI</span>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: projectProfit >= 0 ? '#10b981' : '#ef4444' }}>
                        {projectProfit >= 0 ? '+' : ''}{projectProfit.toLocaleString('tr-TR')} ₺ (%{margin})
                      </div>
                    </div>

                    <button 
                      className="btn btn-secondary btn-icon btn-sm"
                      onClick={(e) => { e.stopPropagation(); setProjectToDelete(project); }}
                      style={{ color: 'var(--color-danger)' }}
                    >
                      <Trash2 size={14} />
                    </button>

                    {isExpanded ? <ChevronUp size={18} color="var(--text-secondary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={16} className="text-accent" />
                        Ekip & Tedarikçi Masraf Listesi
                      </h4>

                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setSelectedProject(project); setShowAddCostModal(true); }}
                        style={{ fontSize: '0.8rem', gap: '4px' }}
                      >
                        <Plus size={13} />
                        <span>Masraf / Tedarikçi Ekle</span>
                      </button>
                    </div>

                    {project.costs.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                        Bu projeye henüz freelance videographer, ekipman kiralama veya mekan gideri eklenmedi.
                      </p>
                    ) : (
                      <div className="table-container" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                          <thead>
                            <tr>
                              <th>Gider / Tedarikçi Tanımı</th>
                              <th>Kategori</th>
                              <th style={{ textAlign: 'right' }}>Tutar</th>
                            </tr>
                          </thead>
                          <tbody>
                            {project.costs.map(c => (
                              <tr key={c.id}>
                                <td style={{ fontWeight: 600, color: '#fff' }}>{c.title}</td>
                                <td>
                                  <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                                    {c.category}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-danger)' }}>
                                  -{c.amount.toLocaleString('tr-TR')} ₺
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: ADD NEW PRODUCTION PROJECT */}
      {showAddProjectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Yeni Prodüksiyon Projesi Ekle</h2>
              <button className="modal-close" onClick={() => setShowAddProjectModal(false)}>×</button>
            </div>

            <form onSubmit={handleAddProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Proje Başlığı / Adı</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  placeholder="Örn: Garanti Bankası Reklam Çekimi"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Müşteri / Cari Unvanı</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Müşteri adı"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Müşteri Anlaşma Bütçesi (₺)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required
                    placeholder="50000"
                    value={projectBudget}
                    onChange={(e) => setProjectBudget(e.target.value)}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Proje Çekim Tarihi</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={projectDate}
                  onChange={(e) => setProjectDate(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddProjectModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Projeyi Başlat</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD COST TO PROJECT */}
      {showAddCostModal && selectedProject && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Ekip / Tedarikçi Masrafı Ekle</h2>
              <button className="modal-close" onClick={() => { setShowAddCostModal(false); setSelectedProject(null); }}>×</button>
            </div>

            <form onSubmit={handleAddCostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
                Proje: <strong>{selectedProject.title}</strong>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Masraf Açıklaması / Tedarikçi Adı</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  placeholder="Örn: Drone Operatörü Kaşesi veya Işık Seti"
                  value={costTitle}
                  onChange={(e) => setCostTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Gider Kategorisi</label>
                  <select 
                    className="select-custom"
                    value={costCategory}
                    onChange={(e) => setCostCategory(e.target.value)}
                  >
                    <option value="Freelancer">Freelancer / Dış Ekip</option>
                    <option value="Ekipman">Ekipman & Işık Kiralama</option>
                    <option value="Post-Prodüksiyon">Post-Prodüksiyon & Kurgu</option>
                    <option value="Lojistik">Lojistik & Catering</option>
                    <option value="Oyuncu/Model">Oyuncu / Model Kaşesi</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Masraf Tutarı (₺)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required
                    placeholder="5000"
                    value={costAmount}
                    onChange={(e) => setCostAmount(e.target.value)}
                    min="1"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowAddCostModal(false); setSelectedProject(null); }}>İptal</button>
                <button type="submit" className="btn btn-primary">Masrafı İşle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {projectToDelete && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', margin: 0 }}>
                <AlertTriangle size={20} />
                Projeyi Sil
              </h2>
              <button className="modal-close" onClick={() => setProjectToDelete(null)}>×</button>
            </div>

            <div style={{ padding: '1.25rem 0', textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <strong>{projectToDelete.title}</strong> isimli prodüksiyon projesini silmek istediğinize emin misiniz?
              </p>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setProjectToDelete(null)}>Vazgeç</button>
              <button className="btn btn-sm" onClick={() => handleDeleteProject(projectToDelete.id)} style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)', color: '#fca5a5' }}>
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
