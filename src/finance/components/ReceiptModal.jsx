import React from 'react';
import { Printer, X, CheckCircle, FileText } from 'lucide-react';

export default function ReceiptModal({ payment, client, onClose }) {
  if (!payment) return null;

  const receiptNo = `MAK-${new Date(payment.payment_date || Date.now()).getFullYear()}-${String(payment.id).padStart(4, '0')}`;
  const amount = parseFloat(payment.amount || 0);
  const kdvRate = payment.kdv_rate !== undefined ? parseFloat(payment.kdv_rate) : 20;
  const kdvAmount = payment.kdv_amount !== undefined ? parseFloat(payment.kdv_amount) : Math.round((amount * (kdvRate / (100 + kdvRate))) * 100) / 100;
  const netAmount = amount - kdvAmount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay print-overlay">
      <div className="modal-content print-content" style={{ maxWidth: '650px', background: '#131823', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {/* Modal Top Actions (Hidden during print) */}
        <div className="modal-header no-print" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
            <FileText size={18} className="text-accent" />
            Tahsilat Makbuzu / İşlem Dekontu
          </h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Printer size={14} />
              <span>Yazdır / PDF İndir</span>
            </button>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CARD */}
        <div className="printable-receipt" style={{ padding: '1.5rem', background: '#0d111a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', margin: '1rem 0' }}>
          
          {/* Header Branding */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px dashed rgba(255,255,255,0.1)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>SOCIAL ART AJANS</h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Dijital Medya & Prodüksiyon Hizmetleri</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>TAHSİLAT MAKBUTU</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>{receiptNo}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{new Date(payment.payment_date).toLocaleDateString('tr-TR')}</div>
            </div>
          </div>

          {/* Client Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Müşteri / Cari Unvanı</span>
              <strong style={{ fontSize: '1.05rem', color: '#fff', display: 'block', marginTop: '4px' }}>{client?.name || payment.client_name || 'Diğer / Harici Müşteri'}</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cari Kod: {client?.client_code || 'DIGER'}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ödeme Yöntemi</span>
              <strong style={{ fontSize: '1rem', color: '#fff', display: 'block', marginTop: '4px' }}>{payment.payment_type || 'Havale/EFT'}</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dönem: {payment.period}</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                <th style={{ padding: '8px 0', fontWeight: 600 }}>Açıklama / Hizmet Detayı</th>
                <th style={{ padding: '8px 0', textAlign: 'center', fontWeight: 600 }}>KDV Oranı</th>
                <th style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600 }}>Matrah (Net)</th>
                <th style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600 }}>KDV Tutarı</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 0', color: '#fff', fontWeight: 500 }}>
                  {payment.notes || `${client?.package || 'Hizmet Bedeli Tahsilatı'} (${payment.period})`}
                </td>
                <td style={{ padding: '12px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>%{kdvRate}</td>
                <td style={{ padding: '12px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>{netAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                <td style={{ padding: '12px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>{kdvAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
              </tr>
            </tbody>
          </table>

          {/* Grand Total Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
            <span style={{ fontWeight: 600, color: '#38bdf8', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={18} />
              Tahsil Edilen Toplam Tutar
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </span>
          </div>

          {/* Footer Signatures */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', paddingTop: '1rem', borderTop: '1px dashed rgba(255,255,255,0.1)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div>
              <strong>Ödemeyi Alan:</strong><br />
              Social Art Ajans Finans Yönetimi<br />
              <span style={{ fontSize: '0.75rem', fontStyle: 'italic', marginTop: '4px', display: 'inline-block' }}>Elektronik Sistem Onaylıdır.</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong>Müşteri / Ödeyen Unvanı:</strong><br />
              {client?.name || payment.client_name || 'Müşteri'}<br />
              <span style={{ fontSize: '0.75rem', fontStyle: 'italic', marginTop: '4px', display: 'inline-block' }}>İmza / Kaşe</span>
            </div>
          </div>

        </div>

        <div className="modal-footer no-print">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Kapat</button>
        </div>
      </div>
    </div>
  );
}
