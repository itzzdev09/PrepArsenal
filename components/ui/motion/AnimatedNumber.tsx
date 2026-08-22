'use client';

import React, { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

/**
 * Motion Primitives AnimatedNumber
 * Smooth physics-based spring rolling counter for dashboard metrics and telemetry stats.
 */
export function AnimatedNumber({
  value,
  format = (val) => Math.round(val).toLocaleString(),
  className = '',
  suffix = '',
  prefix = '',
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 35,
    stiffness: 140,
  });
  const isInView = useInView(ref, { once: true, margin: '-20px' });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${format(latest)}${suffix}`;
      }
    });
    return () => unsubscribe();
  }, [springValue, format, prefix, suffix]);

  return <span ref={ref} className={className}>{`${prefix}${format(0)}${suffix}`}</span>;
}
