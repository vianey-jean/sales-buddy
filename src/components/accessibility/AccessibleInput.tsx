
import React, { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AccessibleInputProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    required = false, 
    className, 
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className="space-y-2">
        <Label 
          htmlFor={inputId}
          className={cn(
            'text-sm font-medium',
            required && 'after:content-["*"] after:ml-1 after:text-red-500'
          )}
        >
          {label}
        </Label>
        
        <Input
          ref={ref}
          id={inputId}
          className={cn(
            'focus:ring-2 focus:ring-offset-1 focus:ring-primary',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={cn(
            errorId && errorId,
            helperId && helperId
          ).trim() || undefined}
          aria-required={required}
          {...props}
        />
        
        {helperText && (
          <p id={helperId} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
        
        {error && (
          <p 
            id={errorId} 
            className="text-sm text-red-600 flex items-center"
            role="alert"
            aria-live="polite"
          >
            <span className="mr-1" aria-hidden="true">⚠️</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';
