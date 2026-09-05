import type { ComponentType } from 'react';

export interface NavLinkItem {
  href: string;
  label: string;
}

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
}
