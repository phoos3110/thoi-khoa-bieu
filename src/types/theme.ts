export type PresetThemeId = 
  | 'default'
  | 'dark'
  | 'sunset'
  | 'ocean'
  | 'forest'
  | 'lavender'
  | 'notebook';

export interface ThemeStyleTokens {
  background: string;
  isDark?: boolean;
  headerBg: string;
  subHeaderBg: string;
  accentColor: string;
  primaryButton: string;
  activeDayTab: string;
  timeBadge: string;
  roomBadge: string;
  cardBg: string;
  cardBorder: string;
  cardTitle: string;
  pattern?: string;
}

export interface PresetTheme {
  id: PresetThemeId;
  name: string;
  tagline: string;
  preview: string; // CSS background style or preview color
  style: ThemeStyleTokens;
}

export interface AppThemeConfig {
  type: 'preset' | 'custom';
  presetId: PresetThemeId;
  customImage?: string; // Base64 compressed image
  overlayDarkness: number; // 0 to 80 (%)
  blur: number; // 0 to 10 (px)
}

export const PRESET_THEMES: PresetTheme[] = [
  {
    id: 'default',
    name: 'Xanh Hiện Đại',
    tagline: 'Sang trọng & Sáng sủa',
    preview: 'linear-gradient(135deg, #2563eb, #4f46e5)',
    style: {
      background: 'radial-gradient(at 0% 0%, #eff6ff 0px, transparent 65%), radial-gradient(at 100% 100%, #dbeafe 0px, transparent 65%), #f8fafc',
      isDark: false,
      headerBg: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 shadow-blue-500/10',
      subHeaderBg: 'bg-white/85 backdrop-blur-md border-b border-blue-100 text-slate-900',
      accentColor: '#2563eb',
      primaryButton: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25',
      activeDayTab: 'bg-white text-blue-700 shadow-md ring-1 ring-blue-100',
      timeBadge: 'text-blue-700 bg-blue-50/90 border border-blue-200/70',
      roomBadge: 'text-slate-700 bg-slate-100/90 border border-slate-200/50',
      cardBg: 'bg-white/90 backdrop-blur-md',
      cardBorder: 'border-slate-200/80 hover:border-blue-300',
      cardTitle: 'text-slate-900',
    }
  },
  {
    id: 'dark',
    name: 'Đêm Obsidian',
    tagline: 'OLED Black & Neon Cyan',
    preview: 'linear-gradient(135deg, #020617, #0f172a, #38bdf8)',
    style: {
      background: 'radial-gradient(at 50% 0%, #0f172a 0px, transparent 75%), radial-gradient(at 100% 100%, #020617 0px, transparent 75%), #020617',
      isDark: true,
      headerBg: 'bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-black/40',
      subHeaderBg: 'bg-slate-900/85 backdrop-blur-xl border-b border-slate-800 text-slate-100',
      accentColor: '#38bdf8',
      primaryButton: 'bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-slate-950 font-extrabold shadow-lg shadow-sky-400/20',
      activeDayTab: 'bg-sky-400 text-slate-950 font-extrabold shadow-md shadow-sky-400/30',
      timeBadge: 'text-sky-300 bg-sky-950/80 border border-sky-800/60',
      roomBadge: 'text-slate-300 bg-slate-800/80 border border-slate-700/60',
      cardBg: 'bg-slate-900/85 backdrop-blur-xl',
      cardBorder: 'border-slate-800/90 hover:border-sky-800/60',
      cardTitle: 'text-white',
    }
  },
  {
    id: 'sunset',
    name: 'Hoàng Hôn Ấm Áp',
    tagline: 'Cam San Hô & Hồng Dịu',
    preview: 'linear-gradient(135deg, #f97316, #ea580c, #e11d48)',
    style: {
      background: 'radial-gradient(at 0% 0%, #fff7ed 0px, transparent 65%), radial-gradient(at 100% 80%, #ffe4e6 0px, transparent 65%), #fff1f2',
      isDark: false,
      headerBg: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 shadow-orange-500/10',
      subHeaderBg: 'bg-white/85 backdrop-blur-md border-b border-orange-100 text-slate-900',
      accentColor: '#f97316',
      primaryButton: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:opacity-95 text-white shadow-lg shadow-orange-500/25',
      activeDayTab: 'bg-white text-orange-600 font-bold shadow-md shadow-orange-500/20 ring-1 ring-orange-100',
      timeBadge: 'text-orange-700 bg-orange-50/90 border border-orange-200/80',
      roomBadge: 'text-rose-700 bg-rose-50/80 border border-rose-200/60',
      cardBg: 'bg-white/90 backdrop-blur-md',
      cardBorder: 'border-orange-200/60 hover:border-orange-300',
      cardTitle: 'text-slate-900',
    }
  },
  {
    id: 'ocean',
    name: 'Đại Dương Xanh',
    tagline: 'Xanh Biển & Cyan Tươi Mát',
    preview: 'linear-gradient(135deg, #1d4ed8, #0284c7, #06b6d4)',
    style: {
      background: 'radial-gradient(at 10% 10%, #f0f9ff 0px, transparent 65%), radial-gradient(at 90% 90%, #e0f2fe 0px, transparent 65%), #f8fafc',
      isDark: false,
      headerBg: 'bg-gradient-to-r from-blue-700 via-sky-600 to-teal-500 shadow-cyan-500/10',
      subHeaderBg: 'bg-white/85 backdrop-blur-md border-b border-sky-100 text-slate-900',
      accentColor: '#0284c7',
      primaryButton: 'bg-gradient-to-r from-blue-600 via-sky-600 to-teal-500 hover:opacity-95 text-white shadow-lg shadow-sky-500/25',
      activeDayTab: 'bg-white text-sky-700 font-bold shadow-md shadow-sky-500/20 ring-1 ring-sky-100',
      timeBadge: 'text-sky-700 bg-sky-50/90 border border-sky-200/80',
      roomBadge: 'text-teal-700 bg-teal-50/80 border border-teal-200/60',
      cardBg: 'bg-white/90 backdrop-blur-md',
      cardBorder: 'border-sky-200/60 hover:border-sky-300',
      cardTitle: 'text-slate-900',
    }
  },
  {
    id: 'forest',
    name: 'Vườn Xanh Ngọc',
    tagline: 'Emerald & Bạc Hà Thư Giãn',
    preview: 'linear-gradient(135deg, #047857, #059669, #10b981)',
    style: {
      background: 'radial-gradient(at 0% 0%, #f0fdf4 0px, transparent 65%), radial-gradient(at 100% 80%, #dcfce7 0px, transparent 65%), #f7fee7',
      isDark: false,
      headerBg: 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 shadow-emerald-500/10',
      subHeaderBg: 'bg-white/85 backdrop-blur-md border-b border-emerald-100 text-slate-900',
      accentColor: '#059669',
      primaryButton: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white shadow-lg shadow-emerald-500/25',
      activeDayTab: 'bg-white text-emerald-700 font-bold shadow-md shadow-emerald-500/20 ring-1 ring-emerald-100',
      timeBadge: 'text-emerald-700 bg-emerald-50/90 border border-emerald-200/80',
      roomBadge: 'text-teal-700 bg-teal-50/80 border border-teal-200/60',
      cardBg: 'bg-white/90 backdrop-blur-md',
      cardBorder: 'border-emerald-200/60 hover:border-emerald-300',
      cardTitle: 'text-slate-900',
    }
  },
  {
    id: 'lavender',
    name: 'Pastel Mộng Mơ',
    tagline: 'Tím Oải Hương & Hồng Kẹo Ngọt',
    preview: 'linear-gradient(135deg, #7c3aed, #9333ea, #db2777)',
    style: {
      background: 'radial-gradient(at 0% 0%, #faf5ff 0px, transparent 65%), radial-gradient(at 100% 100%, #fdf2f8 0px, transparent 65%), #fdf4ff',
      isDark: false,
      headerBg: 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 shadow-purple-500/10',
      subHeaderBg: 'bg-white/85 backdrop-blur-md border-b border-purple-100 text-slate-900',
      accentColor: '#9333ea',
      primaryButton: 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 hover:opacity-95 text-white shadow-lg shadow-purple-500/25',
      activeDayTab: 'bg-white text-purple-700 font-bold shadow-md shadow-purple-500/20 ring-1 ring-purple-100',
      timeBadge: 'text-purple-700 bg-purple-50/90 border border-purple-200/80',
      roomBadge: 'text-fuchsia-700 bg-fuchsia-50/80 border border-fuchsia-200/60',
      cardBg: 'bg-white/90 backdrop-blur-md',
      cardBorder: 'border-purple-200/60 hover:border-purple-300',
      cardTitle: 'text-slate-900',
    }
  },
  {
    id: 'notebook',
    name: 'Sổ Tay Kẻ Ô',
    tagline: 'Trang Vở Học Trò & Mực Indigo',
    preview: 'radial-gradient(#475569 1.5px, #f8fafc 1.5px)',
    style: {
      background: '#fbfbfa',
      isDark: false,
      headerBg: 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/30',
      subHeaderBg: 'bg-white/90 backdrop-blur-md border-b border-slate-200 text-slate-900',
      accentColor: '#4f46e5',
      primaryButton: 'bg-gradient-to-r from-indigo-700 to-slate-900 hover:opacity-95 text-white shadow-lg shadow-indigo-950/20',
      activeDayTab: 'bg-white text-indigo-950 font-extrabold shadow-md ring-1 ring-slate-300',
      timeBadge: 'text-indigo-800 bg-indigo-50/90 border border-indigo-200/80 font-mono',
      roomBadge: 'text-slate-800 bg-slate-100 border border-slate-300/60 font-mono',
      cardBg: 'bg-white/95 backdrop-blur-md',
      cardBorder: 'border-slate-300/80 hover:border-indigo-400',
      cardTitle: 'text-slate-900 font-serif',
      pattern: 'radial-gradient(#cbd5e1 1.4px, transparent 1.4px) 0 0 / 20px 20px',
    }
  }
];

export const DEFAULT_THEME_CONFIG: AppThemeConfig = {
  type: 'preset',
  presetId: 'default',
  overlayDarkness: 25,
  blur: 0,
};
