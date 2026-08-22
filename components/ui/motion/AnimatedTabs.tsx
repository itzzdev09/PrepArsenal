'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface AnimatedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  layoutId?: string;
}

/**
 * Watermelon UI / Motion-Primitives style floating pill tab switcher with spring layout physics.
 */
export function AnimatedTabs({
  tabs,
  activeTab,
  onChange,
  className = '',
  layoutId = 'active-pill-tab',
}: AnimatedTabsProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(15,22,41,0.7)] p-1.5 backdrop-blur-xl ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-colors duration-200 focus:outline-none ${
              isActive ? 'text-white' : 'text-[#94a3c0] hover:text-[#f0f4ff]'
            }`}
            role="tab"
            aria-selected={isActive}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-cyan-600/90 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[0.65rem] font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
