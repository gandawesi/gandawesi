import React from 'react';

export interface PageHeaderProps {
  badge?:
    | {
        icon?: React.ComponentType<{ className?: string }>;
        text: string;
      }
    | React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'hero' | 'simple';
  className?: string;
}

export function PageHeader({
  badge,
  title,
  description,
  actions,
  action,
  variant = 'simple',
  className = '',
}: PageHeaderProps) {
  const headerActions = actions || action;
  const renderHeroBadge = () => {
    if (!badge) return null;
    if (React.isValidElement(badge)) return <div className="mb-3">{badge}</div>;
    const b = badge as { icon?: React.ComponentType<{ className?: string }>; text: string };
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-700/60 border border-forest-500/30 text-forest-200 text-xs font-semibold mb-3">
        {b.icon && <b.icon className="w-3.5 h-3.5 text-forest-300" />}
        <span>{b.text}</span>
      </div>
    );
  };

  const renderSimpleBadge = () => {
    if (!badge) return null;
    if (React.isValidElement(badge)) return <div className="mb-1">{badge}</div>;
    const b = badge as { icon?: React.ComponentType<{ className?: string }>; text: string };
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-forest-700 dark:text-forest-400 uppercase tracking-wider mb-1">
        {b.icon && <b.icon className="w-4 h-4" />}
        <span>{b.text}</span>
      </div>
    );
  };

  if (variant === 'hero') {
    return (
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-forest-950 via-forest-900 to-moss-900 text-white shadow-xl ${className}`}
      >
        <div className="relative z-10 max-w-2xl">
          {renderHeroBadge()}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
          {description && (
            <p className="text-forest-100/80 text-xs sm:text-sm mt-2 leading-relaxed">
              {description}
            </p>
          )}
          {headerActions && <div className="mt-4">{headerActions}</div>}
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-forest-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-20 w-60 h-60 bg-moss-400/20 rounded-full blur-2xl pointer-events-none" />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}
    >
      <div>
        {renderSimpleBadge()}
        <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{description}</p>
        )}
      </div>
      {headerActions && <div className="flex items-center gap-3 shrink-0">{headerActions}</div>}
    </div>
  );
}
