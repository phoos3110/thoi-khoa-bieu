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
  Sun,
  Moon,
  User,
} from 'lucide-react';
import { ClassItem, DayNumber } from './types/schedule';
import { AppThemeConfig, DEFAULT_THEME_CONFIG } from './types/theme';
import { ThemeModal } from './components/ThemeModal';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const DAYS: { number: DayNumber; name: string; short: string }[] = [
  { number: 2, name: 'Thứ Hai', short: 'Thứ 2' },
  { number: 3, name: 'Thứ Ba', short: 'Thứ 3' },
  { number: 4, name: 'Thứ Tư', short: 'Thứ 4' },
  { number: 5, name: 'Thứ Năm', short: 'Thứ 5' },
  { number: 6, name: 'Thứ Sáu', short: 'Thứ 6' },
  { number: 7, name: 'Thứ Bảy', short: 'Thứ 7' },
];

const COLORS = [
  '#2563eb',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function getTodayNumber(): DayNumber | null {
  const d = new Date().getDay();
  if (d >= 1 && d <= 6) return (d + 1) as DayNumber;
  return null;
}

function getFormattedDate(): string {
  const now = new Date();
  return `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${now.getFullYear()}`;
}

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────
export default function App() {
  const todayNumber = getTodayNumber();
  const [activeDay, setActiveDay] = useState<DayNumber>(todayNumber || 2);
  const [currentDateStr, setCurrentDateStr] = useState<string>(getFormattedDate());
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // ── Theme ──
  const [themeConfig, setThemeConfig] = useState<AppThemeConfig>(() => {
    try {
      const saved = localStorage.getItem('don_gian_tkb_theme_v2');
      if (saved) return JSON.parse(saved);
      return DEFAULT_THEME_CONFIG;
    } catch {
      return DEFAULT_THEME_CONFIG;
    }
  });
  const [showThemeModal, setShowThemeModal] = useState(false);
  const isDark = themeConfig.mode === 'dark';
  const hasCustomBg = !!themeConfig.customBg;

  useEffect(() => {
    try {
      localStorage.setItem('don_gian_tkb_theme_v2', JSON.stringify(themeConfig));
    } catch (e) {
      console.error('Lưu theme thất bại:', e);
    }
  }, [themeConfig]);

  // ── Online/Offline ──
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // ── Push Notification Permission ──
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // Xin quyền sau 3 giây để không làm phiền ngay khi mở app
      const timer = setTimeout(() => {
        Notification.requestPermission();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // ── Update Detection (Service Worker + version.json) ──
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Lắng nghe SW tìm thấy version mới
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      reg.update().catch(() => {});

      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setUpdateAvailable(true);
      }

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setUpdateAvailable(true);
            }
          });
        }
      });
    });
  }, []);

  // Định kỳ kiểm tra version.json
  useEffect(() => {
    const checkVersion = async () => {
      if (!navigator.onLine) return;
      try {
        const res = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.buildTime) {
          const stored = localStorage.getItem('app_build_time');
          if (!stored) {
            localStorage.setItem('app_build_time', data.buildTime);
          } else if (data.buildTime !== stored) {
            setUpdateAvailable(true);
            // Gửi push notification qua SW nếu đang chạy nền
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then((reg) => {
                reg.active?.postMessage({
                  type: 'SHOW_UPDATE_NOTIFICATION',
                  buildTime: data.buildTime,
                });
              });
            }
          }
        }
      } catch {
        // bỏ qua lỗi mạng
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, 45000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
        navigator.serviceWorker?.ready.then((reg) => reg.update().catch(() => {}));
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Xử lý cập nhật ngay
  const handleApplyUpdate = async () => {
    setIsUpdating(true);
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      try {
        const res = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.buildTime) localStorage.setItem('app_build_time', data.buildTime);
        }
      } catch {}
      waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => window.location.reload(), 250);
  };

  // ── Auto date update ──
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateStr(getFormattedDate());
      const today = getTodayNumber();
      if (today && activeDay !== today) setActiveDay(today);
    }, 60000);
    return () => clearInterval(timer);
  }, [activeDay]);

  // ── Class data ──
  const [classes, setClasses] = useState<ClassItem[]>(() => {
    try {
      const saved = localStorage.getItem('don_gian_tkb_data');
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('don_gian_tkb_data', JSON.stringify(classes));
    } catch (e) {
      console.error(e);
    }
  }, [classes]);

  // ── Modal state ──
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formDay, setFormDay] = useState<DayNumber>(todayNumber || 2);
  const [formSubject, setFormSubject] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formStartTime, setFormStartTime] = useState('07:30');
  const [formEndTime, setFormEndTime] = useState('09:00');
  const [formColor, setFormColor] = useState(COLORS[0]);
  const [formError, setFormError] = useState('');

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

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Xóa môn "${name}"?`)) {
      setClasses(classes.filter((c) => c.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim()) { setFormError('Vui lòng nhập tên môn học!'); return; }
    if (!formRoom.trim()) { setFormError('Vui lòng nhập phòng học!'); return; }
    if (formStartTime >= formEndTime) { setFormError('Giờ kết thúc phải lớn hơn giờ bắt đầu!'); return; }

    if (editingId) {
      setClasses(classes.map((c) =>
        c.id === editingId
          ? { ...c, day: formDay, subject: formSubject.trim(), room: formRoom.trim(), startTime: formStartTime, endTime: formEndTime, color: formColor }
          : c
      ));
    } else {
      setClasses([...classes, {
        id: Date.now().toString(),
        day: formDay,
        subject: formSubject.trim(),
        room: formRoom.trim(),
        startTime: formStartTime,
        endTime: formEndTime,
        color: formColor,
      }]);
    }
    setActiveDay(formDay);
    setShowModal(false);
  };

  // ── Computed ──
  const currentDayClasses = classes
    .filter((c) => c.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const isSelectedToday = todayNumber === activeDay;
  const activeDayObj = DAYS.find((d) => d.number === activeDay);
  const todayObj = DAYS.find((d) => d.number === todayNumber);

  // ─────────────────────────────────────────────
  // Theme tokens (computed from mode)
  // ─────────────────────────────────────────────
  const tk = {
    // Nền app: Dark = midnight navy sâu với điểm sáng violet tinh tế ở góc
    appBg: isDark
      ? 'radial-gradient(ellipse at 20% 0%, #1e1b4b 0px, transparent 55%), radial-gradient(ellipse at 80% 100%, #0c0a1e 0px, transparent 55%), #080612'
      : 'radial-gradient(at 0% 0%, #eff6ff 0px, transparent 65%), radial-gradient(at 100% 100%, #dbeafe 0px, transparent 65%), #f8fafc',

    // Header: Dark = glassmorphism với viền violet mờ + gradient neon nhẹ
    headerBg: isDark
      ? 'bg-gradient-to-r from-slate-950/95 via-indigo-950/80 to-slate-950/95 backdrop-blur-xl border-b border-indigo-900/40 shadow-lg shadow-black/40'
      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700',

    // Sub-header: Dark = trong suốt kiểu frosted glass
    subHeader: isDark
      ? 'bg-slate-900/70 backdrop-blur-xl border-b border-white/5 text-slate-100'
      : 'bg-white/85 backdrop-blur-md border-b border-blue-100 text-slate-900',

    // Nút chính: Dark = gradient cyan-violet neon rực rỡ
    primaryBtn: isDark
      ? 'bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/25 active:shadow-cyan-400/30'
      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25',

    // Tab ngày đang chọn: Dark = cyan neon rõ nét
    activeDayTab: isDark
      ? 'bg-gradient-to-b from-cyan-400 to-sky-500 text-slate-950 font-extrabold shadow-lg shadow-cyan-400/40 ring-1 ring-cyan-300/50'
      : 'bg-white text-blue-700 shadow-md ring-1 ring-blue-100',

    // Card môn học: Dark = kính mờ với viền violet/indigo tinh tế, hover sáng lên
    cardBg: isDark
      ? 'bg-slate-900/60 backdrop-blur-xl border-indigo-900/50 hover:border-indigo-700/60 hover:bg-slate-800/70'
      : 'bg-white/90 backdrop-blur-md border-slate-200/80',

    cardTitle: isDark ? 'text-white' : 'text-slate-900',

    // Badge giờ: Dark = cyan neon
    timeBadge: isDark
      ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-800/50'
      : 'text-blue-700 bg-blue-50/90 border border-blue-200/70',

    // Badge phòng: Dark = trắng mờ tinh tế
    roomBadge: isDark
      ? 'text-slate-300 bg-white/5 border border-white/10'
      : 'text-slate-700 bg-slate-100/90 border border-slate-200/50',

    // Card rỗng: Dark = kính tối mờ có viền violet
    emptyCard: isDark
      ? 'bg-indigo-950/30 border-indigo-900/50 text-slate-300 backdrop-blur-md'
      : 'bg-white/80 border-slate-300/80 text-slate-700',

    // Bottom bar: Dark = đen sâu với viền mờ
    bottomBar: isDark
      ? 'bg-slate-950/90 border-white/5 backdrop-blur-xl'
      : 'bg-white/85 border-slate-200/80',

    // Input: Dark = nền xanh đen với viền mờ
    inputBg: isDark
      ? 'bg-slate-800/80 border-indigo-900/60 text-white placeholder-slate-500 focus:border-cyan-600'
      : 'bg-slate-50 border-slate-300 text-slate-900',

    label: isDark ? 'text-slate-300' : 'text-slate-700',

    // Nút ghost: Dark = hover sáng nhẹ
    btnGhost: isDark
      ? 'text-slate-400 hover:text-white hover:bg-white/10'
      : 'text-slate-600 hover:bg-slate-100',

    // Modal: Dark = nền xanh đen sâu, viền violet
    modalBg: isDark
      ? 'bg-slate-950 text-white border border-indigo-900/60 shadow-2xl shadow-black/60'
      : 'bg-white text-slate-900 border border-slate-200/60',

    modalDivider: isDark ? 'border-white/8' : 'border-slate-100',

    editBtn: isDark
      ? 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40'
      : 'text-slate-500 hover:text-slate-900 hover:bg-black/5',

    deleteBtn: isDark
      ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/40'
      : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50',

    // Badge "Hôm nay": Dark = emerald neon
    todayBadge: isDark
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : 'bg-emerald-100 text-emerald-800 border-emerald-200',

    todayBtn: isDark
      ? 'text-cyan-400 bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-800/40'
      : 'text-slate-800 bg-black/5 hover:bg-black/10 border border-black/5',

    // Chip "Nay" trên tab: Dark = cyan sáng
    todayChip: isDark ? 'bg-cyan-300 text-slate-950' : 'bg-amber-400 text-slate-950',
    inactiveTodayChip: isDark ? 'bg-cyan-400/80 text-slate-950' : 'bg-amber-300 text-slate-900',
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Khung app — giới hạn max-w-md, nền & ảnh chỉ nằm trong đây */}
      <div className="w-full max-w-md min-h-screen relative flex flex-col shadow-2xl overflow-hidden">

        {/* ── Background Layer 1: Gradient hoặc Ảnh nền ── */}
        <div
          className="absolute inset-0 pointer-events-none z-0 transition-all duration-300"
          style={{
            background: hasCustomBg ? undefined : tk.appBg,
            backgroundImage: hasCustomBg ? `url(${themeConfig.customBg})` : undefined,
            backgroundSize: hasCustomBg ? 'cover' : undefined,
            backgroundPosition: hasCustomBg ? 'center' : undefined,
            filter: themeConfig.blur > 0 ? `blur(${themeConfig.blur}px)` : undefined,
            transform: themeConfig.blur > 0 ? 'scale(1.08)' : undefined,
          }}
        />

        {/* ── Background Layer 2: Lớp phủ tối ── */}
        {themeConfig.overlayDarkness > 0 && (
          <div
            className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-200"
            style={{ backgroundColor: '#000', opacity: themeConfig.overlayDarkness / 100 }}
          />
        )}

        {/* ══════════════════════════════════════
            HEADER
        ══════════════════════════════════════ */}
        <header className={`${hasCustomBg ? 'bg-slate-900/85 backdrop-blur-xl border-b border-white/10' : tk.headerBg} text-white p-4 sticky top-0 z-10 shadow-md transition-colors duration-300`}>
          <div className="flex items-center justify-between">
            {/* Tiêu đề + ngày */}
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
              {/* Toggle Sáng / Tối */}
              <button
                onClick={() => setThemeConfig((prev) => ({ ...prev, mode: isDark ? 'light' : 'dark' }))}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md active:scale-95 transition"
                title={isDark ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Avatar / Cài đặt */}
              <button
                onClick={() => setShowThemeModal(true)}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/40 hover:border-white/80 shadow active:scale-95 transition"
                title="Cài đặt cá nhân"
              >
                {themeConfig.avatarImage ? (
                  <img src={themeConfig.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>

              {/* Nút Thêm ca */}
              <button
                onClick={() => handleOpenAdd(activeDay)}
                className={`flex items-center gap-1 font-bold px-3 py-1.5 rounded-xl text-xs shadow active:scale-95 transition ${
                  hasCustomBg
                    ? 'bg-white text-slate-950'
                    : isDark
                    ? 'bg-sky-400 text-slate-950 font-extrabold'
                    : 'bg-white/95 text-slate-900 hover:bg-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Thêm ca</span>
              </button>
            </div>
          </div>

          {/* Thanh chọn Thứ */}
          <div className="grid grid-cols-6 gap-1 mt-3">
            {DAYS.map((d) => {
              const isSelected = activeDay === d.number;
              const isToday = todayNumber === d.number;
              const count = classes.filter((c) => c.day === d.number).length;
              return (
                <button
                  key={d.number}
                  onClick={() => setActiveDay(d.number)}
                  className={`py-2 rounded-xl text-center transition-all duration-200 flex flex-col items-center justify-center relative ${
                    isSelected
                      ? hasCustomBg
                        ? 'bg-white text-slate-950 font-extrabold shadow-md'
                        : tk.activeDayTab
                      : 'bg-black/15 hover:bg-black/25 text-white/90 font-medium backdrop-blur-sm'
                  }`}
                >
                  {isToday && (
                    <span className={`absolute -top-1 px-1.5 text-[8px] font-bold rounded-full uppercase leading-tight ${
                      isSelected ? tk.todayChip : tk.inactiveTodayChip
                    }`}>
                      Nay
                    </span>
                  )}
                  <span className="text-xs leading-none mt-0.5">{d.short}</span>
                  <span className="text-[10px] mt-1 opacity-80">{count > 0 ? `${count} môn` : '-'}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* ══════════════════════════════════════
            SUB-HEADER
        ══════════════════════════════════════ */}
        <div className={`px-4 py-2.5 flex items-center justify-between transition-colors duration-200 ${
          hasCustomBg
            ? isDark
              ? 'bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white'
              : 'bg-white/85 backdrop-blur-md border-b border-slate-200/80 text-slate-900'
            : tk.subHeader
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base">Lịch học {activeDayObj?.name}</span>
            {isSelectedToday && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${tk.todayBadge}`}>
                Hôm nay
              </span>
            )}
          </div>
          {todayNumber && activeDay !== todayNumber && (
            <button
              onClick={() => setActiveDay(todayNumber)}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${tk.todayBtn}`}
            >
              Về hôm nay ({todayObj?.short})
            </button>
          )}
        </div>

        {/* ══════════════════════════════════════
            MAIN — Danh sách ca học
        ══════════════════════════════════════ */}
        <main className="p-3.5 flex-1 space-y-3 overflow-y-auto">
          <div className="flex items-center justify-between text-xs font-semibold px-1">
            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              {currentDayClasses.length} ca học trong ngày
            </span>
            {!isOnline && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Đang offline</span>
              </div>
            )}
          </div>

          {currentDayClasses.length === 0 ? (
            <div className={`rounded-2xl p-8 text-center border border-dashed mt-2 backdrop-blur-md ${tk.emptyCard}`}>
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
              <p className="font-semibold text-base">
                {isSelectedToday ? 'Hôm nay bạn chưa có ca học nào' : `${activeDayObj?.name} chưa có ca học nào`}
              </p>
              <p className="text-xs opacity-75 mt-1 mb-4">
                Bấm nút bên dưới để thêm môn học cho {activeDayObj?.name}
              </p>
              <button
                onClick={() => handleOpenAdd(activeDay)}
                className={`inline-flex items-center gap-1.5 font-semibold text-sm px-4 py-2.5 rounded-xl shadow active:scale-95 transition ${
                  hasCustomBg ? 'bg-blue-600 text-white' : tk.primaryBtn
                }`}
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
                  className={`rounded-2xl p-3.5 relative overflow-hidden flex items-center justify-between backdrop-blur-md transition-all duration-200 border ${tk.cardBg}`}
                >
                  {/* Dải màu trái */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: item.color || '#2563eb' }}
                  />

                  {/* Thông tin */}
                  <div className="pl-2.5 space-y-1">
                    <h3 className={`font-bold text-base leading-tight ${tk.cardTitle}`}>{item.subject}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
                      <div className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg ${tk.timeBadge}`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.startTime} - {item.endTime}</span>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${tk.roomBadge}`}>
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>{item.room}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className={`p-2 rounded-lg active:scale-90 transition ${tk.editBtn}`}
                      title="Sửa ca học"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.subject)}
                      className={`p-2 rounded-lg active:scale-90 transition ${tk.deleteBtn}`}
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

        {/* ══════════════════════════════════════
            BOTTOM BAR
        ══════════════════════════════════════ */}
        <div className={`p-3.5 border-t sticky bottom-0 backdrop-blur-xl z-20 transition-colors ${tk.bottomBar}`}>
          <button
            onClick={() => handleOpenAdd(activeDay)}
            className={`w-full font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition text-base ${
              hasCustomBg
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/30'
                : tk.primaryBtn
            }`}
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Thêm ca học cho {activeDayObj?.short}</span>
          </button>
        </div>

        {/* ══════════════════════════════════════
            MODAL: Thêm / Sửa ca học
        ══════════════════════════════════════ */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-2xl p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 ${tk.modalBg}`}>
              <div className={`flex items-center justify-between pb-3 border-b ${tk.modalDivider}`}>
                <h2 className="font-bold text-lg">{editingId ? 'Sửa ca học' : 'Thêm ca học mới'}</h2>
                <button onClick={() => setShowModal(false)} className={`p-1 rounded-lg transition ${tk.btnGhost}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mt-3 p-2.5 bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs rounded-lg flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="mt-3 space-y-3.5 text-sm">
                {/* Chọn thứ */}
                <div>
                  <label className={`block text-xs font-bold mb-1 ${tk.label}`}>1. Học vào ngày nào?</label>
                  <div className="grid grid-cols-6 gap-1">
                    {DAYS.map((d) => (
                      <button
                        type="button"
                        key={d.number}
                        onClick={() => setFormDay(d.number)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                          formDay === d.number
                            ? hasCustomBg
                              ? 'bg-blue-600 text-white border-blue-600 shadow'
                              : `${tk.primaryBtn} border-transparent shadow`
                            : isDark
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
                  <label className={`block text-xs font-bold mb-1 ${tk.label}`}>2. Tên môn học:</label>
                  <input
                    type="text" required
                    placeholder="VD: Toán, Tiếng Anh, Lập trình..."
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${tk.inputBg}`}
                  />
                </div>

                {/* Phòng học */}
                <div>
                  <label className={`block text-xs font-bold mb-1 ${tk.label}`}>3. Phòng học:</label>
                  <input
                    type="text" required
                    placeholder="VD: Phòng 301, Lab 2, Nhà A..."
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${tk.inputBg}`}
                  />
                </div>

                {/* Giờ học */}
                <div>
                  <label className={`block text-xs font-bold mb-1 ${tk.label}`}>4. Giờ học:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className={`text-[11px] block mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Từ:</span>
                      <input
                        type="time" required value={formStartTime}
                        onChange={(e) => setFormStartTime(e.target.value)}
                        className={`w-full px-2.5 py-1.5 border rounded-lg font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${tk.inputBg}`}
                      />
                    </div>
                    <div>
                      <span className={`text-[11px] block mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Đến:</span>
                      <input
                        type="time" required value={formEndTime}
                        onChange={(e) => setFormEndTime(e.target.value)}
                        className={`w-full px-2.5 py-1.5 border rounded-lg font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${tk.inputBg}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Màu */}
                <div>
                  <span className={`block text-xs font-bold mb-1.5 ${tk.label}`}>5. Màu hiển thị:</span>
                  <div className="flex items-center gap-2">
                    {COLORS.map((c) => (
                      <button
                        type="button" key={c}
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

                {/* Actions */}
                <div className={`pt-2.5 flex items-center justify-end gap-2 border-t ${tk.modalDivider}`}>
                  <button type="button" onClick={() => setShowModal(false)} className={`px-4 py-2 font-medium rounded-lg transition ${tk.btnGhost}`}>
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2.5 font-bold rounded-xl shadow-md active:scale-95 transition ${
                      hasCustomBg ? 'bg-blue-600 hover:bg-blue-700 text-white' : tk.primaryBtn
                    }`}
                  >
                    {editingId ? 'Cập nhật' : 'Lưu lại'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            MODAL: Cá nhân hóa
        ══════════════════════════════════════ */}
        {showThemeModal && (
          <ThemeModal
            themeConfig={themeConfig}
            onUpdateTheme={setThemeConfig}
            onClose={() => setShowThemeModal(false)}
          />
        )}

        {/* ══════════════════════════════════════
            UPDATE NOTIFICATION (in-app)
        ══════════════════════════════════════ */}
        {updateAvailable && (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-sm z-50 animate-in slide-in-from-top-4 duration-300">
            <div className="bg-slate-900/95 text-white border border-blue-500/50 shadow-2xl rounded-2xl p-3.5 backdrop-blur-xl flex items-start gap-3 ring-1 ring-blue-500/20">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse block" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white">Đã có bản cập nhật mới!</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  Bấm cập nhật để nhận tính năng và sửa đổi mới nhất.
                </p>
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    onClick={handleApplyUpdate}
                    disabled={isUpdating}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 active:scale-95 transition"
                  >
                    <span className={`w-3.5 h-3.5 border-2 border-white ${isUpdating ? 'border-t-transparent rounded-full animate-spin' : 'hidden'}`} />
                    {isUpdating ? 'Đang cập nhật...' : '🔄 Cập nhật ngay'}
                  </button>
                  <button
                    onClick={() => setUpdateAvailable(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 font-medium transition"
                  >
                    Để sau
                  </button>
                </div>
              </div>
              <button
                onClick={() => setUpdateAvailable(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
