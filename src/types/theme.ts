export type PresetThemeId = 
  | 'default'
  | 'dark'
  | 'sunset'
  | 'ocean'
  | 'forest'
  | 'lavender'
  | 'notebook';

export interface PresetTheme {
  id: PresetThemeId;
  name: string;
  preview: string; // CSS background style or preview color
  style: {
    background: string;
    isDark?: boolean;
    headerBg?: string;
    accentColor?: string;
    cardBg?: string;
    cardBorder?: string;
    textColor?: string;
    pattern?: string;
  };
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
    name: 'Mặc định (Sáng)',
    preview: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
    style: {
      background: '#f1f5f9',
      isDark: false,
      headerBg: 'bg-blue-600',
      accentColor: '#2563eb',
      cardBg: 'bg-white',
      cardBorder: 'border-slate-200',
      textColor: 'text-slate-900',
    }
  },
  {
    id: 'dark',
    name: 'Đêm Obsidian',
    preview: 'linear-gradient(135deg, #0f172a, #1e293b)',
    style: {
      background: 'linear-gradient(to bottom, #090d16, #0f172a)',
      isDark: true,
      headerBg: 'bg-slate-900/90 border-b border-slate-800',
      accentColor: '#38bdf8',
      cardBg: 'bg-slate-800/80 backdrop-blur-md',
      cardBorder: 'border-slate-700/60',
      textColor: 'text-white',
    }
  },
  {
    id: 'sunset',
    name: 'Hoàng hôn',
    preview: 'linear-gradient(135deg, #ff7e5f, #feb47b)',
    style: {
      background: 'linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)',
      isDark: false,
      headerBg: 'bg-gradient-to-r from-orange-500 to-rose-500',
      accentColor: '#f97316',
      cardBg: 'bg-white/85 backdrop-blur-md',
      cardBorder: 'border-orange-200/60',
      textColor: 'text-slate-900',
    }
  },
  {
    id: 'ocean',
    name: 'Đại dương',
    preview: 'linear-gradient(135deg, #1e3a8a, #0284c7)',
    style: {
      background: 'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%)',
      isDark: false,
      headerBg: 'bg-gradient-to-r from-blue-700 to-cyan-600',
      accentColor: '#0284c7',
      cardBg: 'bg-white/90 backdrop-blur-md',
      cardBorder: 'border-blue-200/60',
      textColor: 'text-slate-900',
    }
  },
  {
    id: 'forest',
    name: 'Vườn xanh',
    preview: 'linear-gradient(135deg, #065f46, #10b981)',
    style: {
      background: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)',
      isDark: false,
      headerBg: 'bg-gradient-to-r from-emerald-700 to-teal-600',
      accentColor: '#059669',
      cardBg: 'bg-white/90 backdrop-blur-md',
      cardBorder: 'border-emerald-200/60',
      textColor: 'text-slate-900',
    }
  },
  {
    id: 'lavender',
    name: 'Pastel Mộng Mơ',
    preview: 'linear-gradient(135deg, #7c3aed, #ec4899)',
    style: {
      background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 50%, #f3e8ff 100%)',
      isDark: false,
      headerBg: 'bg-gradient-to-r from-purple-600 to-pink-500',
      accentColor: '#9333ea',
      cardBg: 'bg-white/90 backdrop-blur-md',
      cardBorder: 'border-purple-200/60',
      textColor: 'text-slate-900',
    }
  },
  {
    id: 'notebook',
    name: 'Sổ tay ô ly',
    preview: 'radial-gradient(#94a3b8 1px, transparent 1px)',
    style: {
      background: '#f8fafc',
      isDark: false,
      headerBg: 'bg-indigo-600',
      accentColor: '#4f46e5',
      cardBg: 'bg-white/95 backdrop-blur-sm shadow-sm',
      cardBorder: 'border-indigo-100',
      textColor: 'text-slate-900',
      pattern: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px) 0 0 / 16px 16px',
    }
  }
];

export const DEFAULT_THEME_CONFIG: AppThemeConfig = {
  type: 'preset',
  presetId: 'default',
  overlayDarkness: 25,
  blur: 0,
};
