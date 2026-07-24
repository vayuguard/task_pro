import React from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';

export const easeOut = [0.22, 1, 0.36, 1] as const;
export const springSoft = { type: 'spring' as const, stiffness: 320, damping: 28 };

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 28, scale: 0.96, rotate: -0.5 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 280, damping: 24 }
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.97,
    transition: { duration: 0.22 }
  }
};

/** Full-height screens (chat) — fade only so layout doesn't jump or leave bottom gaps */
export const pageFadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } }
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 32 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 26 }
  }
};

export const staggerContainer: Variants = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } }
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 32, scale: 0.92 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 340, damping: 22 }
  }
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.88, y: 16 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 22 }
  },
  exit: { opacity: 0, scale: 0.94, transition: { duration: 0.18 } }
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -28 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 26 }
  }
};

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.7 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 480, damping: 18 }
  }
};

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function AnimatedModal({ open, onClose, children, className = '' }: AnimatedModalProps) {
  return (
    <AnimatePresence>
      {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`relative z-10 w-full max-h-[92vh] overflow-y-auto custom-scrollbar sm:max-h-[90vh] ${className}`}
            >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { motion, AnimatePresence };
