import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'Ha ocurrido un error',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`p-4 rounded-[8px] bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#B91C1C]" aria-hidden="true" />
        <div>
          <h4 className="text-sm font-semibold text-[#B91C1C] leading-snug">{title}</h4>
          <p className="text-xs text-[#B91C1C]/90 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="bg-white border-[#B91C1C]/40 text-[#B91C1C] hover:border-[#B91C1C] shrink-0 self-start sm:self-auto"
        >
          Reintentar
        </Button>
      )}
    </div>
  );
};
