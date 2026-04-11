import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-text-primary block">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors peer-focus:text-brand-purple">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-lg border border-surface-border-subtle bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-all focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              error && "border-danger focus:ring-danger",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
