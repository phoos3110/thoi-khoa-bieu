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
  AlertCircle
} from 'lucide-react';
import { ClassItem, DayNumber } from './types/schedule';

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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between max-w-md mx-auto shadow-md">
      {/* 1. Header Đơn Giản */}
      <header className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Thời Khóa Biểu
            </h1>
            <p className="text-xs text-blue-100 mt-0.5">
              Hôm nay: <span className="font-bold underline">{todayObj ? todayObj.name : 'Chủ nhật'}</span> ({currentDateStr})
            </p>
          </div>

          <button
            onClick={() => handleOpenAdd(activeDay)}
            className="flex items-center gap-1.5 bg-white text-blue-600 font-bold px-3 py-1.5 rounded-lg text-sm shadow active:scale-95 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Thêm ca</span>
          </button>
        </div>

        {/* 2. Thanh Chọn Thứ 2 đến Thứ 7 - Bấm vào thứ nào sẽ xem ngay lịch của thứ đó */}
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
                    ? 'bg-white text-blue-700 font-bold shadow-md'
                    : 'bg-blue-700/60 text-blue-100 hover:bg-blue-700 font-medium'
                }`}
              >
                {/* Huy hiệu nhỏ báo đây là ngày Hôm Nay */}
                {isToday && (
                  <span
                    className={`absolute -top-1 px-1 py-0.2 text-[8px] font-bold rounded-full uppercase leading-tight ${
                      isSelected ? 'bg-amber-400 text-slate-900' : 'bg-amber-300 text-blue-900'
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
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 text-base">
            Lịch học {activeDayObj?.name}
          </span>
          {isSelectedToday && (
            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Hôm nay
            </span>
          )}
        </div>

        {/* Nút quay về hôm nay nếu đang xem ngày khác */}
        {todayNumber && activeDay !== todayNumber && (
          <button
            onClick={() => setActiveDay(todayNumber)}
            className="text-xs text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition"
          >
            Về hôm nay ({todayObj?.short})
          </button>
        )}
      </div>

      {/* 4. Danh sách ca học của ngày được chọn */}
      <main className="p-3.5 flex-1 space-y-3 overflow-y-auto">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>{currentDayClasses.length} ca học trong ngày</span>
          <div className="flex items-center gap-1.5 text-[11px] font-medium bg-slate-200/70 px-2 py-0.5 rounded-full">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
            <span>{isOnline ? 'PWA Offline sẵn sàng' : 'Chế độ Offline'}</span>
          </div>
        </div>

        {currentDayClasses.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-dashed border-slate-300 mt-2">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 text-base">
              {isSelectedToday
                ? 'Hôm nay bạn chưa có ca học nào'
                : `${activeDayObj?.name} chưa có ca học nào`}
            </p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Bấm nút bên dưới để thêm môn học và phòng học cho {activeDayObj?.name}
            </p>
            <button
              onClick={() => handleOpenAdd(activeDay)}
              className="inline-flex items-center gap-1.5 bg-blue-600 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow active:scale-95"
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
                className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 relative overflow-hidden flex items-center justify-between"
              >
                {/* Dải màu bên trái */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: item.color || '#2563eb' }}
                />

                {/* Thông tin môn */}
                <div className="pl-2 space-y-1">
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    {item.subject}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
                    {/* Giờ học */}
                    <div className="flex items-center gap-1 font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.startTime} - {item.endTime}</span>
                    </div>

                    {/* Phòng học */}
                    <div className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{item.room}</span>
                    </div>
                  </div>
                </div>

                {/* Nút sửa / xóa gọn gàng */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg active:scale-90"
                    title="Sửa ca học"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.subject)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg active:scale-90"
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
      <div className="p-3.5 bg-white border-t border-slate-200 sticky bottom-0">
        <button
          onClick={() => handleOpenAdd(activeDay)}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-98 transition text-base"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Thêm ca học cho {activeDayObj?.short}</span>
        </button>
      </div>

      {/* 6. Modal Thêm / Sửa ca học */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl relative animate-in fade-in duration-150">
            {/* Tiêu đề modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-900">
                {editingId ? 'Sửa ca học' : 'Thêm ca học mới'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Báo lỗi nếu thiếu */}
            {formError && (
              <div className="mt-3 p-2.5 bg-rose-50 text-rose-600 text-xs rounded-lg flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-3 space-y-3.5 text-sm">
              {/* Chọn thứ */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
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
                          ? 'bg-blue-600 text-white border-blue-600'
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Tên môn học:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Toán, Tiếng Anh, Lập trình..."
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Phòng học */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. Phòng học:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Phòng 301, Lab 2, Nhà A..."
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Giờ học: từ mấy giờ đến mấy giờ */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. Giờ học (Từ mấy giờ đến mấy giờ):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-0.5">Từ:</span>
                    <input
                      type="time"
                      required
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-0.5">Đến:</span>
                    <input
                      type="time"
                      required
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Màu sắc */}
              <div>
                <span className="block text-xs font-bold text-slate-700 mb-1.5">
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
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow active:scale-95"
                >
                  {editingId ? 'Cập nhật' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
