import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LucideIcon } from 'lucide-react';

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  hint?: string;
}

export const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ label, icon: Icon, error, hint, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          {label}
        </Label>
        <div className="relative group">
          <Input
            ref={ref}
            className={cn(
              "h-12 px-4 bg-gradient-to-r from-white to-gray-50/80",
              "border-2 border-gray-200 hover:border-gray-300",
              "focus:border-primary focus:from-primary/5 focus:to-white",
              "rounded-xl shadow-sm hover:shadow-md focus:shadow-lg",
              "transition-all duration-300",
              "placeholder:text-gray-400",
              "text-gray-900 font-medium",
              error && "border-red-300 focus:border-red-500 bg-red-50/30",
              className
            )}
            {...props}
          />
          {/* Focus glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 blur-sm scale-105" />
        </div>
        {error && (
          <p className="text-sm font-medium text-red-500 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

PremiumInput.displayName = 'PremiumInput';

interface PremiumDialogHeaderProps {
  icon: LucideIcon;
  iconGradient?: string;
  title: string;
  subtitle?: string;
}

export const PremiumDialogHeader: React.FC<PremiumDialogHeaderProps> = ({
  icon: Icon,
  iconGradient = "from-primary to-blue-600",
  title,
  subtitle,
}) => {
  return (
    <div className="text-center space-y-4 pb-4">
      {/* Premium icon */}
      <div className="mx-auto relative">
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl",
          "bg-gradient-to-br", iconGradient,
          "transform hover:scale-105 transition-transform duration-300"
        )}>
          <Icon className="h-8 w-8 text-white drop-shadow-lg" />
        </div>
        {/* Glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-2xl blur-xl opacity-40 -z-10 scale-110",
          "bg-gradient-to-br", iconGradient
        )} />
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h2 className={cn(
          "text-2xl font-black bg-clip-text text-transparent",
          "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"
        )}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-500 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  icon?: LucideIcon;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ variant = 'primary', icon: Icon, isLoading, children, className, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-to-r from-primary via-blue-600 to-indigo-600 hover:from-primary hover:via-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40",
      secondary: "bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-700 border-2 border-gray-200 hover:border-gray-300",
      success: "bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 hover:from-emerald-600 hover:via-green-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40",
      danger: "bg-gradient-to-r from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:via-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40",
      outline: "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "h-12 px-6 rounded-xl font-bold text-base",
          "transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0",
          "flex items-center justify-center gap-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          variants[variant],
          className
        )}
        {...props}
      >
        {Icon && <Icon className={cn("h-5 w-5", isLoading && "animate-spin")} />}
        {children}
      </button>
    );
  }
);

PremiumButton.displayName = 'PremiumButton';

interface PremiumFormContainerProps {
  children: React.ReactNode;
  gradient?: string;
  className?: string;
}

export const PremiumFormContainer: React.FC<PremiumFormContainerProps> = ({
  children,
  gradient = "from-white via-gray-50/30 to-slate-50/50",
  className,
}) => {
  return (
    <div className={cn(
      "relative bg-gradient-to-br backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden",
      gradient,
      className
    )}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary/10 to-blue-200/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-indigo-200/10 to-purple-200/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative">
        {children}
      </div>
    </div>
  );
};
