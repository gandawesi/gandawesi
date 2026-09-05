'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, message, title, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = { id, type, message, title, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const success = useCallback(
    (message: string, title?: string) => {
      showToast({ type: 'success', message, title });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string) => {
      showToast({ type: 'error', message, title: title || 'Terjadi Kesalahan' });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      showToast({ type: 'warning', message, title });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string) => {
      showToast({ type: 'info', message, title });
    },
    [showToast]
  );

  const contextValue = useMemo(
    () => ({ showToast, success, error, warning, info, dismiss }),
    [showToast, success, error, warning, info, dismiss]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast floating container */}
      <div
        aria-live="assertive"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const config = {
            success: {
              icon: CheckCircle2,
              iconColor: 'text-emerald-500 dark:text-emerald-400',
              border: 'border-emerald-200 dark:border-emerald-800/80',
              bg: 'bg-emerald-50/95 dark:bg-emerald-950/90',
            },
            error: {
              icon: AlertCircle,
              iconColor: 'text-rose-500 dark:text-rose-400',
              border: 'border-rose-200 dark:border-rose-800/80',
              bg: 'bg-rose-50/95 dark:bg-rose-950/90',
            },
            warning: {
              icon: AlertTriangle,
              iconColor: 'text-amber-500 dark:text-amber-400',
              border: 'border-amber-200 dark:border-amber-800/80',
              bg: 'bg-amber-50/95 dark:bg-amber-950/90',
            },
            info: {
              icon: Info,
              iconColor: 'text-forest-600 dark:text-forest-400',
              border: 'border-forest-200 dark:border-forest-800/80',
              bg: 'bg-forest-50/95 dark:bg-forest-950/90',
            },
          }[toast.type];

          const IconComponent = config.icon;

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl backdrop-blur-md border ${config.bg} ${config.border} transition-all duration-300 animate-in fade-in slide-in-from-bottom-3`}
            >
              <div className="shrink-0 mt-0.5">
                <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0 pr-1">
                {toast.title && (
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight mb-0.5">
                    {toast.title}
                  </h4>
                )}
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Tutup Notifikasi"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
