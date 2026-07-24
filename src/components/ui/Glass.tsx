import React from 'react';
import { motion } from 'motion/react';
import { fadeUp, popIn } from './motion';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassPanel({ children, className = '', dark = false, hover = false, onClick }: GlassPanelProps) {
  const base = dark ? 'liquid-glass-dark' : 'liquid-glass';
  const hoverCls = hover ? 'liquid-card-hover cursor-pointer' : '';
  const Tag = onClick ? motion.button : motion.div;

  return (
    <Tag
      variants={fadeUp}
      initial="initial"
      animate="animate"
      whileHover={hover ? { y: -5, scale: 1.02, rotate: -0.4 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`${base} rounded-2xl ${hoverCls} ${className}`}
    >
      {children}
    </Tag>
  );
}

export function LiquidBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <motion.div
        className="liquid-blob liquid-blob-1"
        animate={{ scale: [1, 1.12, 1], x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="liquid-blob liquid-blob-2"
        animate={{ scale: [1, 1.15, 1], x: [0, -30, 0], y: [0, 25, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      />
      <motion.div
        className="liquid-blob liquid-blob-3"
        animate={{ scale: [1, 0.9, 1], rotate: [0, 12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      />
      <motion.div
        className="liquid-blob liquid-blob-4"
        animate={{ scale: [1, 1.2, 1], x: [0, 18, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2"
    >
      <div>
        <motion.h2
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink font-display"
        >
          {title}
        </motion.h2>
        {subtitle && <p className="text-sm text-ink-muted mt-1 font-medium max-w-prose">{subtitle}</p>}
      </div>
      {action && (
        <motion.div variants={popIn} initial="initial" animate="animate">
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}

export function StatCard({ label, value, icon, color = 'lime', sub }: {
  label: string; value: string | number; icon: string; color?: string; sub?: string;
}) {
  const colors: Record<string, string> = {
    lime: 'bg-[#c8ff00] text-black',
    cool: 'bg-[#00e5ff] text-black',
    teal: 'bg-[#00e5ff] text-black',
    indigo: 'bg-[#c8ff00] text-black',
    blue: 'bg-[#00e5ff] text-black',
    amber: 'bg-[#ff3cac] text-white',
    green: 'bg-[#c8ff00] text-black',
    violet: 'bg-[#ff3cac] text-white'
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.04, rotate: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
      className="liquid-glass rounded-2xl p-5 liquid-card-hover"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-ink-muted uppercase tracking-widest">{label}</span>
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#0a0a0a] ${colors[color] || colors.lime}`}
        >
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </motion.div>
      </div>
      <p className="text-3xl font-black text-ink font-display tracking-tight">{value}</p>
      {sub && <span className="text-[11px] text-ink-subtle mt-1 block font-medium">{sub}</span>}
    </motion.div>
  );
}
