import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`py-12 px-6 flex flex-col items-center justify-center text-center max-w-md mx-auto rounded-[12px] border border-dashed border-[#E7E0D6] bg-white/50 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E7E0D6] flex items-center justify-center text-[#9F1D3A] mb-4">
        {icon || <PackageOpen className="w-6 h-6" aria-hidden="true" />}
      </div>
      <h3 className="font-headline-sm text-lg text-[#1C1917] font-semibold tracking-tight mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-xs md:text-sm text-[#57534E] leading-relaxed max-w-sm mb-5">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
