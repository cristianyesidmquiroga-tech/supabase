import React from 'react';

export const Skeleton: React.FC<{
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}> = ({ className = '', variant = 'rectangular' }) => {
  const variantStyles = {
    rectangular: 'rounded-[4px]',
    circular: 'rounded-full',
    text: 'rounded-[2px] h-4',
  }[variant];

  return (
    <div
      className={`animate-pulse bg-[#E7E0D6]/60 ${variantStyles} ${className}`}
      aria-hidden="true"
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-[12px] border border-[#E7E0D6] overflow-hidden flex flex-col p-4 space-y-4">
      <Skeleton className="w-full aspect-[3/4] rounded-[8px]" />
      <div className="space-y-2">
        <Skeleton className="w-1/3 h-3" />
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-1/2 h-4" />
      </div>
      <div className="pt-2 border-t border-[#E7E0D6] flex justify-between items-center">
        <Skeleton className="w-20 h-6" />
        <Skeleton className="w-24 h-8" />
      </div>
    </div>
  );
};
