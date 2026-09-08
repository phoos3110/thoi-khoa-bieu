import React, { useRef, useState } from 'react';
import {
  X,
  Sun,
  Moon,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Sliders,
  Trash2,
  Check,
} from 'lucide-react';
import { AppThemeConfig, DEFAULT_THEME_CONFIG } from '../types/theme';
import { compressImage } from '../utils/imageCompressor';

interface ThemeModalProps {
  themeConfig: AppThemeConfig;
  onUpdateTheme: (newConfig: AppThemeConfig) => void;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  themeConfig,
  onUpdateTheme,
  onClose,
}) => {
  const bgInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isDark = themeConfig.mode === 'dark';

  // ——— Upload ảnh nền ———
  const handleBgFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn một file ảnh hợp lệ (PNG, JPG, WEBP...)');
      return;
    }
    try {
      setIsUploadingBg(true);
      setUploadError(null);
      const base64 = await compressImage(file);
      onUpdateTheme({ ...themeConfig, customBg: base64 });
    } catch {
      setUploadError('Không thể tải ảnh. Vui lòng thử ảnh khác!');
    } finally {
      setIsUploadingBg(false);
      if (bgInputRef.current) bgInputRef.current.value = '';
    }
  };

  // ——— Khôi phục mặc định ———
  const handleReset = () => {
    onUpdateTheme(DEFAULT_THEME_CONFIG);
  };

  // Shorthand classes
  const panelBg = isDark
    ? 'bg-slate-900 text-white border-slate-700/80'
    : 'bg-white text-slate-900 border-slate-200/60';
  const headerBg = isDark ? 'bg-slate-800/80 border-slate-800' : 'bg-slate-50/80 border-slate-100';
  const footerBg = isDark ? 'bg-slate-800/80 border-slate-800' : 'bg-slate-50 border-slate-100';
  const labelCls = isDark ? 'text-slate-300' : 'text-slate-700';
  const sectionBg = isDark
    ? 'bg-slate-800/60 border-slate-700/80'
    : 'bg-slate-50 border-slate-200/80';

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3">
      <div
        className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 border ${panelBg}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ——— Header ——— */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${headerBg}`}>
          <div>
            <h2 className="font-bold text-base leading-tight">Giao Diện & Hình Nền</h2>
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Tùy chỉnh chế độ sáng / tối và ảnh nền
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ——— Body ——— */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">

          {/* 1. Chế độ Sáng / Tối */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${labelCls}`}>
              1. Chế Độ Giao Diện
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Sáng */}
              <button
                type="button"
                onClick={() => onUpdateTheme({ ...themeConfig, mode: 'light' })}
                className={`relative flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition active:scale-98 ${
                  !isDark
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                    : 'border-slate-700 bg-slate-800/60 hover:border-slate-500'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-300 to-orange-400 flex items-center justify-center shadow-md shadow-amber-400/30">
                  <Sun className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className={`text-xs font-bold block text-center ${!isDark ? 'text-blue-700' : 'text-slate-300'}`}>
                    Sáng
                  </span>
                  <span className="text-[10px] text-slate-400 block text-center mt-0.5">Clean & Rõ ràng</span>
                </div>
                {!isDark && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white stroke-3" />
                  </div>
                )}
              </button>

              {/* Tối */}
              <button
                type="button"
                onClick={() => onUpdateTheme({ ...themeConfig, mode: 'dark' })}
                className={`relative flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition active:scale-98 ${
                  isDark
                    ? 'border-cyan-500 bg-indigo-950/50 ring-2 ring-cyan-500/20'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-800 to-slate-950 flex items-center justify-center shadow-md shadow-indigo-900/60 border border-indigo-700/60">
                  <Moon className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <span className={`text-xs font-bold block text-center ${isDark ? 'text-cyan-400' : 'text-slate-700'}`}>
                    Tối
                  </span>
                  <span className="text-[10px] text-slate-400 block text-center mt-0.5">OLED & Tiết kiệm pin</span>
                </div>
                {isDark && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white stroke-3" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* 2. Ảnh nền tùy chỉnh */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${labelCls}`}>
              2. Ảnh Nền Tùy Chỉnh
            </label>
            <input type="file" ref={bgInputRef} onChange={handleBgFileChange} accept="image/*" className="hidden" />

            {themeConfig.customBg ? (
              <div className="space-y-2">
                <div className="relative rounded-xl overflow-hidden border border-slate-700/60 h-28 w-full">
                  <img src={themeConfig.customBg} alt="Ảnh nền" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => bgInputRef.current?.click()}
                      disabled={isUploadingBg}
                      className="bg-white hover:bg-slate-100 text-slate-900 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5 active:scale-95 transition"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Đổi ảnh khác</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateTheme({ ...themeConfig, customBg: undefined })}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5 active:scale-95 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa ảnh</span>
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Đang dùng ảnh nền cá nhân (lưu offline)
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => bgInputRef.current?.click()}
                disabled={isUploadingBg}
                className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition active:scale-99 ${
                  isDark
                    ? 'border-slate-700 bg-slate-800/40 hover:border-blue-500 hover:bg-blue-950/20 text-slate-300'
                    : 'border-slate-300 bg-slate-50/60 hover:border-blue-500 hover:bg-blue-50/40 text-slate-600'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-600/15 text-blue-500 flex items-center justify-center">
                  {isUploadingBg ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ImageIcon className="w-5 h-5" />
                  )}
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-blue-500 block">
                    {isUploadingBg ? 'Đang xử lý...' : 'Chọn ảnh từ thư viện'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Ảnh nền sẽ được nén & lưu offline
                  </span>
                </div>
              </button>
            )}

            {uploadError && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium">{uploadError}</p>
            )}
          </div>

          {/* 4. Tinh chỉnh (chỉ hiện khi có ảnh nền) */}
          {themeConfig.customBg && (
            <div className={`p-3.5 rounded-xl border space-y-3.5 ${sectionBg}`}>
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Sliders className="w-3.5 h-3.5 text-blue-500" />
                <span>Tinh chỉnh ảnh nền</span>
              </div>

              {/* Độ tối */}
              <div className="space-y-1">
                <div className={`flex justify-between text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <span>Độ tối lớp phủ</span>
                  <span className="font-bold text-blue-500">{themeConfig.overlayDarkness}%</span>
                </div>
                <input
                  type="range" min="0" max="80" step="5"
                  value={themeConfig.overlayDarkness}
                  onChange={(e) => onUpdateTheme({ ...themeConfig, overlayDarkness: Number(e.target.value) })}
                  className={`w-full accent-blue-600 cursor-pointer h-1.5 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                />
                <span className="text-[10px] text-slate-400 block">Tăng nếu ảnh nền làm khó đọc chữ</span>
              </div>

              {/* Độ mờ */}
              <div className="space-y-1">
                <div className={`flex justify-between text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <span>Độ mờ nền (Blur)</span>
                  <span className="font-bold text-blue-500">{themeConfig.blur}px</span>
                </div>
                <input
                  type="range" min="0" max="10" step="1"
                  value={themeConfig.blur}
                  onChange={(e) => onUpdateTheme({ ...themeConfig, blur: Number(e.target.value) })}
                  className={`w-full accent-blue-600 cursor-pointer h-1.5 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                />
                <span className="text-[10px] text-slate-400 block">Làm mờ để các ca học nổi bật hơn</span>
              </div>
            </div>
          )}
        </div>

        {/* ——— Footer ——— */}
        <div className={`px-5 py-3 border-t flex items-center justify-between ${footerBg}`}>
          <button
            type="button"
            onClick={handleReset}
            className={`text-xs font-medium flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg transition ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục gốc</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow active:scale-95 transition"
          >
            Đã xong
          </button>
        </div>
      </div>
    </div>
  );
};
