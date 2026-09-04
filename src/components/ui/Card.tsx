import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverEffect?: boolean;
}

export function Card({
  children,
  glass = false,
  hoverEffect = false,
  className = '',
  ...props
}: CardProps) {
  const baseClasses = glass
    ? 'glass-card rounded-2xl p-6 transition-all duration-300'
    : 'bg-white dark:bg-[#0f1814] border border-stone-200/80 dark:border-[#1c2b23] rounded-2xl p-6 shadow-sm transition-all duration-300';

  const hoverClasses = hoverEffect
    ? 'hover:shadow-md hover:-translate-y-0.5 hover:border-forest-300 dark:hover:border-forest-700/60'
    : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`mb-4 flex flex-col gap-1.5 ${className}`}>{children}</div>;
}

export function CardTitle({
  children,
  className = '',
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = '',
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-stone-500 dark:text-stone-400 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = '',
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({
  children,
  className = '',
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mt-6 pt-4 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}
