import React from 'react';
import { useAppStore } from '../store';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-sky-400 shrink-0" />;
        let borderClass = 'border-sky-500/30';
        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" />;
          borderClass = 'border-lime-500/40';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
          borderClass = 'border-amber-500/40';
        } else if (toast.type === 'error') {
          icon = <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
          borderClass = 'border-rose-500/40';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/95 backdrop-blur-md border ${borderClass} shadow-xl shadow-black/40 text-slate-100 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white tracking-wide">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
