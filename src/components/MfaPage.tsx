import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { scaleIn, staggerContainer, staggerItem } from './ui/motion';

interface MfaPageProps {
  email: string;
  onVerify: (code: string) => Promise<{ ok: true } | { ok: false; error: string }> | { ok: true } | { ok: false; error: string };
  onLogout: () => void;
}

export default function MfaPage({ email, onVerify, onLogout }: MfaPageProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await onVerify(code);
      if (result.ok === false) setError(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mesh-auth flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neutral-500/20 rounded-full blur-3xl animate-float-delayed" />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="w-full max-w-sm relative z-10"
      >
        <motion.div variants={staggerItem} className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-2xl bg-[#c8ff00] flex items-center justify-center mx-auto mb-4 border-2 border-black shadow-[4px_4px_0_#ff3cac]"
          >
            <span className="material-symbols-outlined text-3xl text-black">shield</span>
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Verify it&apos;s you</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Enter the 6-digit code sent to<br />
            <strong className="text-neutral-300">{email}</strong>
          </p>
        </motion.div>

        <motion.form variants={scaleIn} onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-500/10 border border-red-400/30 text-red-300 text-sm px-4 py-3 rounded-xl"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label htmlFor="mfa-code" className="block text-xs font-semibold text-slate-300 mb-2">Verification Code</label>
            <input
              id="mfa-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              placeholder="000000"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-center text-2xl tracking-[0.5em] font-mono text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-neutral-500/40 focus:border-neutral-400/50 transition-all"
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-accent w-full py-3 text-sm"
          >
            Verify & Continue
          </motion.button>

          <button type="button" onClick={onLogout} className="w-full text-slate-400 hover:text-white text-sm py-2 transition-colors cursor-pointer">
            ← Back to login
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}
