import React from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';

interface UpdateNotificationProps {
  show: boolean;
  isUpdating: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  show,
  isUpdating,
  onUpdate,
  onDismiss,
}) => {
  if (!show) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-sm z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-900/95 text-white border border-blue-500/50 shadow-2xl rounded-2xl p-3.5 backdrop-blur-xl flex items-start gap-3 ring-1 ring-blue-500/20">
        <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-white">
              Đã có bản cập nhật mới!
            </h4>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
            Vừa có cập nhật mới trên hệ thống. Hãy bấm cập nhật để nhận các tính năng và sửa đổi mới nhất!
          </p>

          <div className="flex items-center gap-2 mt-2.5">
            <button
              onClick={onUpdate}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{isUpdating ? 'Đang cập nhật...' : 'Cập nhật ngay'}</span>
            </button>

            <button
              onClick={onDismiss}
              className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 font-medium transition cursor-pointer"
            >
              Để sau
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          title="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
