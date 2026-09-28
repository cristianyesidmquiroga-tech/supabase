import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastMessage['type'], message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastMessage['type'], message: string, title?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message, title }]);
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
        role="status"
      >
        {toasts.map((toast) => {
          const icon = {
            success: <CheckCircle2 className="w-5 h-5 text-[#166534] shrink-0" />,
            error: <XCircle className="w-5 h-5 text-[#B91C1C] shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-[#92400E] shrink-0" />,
            info: <Info className="w-5 h-5 text-[#9F1D3A] shrink-0" />,
          }[toast.type];

          const bgBorder = {
            success: 'bg-[#DCFCE7] border-[#BBF7D0] text-[#166534]',
            error: 'bg-[#FEE2E2] border-[#FECACA] text-[#B91C1C]',
            warning: 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]',
            info: 'bg-[#F3E8EA] border-[#DFBFC0] text-[#9F1D3A]',
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-[8px] border shadow-lg flex items-start gap-3 transition-all animate-in slide-in-from-bottom-2 ${bgBorder}`}
            >
              {icon}
              <div className="flex-1 text-sm">
                {toast.title && <p className="font-semibold leading-tight mb-0.5">{toast.title}</p>}
                <p className="font-normal text-xs leading-relaxed opacity-90">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="opacity-60 hover:opacity-100 transition-opacity p-0.5"
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser utilizado dentro de un ToastProvider');
  }
  return context;
}
