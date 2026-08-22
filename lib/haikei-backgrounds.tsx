'use client';

import React from 'react';

/**
 * Haikei.app & Cyber-Tech inspired generative SVG patterns and visual backdrops.
 * Resolution-independent, zero network overhead, ultra-crisp GPU rendering.
 */

export function CyberGridBackground({ className = '', opacity = 0.4 }: { className?: string; opacity?: number }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="cyber-grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="rgba(59, 130, 246, 0.08)"
              strokeWidth="1"
            />
            <circle cx="48" cy="0" r="1.5" fill="rgba(59, 130, 246, 0.25)" />
          </pattern>
          <radialGradient id="cyber-grid-mask" cx="50%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="60%" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="cyber-mask">
            <rect width="100%" height="100%" fill="url(#cyber-grid-mask)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#cyber-grid-pattern)" mask="url(#cyber-mask)" />
      </svg>
    </div>
  );
}

export function TopographicWavesBackground({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        className="absolute -top-1/4 left-1/2 h-[150%] w-[150%] -translate-x-1/2 opacity-25"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-100,450 C300,300 600,600 900,400 C1200,200 1400,500 1600,450"
          stroke="url(#topowave-grad1)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M-100,520 C320,380 620,680 920,470 C1220,260 1420,570 1600,520"
          stroke="url(#topowave-grad2)"
          strokeWidth="1.2"
        />
        <path
          d="M-100,380 C280,220 580,520 880,330 C1180,140 1380,430 1600,380"
          stroke="url(#topowave-grad3)"
          strokeWidth="1.8"
        />
        <path
          d="M-100,600 C350,450 650,750 950,540 C1250,330 1450,640 1600,600"
          stroke="url(#topowave-grad1)"
          strokeWidth="1"
          strokeOpacity="0.5"
        />
        <defs>
          <linearGradient id="topowave-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="topowave-grad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="topowave-grad3" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function NeonGlowOrbs({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div
        className="absolute -top-32 left-1/4 h-96 w-96 rounded-full blur-[128px]"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.08) 70%, transparent 100%)' }}
      />
      <div
        className="absolute top-1/3 right-10 h-80 w-80 rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.14) 0%, rgba(59,130,246,0.04) 70%, transparent 100%)' }}
      />
      <div
        className="absolute -bottom-20 left-1/3 h-[420px] w-[420px] rounded-full blur-[140px]"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(6,10,20,0) 70%)' }}
      />
    </div>
  );
}
