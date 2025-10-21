import React from 'react';
import { cn } from '../../utils';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  /** 접근성을 위한 aria-label (아이콘만 있는 버튼의 경우 필수) */
  'aria-label'?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl focus:outline-none transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) disabled:cursor-not-allowed relative overflow-hidden';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-colored hover:from-primary-700 hover:to-primary-800 hover:-translate-y-1 hover:shadow-strong focus:ring-4 focus:ring-primary-200 disabled:from-primary-300 disabled:to-primary-300 disabled:shadow-none disabled:translate-y-0 border-0',
    secondary: 'bg-gradient-to-r from-surface-200 to-surface-300 text-gray-900 border border-surface-400 shadow-soft hover:from-surface-300 hover:to-surface-400 hover:text-gray-900 hover:-translate-y-0.5 hover:shadow-medium focus:ring-4 focus:ring-surface-300 disabled:from-surface-100 disabled:to-surface-100 disabled:text-surface-400 disabled:border-surface-200 disabled:shadow-none disabled:translate-y-0',
    danger: 'bg-gradient-to-r from-error-600 to-error-700 text-white shadow-[0_10px_15px_-3px_rgba(239,68,68,0.3)] hover:from-error-700 hover:to-error-800 hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(239,68,68,0.4)] focus:ring-4 focus:ring-error-200 disabled:from-error-300 disabled:to-error-300 disabled:shadow-none disabled:translate-y-0',
    ghost: 'bg-gradient-to-r from-surface-100 to-surface-200 text-gray-800 border border-surface-300/50 hover:from-primary-100 hover:to-primary-200 hover:text-primary-800 hover:border-primary-300 hover:-translate-y-0.5 hover:shadow-soft focus:ring-4 focus:ring-primary-100 disabled:from-surface-50 disabled:to-surface-50 disabled:text-surface-400 disabled:border-surface-200 disabled:translate-y-0',
    outline: 'bg-white text-gray-800 border-2 border-gray-400 shadow-soft hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:border-primary-400 hover:text-primary-800 hover:-translate-y-0.5 hover:shadow-medium focus:ring-4 focus:ring-primary-200 disabled:bg-surface-50 disabled:text-surface-400 disabled:border-surface-200 disabled:translate-y-0',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm h-9',
    md: 'px-6 py-3 text-sm h-11',
    lg: 'px-8 py-4 text-base h-13',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={loading || disabled}
      aria-disabled={loading || disabled}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      <span className={loading ? 'opacity-70' : ''}>{children}</span>
    </button>
  );
};

export default Button;