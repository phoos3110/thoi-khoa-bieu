/**
 * Cấu hình giao diện của app — chỉ có 2 chế độ: Sáng và Tối.
 * Tất cả màu sắc được tính toán từ `mode`, đảm bảo đồng bộ 100%.
 */

export type ThemeMode = 'light' | 'dark';

export interface AppThemeConfig {
  mode: ThemeMode;
  customBg?: string;     // Base64 — ảnh nền tùy chỉnh
  overlayDarkness: number; // 0–80 (%)
  blur: number;            // 0–10 (px)
}

export const DEFAULT_THEME_CONFIG: AppThemeConfig = {
  mode: 'light',
  overlayDarkness: 30,
  blur: 0,
};
