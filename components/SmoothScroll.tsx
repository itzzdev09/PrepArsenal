'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: false,
      // Keep a gentle glide, while settling sooner after each wheel gesture.
      lerp: 0.055,
      smoothWheel: true,
      syncTouch: true,
      syncTouchLerp: 0.065,
      touchInertiaExponent: 1.55,
      wheelMultiplier: 1.1,
      // This product deliberately uses motion as part of its interaction design.
      respectReducedMotion: false,
    });

    let animationFrame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      animationFrame = requestAnimationFrame(raf);
    };
    animationFrame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrame);
      lenis.destroy();
    };
  }, []);

  return children;
}
