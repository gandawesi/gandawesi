import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: AlertType;
  title?: string;
  message?: React.ReactNode;
  onClose?: () => void;
}

const ALERT_CONFIG: Record<
  AlertType,
  {
    icon: React.ComponentType<{ className?: string }>;
    bg: string;
    border: string;
    text: string;
    iconColor: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
    border: 'border-emerald-500/20 dark:border-emerald-800/40',
    text: 'text-emerald-800 dark:text-emerald-300',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  error: {
    icon: AlertTriangle,
    bg: 'bg-rose-500/10 dark:bg-rose-950/40',
    border: 'border-rose-500/20 dark:border-rose-800/40',
    text: 'text-rose-800 dark:text-rose-300',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/10 dark:bg-amber-950/40',
    border: 'border-amber-500/20 dark:border-amber-800/40',
    text: 'text-amber-800 dark:text-amber-300',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    icon: Info,
    bg: 'bg-forest-500/10 dark:bg-forest-950/40',
    border: 'border-forest-500/20 dark:border-forest-800/40',
    text: 'text-forest-800 dark:text-forest-300',
    iconColor: 'text-forest-600 dark:text-forest-400',
  },
};

export function Alert({
  type = 'info',
  title,
  message,
  children,
  onClose,
  className = '',
  ...props
}: AlertProps) {
  const config = ALERT_CONFIG[type] || ALERT_CONFIG.info;
  const IconComponent = config.icon;
  const content = message || children;

  if (!content && !title) return null;

  return (
    <div
      role="alert"
      className={`p-4 rounded-2xl border flex items-start gap-3 text-xs font-semibold ${config.bg} ${config.border} ${config.text} ${className}`}
      {...props}
    >
      <IconComponent className={`w-5 h-5 shrink-0 ${config.iconColor} mt-0.5`} />
      <div className="flex-1 min-w-0">
        {title && <div className="font-bold text-sm mb-0.5">{title}</div>}
        <div className="font-medium leading-relaxed">{content}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1 -mr-1 -mt-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-opacity cursor-pointer"
          title="Tutup notifikasi"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
