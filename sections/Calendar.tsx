
// import React, { useState, useMemo, useRef, useEffect } from 'react';
// import { createPortal } from 'react-dom';
// import { Task } from '../types';

// interface CalendarProps {
//   isDark: boolean;
// }

// const Calendar: React.FC<CalendarProps> = ({ isDark }) => {
//   const TASKS_STORAGE_KEY = 'chronomax_calendar_tasks_v1';
//   const todayDate = new Date();
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const dateInputRef = useRef<HTMLInputElement>(null);
  
//   // State for modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalDate, setModalDate] = useState('');
//   const [form, setForm] = useState({
//     title: '',
//     invitees: '',
//     location: '',
//     time: '12:00',
//     priority: 'medium' as 'low' | 'medium' | 'high'
//   });

//   const notifiedRef = useRef<Set<string>>(new Set());
//   const [previewTask, setPreviewTask] = useState<Task | null>(null);
//   const [previewPos, setPreviewPos] = useState<{ top: number; left: number } | null>(null);

//   const defaultTasks: Task[] = [
//     { id: '1', title: 'Global Sync', description: 'Review Q4 goals', dueDate: new Date(2026, 1, 8).toISOString().split('T')[0], time: '14:00', priority: 'high', completed: false, repeat: 'none' },
//     { id: '2', title: 'Plan Sprint', description: 'Design updates', dueDate: new Date(2026, 1, 12).toISOString().split('T')[0], time: '10:00', priority: 'medium', completed: true, repeat: 'none' }
//   ];

//   const [tasks, setTasks] = useState<Task[]>(() => {
//     try {
//       const raw = localStorage.getItem(TASKS_STORAGE_KEY);
//       if (!raw) return defaultTasks;

//       const parsed = JSON.parse(raw);
//       return Array.isArray(parsed) ? parsed : defaultTasks;
//     } catch {
//       return defaultTasks;
//     }
//   });

//   const toDateKey = (d: Date) => {
//     const y = d.getFullYear();
//     const m = String(d.getMonth() + 1).padStart(2, '0');
//     const day = String(d.getDate()).padStart(2, '0');
//     return `${y}-${m}-${day}`;
//   };

//   const todayKey = toDateKey(todayDate);
//   const selectedDateKey = toDateKey(selectedDate);

//   const selectedDayTasks = useMemo(() => {
//     return tasks
//       .filter(t => !t.completed && t.dueDate === selectedDateKey)
//       .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
//   }, [tasks, selectedDateKey]);

//   useEffect(() => {
//     try {
//       localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
//     } catch {
//       // ignore storage errors (quota / private mode)
//     }
//   }, [tasks]);

//   const parseTaskDateTime = (task: Task) => {
//     const [y, m, d] = task.dueDate.split('-').map(Number);
//     const [hh, mm] = (task.time || '00:00').split(':').map(Number);
//     return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
//   };

//   useEffect(() => {
//     if (typeof window === 'undefined' || !('Notification' in window)) return;
//     if (Notification.permission === 'default') {
//       Notification.requestPermission().catch(() => {});
//     }
//   }, []);

//   useEffect(() => {
//     if (typeof window === 'undefined') return;
//     if (!('Notification' in window)) return;
//     if (Notification.permission !== 'granted') return;

//     const notifyIfDue = (now: number, triggerAt: number, key: string, title: string, body: string) => {
//       if (now >= triggerAt && now < triggerAt + 60000 && !notifiedRef.current.has(key)) {
//         try {
//           new Notification(title, { body });
//         } catch (e) {
//           console.warn("Calendar: Failed to show notification", e);
//         }
//         notifiedRef.current.add(key);
//       }
//     };

//     const tick = () => {
//       const now = Date.now();

//       tasks.forEach(task => {
//         if (task.completed) return;

//         const eventTime = parseTaskDateTime(task).getTime();
//         if (!Number.isFinite(eventTime)) return;

//         const tenMinBefore = eventTime - 10 * 60 * 1000;
//         const twoMinBefore = eventTime - 2 * 60 * 1000;

//         const baseKey = `${task.id}-${task.dueDate}-${task.time || '00:00'}`;
//         const body = `${task.title} • ${task.time || '00:00'}`;

//         notifyIfDue(now, tenMinBefore, `${baseKey}-10m`, 'Meeting in 10 minutes', body);
//         notifyIfDue(now, twoMinBefore, `${baseKey}-2m`, 'Meeting in 2 minutes', body);
//       });
//     };

//     tick();
//     const interval = setInterval(tick, 30000);

//     return () => clearInterval(interval);
//   }, [tasks]);

//   const openTaskPreview = (task: Task, anchorEl: HTMLElement) => {
//     const rect = anchorEl.getBoundingClientRect();
//     const popupW = 340;
//     const popupH = 230;
//     const gap = 10;

//     let left = rect.right + gap;
//     if (left + popupW > window.innerWidth - 12) left = rect.left - popupW - gap;
//     if (left < 12) left = 12;

//     let top = rect.top;
//     if (top + popupH > window.innerHeight - 12) top = window.innerHeight - popupH - 12;
//     if (top < 12) top = 12;

//     setPreviewTask(task);
//     setPreviewPos({ top, left });
//   };

//   const closeTaskPreview = () => {
//     setPreviewTask(null);
//     setPreviewPos(null);
//   };

//   const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
//   const startDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

//   const calendarData = useMemo(() => {
//     const month = currentDate.getMonth();
//     const year = currentDate.getFullYear();
//     const days = daysInMonth(month, year);
//     const start = startDayOfMonth(month, year);
//     const result = [];
//     for (let i = 0; i < start; i++) result.push(null);
//     for (let i = 1; i <= days; i++) result.push(i);
//     return result;
//   }, [currentDate.getMonth(), currentDate.getFullYear()]);

//   const monthName = currentDate.toLocaleString('default', { month: 'long' });
//   const currentYear = currentDate.getFullYear();

//   const shiftDay = (offset: number) => {
//     const next = new Date(selectedDate);
//     next.setDate(next.getDate() + offset);
//     setSelectedDate(next);
//     if (next.getMonth() !== currentDate.getMonth() || next.getFullYear() !== currentDate.getFullYear()) {
//       setCurrentDate(new Date(next.getFullYear(), next.getMonth(), 1));
//     }
//   };

//   const shiftMonth = (offset: number) => {
//     const next = new Date(currentDate);
//     next.setMonth(next.getMonth() + offset);
//     setCurrentDate(next);
//   };

//   const goToToday = () => {
//     const today = new Date();
//     setSelectedDate(today);
//     setCurrentDate(today);
//   };

//   const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.value) {
//       const selected = new Date(e.target.value);
//       setSelectedDate(selected);
//       setCurrentDate(selected);
//     }
//   };

//   const openDatePicker = () => {
//     // Fix: Use explicit property check to prevent TypeScript from narrowing the input element to 'never' in the fallback branch
//     const input = dateInputRef.current;
//     if (input) {
//       if (typeof (input as any).showPicker === 'function') {
//         (input as any).showPicker();
//       } else {
//         input.click();
//       }
//     }
//   };

//   const openModal = (dateStr: string) => {
//     setModalDate(dateStr);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setForm({ title: '', invitees: '', location: '', time: '12:00', priority: 'medium' });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!form.title.trim()) return;

//     const newTask: Task = {
//       id: Math.random().toString(36).substr(2, 9),
//       title: form.title.trim(),
//       description: `Meeting with ${form.invitees}`,
//       dueDate: modalDate,
//       time: form.time,
//       priority: form.priority,
//       completed: false,
//       repeat: 'none',
//       invitees: form.invitees,
//       location: form.location
//     };
//     setTasks(prev => [...prev, newTask]);
//     closeModal();
//   };

//   const bgColor = isDark ? 'bg-black' : 'bg-white';
//   const textColor = isDark ? 'text-white' : 'text-black';
//   const sidebarBg = isDark ? 'bg-zinc-950' : 'bg-zinc-50';
//   const borderColor = isDark ? 'border-zinc-800' : 'border-zinc-200';
//   const heavyBorderColor = isDark ? 'border-white' : 'border-black';
//   const mutedText = isDark ? 'text-zinc-500' : 'text-zinc-400';
//   const modalBg = isDark ? 'bg-zinc-900' : 'bg-white';

//   return (
//     <div className={`flex flex-col lg:flex-row min-h-[800px] font-['Helvetica Neue',Helvetica,sans-serif] ${bgColor} ${textColor} transition-colors duration-500 relative`}>
      
//       {/* Event Logging Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/40">
//           <div className={`${modalBg} w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border ${borderColor} animate-in fade-in zoom-in duration-300`}>
//             <div className="flex justify-between items-start mb-8">
//               <div>
//                 <h3 className="text-3xl font-black uppercase tracking-tighter">Log Event</h3>
//                 <p className={`text-[10px] font-black uppercase tracking-widest ${mutedText} mt-1`}>Date: {modalDate}</p>
//               </div>
//               <button onClick={closeModal} className={`${mutedText} hover:text-red-500 transition-colors`}>
//                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="space-y-2">
//                 <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Title</label>
//                 <input 
//                   autoFocus
//                   required
//                   type="text" 
//                   value={form.title}
//                   onChange={e => setForm({...form, title: e.target.value})}
//                   className={`w-full bg-transparent border-b-2 ${borderColor} py-2 text-xl font-bold outline-none focus:border-yellow-400 transition-colors`}
//                   placeholder="Meeting Title"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Invite</label>
//                   <input 
//                     type="text" 
//                     value={form.invitees}
//                     onChange={e => setForm({...form, invitees: e.target.value})}
//                     className={`w-full bg-transparent border-b-2 ${borderColor} py-2 text-sm font-bold outline-none focus:border-yellow-400 transition-colors`}
//                     placeholder="Names / Emails"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Time</label>
//                   <input 
//                     type="time" 
//                     value={form.time}
//                     onChange={e => setForm({...form, time: e.target.value})}
//                     className={`w-full bg-transparent border-b-2 ${borderColor} py-2 text-sm font-bold outline-none focus:border-yellow-400 transition-colors`}
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Location / Link</label>
//                 <input 
//                   type="text" 
//                   value={form.location}
//                   onChange={e => setForm({...form, location: e.target.value})}
//                   className={`w-full bg-transparent border-b-2 ${borderColor} py-2 text-sm font-bold outline-none focus:border-yellow-400 transition-colors`}
//                   placeholder="Google Meet / Room 402"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Priority</label>
//                 <div className="flex gap-3">
//                   {['low', 'medium', 'high'].map(p => (
//                     <button
//                       key={p}
//                       type="button"
//                       onClick={() => setForm({...form, priority: p as any})}
//                       className={`flex-1 py-3 rounded-full border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
//                         form.priority === p 
//                         ? 'border-yellow-400 bg-yellow-400 text-black' 
//                         : `${borderColor} hover:border-yellow-400/50`
//                       }`}
//                     >
//                       {p}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <button 
//                 type="submit"
//                 className="w-full py-5 bg-current text-current-contrast rounded-full font-black uppercase tracking-[0.2em] text-sm mt-4 hover:opacity-90 active:scale-95 transition-all"
//                 style={{ backgroundColor: isDark ? 'white' : 'black', color: isDark ? 'black' : 'white' }}
//               >
//                 Log Sync
//               </button>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Sidebar: Next Up */}
//       <aside className={`w-full lg:w-80 border-r ${borderColor} p-10 space-y-12 flex-none ${sidebarBg} transition-colors duration-500 relative z-30 overflow-visible`}>
//         <div className="space-y-2">
//           <h2 className="text-3xl font-black uppercase tracking-[0.1em]">NEXT UP</h2>
//           <div className="h-1 w-12 bg-current opacity-20 rounded-full" />
//         </div>
//         <div className="space-y-6">
//           {selectedDayTasks.slice(0, 3).map(task => (
//             <div
//               key={task.id}
//               onMouseEnter={(e) => openTaskPreview(task, e.currentTarget)}
//               onMouseLeave={closeTaskPreview}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 openTaskPreview(task, e.currentTarget);
//               }}
//               className={`p-6 rounded-[2rem] border ${borderColor} transition-all relative overflow-visible group hover:scale-[1.02] cursor-pointer ${isDark ? 'bg-zinc-900/40' : 'bg-white shadow-sm'}`}
//             >
//               <div className="flex items-center gap-3 mb-4">
//                 <span className={`w-3 h-3 rounded-full ${task.priority === 'high' ? 'bg-red-600 animate-pulse' : 'bg-blue-600'}`} />
//                 <span className={`text-xs font-black uppercase tracking-widest ${mutedText}`}>{task.time} {task.dueDate === selectedDateKey ? 'Selected Day' : 'Scheduled'}</span>
//               </div>
//               <h4 className="font-black text-2xl mb-1 tracking-tight">{task.title}</h4>
//               <p className={`text-xs ${mutedText} font-bold leading-relaxed truncate`}>{task.description}</p>
//             </div>
//           ))}
//         </div>
//       </aside>

//       {/* Main Calendar View */}
//       <div className={`flex-1 p-8 md:p-14 space-y-12 overflow-y-auto ${bgColor} transition-colors duration-500 relative z-10`}>
//         <header className="flex flex-col xl:flex-row items-start xl:items-start justify-between gap-10">
//           <div className="space-y-4">
//             <div className="flex items-center gap-6">
//               <h1 className="text-7xl md:text-8xl font-black tracking-tighter flex items-baseline gap-4 whitespace-nowrap">
//                 {monthName} <span className={isDark ? 'text-zinc-700' : 'text-zinc-200'}>{currentYear}</span>
//               </h1>
//               <div className="flex items-center gap-2">
//                 <button onClick={() => shiftMonth(-1)} className={`p-3 rounded-full border ${borderColor} hover:bg-current hover:text-current-contrast transition-all`} title="Previous Month">
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
//                 </button>
//                 <button onClick={() => shiftMonth(1)} className={`p-3 rounded-full border ${borderColor} hover:bg-current hover:text-current-contrast transition-all`} title="Next Month">
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
//                 </button>
//               </div>
//             </div>
//             <p className={`text-[11px] font-black uppercase tracking-[0.5em] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Precision Synchronization View</p>
//           </div>
          
//           <div className="flex flex-wrap items-center gap-5 pt-4 xl:pt-8">
//             <div className="relative group">
//               <button onClick={openDatePicker} className={`w-16 h-16 border-2 ${borderColor} rounded-full flex items-center justify-center transition-all group-hover:border-blue-500 group-hover:text-blue-500`}>
//                 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
//               </button>
//               <input ref={dateInputRef} type="date" className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0" onChange={handleDateChange} />
//             </div>

//             <div className="flex items-center gap-3">
//               <button onClick={() => shiftDay(-1)} className={`w-16 h-16 border-2 ${heavyBorderColor} rounded-full flex items-center justify-center transition-all hover:border-yellow-400 hover:text-yellow-400`} title="Yesterday">
//                 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
//               </button>
//               <button onClick={goToToday} className={`px-12 h-16 border-2 ${heavyBorderColor} rounded-full font-black uppercase text-sm tracking-[0.2em] transition-all hover:border-yellow-400 hover:text-yellow-400 shadow-sm active:scale-95`}>TODAY</button>
//               <button onClick={() => shiftDay(1)} className={`w-16 h-16 border-2 ${heavyBorderColor} rounded-full flex items-center justify-center transition-all hover:border-yellow-400 hover:text-yellow-400`} title="Tomorrow">
//                 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
//               </button>
//             </div>
//           </div>
//         </header>

//         <div className="grid grid-cols-7 gap-4">
//           {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
//             <div key={day} className={`text-center text-[11px] font-black uppercase tracking-[0.4em] pb-8 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{day}</div>
//           ))}
          
//           {calendarData.map((day, idx) => {
//             const dateObj = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
//             const dateStr = dateObj ? toDateKey(dateObj) : '';
//             const dayTasks = tasks.filter(t => t.dueDate === dateStr);
//             const isSelected = day && selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear();
//             const isActualToday = day && dateStr === todayKey;

//             return (
//               <div 
//                 key={idx} 
//                 className={`min-h-[220px] p-8 rounded-[3rem] border-2 transition-all flex flex-col relative overflow-hidden group ${
//                   day
//                     ? (isActualToday
//                         ? (isDark ? 'bg-white text-black border-white cursor-pointer' : 'bg-black text-white border-black cursor-pointer')
//                         : (isSelected
//                             ? 'border-yellow-400 text-yellow-400 cursor-pointer shadow-[0_0_30px_rgba(250,204,21,0.15)] bg-yellow-400/5'
//                             : `${bgColor} ${textColor} ${borderColor} hover:border-yellow-400 hover:text-yellow-400 cursor-pointer`))
//                     : 'border-transparent pointer-events-none'
//                 }`}
//                 onClick={() => {
//                   if (day) {
//                     const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
//                     setSelectedDate(d);
//                   }
//                 }}
//               >
//                 {day && (
//                   <>
//                     <button 
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         openModal(dateStr);
//                       }}
//                       className={`absolute bottom-8 right-8 w-14 h-14 rounded-full border-2 flex items-center justify-center text-3xl font-black transition-all hover:scale-110 active:scale-90 ${
//                         isActualToday 
//                           ? (isDark ? 'border-black text-black hover:bg-black/10' : 'border-white text-white hover:bg-white/10')
//                           : (isSelected ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/10' : 'border-current opacity-30 group-hover:opacity-100 hover:bg-current/10')
//                       }`}
//                       title="Log Meeting/Event"
//                     >
//                       +
//                     </button>

//                     <span className={`text-7xl font-black leading-none tracking-tighter mb-4 transition-colors ${
//                       isActualToday ? (isDark ? 'text-black' : 'text-white') : (isSelected ? 'text-yellow-400' : 'group-hover:text-yellow-400')
//                     }`}>
//                       {day}
//                     </span>
                    
//                     <div className="space-y-2 mt-auto pr-16">
//                       {dayTasks.map(task => (
//                         <div
//                           key={task.id}
//                           className="relative"
//                           onMouseEnter={(e) => openTaskPreview(task, e.currentTarget)}
//                           onMouseLeave={closeTaskPreview}
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             openTaskPreview(task, e.currentTarget);
//                           }}
//                         >
//                           <div className={`text-[10px] px-4 py-2 rounded-full font-black uppercase tracking-widest truncate cursor-pointer ${
//                             isActualToday 
//                               ? (isDark ? 'bg-black text-white' : 'bg-white text-black')
//                               : (isSelected ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : (isDark ? 'bg-white text-black' : 'bg-black text-white'))
//                           }`}>
//                             {task.title}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {previewTask && previewPos && typeof document !== 'undefined' && createPortal(
//         <div
//           className={`fixed z-[9999] w-[340px] rounded-[2rem] p-6 border ${borderColor} shadow-2xl ${modalBg} pointer-events-none`}
//           style={{ top: previewPos.top, left: previewPos.left }}
//         >
//           <h5 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
//             {previewTask.title}
//           </h5>

//           <p className="text-[13px] font-black tracking-widest text-yellow-400 mt-1">
//             {previewTask.time || 'N/A'}
//           </p>

//           <div className="space-y-2 text-[11px] font-bold mt-4">
//             <div className={mutedText}>{previewTask.description || 'N/A'}</div>
//             <div className={mutedText}>{previewTask.location || 'N/A'}</div>
//           </div>
//         </div>,
//         document.body
//       )}
//     </div>
//   );
// };

// export default Calendar;



import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Task } from '../types';

interface CalendarProps {
  isDark: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ isDark }) => {
  const TASKS_STORAGE_KEY = 'chronomax_calendar_tasks_v1';
  const todayDate = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    mode: 'delete' | 'save' | null;
    taskId: string | null;
  }>({
    open: false,
    mode: null,
    taskId: null
  });
  const [modalDate, setModalDate] = useState('');
  const [form, setForm] = useState({
    title: '',
    invitees: '',
    location: '',
    time: '12:00',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const notifiedRef = useRef<Set<string>>(new Set());
  const [previewTask, setPreviewTask] = useState<Task | null>(null);
  const [previewPos, setPreviewPos] = useState<{ top: number; left: number } | null>(null);

  const defaultTasks: Task[] = [
    { id: '1', title: 'Global Sync', description: 'Review Q4 goals', dueDate: new Date(2026, 1, 8).toISOString().split('T')[0], time: '14:00', priority: 'high', completed: false, repeat: 'none' },
    { id: '2', title: 'Plan Sprint', description: 'Design updates', dueDate: new Date(2026, 1, 12).toISOString().split('T')[0], time: '10:00', priority: 'medium', completed: true, repeat: 'none' }
  ];

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const raw = localStorage.getItem(TASKS_STORAGE_KEY);
      if (!raw) return defaultTasks;

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : defaultTasks;
    } catch {
      return defaultTasks;
    }
  });

  const toDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayKey = toDateKey(todayDate);
  const selectedDateKey = toDateKey(selectedDate);

  const selectedDayTasks = useMemo(() => {
    return tasks
      .filter(t => !t.completed && t.dueDate === selectedDateKey)
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [tasks, selectedDateKey]);

  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // ignore storage errors (quota / private mode)
    }
  }, [tasks]);

  const parseTaskDateTime = (task: Task) => {
    const [y, m, d] = task.dueDate.split('-').map(Number);
    const [hh, mm] = (task.time || '00:00').split(':').map(Number);
    return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const notifyIfDue = (now: number, triggerAt: number, key: string, title: string, body: string) => {
      if (now >= triggerAt && now < triggerAt + 60000 && !notifiedRef.current.has(key)) {
        try {
          new Notification(title, { body });
        } catch (e) {
          console.warn("Calendar: Failed to show notification", e);
        }
        notifiedRef.current.add(key);
      }
    };

    const tick = () => {
      const now = Date.now();

      tasks.forEach(task => {
        if (task.completed) return;

        const eventTime = parseTaskDateTime(task).getTime();
        if (!Number.isFinite(eventTime)) return;

        const tenMinBefore = eventTime - 10 * 60 * 1000;
        const twoMinBefore = eventTime - 2 * 60 * 1000;

        const baseKey = `${task.id}-${task.dueDate}-${task.time || '00:00'}`;
        const body = `${task.title} • ${task.time || '00:00'}`;

        notifyIfDue(now, tenMinBefore, `${baseKey}-10m`, 'Meeting in 10 minutes', body);
        notifyIfDue(now, twoMinBefore, `${baseKey}-2m`, 'Meeting in 2 minutes', body);
      });
    };

    tick();
    const interval = setInterval(tick, 30000);

    return () => clearInterval(interval);
  }, [tasks]);

  const openTaskPreview = (task: Task, anchorEl: HTMLElement) => {
    const rect = anchorEl.getBoundingClientRect();
    const popupW = 340;
    const popupH = 230;
    const gap = 10;

    let left = rect.right + gap;
    if (left + popupW > window.innerWidth - 12) left = rect.left - popupW - gap;
    if (left < 12) left = 12;

    let top = rect.top;
    if (top + popupH > window.innerHeight - 12) top = window.innerHeight - popupH - 12;
    if (top < 12) top = 12;

    setPreviewTask(task);
    setPreviewPos({ top, left });
  };

  const closeTaskPreview = () => {
    setPreviewTask(null);
    setPreviewPos(null);
  };

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const calendarData = useMemo(() => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const days = daysInMonth(month, year);
    const start = startDayOfMonth(month, year);
    const result = [];
    for (let i = 0; i < start; i++) result.push(null);
    for (let i = 1; i <= days; i++) result.push(i);
    return result;
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  const shiftDay = (offset: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + offset);
    setSelectedDate(next);
    if (next.getMonth() !== currentDate.getMonth() || next.getFullYear() !== currentDate.getFullYear()) {
      setCurrentDate(new Date(next.getFullYear(), next.getMonth(), 1));
    }
  };

  const shiftMonth = (offset: number) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + offset);
    setCurrentDate(next);
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDate(today);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const selected = new Date(e.target.value);
      setSelectedDate(selected);
      setCurrentDate(selected);
    }
  };

  const openDatePicker = () => {
    // Fix: Use explicit property check to prevent TypeScript from narrowing the input element to 'never' in the fallback branch
    const input = dateInputRef.current;
    if (input) {
      if (typeof (input as any).showPicker === 'function') {
        (input as any).showPicker();
      } else {
        input.click();
      }
    }
  };

  const openModal = (dateStr: string) => {
    setModalDate(dateStr);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setForm({
      title: task.title,
      invitees: task.invitees || '',
      location: task.location || '',
      time: task.time || '12:00',
      priority: task.priority as 'low' | 'medium' | 'high'
    });
    setModalDate(task.dueDate);
    setEditingTaskId(task.id);
    setIsModalOpen(true);
  };

  const deleteTask = (taskId: string) => {
    setConfirmState({ open: true, mode: 'delete', taskId });
  };

  const closeConfirmModal = () => {
    setConfirmState({ open: false, mode: null, taskId: null });
  };

  const handleConfirmAction = () => {
    const { mode, taskId } = confirmState;
    if (mode === 'delete' && taskId) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      if (previewTask?.id === taskId) {
        closeTaskPreview();
      }
    } else if (mode === 'save') {
      setTasks(prev => prev.map(t => t.id === editingTaskId ? {
        ...t,
        title: form.title.trim(),
        description: `Meeting with ${form.invitees}`,
        dueDate: modalDate,
        time: form.time,
        priority: form.priority,
        invitees: form.invitees,
        location: form.location
      } : t));
      closeModal();
    }
    closeConfirmModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm({ title: '', invitees: '', location: '', time: '12:00', priority: 'medium' });
    setEditingTaskId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (editingTaskId) {
      setConfirmState({ open: true, mode: 'save', taskId: editingTaskId });
      return;
    } else {
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: form.title.trim(),
        description: `Meeting with ${form.invitees}`,
        dueDate: modalDate,
        time: form.time,
        priority: form.priority,
        completed: false,
        repeat: 'none',
        invitees: form.invitees,
        location: form.location
      };
      setTasks(prev => [...prev, newTask]);
    }
    closeModal();
  };

  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-black';
  const sidebarBg = isDark ? 'bg-zinc-950' : 'bg-zinc-50';
  const borderColor = isDark ? 'border-zinc-800' : 'border-zinc-200';
  const heavyBorderColor = isDark ? 'border-white' : 'border-black';
  const mutedText = isDark ? 'text-zinc-500' : 'text-zinc-400';
  const modalBg = isDark ? 'bg-zinc-900' : 'bg-white';

  return (
    <div className={`flex flex-col lg:flex-row min-h-[800px] font-['Helvetica Neue',Helvetica,sans-serif] ${bgColor} ${textColor} transition-colors duration-500 relative`}>
      
      {/* Event Logging Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/40">
          <div className={`${modalBg} w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border ${borderColor} animate-in fade-in zoom-in duration-300`}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter">{editingTaskId ? 'Edit Event' : 'Log Event'}</h3>
                <p className={`text-[10px] font-black uppercase tracking-widest ${mutedText} mt-1`}>Date: {modalDate}</p>
              </div>
              <button onClick={closeModal} className={`${mutedText} hover:text-red-500 transition-colors`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Title</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  className={`w-full bg-transparent border-b-2 ${borderColor} py-2 text-xl font-bold outline-none focus:border-yellow-400 transition-colors`}
                  placeholder="Meeting Title"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Invite</label>
                  <input 
                    type="text" 
                    value={form.invitees}
                    onChange={e => setForm({...form, invitees: e.target.value})}
                    className={`w-full bg-transparent border-b-2 ${borderColor} py-2 text-sm font-bold outline-none focus:border-yellow-400 transition-colors`}
                    placeholder="Names / Emails"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Time</label>
                  <input 
                    type="time" 
                    value={form.time}
                    onChange={e => setForm({...form, time: e.target.value})}
                    className={`w-full bg-transparent border-b-2 ${borderColor} py-2 text-sm font-bold outline-none focus:border-yellow-400 transition-colors`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Location / Link</label>
                <input 
                  type="text" 
                  value={form.location}
                  onChange={e => setForm({...form, location: e.target.value})}
                  className={`w-full bg-transparent border-b-2 ${borderColor} py-2 text-sm font-bold outline-none focus:border-yellow-400 transition-colors`}
                  placeholder="Google Meet / Room 402"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Priority</label>
                <div className="flex gap-3">
                  {['low', 'medium', 'high'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({...form, priority: p as any})}
                      className={`flex-1 py-3 rounded-full border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                        form.priority === p 
                        ? 'border-yellow-400 bg-yellow-400 text-black' 
                        : `${borderColor} hover:border-yellow-400/50`
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-current text-current-contrast rounded-full font-black uppercase tracking-[0.2em] text-sm mt-4 hover:opacity-90 active:scale-95 transition-all"
                style={{ backgroundColor: isDark ? 'white' : 'black', color: isDark ? 'black' : 'white' }}
              >
                {editingTaskId ? 'Update Sync' : 'Log Sync'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmState.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-xl bg-black/40">
          <div className={`${modalBg} w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border ${borderColor} animate-in fade-in zoom-in duration-200`}>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 text-center">
              {confirmState.mode === 'delete' ? 'Confirm Delete?' : 'Save Changes?'}
            </h3>
            <div className="flex gap-4">
              <button 
                onClick={closeConfirmModal}
                className={`flex-1 py-4 rounded-full border-2 ${borderColor} text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-all`}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmAction}
                className="flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
                style={confirmState.mode === 'delete' 
                  ? { backgroundColor: '#ef4444', color: 'white' } 
                  : { backgroundColor: isDark ? 'white' : 'black', color: isDark ? 'black' : 'white' }
                }
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar: Next Up */}
      <aside className={`w-full lg:w-80 border-r ${borderColor} p-10 space-y-12 flex-none ${sidebarBg} transition-colors duration-500 relative z-30 overflow-visible`}>
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-[0.1em]">NEXT UP</h2>
          <div className="h-1 w-12 bg-current opacity-20 rounded-full" />
        </div>
        <div className="space-y-6">
          {selectedDayTasks.slice(0, 3).map(task => (
            <div
              key={task.id}
              onMouseEnter={(e) => openTaskPreview(task, e.currentTarget)}
              onMouseLeave={closeTaskPreview}
              onClick={(e) => {
                e.stopPropagation();
                openTaskPreview(task, e.currentTarget);
              }}
              className={`p-6 rounded-[2rem] border ${borderColor} transition-all relative overflow-visible group hover:scale-[1.02] cursor-pointer ${isDark ? 'bg-zinc-900/40' : 'bg-white shadow-sm'}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-3 h-3 rounded-full ${task.priority === 'high' ? 'bg-red-600 animate-pulse' : 'bg-blue-600'}`} />
                <span className={`text-xs font-black uppercase tracking-widest ${mutedText}`}>{task.time} {task.dueDate === selectedDateKey ? 'Selected Day' : 'Scheduled'}</span>
              </div>
              <h4 className="font-black text-2xl mb-1 tracking-tight">{task.title}</h4>
              <p className={`text-xs ${mutedText} font-bold leading-relaxed truncate`}>{task.description}</p>
              
              <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); openEditModal(task); }}
                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${
                    isDark 
                      ? 'border-zinc-700 text-zinc-500 hover:border-white hover:text-white' 
                      : 'border-zinc-300 text-zinc-400 hover:border-black hover:text-black'
                  }`}
                >
                  EDIT
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                  className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Calendar View */}
      <div className={`flex-1 p-8 md:p-14 space-y-12 overflow-y-auto ${bgColor} transition-colors duration-500 relative z-10`}>
        <header className="flex flex-col xl:flex-row items-start xl:items-start justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <h1 className="text-7xl md:text-8xl font-black tracking-tighter flex items-baseline gap-4 whitespace-nowrap">
                {monthName} <span className={isDark ? 'text-zinc-700' : 'text-zinc-200'}>{currentYear}</span>
              </h1>
              <div className="flex items-center gap-2">
                <button onClick={() => shiftMonth(-1)} className={`p-3 rounded-full border ${borderColor} hover:bg-current hover:text-current-contrast transition-all`} title="Previous Month">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button onClick={() => shiftMonth(1)} className={`p-3 rounded-full border ${borderColor} hover:bg-current hover:text-current-contrast transition-all`} title="Next Month">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
            <p className={`text-[11px] font-black uppercase tracking-[0.5em] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Precision Synchronization View</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-5 pt-4 xl:pt-8">
            <div className="relative group">
              <button onClick={openDatePicker} className={`w-16 h-16 border-2 ${borderColor} rounded-full flex items-center justify-center transition-all group-hover:border-blue-500 group-hover:text-blue-500`}>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </button>
              <input ref={dateInputRef} type="date" className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0" onChange={handleDateChange} />
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => shiftDay(-1)} className={`w-16 h-16 border-2 ${heavyBorderColor} rounded-full flex items-center justify-center transition-all hover:border-yellow-400 hover:text-yellow-400`} title="Yesterday">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button onClick={goToToday} className={`px-12 h-16 border-2 ${heavyBorderColor} rounded-full font-black uppercase text-sm tracking-[0.2em] transition-all hover:border-yellow-400 hover:text-yellow-400 shadow-sm active:scale-95`}>TODAY</button>
              <button onClick={() => shiftDay(1)} className={`w-16 h-16 border-2 ${heavyBorderColor} rounded-full flex items-center justify-center transition-all hover:border-yellow-400 hover:text-yellow-400`} title="Tomorrow">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-4">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day} className={`text-center text-[11px] font-black uppercase tracking-[0.4em] pb-8 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{day}</div>
          ))}
          
          {calendarData.map((day, idx) => {
            const dateObj = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
            const dateStr = dateObj ? toDateKey(dateObj) : '';
            const dayTasks = tasks.filter(t => t.dueDate === dateStr);
            const isSelected = day && selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear();
            const isActualToday = day && dateStr === todayKey;

            return (
              <div 
                key={idx} 
                className={`min-h-[220px] p-8 rounded-[3rem] border-2 transition-all flex flex-col relative overflow-hidden group ${
                  day
                    ? (isActualToday
                        ? (isDark ? 'bg-white text-black border-white cursor-pointer' : 'bg-black text-white border-black cursor-pointer')
                        : (isSelected
                            ? 'border-yellow-400 text-yellow-400 cursor-pointer shadow-[0_0_30px_rgba(250,204,21,0.15)] bg-yellow-400/5'
                            : `${bgColor} ${textColor} ${borderColor} hover:border-yellow-400 hover:text-yellow-400 cursor-pointer`))
                    : 'border-transparent pointer-events-none'
                }`}
                onClick={() => {
                  if (day) {
                    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    setSelectedDate(d);
                  }
                }}
              >
                {day && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(dateStr);
                      }}
                      className={`absolute bottom-8 right-8 w-14 h-14 rounded-full border-2 flex items-center justify-center text-3xl font-black transition-all hover:scale-110 active:scale-90 ${
                        isActualToday 
                          ? (isDark ? 'border-black text-black hover:bg-black/10' : 'border-white text-white hover:bg-white/10')
                          : (isSelected ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/10' : 'border-current opacity-30 group-hover:opacity-100 hover:bg-current/10')
                      }`}
                      title="Log Meeting/Event"
                    >
                      +
                    </button>

                    <span className={`text-7xl font-black leading-none tracking-tighter mb-4 transition-colors ${
                      isActualToday ? (isDark ? 'text-black' : 'text-white') : (isSelected ? 'text-yellow-400' : 'group-hover:text-yellow-400')
                    }`}>
                      {day}
                    </span>
                    
                    <div className="space-y-2 mt-auto pr-16">
                      {dayTasks.map(task => (
                        <div
                          key={task.id}
                          className="relative"
                          onMouseEnter={(e) => openTaskPreview(task, e.currentTarget)}
                          onMouseLeave={closeTaskPreview}
                          onClick={(e) => {
                            e.stopPropagation();
                            openTaskPreview(task, e.currentTarget);
                          }}
                        >
                          <div className={`text-[10px] px-4 py-2 rounded-full font-black uppercase tracking-widest truncate cursor-pointer ${
                            isActualToday 
                              ? (isDark ? 'bg-black text-white' : 'bg-white text-black')
                              : (isSelected ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : (isDark ? 'bg-white text-black' : 'bg-black text-white'))
                          }`}>
                            {task.title}
                          </div>
                          <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => { e.stopPropagation(); openEditModal(task); }}
                              className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full border transition-all ${
                                isDark 
                                  ? 'border-zinc-800 text-zinc-600 hover:border-white hover:text-white' 
                                  : 'border-zinc-200 text-zinc-400 hover:border-black hover:text-black'
                              }`}
                            >
                              EDIT
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                              className="text-[8px] font-black uppercase tracking-tighter text-red-500 opacity-60 hover:opacity-100"
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {previewTask && previewPos && typeof document !== 'undefined' && createPortal(
        <div
          className={`fixed z-[9999] w-[340px] rounded-[2rem] p-6 border ${borderColor} shadow-2xl ${modalBg} pointer-events-none`}
          style={{ top: previewPos.top, left: previewPos.left }}
        >
          <h5 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            {previewTask.title}
          </h5>

          <p className="text-[13px] font-black tracking-widest text-yellow-400 mt-1">
            {previewTask.time || 'N/A'}
          </p>

          <div className="space-y-2 text-[11px] font-bold mt-4">
            <div className={mutedText}>{previewTask.description || 'N/A'}</div>
            <div className={mutedText}>{previewTask.location || 'N/A'}</div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Calendar;
