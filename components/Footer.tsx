
import React from 'react';

interface FooterProps {
  theme: 'dark' | 'light';
}

const Footer: React.FC<FooterProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-black';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const borderColor = isDark ? 'border-zinc-800' : 'border-black';

  return (
    <footer className={`${bgColor} ${textColor} border-t-2 ${borderColor} pt-20 pb-12 font-['Helvetica']`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl border-2 ${isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>W</div>
              <span className="text-2xl font-black tracking-tighter">worldtimesuite</span>
            </div>
            <p className="text-sm font-bold opacity-50 leading-relaxed uppercase tracking-widest">
              Professional global productivity suite. Precision synchronization.
            </p>
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8">Tools</h4>
            <ul className="space-y-4 text-sm font-black uppercase tracking-widest">
              <li><a href="#" className="hover:opacity-50 transition">Timezone Converter</a></li>
              <li><a href="#" className="hover:opacity-50 transition">iPhone Stopwatch</a></li>
              <li><a href="#" className="hover:opacity-50 transition">Countdown Timer</a></li>
              <li><a href="#" className="hover:opacity-50 transition">Calendar Sync</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8">Resources</h4>
            <ul className="space-y-4 text-sm font-black uppercase tracking-widest">
              <li><a href="#" className="hover:opacity-50 transition">DST Guide</a></li>
              <li><a href="#" className="hover:opacity-50 transition">Global Hours</a></li>
              <li><a href="#" className="hover:opacity-50 transition">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8">Legal</h4>
            <ul className="space-y-4 text-sm font-black uppercase tracking-widest">
              <li><a href="#" className="hover:opacity-50 transition">Privacy</a></li>
              <li><a href="#" className="hover:opacity-50 transition">Terms</a></li>
              <li><a href="/ads.txt" className="hover:opacity-50 transition">ads.txt</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-current opacity-20 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em]">
          <p>© {new Date().getFullYear()} WORLDTIMESUITE PRODUCTIVITY SUITE.</p>
          <div className="flex gap-8">
            <span>GMT TO IST</span>
            <span>LDN TO IND</span>
            <span>TASK PLANNER</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
