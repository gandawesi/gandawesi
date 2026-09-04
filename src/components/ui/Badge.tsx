import React from 'react';
import { MEMBER_STATUS_LABELS, MEMBER_STATUS_COLORS, type MemberStatus, USER_ROLE_LABELS, type FunctionalRole } from '@/lib/constants';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'status' | 'role' | 'default' | 'success' | 'warning' | 'danger';
  status?: MemberStatus;
  role?: FunctionalRole;
  subLabel?: string;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({
  children,
  variant = 'default',
  status,
  role,
  subLabel,
  size = 'md',
  dot = false,
  className = '',
  ...props
}: BadgeProps) {
  let styleClasses = 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700';
  let label = children;

  if (status) {
    const colors = MEMBER_STATUS_COLORS[status] || MEMBER_STATUS_COLORS.calon_siswa;
    styleClasses = `${colors.bg} ${colors.text} ${colors.border}`;
    const baseLabel = MEMBER_STATUS_LABELS[status] || status;
    label = label || (subLabel ? `${baseLabel} ${subLabel}` : baseLabel);
  } else if (role) {
    styleClasses = 'bg-forest-50 text-forest-800 border-forest-200 dark:bg-forest-950/60 dark:text-forest-300 dark:border-forest-800';
    label = label || USER_ROLE_LABELS[role] || role;
  } else if (variant === 'success') {
    styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
  } else if (variant === 'warning') {
    styleClasses = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
  } else if (variant === 'danger') {
    styleClasses = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide select-none ${sizeClasses} ${styleClasses} ${className}`}
      {...props}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />}
      {label}
    </span>
  );
}
