'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      // Do not transform the app shell: transforms capture position: fixed sidebars.
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
