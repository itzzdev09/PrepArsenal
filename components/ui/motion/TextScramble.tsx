'use client';

import React, { useEffect, useState } from 'react';

const GLYPHS = '0101XYZ_#+<>$!*&%~';

interface TextScrambleProps {
  text: string;
  className?: string;
  speed?: number;
  trigger?: boolean;
}

/**
 * Cyber-tech character decode / scramble effect for headers, titles and stats.
 */
export function TextScramble({
  text,
  className = '',
  speed = 30,
  trigger = true,
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    if (!trigger) return;
    let iteration = 0;
    const maxIterations = text.length * 2;

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration / 2) {
              return text[index];
            }
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join('')
      );

      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
      }
      iteration += 1;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, trigger]);

  return <span className={className}>{displayText}</span>;
}
