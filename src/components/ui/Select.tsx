import React, { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, id, children, className = '', ...props }, ref) => {
    const selectId = id || props.name || Math.random().toString(36).substring(2, 9);
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
            {label} {props.required && <span className="text-[#9F1D3A]">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`w-full appearance-none bg-[#FFFFFF] rounded-[4px] border text-sm text-[#1C1917] pl-3.5 pr-10 py-2.5 transition-all outline-none cursor-pointer ${
              error
                ? 'border-[#B91C1C] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20'
                : 'border-[#E7E0D6] focus:border-[#9F1D3A] focus:ring-2 focus:ring-[#9F1D3A]/20'
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#57534E]">
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </span>
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

Select.displayName = 'Select';
