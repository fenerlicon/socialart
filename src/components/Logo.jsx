import React from 'react';

const Logo = ({ className = "", style = {}, showText = true }) => {
  return (
    <div className={`logo-wrapper ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', ...style }}>
      <div className="logo-icon" style={{ position: 'relative', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Colorful Triangle/Play Icon (Recreated from image) */}
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8a2be2" />
              <stop offset="100%" stopColor="#ff0055" />
            </linearGradient>
            <linearGradient id="logo-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#00ff88" />
            </linearGradient>
          </defs>
          {/* Main Rounded Triangle Shape */}
          <path 
            d="M85 50C85 55.5 81 60 75 64L30 88C22 93 12 87 12 78V22C12 13 22 7 30 12L75 36C81 40 85 44.5 85 50Z" 
            fill="url(#logo-grad-1)"
            style={{ opacity: 0.9 }}
          />
          {/* Overlay color layers to match the "colorful" look */}
          <path 
            d="M85 50C85 55.5 81 60 75 64L50 50L75 36C81 40 85 44.5 85 50Z" 
            fill="#ff8800" 
            style={{ mixBlendMode: 'overlay', opacity: 0.6 }}
          />
          <path 
            d="M30 12L50 50L12 22C12 13 22 7 30 12Z" 
            fill="#00ff88" 
            style={{ mixBlendMode: 'overlay', opacity: 0.6 }}
          />
          {/* Inner Play Button Symbol */}
          <path 
            d="M42 35V65L65 50L42 35Z" 
            fill="white" 
          />
        </svg>
      </div>

      {showText && (
        <div className="logo-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ 
              fontSize: '24px', 
              fontWeight: '900', 
              letterSpacing: '1px', 
              color: '#fff',
              fontFamily: "'Outfit', sans-serif"
            }}>SOCIAL</span>
            <span style={{ 
              fontSize: '24px', 
              fontWeight: '900', 
              letterSpacing: '1px', 
              color: '#fff',
              marginLeft: '40px',
              fontFamily: "'Outfit', sans-serif"
            }}>RT</span>
          </div>
          <span style={{ 
            fontSize: '9px', 
            letterSpacing: '5px', 
            color: 'rgba(255,255,255,0.7)', 
            marginTop: '2px',
            textAlign: 'center',
            marginLeft: '-5px'
          }}>AJANS</span>
        </div>
      )}
      
      {/* Absolute positioning for the "O" replacement logic if needed, 
          but here we just use margin in the text to make room for the icon 
          if it's positioned differently. Let's adjust to match image exactly. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .logo-wrapper { cursor: pointer; }
        .logo-icon { margin-right: -45px; z-index: 1; }
        .logo-text { margin-left: 5px; }
      `}} />
    </div>
  );
};

export default Logo;
