'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'glow' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Tech-savvy interactive button with gradient sweep, subtle neon glow, and tactile hover feedback.
 */
export function CyberButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}: CyberButtonProps) {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-4 py-2 text-sm gap-2 rounded-xl',
    lg: 'px-6 py-3 text-base gap-2.5 rounded-xl font-bold',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-[0_0_25px_rgba(59,130,246,0.35)] hover:shadow-[0_0_35px_rgba(59,130,246,0.55)] border border-blue-400/30',
    secondary:
      'bg-[rgba(15,22,41,0.7)] text-[#f0f4ff] border border-[rgba(59,130,246,0.25)] hover:border-blue-400/50 hover:bg-[rgba(20,30,55,0.85)] shadow-md',
    glow:
      'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-[0_0_30px_rgba(6,182,212,0.45)] hover:shadow-[0_0_45px_rgba(6,182,212,0.7)] border border-cyan-300/40',
    danger:
      'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-[0_0_25px_rgba(244,63,94,0.35)] border border-rose-400/30',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative inline-flex items-center justify-center font-medium tracking-wide overflow-hidden backdrop-blur-lg focus:outline-none transition-all duration-200 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {/* Light sweep flare */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
