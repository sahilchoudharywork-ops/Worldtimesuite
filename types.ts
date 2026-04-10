
// export enum Page {
//   CONVERTER = 'converter',
//   STOPWATCH = 'stopwatch',
//   TIMER = 'timer',
//   CALENDAR = 'calendar',
//   SETTINGS = 'settings'
// }

// export interface Task {
//   id: string;
//   title: string;
//   description: string;
//   dueDate: string;
//   time: string;
//   priority: 'low' | 'medium' | 'high';
//   completed: boolean;
//   repeat: 'none' | 'daily' | 'weekly' | 'monthly';
//   invitees?: string;
//   location?: string;
// }

// export interface Timezone {
//   name: string;
//   iana: string;
//   offset: number;
// }

// export interface Lap {
//   id: number;
//   time: number;
//   cumulative: number;
// }

// export interface AdProps {
//   id: string;
//   type: 'leaderboard' | 'sidebar' | 'footer' | 'skyscraper';
//   className?: string;
//   isDark?: boolean;
// }

// export interface GDPRSettings {
//   essential: boolean;
//   analytics: boolean;
//   marketing: boolean;
//   consented: boolean;
// }


export enum Page {
  CONVERTER = 'converter',
  STOPWATCH = 'stopwatch',
  TIMER = 'timer',
  CALENDAR = 'calendar',
  SETTINGS = 'settings',
  ABOUT = 'about',
  TERMS = 'terms',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  invitees?: string;
  location?: string;
}

export interface Timezone {
  name: string;
  iana: string;
  offset: number;
}

export interface Lap {
  id: number;
  time: number;
  cumulative: number;
}

export interface AdProps {
  id: string;
  type: 'leaderboard' | 'sidebar' | 'footer' | 'skyscraper';
  className?: string;
  isDark?: boolean;
}

export interface GDPRSettings {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  consented: boolean;
}
