import React, { useState, useEffect } from 'react';
import { Activity, Search, ShieldCheck, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ActivityLogView() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    let remoteLogs = [];

    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && Array.isArray(data)) {
        remoteLogs = data;
      }
    } catch (err) {
      console.warn("Activity log fetch warning:", err);
    }

    // Merge with local fallback storage logs
    let localLogs = [];
    try {
      const saved = localStorage.getItem('socialart_local_activity_logs');
      if (saved) localLogs = JSON.parse(saved);
    } catch (e) {}

    // Combine and deduplicate
    const combined = [...remoteLogs, ...localLogs];
    const map = new Map();
    combined.forEach(item => {
      if (item && typeof item === 'object') {
        const key = item.id || `${item.created_at}-${item.action}-${item.details}`;
        if (!map.has(key)) map.set(key, item);
      }
    });

    const merged = Array.from(map.values());
    merged.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    setLogs(merged);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = (logs || []).filter(log => {
    if (!log) return false;
    const text = `${log.action || ''} ${log.details || ''} ${log.target_name || ''} ${log.user_name || ''} ${log.module || ''}`.toLowerCase();
    
    // Exclude general CRM lead pipeline logs
    if (text.includes('lead') || text.includes('crm aşama') || text.includes('kanban') || text.includes('potansiyel müşteri')) {
      if (!text.includes('crm entegrasyonu') && !text.includes('prodüksiyon geliri')) {
        return false;
      }
    }

    return text.includes((searchTerm || '').toLowerCase());
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleString('tr-TR');
    } catch (e) {
      return '-';
    }
  };

  return (
    <div className="activity-log-view">
      {/* Header & Search */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="İşlem kaydı veya detay ara..." 
            className="form-input search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary" onClick={fetchLogs} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={15} />
          <span>Yenile</span>
        </button>
      </div>

      {/* Activity Log List */}
      <div className="glass-card" style={{ padding: 0 }}>
        {isLoading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <span>İşlem günlükleri yükleniyor...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="empty-state">
            <Activity size={48} style={{ color: 'var(--text-muted)' }} />
            <h4 className="empty-state-title">İşlem Kaydı Bulunmadı</h4>
            <p>Sistemde henüz kayıtlı bir işlem geçmişi bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Zaman / Tarih</th>
                  <th>Kullanıcı</th>
                  <th>Eylem / İşlem</th>
                  <th>Hedef / Cari</th>
                  <th>Detaylar</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr key={log.id || idx}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {formatDate(log.created_at)}
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', fontWeight: 600 }}>
                        <ShieldCheck size={13} style={{ color: '#818cf8' }} />
                        {log.user_name || 'Yönetici'}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', fontWeight: 600 }}>
                        {log.action || 'İşlem'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {log.target_name || 'Genel'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '350px' }}>
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
