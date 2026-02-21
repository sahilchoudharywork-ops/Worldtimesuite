
import React, { useState, useEffect, useRef } from 'react';
import { AdProps } from '../types';

const AdUnit: React.FC<AdProps> = ({ id, type, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getDimensions = () => {
    switch (type) {
      case 'leaderboard': return 'h-[90px] w-full max-w-[970px]';
      case 'sidebar': return 'h-[250px] w-[300px]';
      case 'skyscraper': return 'h-[600px] w-[160px]';
      case 'footer': return 'h-[90px] w-full max-w-[970px]';
      default: return 'h-[90px] w-[728px]';
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative bg-slate-100 rounded border border-dashed border-slate-300 flex items-center justify-center overflow-hidden ${getDimensions()} ${className}`}
    >
      {!isVisible ? (
        <div className="animate-pulse bg-slate-200 w-full h-full flex items-center justify-center">
          <span className="text-slate-400 text-[10px] font-medium uppercase tracking-widest text-center px-2">Loading Advertisement</span>
        </div>
      ) : (
        <div className="text-center">
          <span className="text-[10px] text-slate-400 block mb-1">ADVERTISEMENT</span>
          <div className="text-slate-500 font-medium italic text-sm px-2">
            {type === 'leaderboard' ? 'Top Leaderboard 970x90' : 
             type === 'sidebar' ? 'Sidebar 300x250' : 
             type === 'skyscraper' ? 'Skyscraper 160x600' : 'Footer Ad 728x90'}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdUnit;
