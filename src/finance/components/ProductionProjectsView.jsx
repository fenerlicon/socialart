import React, { useState, useEffect } from 'react';
import { Plus, Video, Film, Users, DollarSign, Calendar, CheckCircle, Trash2, Edit, AlertTriangle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ProductionProjectsView({ 
  clients = [],
  period,
  onAddExpense,
  onRecordClientPayment
}) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Supabase initial load
  const loadFromSupabase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('finance_production_projects').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        const formatted = data.map(d => ({
          id: d.id,
          title: d.title || d.project_name || 'İsimsiz Prodüksiyon Projesi',
          client_name: d.client_name || 'Harici Müşteri',
          budget: parseFloat(d.budget) || 0,
          status: d.status || 'ongoing',
          date: d.date || d.start_date || new Date().toISOString().split('T')[0],
          costs: Array.isArray(d.costs) ? d.costs : []
        }));
        setProjects(formatted);
        localStorage.setItem('socialart_production_projects', JSON.stringify(formatted));
      } else {
        const saved = localStorage.getItem('socialart_production_projects');
        if (saved) { try { setProjects(JSON.parse(saved)); } catch(e){} }
      }
    } catch (err) {
      console.warn('Production projects load warning:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFromSupabase();
  }, []);

  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddCostModal, setShowAddCostModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [expandedProjectId, setExpandedProjectId] = useState(null);

  // New Project Form
  const [projectTitle, setProjectTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [projectBudget, setProjectBudget] = useState('');
  const [projectDate, setProjectDate] = useState(new Date().toISOString().split('T')[0]);

  // New Cost Form
  const [costTitle, setCostTitle] = useState('');
  const [costCategory, setCostCategory] = useState('Freelancer');
  const [costAmount, setCostAmount] = useState('');

  // Handle Add Project
  const handleAddProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectTitle || !projectBudget || parseFloat(projectBudget) <= 0) return;

    const newProjectData = {
      title: projectTitle,
      client_name: clientName || 'Harici Müşteri',
      budget: parseFloat(projectBudget),
      status: 'ongoing',
      date: projectDate,
      costs: []
    };

    try {
      const { data, error } = await supabase
        .from('finance_production_projects')
        .insert([newProjectData])
        .select();

      if (!error && data && data.length > 0) {
        const created = {
          id: data[0].id,
          ...newProjectData
        };
        const updated = [created, ...projects];
        setProjects(updated);
        localStorage.setItem('socialart_production_projects', JSON.stringify(updated));
      } else {
        const fallbackProject = { id: Date.now(), ...newProjectData };
        const updated = [fallbackProject, ...projects];
        setProjects(updated);
        localStorage.setItem('socialart_production_projects', JSON.stringify(updated));
      }
    } catch (err) {
      const fallbackProject = { id: Date.now(), ...newProjectData };
      const updated = [fallbackProject, ...projects];
      setProjects(updated);
    }

    setShowAddProjectModal(false);
    setProjectTitle('');
    setClientName('');
    setProjectBudget('');
  };

  // Handle Add Cost to Project
  const handleAddCostSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject || !costTitle || !costAmount || parseFloat(costAmount) <= 0) return;

    const newCost = {
      id: Date.now(),
      title: costTitle,
      category: costCategory,
      amount: parseFloat(costAmount)
    };

    const updatedCosts = [...(selectedProject.costs || []), newCost];

    const updatedProjects = projects.map(p => {
      if (p.id === selectedProject.id) {
        return { ...p, costs: updatedCosts };
      }
      return p;
    });

    setProjects(updatedProjects);
    localStorage.setItem('socialart_production_projects', JSON.stringify(updatedProjects));

    // Update in Supabase DB
    try {
      await supabase
        .from('finance_production_projects')
        .update({ costs: updatedCosts })
        .eq('id', selectedProject.id);
    } catch (err) {
      console.warn('Update project costs warning:', err);
    }

    // Auto add to global expenses if callback exists
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
  const handleDeleteProject = async (id) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('socialart_production_projects', JSON.stringify(updated));
    setProjectToDelete(null);

    try {
      await supabase.from('finance_production_projects').delete().eq('id', id);
    } catch (err) {
      console.warn('Delete project warning:', err);
    }
  };

  // Calculate Summary Stats
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const totalCosts = projects.reduce((acc, p) => acc + (Array.isArray(p.costs) ? p.costs.reduce((ca, c) => ca + (c.amount || 0), 0) : 0), 0);
  const netProfit = totalBudget - totalCosts;
  const averageMargin = totalBudget > 0 ? Math.round((netProfit / totalBudget) * 100) : 0;

  return (
    <div className="production-projects-view">
      {/* Top Filter & Actions */}
      <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Film size={22} className="text-accent" style={{ color: '#38bdf8' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>Prodüksiyon Projeleri & Tedarikçi Hakedişleri</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Reklam çekimleri, bütçe yönetimi ve tedarikçi masrafları</span>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddProjectModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          <span>Yeni Prodüksiyon Projesi</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span className="form-label" style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Toplam Proje Bütçeleri</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '6px' }}>
            {totalBudget.toLocaleString('tr-TR')} ₺
          </h2>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span className="form-label" style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Toplam Ekip & Tedarikçi Masrafı</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginTop: '6px' }}>
            -{totalCosts.toLocaleString('tr-TR')} ₺
          </h2>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span className="form-label" style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Prodüksiyon Karı</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: netProfit >= 0 ? '#10b981' : '#ef4444', marginTop: '6px' }}>
            {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString('tr-TR')} ₺
          </h2>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span className="form-label" style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ortalama Kar Marjı</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: averageMargin >= 50 ? '#10b981' : '#f59e0b', marginTop: '6px' }}>
            %{averageMargin}
          </h2>
        </div>
      </div>

      {/* Projects List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {isLoading ? (
          <div className="glass-card text-center py-8 text-muted" style={{ textAlign: 'center', padding: '2rem' }}>
            Projeler yükleniyor...
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card empty-state" style={{ textCenter: 'center', padding: '3rem 1.5rem', textAlign: 'center' }}>
            <Video size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
            <h4 className="empty-state-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Henüz Prodüksiyon Projesi Girilmedi</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '450px', margin: '0 auto' }}>
              Reklam filmi, klip veya lansman çekimlerinizi ekleyerek ekip masraflarını ve net projenin karını takip edin.
            </p>
            <button className="btn btn-primary" style={{ marginTop: '1.25rem', margin: '1.25rem auto 0 auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => setShowAddProjectModal(true)}>
              <Plus size={16} /> İlk Projeyi Ekle
            </button>
          </div>
        ) : (
          projects.map(project => {
            const projectCostTotal = (project.costs || []).reduce((acc, c) => acc + (c.amount || 0), 0);
            const projectProfit = project.budget - projectCostTotal;
            const margin = project.budget > 0 ? Math.round((projectProfit / project.budget) * 100) : 0;
            const isExpanded = expandedProjectId === project.id;

            return (
              <div className="glass-card" key={project.id} style={{ padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                {/* Project Header Bar */}
                <div 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', cursor: 'pointer' }} 
                  onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                >
                  <div style={{ flex: '1 1 240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>{project.title}</h3>
                      <span className="badge" style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem' }}>
                        {project.client_name}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Tarih: {new Date(project.date).toLocaleDateString('tr-TR')} · Gider Kalemi Sayısı: {(project.costs || []).length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>NET PROJE KARI</span>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: projectProfit >= 0 ? '#10b981' : '#ef4444' }}>
                        {projectProfit >= 0 ? '+' : ''}{projectProfit.toLocaleString('tr-TR')} ₺ (%{margin})
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        className="btn btn-secondary btn-icon btn-sm"
                        onClick={(e) => { e.stopPropagation(); setProjectToDelete(project); }}
                        style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                        title="Projeyi Sil"
                      >
                        <Trash2 size={14} />
                      </button>

                      {isExpanded ? <ChevronUp size={20} color="var(--text-secondary)" /> : <ChevronDown size={20} color="var(--text-secondary)" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details: Costs & Add Cost */}
                {isExpanded && (
                  <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', margin: 0 }}>Proje Giderleri & Ekip Kalemleri</h4>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => { setSelectedProject(project); setShowAddCostModal(true); }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                      >
                        <Plus size={14} /> Gider Kalemi Ekle
                      </button>
                    </div>

                    {(project.costs || []).length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        Bu projeye henüz tedarikçi veya ekip gideri eklenmedi.
                      </div>
                    ) : (
                      <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                              <th style={{ padding: '8px 12px' }}>Açıklama / Kalem</th>
                              <th style={{ padding: '8px 12px' }}>Kategori</th>
                              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Tutar</th>
                            </tr>
                          </thead>
                          <tbody>
                            {project.costs.map((cost, idx) => (
                              <tr key={cost.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                                <td style={{ padding: '10px 12px', color: '#fff', fontWeight: 500 }}>{cost.title}</td>
                                <td style={{ padding: '10px 12px' }}>
                                  <span style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                    {cost.category}
                                  </span>
                                </td>
                                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#ef4444' }}>
                                  -{parseFloat(cost.amount || 0).toLocaleString('tr-TR')} ₺
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

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="modal-content glass-card" style={{ width: '100%', maxWidth: '480px', padding: '1.5rem', borderRadius: '16px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' }}>Yeni Prodüksiyon Projesi Ekle</h3>
            <form onSubmit={handleAddProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>Proje / Çekim Adı *</label>
                <input 
                  type="text" 
                  className="input-custom" 
                  placeholder="Örn. Gurme Reklam Filmi Çekimi"
                  value={projectTitle}
                  onChange={e => setProjectTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>Müşteri / Marka</label>
                <input 
                  type="text" 
                  className="input-custom" 
                  placeholder="Örn. Mall Of Gurme"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>Toplam Bütçe (₺) *</label>
                  <input 
                    type="number" 
                    className="input-custom" 
                    placeholder="45000"
                    value={projectBudget}
                    onChange={e => setProjectBudget(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>Çekim Tarihi</label>
                  <input 
                    type="date" 
                    className="input-custom" 
                    value={projectDate}
                    onChange={e => setProjectDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyEnd: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddProjectModal(false)}>Vazgeç</button>
                <button type="submit" className="btn btn-primary">Kaydet & Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Cost Modal */}
      {showAddCostModal && selectedProject && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="modal-content glass-card" style={{ width: '100%', maxWidth: '440px', padding: '1.5rem', borderRadius: '16px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Gider Kalemi / Tedarikçi Ekle</h3>
            <span style={{ fontSize: '0.8rem', color: '#38bdf8', display: 'block', marginBottom: '1.25rem' }}>Proje: {selectedProject.title}</span>

            <form onSubmit={handleAddCostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>Kalem Açıklaması *</label>
                <input 
                  type="text" 
                  className="input-custom" 
                  placeholder="Örn. Drone Operatörü, Işık Kiralama"
                  value={costTitle}
                  onChange={e => setCostTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>Kategori</label>
                  <select 
                    className="select-custom" 
                    value={costCategory}
                    onChange={e => setCostCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  >
                    <option value="Freelancer">Freelancer</option>
                    <option value="Ekipman">Ekipman Kiralama</option>
                    <option value="Post-Prodüksiyon">Post-Prodüksiyon</option>
                    <option value="Lojistik">Lojistik & Catering</option>
                    <option value="Oyuncu/Model">Oyuncu / Model</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>Tutar (₺) *</label>
                  <input 
                    type="number" 
                    className="input-custom" 
                    placeholder="5000"
                    value={costAmount}
                    onChange={e => setCostAmount(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowAddCostModal(false); setSelectedProject(null); }}>Vazgeç</button>
                <button type="submit" className="btn btn-primary">Gideri Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="modal-content glass-card" style={{ width: '100%', maxWidth: '400px', padding: '1.5rem', borderRadius: '16px', background: '#0f172a', border: '1px solid rgba(239,68,68,0.3)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444', marginBottom: '0.5rem' }}>Projeyi Sil</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              <strong>&quot;{projectToDelete.title}&quot;</strong> projesini ve bağlı masraf kalemlerini silmek istediğinize emin misiniz?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setProjectToDelete(null)}>Vazgeç</button>
              <button className="btn btn-danger" style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }} onClick={() => handleDeleteProject(projectToDelete.id)}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
