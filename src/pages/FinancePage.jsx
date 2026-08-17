import React, { useEffect } from 'react';
import FinanceApp from '../finance/App';
import '../finance/index.css';

export default function FinancePage() {
  useEffect(() => {
    document.title = 'SocialArt Finance | Ön Muhasebe & Kasa Yönetimi';
  }, []);

  return (
    <div className="finance-root-wrapper" style={{ minHeight: '100vh', background: '#0a0e1a' }}>
      <FinanceApp />
    </div>
  );
}
