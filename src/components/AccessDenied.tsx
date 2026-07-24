import React from 'react';
import { motion } from 'motion/react';
import { fadeUp } from './ui/motion';

interface AccessDeniedProps {
  screenName: string;
  onGoBack: () => void;
}

export default function AccessDenied({ screenName, onGoBack }: AccessDeniedProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      className="flex-1 max-w-lg mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 text-center"
    >
      <motion.div
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        className="w-20 h-20 rounded-2xl bg-linear-to-br from-red-100 to-orange-100 flex items-center justify-center mx-auto shadow-lg"
      >
        <span className="material-symbols-outlined text-4xl text-red-400">lock</span>
      </motion.div>
      <h2 className="text-xl font-bold text-slate-900 mt-6">Access Restricted</h2>
      <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
        You don&apos;t have permission to view <strong className="text-slate-700">{screenName}</strong>.
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onGoBack}
        className="btn-primary mt-8 px-6 py-2.5 text-sm"
      >
        Go to My Dashboard
      </motion.button>
    </motion.div>
  );
}
