'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'animate-spin rounded-full',
          'border-[4px]',
          'border-amber-500/10',
          'border-l-amber-500',
          'border-t-amber-500',
          'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
          sizeClasses[size]
        )}
        style={{
          filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))'
        }}
      >
        <span className="sr-only">Loading Projections</span>
      </div>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="flex-1 relative">
      <div className="absolute inset-0 bg-gray-900/5 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="relative p-4">
            <div className="absolute inset-0 animate-pulse-slow blur-2xl bg-amber-500/10 rounded-full" />
            <Spinner size="lg" className="relative z-10" />
          </div>
          <div className="text-center mt-6">
            <p className="text-sm sm:text-base font-medium text-amber-600/70 animate-pulse drop-shadow-sm">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
