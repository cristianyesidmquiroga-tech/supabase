import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixText?: string;
  suffixIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, prefixText, suffixIcon, id, className = '', ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(2, 9);
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
            {label} {props.required && <span className="text-[#9F1D3A]">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixText && (
            <span className="absolute left-3 font-semibold text-[#9F1D3A] text-sm pointer-events-none select-none">
              {prefixText}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`w-full bg-[#FFFFFF] rounded-[4px] border text-sm text-[#1C1917] placeholder-[#57534E]/60 py-2.5 transition-all outline-none ${
              prefixText ? 'pl-8' : 'pl-3.5'
            } ${suffixIcon || error ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-[#B91C1C] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20'
                : 'border-[#E7E0D6] focus:border-[#9F1D3A] focus:ring-2 focus:ring-[#9F1D3A]/20'
            } ${className}`}
            {...props}
          />
          {error ? (
            <span className="absolute right-3 text-[#B91C1C] pointer-events-none flex items-center">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
            </span>
          ) : (
            suffixIcon && <span className="absolute right-3 text-[#57534E] flex items-center">{suffixIcon}</span>
          )}
        </div>
        {error ? (
          <p id={errorId} className="text-xs text-[#B91C1C] flex items-center gap-1 mt-1" role="alert">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-[#57534E] mt-1">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
