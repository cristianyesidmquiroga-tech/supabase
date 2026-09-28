import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'whatsapp' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-[4px] transition-all duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-sm px-6 py-3.5 gap-2.5 tracking-wide',
  }[size];

  const variantStyles = {
    primary:
      'bg-[#9F1D3A] text-white hover:bg-[#7F1730] focus-visible:ring-[#9F1D3A] focus-visible:ring-offset-[#FAF7F2] shadow-sm',
    secondary:
      'bg-[#1C1917] text-white hover:bg-[#33302D] focus-visible:ring-[#1C1917] focus-visible:ring-offset-[#FAF7F2] shadow-sm',
    outline:
      'bg-transparent border border-[#E7E0D6] text-[#1C1917] hover:border-[#1C1917] hover:bg-black/5 focus-visible:ring-[#1C1917]',
    danger:
      'bg-[#B91C1C] text-white hover:bg-[#93000A] focus-visible:ring-[#B91C1C] shadow-sm',
    whatsapp:
      'bg-[#128C7E] text-white hover:bg-[#0E7064] focus-visible:ring-[#128C7E] shadow-sm',
    ghost:
      'bg-transparent text-[#57534E] hover:text-[#1C1917] hover:bg-black/5 focus-visible:ring-[#1C1917]',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
