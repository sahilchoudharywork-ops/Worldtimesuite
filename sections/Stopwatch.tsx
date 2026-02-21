
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Lap } from '../types';

interface StopwatchProps {
  isDark: boolean;
}

const Stopwatch: React.FC<StopwatchProps> = ({ isDark }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      const start = performance.now() - elapsed;
      const tick = () => {
        setElapsed(performance.now() - start);
        timerRef.current = requestAnimationFrame(tick);
      };
      timerRef.current = requestAnimationFrame(tick);
    } else {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    }
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);

    const h = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '';
    const m = minutes.toString().padStart(2, '0');
    const s = seconds.toString().padStart(2, '0');
    const msStr = milliseconds.toString().padStart(2, '0');

    return `${h}${m}:${s}.${msStr}`;
  };

  const handleLap = () => {
    const cumulative = elapsed;
    const lastCumulative = laps.length > 0 ? laps[0].cumulative : 0;
    const newLap: Lap = {
      id: laps.length + 1,
      time: cumulative - lastCumulative,
      cumulative: cumulative
    };
    setLaps([newLap, ...laps]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsed(0);
    setLaps([]);
  };

  const minMaxLaps = useMemo(() => {
    if (laps.length < 2) return { min: -1, max: -1 };
    let minIdx = 0, maxIdx = 0;
    laps.forEach((lap, i) => {
      if (lap.time < laps[minIdx].time) minIdx = i;
      if (lap.time > laps[maxIdx].time) maxIdx = i;
    });
    return { min: minIdx, max: maxIdx };
  }, [laps]);

  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-black';
  const borderColor = isDark ? 'border-white' : 'border-black';

  return (
    <div className={`flex flex-col flex-1 h-full ${bgColor} ${textColor} p-4 md:p-12 overflow-y-auto font-['Helvetica'] scroll-smooth`}>
      {/* Header section with stylized STOPWATCH text */}
      <div className="flex-none flex flex-col items-center justify-center text-center py-4">
        <h1 className="text-4xl md:text-6xl font-black mb-2 uppercase tracking-tighter">Stopwatch</h1>
        <p className={`text-xs md:text-sm opacity-50 uppercase tracking-[0.3em] font-bold`}>
          HIGH PRECISION TRACKING
        </p>
      </div>

      {/* Main Display - using font-[100] to match Timer section */}
      <div className="flex-none min-h-[50vh] flex flex-col items-center justify-center py-8">
        <div className={`text-[15vw] md:text-[20vw] leading-none font-[100] tracking-[-0.05em] tabular-nums transition-all ${textColor}`}>
          {formatTime(elapsed)}
        </div>
      </div>

      <div className="flex flex-col items-center gap-12 w-full max-w-2xl mx-auto pb-12">
        <div className="flex justify-between w-full px-8">
          <button 
            onClick={isRunning ? handleLap : handleReset}
            className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-2 ${borderColor} flex items-center justify-center text-xl font-bold transition-all active:scale-95 hover:bg-current hover:text-current-contrast`}
            style={{ 
              backgroundColor: 'transparent',
              color: isDark ? 'white' : 'black'
            }}
          >
            {isRunning ? 'Lap' : 'Reset'}
          </button>

          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-2 flex items-center justify-center text-xl font-bold transition-all active:scale-95 ${
              isRunning 
                ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white' 
                : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white'
            }`}
          >
            {isRunning ? 'Stop' : 'Start'}
          </button>
        </div>

        {laps.length > 0 && (
          <div className="w-full border-t-2 border-current pt-8 px-4">
            <div className="space-y-6">
              {laps.map((lap, i) => (
                <div 
                  key={lap.id} 
                  className={`flex justify-between items-center py-4 border-b border-zinc-500/20 transition-colors ${
                    i === minMaxLaps.min ? 'text-green-400' : i === minMaxLaps.max ? 'text-red-400' : ''
                  }`}
                >
                  <span className="text-xl font-black uppercase tracking-widest">Lap {lap.id}</span>
                  <span className="text-3xl font-[100] tabular-nums tracking-tight">
                    {formatTime(lap.time)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stopwatch;
