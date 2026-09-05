import React from 'react';

export type StatColor = 'forest' | 'amber' | 'emerald' | 'blue' | 'purple' | 'indigo' | 'rose' | 'stone';

export interface StatCardProps {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  description?: string;
  color?: StatColor;
  className?: string;
  onClick?: () => void;
}

const COLOR_MAP: Record<StatColor, { bg: string; text: string; border: string }> = {
  forest: {
    bg: 'bg-forest-50 dark:bg-forest-950/60',
    text: 'text-forest-700 dark:text-forest-400',
    border: 'border-forest-100 dark:border-forest-900/60',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-900/60',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-900/60',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-900/60',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-100 dark:border-purple-900/60',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-100 dark:border-indigo-900/60',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-100 dark:border-rose-900/60',
  },
  stone: {
    bg: 'bg-stone-100 dark:bg-stone-800/60',
    text: 'text-stone-700 dark:text-stone-300',
    border: 'border-stone-200 dark:border-stone-700/60',
  },
};

export function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  description,
  color = 'forest',
  className = '',
  onClick,
}: StatCardProps) {
  const colorStyles = COLOR_MAP[color] || COLOR_MAP.forest;

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 flex items-center gap-4 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-forest-400/60 hover:shadow-md' : ''
      } ${className}`}
    >
      {Icon && (
        <div
          className={`w-12 h-12 rounded-xl ${colorStyles.bg} border ${colorStyles.border} flex items-center justify-center ${colorStyles.text} shrink-0`}
        >
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider truncate">
          {label}
        </p>
        <p className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-0.5 tracking-tight flex items-baseline gap-1.5">
          <span>{value}</span>
          {(subtext || description) && (
            <span className="text-xs font-normal text-stone-500 truncate">{subtext || description}</span>
          )}
        </p>
      </div>
    </div>
  );
}

export function StatGrid({
  children,
  columns = 4,
  className = '',
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const colClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  }[columns];

  return <div className={`grid ${colClass} gap-4 ${className}`}>{children}</div>;
}
