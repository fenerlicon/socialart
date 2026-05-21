import React, { useState, useRef, useEffect } from 'react';
import { Play } from 'lucide-react';

const ShowcaseVideo = ({ src, logo, name, aspectRatio = '9/16', style = {} }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  // Auto-generate optimized JPEG poster URL from Cloudinary video URL
  const getPosterUrl = (videoUrl) => {
    if (!videoUrl) return '';
    if (videoUrl.includes('cloudinary.com')) {
      let poster = videoUrl.replace(/\.[a-zA-Z0-9]+$/, '.jpg');
      // Apply Cloudinary image optimizations (convert to auto-format, auto-quality, scaled width)
      if (poster.includes('/video/upload/')) {
        poster = poster.replace(/\/video\/upload\/[^/]*\//, '/video/upload/f_auto,q_auto,w_450,c_scale/');
      }
      return poster;
    }
    return '';
  };

  const posterUrl = getPosterUrl(src);

  // Desktop hover controls
  const handleMouseEnter = () => {
    // Only trigger play on hover for hover-capable devices (desktops)
    if (window.matchMedia('(hover: hover)').matches) {
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.matchMedia('(hover: hover)').matches) {
      setIsPlaying(false);
    }
  };

  const handleTogglePlay = (e) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay block or video load error:", err);
      });
    }
  }, [isPlaying]);

  return (
    <div 
      className="showcase-video-card"
      style={{
        borderRadius: '30px',
        overflow: 'hidden',
        aspectRatio: aspectRatio,
        background: '#000',
        position: 'relative',
        border: '8px solid #1a1a1a',
        cursor: 'pointer',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        ...style
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleTogglePlay}
    >
      {/* Dynamic Video Element (Loaded on-demand) */}
      {isPlaying ? (
        <video 
          ref={videoRef}
          src={src} 
          autoPlay 
          muted 
          loop 
          playsInline 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            display: 'block'
          }} 
        />
      ) : (
        // Poster / Cover Image
        <div 
          style={{ 
            width: '100%', 
            height: '100%', 
            backgroundImage: posterUrl ? `url(${posterUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          {/* Fallback overlay when no poster */}
          {!posterUrl && (
            <div style={{ color: '#555', fontSize: '0.9rem' }}>{name || 'Video'}</div>
          )}

          {/* Logo overlay if provided */}
          {logo && (
            <div style={{ 
              position: 'absolute', 
              top: '20px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              zIndex: 2,
              maxHeight: '40px',
              maxWidth: '80%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={logo} 
                alt={name || "Client Logo"} 
                style={{ 
                  maxHeight: '35px', 
                  maxWidth: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' 
                }} 
                loading="lazy"
              />
            </div>
          )}

          {/* Glassmorphic Play Button Overlay */}
          <div 
            className="play-btn-overlay"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s',
              zIndex: 3
            }}
          >
            <Play size={24} fill="#fff" style={{ marginLeft: '4px' }} />
          </div>

          {/* Name overlay at the bottom if provided */}
          {name && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              right: '20px',
              textAlign: 'center',
              zIndex: 2,
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: '700',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '6px 12px',
              borderRadius: '10px',
              backdropFilter: 'blur(4px)'
            }}>
              {name}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShowcaseVideo;
