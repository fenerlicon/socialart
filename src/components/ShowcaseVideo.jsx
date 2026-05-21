import React, { useState, useRef, useEffect } from 'react';

const ShowcaseVideo = ({ src, aspectRatio = '9/16', style = {} }) => {
  const [inView, setInView] = useState(false);
  const containerRef = useRef(null);

  // Auto-generate optimized JPEG poster URL from Cloudinary video URL
  const getPosterUrl = (videoUrl) => {
    if (!videoUrl) return '';
    if (videoUrl.includes('cloudinary.com')) {
      let poster = videoUrl.replace(/\.[a-zA-Z0-9]+$/, '.jpg');
      if (poster.includes('/video/upload/')) {
        poster = poster.replace(/\/video\/upload\/[^/]*\//, '/video/upload/f_auto,q_auto,w_450,c_scale/');
      }
      return poster;
    }
    return '';
  };

  const posterUrl = getPosterUrl(src);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // Once it enters viewport, keep it loaded
        }
      },
      {
        rootMargin: '150px', // Preload 150px before entering viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="showcase-video-card"
      style={{
        width: '100%',
        borderRadius: '30px',
        overflow: 'hidden',
        aspectRatio: aspectRatio,
        background: '#000',
        position: 'relative',
        border: '8px solid #1a1a1a',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        ...style
      }}
    >
      {/* If visible in viewport, render and autoplay the video. Otherwise, render the poster */}
      {inView ? (
        <video 
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
        <div 
          style={{ 
            width: '100%', 
            height: '100%', 
            backgroundImage: posterUrl ? `url(${posterUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'block'
          }}
        />
      )}
    </div>
  );
};

export default ShowcaseVideo;
