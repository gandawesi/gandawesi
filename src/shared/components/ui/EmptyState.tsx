import React from 'react';
import { Package } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Package,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`p-12 text-center rounded-3xl border border-dashed border-stone-200 dark:border-stone-800 bg-white/40 dark:bg-stone-900/40 backdrop-blur-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-center mx-auto mb-3 text-stone-400">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{title}</h3>
      {description && (
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
