import React, { forwardRef } from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl cursor-pointer select-none active:scale-[0.98]';

    const variantClasses = {
      primary:
        'bg-forest-700 hover:bg-forest-800 text-white shadow-sm hover:shadow-md focus:ring-forest-600 dark:bg-forest-600 dark:hover:bg-forest-500',
      secondary:
        'bg-moss-100 hover:bg-moss-200 text-moss-900 focus:ring-moss-400 dark:bg-moss-900/60 dark:hover:bg-moss-800/80 dark:text-moss-100',
      outline:
        'border border-forest-300 dark:border-forest-700/60 text-forest-800 dark:text-forest-200 hover:bg-forest-50 dark:hover:bg-forest-950/40 focus:ring-forest-500',
      ghost:
        'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 focus:ring-stone-400',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500 dark:bg-rose-700 dark:hover:bg-rose-600',
    }[variant];

    const sizeClasses = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5',
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Spinner size="sm" className="text-current" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
