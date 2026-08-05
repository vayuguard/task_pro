import type { ReactNode } from 'react';
import { motion, useReducedMotion, type Variants, type Transition } from 'motion/react';

export const easeOut: Transition['ease'] = [0.16, 1, 0.3, 1];

export const springSoft: Transition = { type: 'spring', stiffness: 340, damping: 30 };
export const springSnappy: Transition = { type: 'spring', stiffness: 520, damping: 32 };

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: easeOut } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: 'easeIn' } }
};

export const listVariants: Variants = {
  animate: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } }
};

export const itemVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.16 } }
};

export const scaleInVariants: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: springSoft },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.14 } }
};

/** Fades and lifts children in sequence. Collapses to a plain div when motion is reduced. */
export function Stagger({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={listVariants} initial="initial" animate="animate">
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

export function FadeIn({
  children,
  className = '',
  delay = 0
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: easeOut, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Lifts on hover — used for cards that link somewhere. */
export function HoverLift({
  children,
  className = '',
  disabled = false
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const reduced = useReducedMotion();
  if (reduced || disabled) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      transition={springSnappy}
    >
      {children}
    </motion.div>
  );
}
