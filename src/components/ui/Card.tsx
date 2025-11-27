import { cn } from '@/lib/utils';
import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

const Card: React.FC<CardProps> = ({ className, title, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-dark-card rounded-xl shadow-lg border border-gray-100 dark:border-dark-bg transition-shadow duration-300 hover:shadow-xl',
        className
      )}
      {...props}
    >
      {title && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>
        </div>
      )}
      <div className={cn({ 'p-6': !title }, { 'p-4': title })}>
        {children}
      </div>
    </div>
  );
};

export default Card;
