
import React, { useState, useEffect, useRef } from 'react';
import { AdProps } from '../types';

const AdUnit: React.FC<AdProps> = ({ id, type, className = '', isDark = false }) => {
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
      case 'leaderboard': return 'h-[90px] w-[728px]';
      case 'sidebar': return 'h-[250px] w-[300px]';
      case 'skyscraper': return 'h-[250px] w-[300px]';
      case 'footer': return 'h-[90px] w-full max-w-[970px]';
      default: return 'h-[90px] w-[728px]';
    }
  };

  const bgColor = isDark ? 'bg-white/5' : 'bg-black/5';
  const borderColor = isDark ? 'border-white/10' : 'border-black/10';
  const textColor = isDark ? 'text-zinc-500' : 'text-slate-400';
  const pulseColor = isDark ? 'bg-white/5' : 'bg-black/5';

  return (
    <div 
      ref={containerRef}
      className={`relative ${bgColor} rounded border border-dashed ${borderColor} flex items-center justify-center overflow-hidden ${getDimensions()} ${className} transition-colors duration-300`}
    >
      {!isVisible ? (
        <div className={`animate-pulse ${pulseColor} w-full h-full flex items-center justify-center`}>
          <span className={`${textColor} text-[10px] font-medium uppercase tracking-widest text-center px-2`}>Loading Advertisement</span>
        </div>
      ) : (
        <div className="text-center">
          <span className={`text-[10px] ${textColor} block mb-1`}>ADVERTISEMENT</span>
          <div className={`${isDark ? 'text-zinc-400' : 'text-slate-500'} font-medium italic text-sm px-2`}>
            {type === 'leaderboard' ? 'Leaderboard 728x90' : 
             type === 'sidebar' ? 'Sidebar 300x250' : 
             type === 'skyscraper' ? 'Sidebar 300x250' : 'Footer Ad 728x90'}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdUnit;
