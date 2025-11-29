import { cn } from '@/lib/utils';
import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'default',
  isLoading = false,
  children,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-opacity-90 focus:ring-primary',
    secondary: 'bg-secondary text-dark-bg hover:bg-opacity-90 focus:ring-secondary',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
    ghost: 'bg-transparent text-primary hover:bg-primary/10 focus:ring-primary',
  };

  const sizeStyles = {
    default: 'h-10 px-4 py-2 text-base',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-6 text-lg',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin ltr:mr-2 rtl:ml-2" />
      ) : (
        children
      )}
    </button>
  );
};
export default Button;

// src/components/ui/Button.tsx
"use client";
import React from "react";
import clsx from "clsx";

export default function Button({ children, className, ...props }: any) {
  return (
    <button {...props} className={clsx("btn-lux bg-gradient-to-br from-[#06b6d4] to-[#7c3aed] text-white", className)}>
      {children}
    </button>
  );
}
