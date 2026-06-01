import React, { useState, useEffect, useRef } from 'react';

const LazySection = ({ children, height = '300px' }) => {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Load when component is within 200px of viewport
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ minHeight: isInView ? 'auto' : height, width: '100%', display: 'flex', flexDirection: 'column' }}>
      {isInView ? children : null}
    </div>
  );
};

export default LazySection;
