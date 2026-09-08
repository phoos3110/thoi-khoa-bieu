import React, { useRef, useState } from 'react';
import { 
  X, 
  Check, 
  Upload, 
  Image as ImageIcon, 
  RotateCcw, 
  Sliders, 
  Sparkles,
  Trash2
} from 'lucide-react';
import { AppThemeConfig, DEFAULT_THEME_CONFIG, PRESET_THEMES, PresetThemeId } from '../types/theme';
import { compressImage } from '../utils/imageCompressor';

interface ThemeModalProps {
  themeConfig: AppThemeConfig;
  isDarkMode?: boolean;
  onUpdateTheme: (newConfig: AppThemeConfig) => void;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  themeConfig,
  isDarkMode = false,
  onUpdateTheme,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Xử lý khi chọn ảnh từ thư viện
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, WEBP...)');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      const base64 = await compressImage(file);

      onUpdateTheme({
        ...themeConfig,
        type: 'custom',
        customImage: base64,
      });
    } catch (err) {
      console.error(err);
      setUploadError('Không thể nén và tải ảnh. Vui lòng thử ảnh khác!');
    } finally {
      setIsUploading(false);
      // Reset input value to allow selecting same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Chọn preset
  const handleSelectPreset = (id: PresetThemeId) => {
    onUpdateTheme({
      ...themeConfig,
      type: 'preset',
      presetId: id,
    });
  };

  // Xóa ảnh tùy chỉnh
  const handleRemoveCustomImage = () => {
    onUpdateTheme({
      ...themeConfig,
      type: 'preset',
      customImage: undefined,
    });
  };

  // Khôi phục mặc định
  const handleReset = () => {
    onUpdateTheme(DEFAULT_THEME_CONFIG);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 transition-colors ${
          isDarkMode 
            ? 'bg-slate-900 text-white border border-slate-700/80' 
            : 'bg-white text-slate-900 border border-slate-200/60'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isDarkMode ? 'bg-slate-800/80 border-slate-800' : 'bg-slate-50/80 border-slate-100'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/15 text-blue-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">
                Cá Nhân Hóa Nền
              </h2>
              <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Tùy chỉnh màu sắc & ảnh nền offline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${
              isDarkMode 
                ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Section 1: Bộ sưu tập có sẵn */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-800'
            }`}>
              1. Chủ đề màu sắc có sẵn
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_THEMES.map((preset) => {
                const isSelected = themeConfig.type === 'preset' && themeConfig.presetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    style={{
                      borderColor: isSelected ? preset.style.accentColor : undefined,
                    }}
                    className={`group relative p-2.5 rounded-xl border text-left flex flex-col items-start gap-1.5 transition active:scale-98 ${
                      isSelected
                        ? 'ring-2 ring-blue-500/20 bg-blue-500/10'
                        : isDarkMode
                        ? 'border-slate-700/80 hover:border-slate-600 bg-slate-800/80'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {/* Thumbnail preview */}
                    <div 
                      className="w-full h-12 rounded-lg border border-black/10 shadow-xs relative overflow-hidden flex items-center justify-center"
                      style={{ background: preset.preview }}
                    >
                      {isSelected && (
                        <div 
                          className="w-5 h-5 rounded-full text-white flex items-center justify-center shadow-md"
                          style={{ backgroundColor: preset.style.accentColor }}
                        >
                          <Check className="w-3 h-3 stroke-3" />
                        </div>
                      )}
                    </div>
                    <div className="w-full min-w-0">
                      <span className={`text-xs font-bold truncate block ${
                        isSelected 
                          ? (isDarkMode ? 'text-white' : 'text-slate-900') 
                          : isDarkMode ? 'text-slate-300' : 'text-slate-800'
                      }`}>
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate block leading-tight mt-0.5">
                        {preset.tagline}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Ảnh cá nhân từ điện thoại */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-800'
            }`}>
              2. Ảnh cá nhân từ điện thoại
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {themeConfig.customImage ? (
              <div className="space-y-2">
                <div className="relative rounded-xl overflow-hidden border border-slate-700 group h-32 w-full bg-slate-800">
                  <img
                    src={themeConfig.customImage}
                    alt="Custom Background Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-90 transition">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 active:scale-95 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Đổi ảnh khác</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveCustomImage}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 active:scale-95 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa ảnh</span>
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Đang áp dụng ảnh nền cá nhân (Đã tối ưu & lưu offline)
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition active:scale-99 ${
                  isDarkMode
                    ? 'border-slate-700 bg-slate-800/40 hover:border-blue-500 hover:bg-blue-950/20 text-slate-300'
                    : 'border-slate-300 bg-slate-50/60 hover:border-blue-500 hover:bg-blue-50/40 text-slate-600'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-600/15 text-blue-500 flex items-center justify-center">
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ImageIcon className="w-5 h-5" />
                  )}
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-blue-500 block">
                    {isUploading ? 'Đang xử lý ảnh...' : 'Chọn ảnh từ thư viện của bạn'}
                  </span>
                  <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                    Ảnh anime, idol, phong cảnh... (Tự động nén & lưu offline)
                  </span>
                </div>
              </button>
            )}

            {uploadError && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium">
                {uploadError}
              </p>
            )}
          </div>

          {/* Section 3: Tinh chỉnh hiển thị (Lớp phủ làm mờ / làm tối) */}
          <div className={`p-3.5 rounded-xl border space-y-3 ${
            isDarkMode 
              ? 'bg-slate-800/60 border-slate-700/80 text-slate-200' 
              : 'bg-slate-50 border-slate-200/80 text-slate-700'
          }`}>
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <Sliders className="w-3.5 h-3.5 text-blue-500" />
              <span>Tinh chỉnh để chữ luôn dễ đọc</span>
            </div>

            {/* Slider: Độ tối lớp phủ */}
            <div className="space-y-1">
              <div className={`flex justify-between text-xs font-medium ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                <span>Độ tối lớp phủ (Dimming)</span>
                <span className="font-bold text-blue-500">{themeConfig.overlayDarkness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={themeConfig.overlayDarkness}
                onChange={(e) =>
                  onUpdateTheme({
                    ...themeConfig,
                    overlayDarkness: Number(e.target.value),
                  })
                }
                className={`w-full accent-blue-600 cursor-pointer h-1.5 rounded-lg ${
                  isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                }`}
              />
              <span className={`text-[10px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                Tăng độ tối nếu ảnh nền sáng làm khó đọc chữ thời khóa biểu
              </span>
            </div>

            {/* Slider: Độ mờ nền (Blur) */}
            <div className="space-y-1 pt-1">
              <div className={`flex justify-between text-xs font-medium ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                <span>Độ mờ hậu cảnh (Blur)</span>
                <span className="font-bold text-blue-500">{themeConfig.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={themeConfig.blur}
                onChange={(e) =>
                  onUpdateTheme({
                    ...themeConfig,
                    blur: Number(e.target.value),
                  })
                }
                className={`w-full accent-blue-600 cursor-pointer h-1.5 rounded-lg ${
                  isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                }`}
              />
              <span className={`text-[10px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                Làm mờ chi tiết ảnh để nổi bật các ca học
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`px-5 py-3 border-t flex items-center justify-between ${
          isDarkMode ? 'bg-slate-800/80 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
          <button
            type="button"
            onClick={handleReset}
            className={`text-xs font-medium flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg transition ${
              isDarkMode 
                ? 'text-slate-300 hover:text-white hover:bg-slate-800' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục gốc</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm active:scale-95 transition"
          >
            Đã xong
          </button>
        </div>
      </div>
    </div>
  );
};
