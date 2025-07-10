import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'destructive' | 'medical' | 'legal' | 'sales';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-brand font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-primary-purple hover:bg-primary-purple/90 text-white focus:ring-primary-purple",
    secondary: "bg-primary-teal hover:bg-primary-teal/90 text-white focus:ring-primary-teal",
    outline: "border-2 border-primary-purple text-primary-purple hover:bg-primary-purple hover:text-white focus:ring-primary-purple",
    ghost: "text-primary-purple hover:bg-primary-purple/10 focus:ring-primary-purple",
    gradient: "bg-gradient text-white hover:opacity-90 focus:ring-primary-purple",
    destructive: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    medical: "bg-industry-medical hover:bg-industry-medical/90 text-white focus:ring-industry-medical",
    legal: "bg-industry-legal hover:bg-industry-legal/90 text-white focus:ring-industry-legal",
    sales: "bg-industry-sales hover:bg-industry-sales/90 text-white focus:ring-industry-sales"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg"
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        loading && "animate-pulse",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
