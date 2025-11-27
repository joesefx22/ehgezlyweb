import { cn } from '@/lib/utils';
import React, { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'info', className }) => {
  const variantStyles = {
    primary: 'bg-primary/20 text-primary',
    secondary: 'bg-gray-500/20 text-gray-700',
    success: 'bg-green-500/20 text-green-700',
    danger: 'bg-red-500/20 text-red-700',
    warning: 'bg-yellow-500/20 text-yellow-700',
    info: 'bg-blue-500/20 text-blue-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full rtl:ml-2 ltr:mr-2',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
