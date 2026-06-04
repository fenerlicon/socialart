import React, { useState, useRef, useEffect } from 'react';

const ShowcaseVideo = ({ src, aspectRatio = '9/16', style = {} }) => {
  const [inView, setInView] = useState(false);
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  // Auto-generate optimized JPEG poster URL from Cloudinary video URL
  const getPosterUrl = (videoUrl) => {
    if (!videoUrl) return '';
    if (videoUrl.includes('cloudinary.com')) {
      let poster = videoUrl.replace(/\.[a-zA-Z0-9]+$/, '.jpg');
      
      const match = poster.match(/(.*\/video\/upload\/)(.*)/);
      if (match) {
        const prefix = match[1];
        let rest = match[2];
        
        const parts = rest.split('/');
        const isVersion = /^v\d+$/.test(parts[0]);
        
        if (isVersion) {
          return prefix + 'f_auto,q_auto,w_450,c_scale/' + rest;
        } else if (parts.length > 1) {
          const isSecondPartVersion = /^v\d+$/.test(parts[1]);
          if (isSecondPartVersion || parts.length > 2) {
            parts[0] = 'f_auto,q_auto,w_450,c_scale';
            return prefix + parts.join('/');
          }
        }
        
        if (!rest.includes('f_auto,q_auto,w_450,c_scale')) {
          return prefix + 'f_auto,q_auto,w_450,c_scale/' + rest;
        }
      }
      return poster;
    }
    return '';
  };

  // Auto-generate optimized video source URL from Cloudinary URL to save massive bandwidth
  const getOptimizedVideoUrl = (videoUrl) => {
    if (!videoUrl) return '';
    if (videoUrl.includes('cloudinary.com')) {
      const match = videoUrl.match(/(.*\/video\/upload\/)(.*)/);
      if (match) {
        const prefix = match[1];
        let rest = match[2];
        
        const parts = rest.split('/');
        const isVersion = /^v\d+$/.test(parts[0]);
        
        if (isVersion) {
          return prefix + 'f_auto,q_auto/' + rest;
        } else if (parts.length > 1) {
          const isSecondPartVersion = /^v\d+$/.test(parts[1]);
          if (isSecondPartVersion || parts.length > 2) {
            parts[0] = 'f_auto,q_auto';
            return prefix + parts.join('/');
          }
        }
        
        if (!rest.includes('f_auto,q_auto')) {
          return prefix + 'f_auto,q_auto/' + rest;
        }
      }
    }
    return videoUrl;
  };

  const posterUrl = getPosterUrl(src);
  const optimizedVideoUrl = getOptimizedVideoUrl(src);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      {
        rootMargin: '100px', // Start loading/playing 100px before entering viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Play or pause programmatically based on viewport intersection
  useEffect(() => {
    if (videoRef.current) {
      if (inView) {
        videoRef.current.play().catch(err => {
          // Silent catch for autoplay browser policies
          console.debug("Autoplay prevented or interrupted:", err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [inView]);

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
      <video 
        ref={videoRef}
        src={optimizedVideoUrl} 
        muted 
        loop 
        playsInline 
        poster={posterUrl}
        preload="none"
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          display: 'block'
        }} 
      />
    </div>
  );
};

export default ShowcaseVideo;

