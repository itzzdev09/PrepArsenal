'use client';

import React from 'react';

interface GlowBadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'cyan' | 'emerald' | 'amber' | 'purple' | 'rose';
  dot?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  blue: {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.3)',
    text: '#93c5fd',
    dot: '#3b82f6',
    glow: '0 0 12px rgba(59, 130, 246, 0.4)',
  },
  cyan: {
    bg: 'rgba(6, 182, 212, 0.1)',
    border: 'rgba(6, 182, 212, 0.3)',
    text: '#67e8f9',
    dot: '#06b6d4',
    glow: '0 0 12px rgba(6, 182, 212, 0.4)',
  },
  emerald: {
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.3)',
    text: '#6ee7b7',
    dot: '#10b981',
    glow: '0 0 12px rgba(16, 185, 129, 0.4)',
  },
  amber: {
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.3)',
    text: '#fcd34d',
    dot: '#f59e0b',
    glow: '0 0 12px rgba(245, 158, 11, 0.4)',
  },
  purple: {
    bg: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(139, 92, 246, 0.3)',
    text: '#c4b5fd',
    dot: '#8b5cf6',
    glow: '0 0 12px rgba(139, 92, 246, 0.4)',
  },
  rose: {
    bg: 'rgba(244, 63, 94, 0.1)',
    border: 'rgba(244, 63, 94, 0.3)',
    text: '#fda4af',
    dot: '#f43f5e',
    glow: '0 0 12px rgba(244, 63, 94, 0.4)',
  },
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[0.7rem] gap-1.5',
  md: 'px-3 py-1 text-xs gap-2',
  lg: 'px-4 py-1.5 text-sm gap-2.5',
};

/**
 * Manus.im inspired cybernetic telemetry status badge with live pulsating dot and glass background.
 */
export function GlowBadge({
  children,
  variant = 'blue',
  dot = true,
  className = '',
  size = 'md',
}: GlowBadgeProps) {
  const style = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-semibold tracking-wide uppercase backdrop-blur-md transition-all duration-200 ${sizeStyles[size]} ${className}`}
      style={{
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        color: style.text,
        boxShadow: style.glow,
      }}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: style.dot }}
          />
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ backgroundColor: style.dot }}
          />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}
