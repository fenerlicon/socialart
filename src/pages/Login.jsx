import React, { useEffect } from 'react';

/**
 * Legacy Login Component — Deprecated.
 * Authentication is canonicalized at /admin/login.
 * All attempts to access this component are immediately redirected to the canonical /admin/login page.
 */
export default function Login() {
  useEffect(() => {
    window.location.replace('/admin/login');
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09090b', color: '#fff' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '2px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Panele yönlendiriliyorsunuz...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
