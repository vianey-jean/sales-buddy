
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ className, error, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="relative group">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          data-lpignore="true"
          data-form-type="other"
          className={cn(
            "pl-10 pr-12 h-12 rounded-xl border-2 transition-all duration-200",
            "focus:border-purple-500 focus:ring-purple-500/20 focus:ring-4",
            "group-hover:border-purple-300",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        
        {/* Security icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Shield className={cn(
            "h-5 w-5 transition-colors duration-200",
            error ? "text-red-400" : "text-purple-400 group-hover:text-purple-500"
          )} />
        </div>
        
        {/* Toggle button */}
        <button
          type="button"
          className={cn(
            "absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg",
            "hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-purple-500/20",
            error && "hover:bg-red-50 dark:hover:bg-red-900/20"
          )}
          onClick={togglePasswordVisibility}
        >
          {showPassword ? (
            <EyeOff className={cn(
              "h-5 w-5 transition-colors duration-200",
              error ? "text-red-400 hover:text-red-500" : "text-gray-400 hover:text-purple-500"
            )} />
          ) : (
            <Eye className={cn(
              "h-5 w-5 transition-colors duration-200",
              error ? "text-red-400 hover:text-red-500" : "text-gray-400 hover:text-purple-500"
            )} />
          )}
        </button>
      </div>
      
      {error && (
        <div className="mt-2 flex items-center animate-in fade-in-50 duration-200">
          <div className="w-1 h-1 bg-red-500 rounded-full mr-2"></div>
          <p className="text-sm text-red-500 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
