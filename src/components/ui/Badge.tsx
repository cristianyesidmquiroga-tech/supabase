import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'accent' | 'wine';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    success: 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]',
    warning: 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]',
    danger: 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]',
    neutral: 'bg-[#FAF7F2] text-[#57534E] border border-[#E7E0D6]',
    accent: 'bg-[#F3E8EA] text-[#9F1D3A] border border-[#DFBFC0]',
    wine: 'bg-[#9F1D3A] text-white border-transparent',
  }[variant];

  const dotColors = {
    success: 'bg-[#166534]',
    warning: 'bg-[#92400E]',
    danger: 'bg-[#B91C1C]',
    neutral: 'bg-[#57534E]',
    accent: 'bg-[#9F1D3A]',
    wine: 'bg-white',
  }[variant];

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-[4px] leading-tight select-none ${variantStyles} ${sizeStyles} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors}`} aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
};
