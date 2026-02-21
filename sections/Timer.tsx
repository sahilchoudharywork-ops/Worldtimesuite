
import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
  isDark: boolean;
}

const Timer: React.FC<TimerProps> = ({ isDark }) => {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  
  const [inputH, setInputH] = useState(0);
  const [inputM, setInputM] = useState(0);
  const [inputS, setInputS] = useState(0);

  const endTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // Refs for smooth wheel accumulation
  const wheelAccH = useRef(0);
  const wheelAccM = useRef(0);
  const wheelAccS = useRef(0);
  const SCROLL_THRESHOLD = 50; // Pixels of scroll before updating number

  const PRESETS = [
    { label: '1m', s: 60 },
    { label: '5m', s: 300 },
    { label: '10m', s: 600 },
    { label: '30m', s: 1800 },
    { label: '1h', s: 3600 },
  ];

  useEffect(() => {
    if (isActive && !isPaused) {
      endTimeRef.current = Date.now() + remaining * 1000;
      
      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((endTimeRef.current! - now) / 1000));
        setRemaining(diff);
        
        if (diff <= 0) {
          handleComplete();
        }
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused]);

  const handleStartToggle = () => {
    if (!isActive) {
      const s = inputH * 3600 + inputM * 60 + inputS;
      if (s === 0) return;
      setTotalSeconds(s);
      setRemaining(s);
      setIsActive(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleReset = () => {
    if (isActive) {
      // First stage of reset: stop current timer and return to setup mode
      setIsActive(false);
      setIsPaused(true);
      setRemaining(0);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      // Second stage of reset (or clicked while already in setup): reset numbers to zero
      setInputH(0);
      setInputM(0);
      setInputS(0);
    }
  };

  const formatDisplay = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const textColor = isDark ? 'text-white' : 'text-black';
  const bgColor = isDark ? 'bg-black' : 'bg-white';

  const handleWheelH = (e: React.WheelEvent) => {
    if (isActive) return;
    wheelAccH.current += e.deltaY;
    if (Math.abs(wheelAccH.current) >= SCROLL_THRESHOLD) {
      const direction = wheelAccH.current > 0 ? -1 : 1;
      setInputH(prev => (prev + direction + 24) % 24);
      wheelAccH.current = 0;
    }
  };

  const handleWheelM = (e: React.WheelEvent) => {
    if (isActive) return;
    wheelAccM.current += e.deltaY;
    if (Math.abs(wheelAccM.current) >= SCROLL_THRESHOLD) {
      const direction = wheelAccM.current > 0 ? -1 : 1;
      setInputM(prev => (prev + direction + 60) % 60);
      wheelAccM.current = 0;
    }
  };

  const handleWheelS = (e: React.WheelEvent) => {
    if (isActive) return;
    wheelAccS.current += e.deltaY;
    if (Math.abs(wheelAccS.current) >= SCROLL_THRESHOLD) {
      const direction = wheelAccS.current > 0 ? -1 : 1;
      setInputS(prev => (prev + direction + 60) % 60);
      wheelAccS.current = 0;
    }
  };

  const actionButtonBase = "flex-1 rounded-3xl font-black transition-all active:scale-95 uppercase tracking-[0.1em] border-2 bg-transparent hover:text-yellow-400 hover:border-yellow-400 active:text-yellow-500 active:border-yellow-500";

  return (
    <div className={`flex flex-col min-h-full ${bgColor} ${textColor} p-4 md:p-8 font-['Helvetica'] overflow-y-auto`}>
      <div className="flex-none flex flex-col items-center justify-center text-center py-4">
        <h1 className="text-4xl md:text-6xl font-black mb-2">Timer</h1>
        <p className={`text-xs md:text-sm opacity-50 uppercase tracking-[0.3em] font-bold`}>
          SCROLL NUMBERS TO SET
        </p>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center">
        {!isActive ? (
          <div className="flex flex-col items-center w-full max-w-screen-xl">
            {/* Ultra Thin Display Input Area with Scrolling Effect */}
            <div className="flex items-center justify-center gap-1 md:gap-2 w-full max-w-6xl px-4 mb-8 select-none">
              {/* Hours Segment */}
              <div 
                className="flex flex-col items-center flex-1 cursor-ns-resize group"
                onWheel={handleWheelH}
              >
                <div className={`text-[20vw] md:text-[22vw] leading-none font-[100] tabular-nums tracking-[-0.05em] w-full text-center transition-all group-hover:opacity-80`}>
                  {inputH.toString().padStart(2, '0')}
                </div>
                <div className="text-[8px] md:text-[10px] uppercase font-black opacity-30 mt-2 tracking-widest">HOURS</div>
              </div>

              <div className="text-[12vw] font-[100] opacity-30 self-center pb-8 mx-1 md:mx-2">:</div>

              {/* Minutes Segment */}
              <div 
                className="flex flex-col items-center flex-1 cursor-ns-resize group"
                onWheel={handleWheelM}
              >
                <div className={`text-[20vw] md:text-[22vw] leading-none font-[100] tabular-nums tracking-[-0.05em] w-full text-center transition-all group-hover:opacity-80`}>
                  {inputM.toString().padStart(2, '0')}
                </div>
                <div className="text-[8px] md:text-[10px] uppercase font-black opacity-30 mt-2 tracking-widest">MINUTES</div>
              </div>

              <div className="text-[12vw] font-[100] opacity-30 self-center pb-8 mx-1 md:mx-2">:</div>

              {/* Seconds Segment */}
              <div 
                className="flex flex-col items-center flex-1 cursor-ns-resize group"
                onWheel={handleWheelS}
              >
                <div className={`text-[20vw] md:text-[22vw] leading-none font-[100] tabular-nums tracking-[-0.05em] w-full text-center transition-all group-hover:opacity-80`}>
                  {inputS.toString().padStart(2, '0')}
                </div>
                <div className="text-[8px] md:text-[10px] uppercase font-black opacity-30 mt-2 tracking-widest">SECONDS</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 w-full max-w-lg px-4 mb-8">
              <button 
                onClick={handleStartToggle}
                className={`${actionButtonBase} py-4 ${isDark ? 'border-white text-white' : 'border-black text-black'}`}
              >
                {isActive ? (isPaused ? 'Resume' : 'Pause') : 'Start'}
              </button>
              <button 
                onClick={handleReset}
                className={`${actionButtonBase} py-4 ${isDark ? 'border-white text-white' : 'border-black text-black'}`}
              >
                Reset
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap justify-center gap-3">
              {PRESETS.map((p) => (
                <button 
                  key={p.label}
                  onClick={() => {
                    setInputH(Math.floor(p.s / 3600));
                    setInputM(Math.floor((p.s % 3600) / 60));
                    setInputS(p.s % 60);
                  }}
                  className={`px-6 py-2 rounded-full border border-current hover:text-yellow-400 hover:border-yellow-400 transition-all font-black text-[10px] uppercase tracking-widest`}
                  style={{ color: isDark ? 'white' : 'black' }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 w-full max-w-4xl py-8">
            {/* Running Display - Ultra thin (100 weight) */}
            <div className={`text-[20vw] md:text-[24vw] leading-none font-[100] tracking-[-0.05em] tabular-nums transition-all ${textColor}`}>
              {formatDisplay(remaining)}
            </div>

            <div className="flex gap-4 w-full max-w-lg px-4">
              <button 
                onClick={() => setIsPaused(!isPaused)} 
                className={`${actionButtonBase} py-5 ${
                  isPaused ? 'border-green-500 text-green-500' : 'border-amber-500 text-amber-500'
                }`}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button 
                onClick={handleReset} 
                className={`${actionButtonBase} py-5 ${isDark ? 'border-white text-white' : 'border-black text-black'}`}
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timer;
