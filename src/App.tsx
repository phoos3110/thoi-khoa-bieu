import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Clock, 
  MapPin, 
  BookOpen, 
  Check, 
  X, 
  Calendar,
  AlertCircle,
  Palette
} from 'lucide-react';
import { ClassItem, DayNumber } from './types/schedule';
import { AppThemeConfig, DEFAULT_THEME_CONFIG, PRESET_THEMES } from './types/theme';
import { ThemeModal } from './components/ThemeModal';

const DAYS: { number: DayNumber; name: string; short: string }[] = [
  { number: 2, name: 'Thứ Hai', short: 'Thứ 2' },
  { number: 3, name: 'Thứ Ba', short: 'Thứ 3' },
  { number: 4, name: 'Thứ Tư', short: 'Thứ 4' },
  { number: 5, name: 'Thứ Năm', short: 'Thứ 5' },
  { number: 6, name: 'Thứ Sáu', short: 'Thứ 6' },
  { number: 7, name: 'Thứ Bảy', short: 'Thứ 7' },
];

const COLORS = [
  '#2563eb', // Xanh dương
  '#059669', // Xanh lá
  '#d97706', // Vàng cam
  '#dc2626', // Đỏ
  '#7c3aed', // Tím
  '#0891b2', // Xanh lơ
];

function getTodayNumber(): DayNumber | null {
  const d = new Date().getDay(); // 0 is Sun, 1 is Mon (Thứ 2)... 6 is Sat (Thứ 7)
  if (d >= 1 && d <= 6) return (d + 1) as DayNumber;
  return null; // Chủ nhật
}

function getFormattedDate(): string {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function App() {
  const todayNumber = getTodayNumber();
  // Mặc định luôn mở đúng ngày hôm nay (hôm nay Thứ mấy sẽ xem ngay Thứ đó)
  const [activeDay, setActiveDay] = useState<DayNumber>(todayNumber || 2);
  const [currentDateStr, setCurrentDateStr] = useState<string>(getFormattedDate());
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Theme configuration state
  const [themeConfig, setThemeConfig] = useState<AppThemeConfig>(() => {
    try {
      const saved = localStorage.getItem('don_gian_tkb_theme');
      if (saved) return JSON.parse(saved);
      return DEFAULT_THEME_CONFIG;
    } catch {
      return DEFAULT_THEME_CONFIG;
    }
  });
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Save Theme to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('don_gian_tkb_theme', JSON.stringify(themeConfig));
    } catch (e) {
      console.error('Không thể lưu theme vào LocalStorage:', e);
    }
  }, [themeConfig]);

  // Lắng nghe trạng thái online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cập nhật ngày theo thời gian thực nếu qua ngày mới
  useEffect(() => {
    const timer = setInterval(() => {
      const today = getTodayNumber();
      setCurrentDateStr(getFormattedDate());
      if (today && activeDay !== today) {
        // Tự động chuyển tab nếu qua ngày mới
        setActiveDay(today);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [activeDay]);

  // Load classes from local storage
  const [classes, setClasses] = useState<ClassItem[]>(() => {
    try {
      const saved = localStorage.getItem('don_gian_tkb_data');
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [formDay, setFormDay] = useState<DayNumber>(todayNumber || 2);
  const [formSubject, setFormSubject] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formStartTime, setFormStartTime] = useState('07:30');
  const [formEndTime, setFormEndTime] = useState('09:00');
  const [formColor, setFormColor] = useState(COLORS[0]);
  const [formError, setFormError] = useState('');

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('don_gian_tkb_data', JSON.stringify(classes));
    } catch (e) {
      console.error(e);
    }
  }, [classes]);

  // Open modal to add new
  const handleOpenAdd = (day: DayNumber) => {
    setEditingId(null);
    setFormDay(day);
    setFormSubject('');
    setFormRoom('');
    setFormStartTime('07:30');
    setFormEndTime('09:00');
    setFormColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setFormError('');
    setShowModal(true);
  };

  // Open modal to edit
  const handleOpenEdit = (item: ClassItem) => {
    setEditingId(item.id);
    setFormDay(item.day);
    setFormSubject(item.subject);
    setFormRoom(item.room);
    setFormStartTime(item.startTime);
    setFormEndTime(item.endTime);
    setFormColor(item.color || COLORS[0]);
    setFormError('');
    setShowModal(true);
  };

  // Delete a class
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Xóa môn "${name}"?`)) {
      setClasses(classes.filter((c) => c.id !== id));
    }
  };

  // Save form
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim()) {
      setFormError('Vui lòng nhập tên môn học!');
      return;
    }
    if (!formRoom.trim()) {
      setFormError('Vui lòng nhập phòng học!');
      return;
    }
    if (formStartTime >= formEndTime) {
      setFormError('Giờ kết thúc phải lớn hơn giờ bắt đầu!');
      return;
    }

    if (editingId) {
      // Update
      setClasses(
        classes.map((c) =>
          c.id === editingId
            ? {
                ...c,
                day: formDay,
                subject: formSubject.trim(),
                room: formRoom.trim(),
                startTime: formStartTime,
                endTime: formEndTime,
                color: formColor,
              }
            : c
        )
      );
    } else {
      // Create new
      const newItem: ClassItem = {
        id: Date.now().toString(),
        day: formDay,
        subject: formSubject.trim(),
        room: formRoom.trim(),
        startTime: formStartTime,
        endTime: formEndTime,
        color: formColor,
      };
      setClasses([...classes, newItem]);
    }

    setActiveDay(formDay);
    setShowModal(false);
  };

  // Filter classes for selected day
  const currentDayClasses = classes
    .filter((c) => c.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const isSelectedToday = todayNumber === activeDay;
  const activeDayObj = DAYS.find((d) => d.number === activeDay);
  const todayObj = DAYS.find((d) => d.number === todayNumber);

  // Theme calculations
  const currentPreset = PRESET_THEMES.find((p) => p.id === themeConfig.presetId) || PRESET_THEMES[0];
  const isCustomImage = themeConfig.type === 'custom' && !!themeConfig.customImage;
  const isDarkMode = isCustomImage ? themeConfig.overlayDarkness >= 45 : (currentPreset.style.isDark ?? false);

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Khung ứng dụng di động: Toàn bộ nền, ảnh nền và nội dung được giới hạn bên trong khung này */}
      <div className="w-full max-w-md min-h-screen relative flex flex-col justify-between shadow-2xl overflow-hidden bg-slate-900">
        {/* 0. Background Layer 1 (Color / Gradient / Pattern / Custom Image) - Chỉ hiển thị trong khung app */}
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-300 z-0"
          style={{
            background: isCustomImage ? undefined : currentPreset.style.background,
            backgroundImage: isCustomImage 
              ? `url(${themeConfig.customImage})` 
              : (currentPreset.style.pattern || undefined),
            backgroundSize: isCustomImage ? 'cover' : undefined,
            backgroundPosition: isCustomImage ? 'center center' : undefined,
            backgroundRepeat: isCustomImage ? 'no-repeat' : undefined,
            filter: themeConfig.blur > 0 ? `blur(${themeConfig.blur}px)` : undefined,
            transform: themeConfig.blur > 0 ? 'scale(1.08)' : undefined,
          }}
        />

        {/* 0. Background Layer 2 (Lớp phủ tối mờ tinh chỉnh) - Chỉ hiển thị trong khung app */}
        {themeConfig.overlayDarkness > 0 && (
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-200 z-0"
            style={{
              backgroundColor: '#000000',
              opacity: themeConfig.overlayDarkness / 100,
            }}
          />
        )}

      {/* 1. Header */}
      <header className={`${isCustomImage ? 'bg-slate-900/80 backdrop-blur-md border-b border-white/10' : currentPreset.style.headerBg} text-white p-4 sticky top-0 z-10 shadow-md transition-colors duration-300`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Thời Khóa Biểu
            </h1>
            <p className="text-xs text-white/80 mt-0.5">
              Hôm nay: <span className="font-bold underline">{todayObj ? todayObj.name : 'Chủ nhật'}</span> ({currentDateStr})
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Nút Đổi nền */}
            <button
              onClick={() => setShowThemeModal(true)}
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white font-semibold px-2.5 py-1.5 rounded-lg text-xs backdrop-blur-sm border border-white/25 active:scale-95 transition"
              title="Đổi hình nền / giao diện"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Đổi nền</span>
            </button>

            {/* Nút Thêm ca */}
            <button
              onClick={() => handleOpenAdd(activeDay)}
              className="flex items-center gap-1 bg-white text-slate-900 font-bold px-3 py-1.5 rounded-lg text-xs shadow active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Thêm ca</span>
            </button>
          </div>
        </div>

        {/* 2. Thanh Chọn Thứ 2 đến Thứ 7 */}
        <div className="grid grid-cols-6 gap-1 mt-3">
          {DAYS.map((d) => {
            const isSelected = activeDay === d.number;
            const isToday = todayNumber === d.number;
            const count = classes.filter((c) => c.day === d.number).length;

            return (
              <button
                key={d.number}
                onClick={() => setActiveDay(d.number)}
                className={`py-2 rounded-lg text-center transition flex flex-col items-center justify-center relative ${
                  isSelected
                    ? 'bg-white text-slate-900 font-bold shadow-md'
                    : 'bg-black/20 hover:bg-black/30 text-white/90 font-medium backdrop-blur-xs'
                }`}
              >
                {/* Huy hiệu nhỏ báo đây là ngày Hôm Nay */}
                {isToday && (
                  <span
                    className={`absolute -top-1 px-1 py-0.2 text-[8px] font-bold rounded-full uppercase leading-tight ${
                      isSelected ? 'bg-amber-400 text-slate-900' : 'bg-amber-300 text-slate-900'
                    }`}
                  >
                    Nay
                  </span>
                )}
                <span className="text-xs leading-none mt-0.5">{d.short}</span>
                <span className="text-[10px] mt-1 opacity-80">
                  {count > 0 ? `${count} môn` : '-'}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* 3. Tiêu đề hiển thị rõ ràng ngày đang xem */}
      <div className={`px-4 py-2.5 flex items-center justify-between border-b transition-colors duration-200 ${
        isDarkMode 
          ? 'bg-slate-900/80 backdrop-blur-md border-slate-800 text-white' 
          : 'bg-white/85 backdrop-blur-md border-slate-200/80 text-slate-900'
      }`}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-base">
            Lịch học {activeDayObj?.name}
          </span>
          {isSelectedToday && (
            <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Hôm nay
            </span>
          )}
        </div>

        {/* Nút quay về hôm nay nếu đang xem ngày khác */}
        {todayNumber && activeDay !== todayNumber && (
          <button
            onClick={() => setActiveDay(todayNumber)}
            className={`text-xs font-bold px-2.5 py-1 rounded-md transition ${
              isDarkMode
                ? 'text-sky-400 bg-sky-950/60 hover:bg-sky-900/80 border border-sky-800/40'
                : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
            }`}
          >
            Về hôm nay ({todayObj?.short})
          </button>
        )}
      </div>

      {/* 4. Danh sách ca học của ngày được chọn */}
      <main className="p-3.5 flex-1 space-y-3 overflow-y-auto">
        <div className="flex items-center justify-between text-xs font-semibold px-1">
          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
            {currentDayClasses.length} ca học trong ngày
          </span>
          {!isOnline && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Đang offline</span>
            </div>
          )}
        </div>

        {currentDayClasses.length === 0 ? (
          <div className={`rounded-xl p-8 text-center border border-dashed mt-2 backdrop-blur-md transition-colors ${
            isDarkMode 
              ? 'bg-slate-900/60 border-slate-700/60 text-slate-300' 
              : 'bg-white/80 border-slate-300/80 text-slate-700'
          }`}>
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
            <p className="font-semibold text-base">
              {isSelectedToday
                ? 'Hôm nay bạn chưa có ca học nào'
                : `${activeDayObj?.name} chưa có ca học nào`}
            </p>
            <p className="text-xs opacity-75 mt-1 mb-4">
              Bấm nút bên dưới để thêm môn học và phòng học cho {activeDayObj?.name}
            </p>
            <button
              onClick={() => handleOpenAdd(activeDay)}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              Thêm môn cho {activeDayObj?.short}
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {currentDayClasses.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl p-3.5 shadow-sm relative overflow-hidden flex items-center justify-between backdrop-blur-md transition border ${
                  isDarkMode
                    ? 'bg-slate-900/80 border-slate-700/60 text-white'
                    : 'bg-white/90 border-white/60 shadow-xs text-slate-900'
                }`}
              >
                {/* Dải màu bên trái */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: item.color || '#2563eb' }}
                />

                {/* Thông tin môn */}
                <div className="pl-2 space-y-1">
                  <h3 className="font-bold text-base leading-tight">
                    {item.subject}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2.5 text-xs pt-0.5">
                    {/* Giờ học */}
                    <div className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded ${
                      isDarkMode 
                        ? 'text-sky-300 bg-sky-950/80 border border-sky-800/40' 
                        : 'text-blue-600 bg-blue-50'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.startTime} - {item.endTime}</span>
                    </div>

                    {/* Phòng học */}
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                      isDarkMode 
                        ? 'text-slate-200 bg-slate-800/80 border border-slate-700/50' 
                        : 'text-slate-700 bg-slate-100'
                    }`}>
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{item.room}</span>
                    </div>
                  </div>
                </div>

                {/* Nút sửa / xóa gọn gàng */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className={`p-2 rounded-lg active:scale-90 transition ${
                      isDarkMode
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                        : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title="Sửa ca học"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.subject)}
                    className={`p-2 rounded-lg active:scale-90 transition ${
                      isDarkMode
                        ? 'text-slate-300 hover:text-rose-400 hover:bg-rose-950/40'
                        : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                    title="Xóa ca học"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 5. Nút bấm thêm to ở góc dưới cho điện thoại */}
      <div className={`p-3.5 border-t sticky bottom-0 backdrop-blur-md transition-colors ${
        isDarkMode 
          ? 'bg-slate-900/85 border-slate-800' 
          : 'bg-white/85 border-slate-200/80'
      }`}>
        <button
          onClick={() => handleOpenAdd(activeDay)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-98 transition text-base"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Thêm ca học cho {activeDayObj?.short}</span>
        </button>
      </div>

      {/* 6. Modal Thêm / Sửa ca học */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-2xl p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 transition-colors ${
            isDarkMode 
              ? 'bg-slate-900 text-white border border-slate-700/80' 
              : 'bg-white text-slate-900 border border-slate-200/60'
          }`}>
            {/* Tiêu đề modal */}
            <div className={`flex items-center justify-between pb-3 border-b ${
              isDarkMode ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <h2 className="font-bold text-lg">
                {editingId ? 'Sửa ca học' : 'Thêm ca học mới'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className={`p-1 rounded-lg transition ${
                  isDarkMode 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Báo lỗi nếu thiếu */}
            {formError && (
              <div className="mt-3 p-2.5 bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs rounded-lg flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-3 space-y-3.5 text-sm">
              {/* Chọn thứ */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  1. Học vào ngày nào?
                </label>
                <div className="grid grid-cols-6 gap-1">
                  {DAYS.map((d) => (
                    <button
                      type="button"
                      key={d.number}
                      onClick={() => setFormDay(d.number)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                        formDay === d.number
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : isDarkMode
                          ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {d.short}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tên môn */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  2. Tên môn học:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Toán, Tiếng Anh, Lập trình..."
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:bg-slate-800'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white'
                  }`}
                />
              </div>

              {/* Phòng học */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  3. Phòng học:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Phòng 301, Lab 2, Nhà A..."
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:bg-slate-800'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white'
                  }`}
                />
              </div>

              {/* Giờ học: từ mấy giờ đến mấy giờ */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  4. Giờ học (Từ mấy giờ đến mấy giờ):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className={`text-[11px] block mb-0.5 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>Từ:</span>
                    <input
                      type="time"
                      required
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      className={`w-full px-2.5 py-1.5 border rounded-lg font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white'
                      }`}
                    />
                  </div>
                  <div>
                    <span className={`text-[11px] block mb-0.5 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>Đến:</span>
                    <input
                      type="time"
                      required
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      className={`w-full px-2.5 py-1.5 border rounded-lg font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Màu sắc */}
              <div>
                <span className={`block text-xs font-bold mb-1.5 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  5. Chọn màu hiển thị:
                </span>
                <div className="flex items-center gap-2">
                  {COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setFormColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                        formColor === c ? 'scale-110 ring-2 ring-offset-2 ring-blue-500' : ''
                      }`}
                    >
                      {formColor === c && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nút hành động */}
              <div className={`pt-2.5 flex items-center justify-end gap-2 border-t ${
                isDarkMode ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 font-medium rounded-lg transition ${
                    isDarkMode
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md active:scale-95 transition"
                >
                  {editingId ? 'Cập nhật' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal Tùy Chỉnh Hình Nền */}
      {showThemeModal && (
        <ThemeModal
          themeConfig={themeConfig}
          isDarkMode={isDarkMode}
          onUpdateTheme={setThemeConfig}
          onClose={() => setShowThemeModal(false)}
        />
      )}
      </div>
    </div>
  );
}
