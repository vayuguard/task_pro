import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fadeUp, staggerContainer, staggerItem } from './ui/motion';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }> | { ok: true } | { ok: false; error: string };
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await onLogin(email, password);
      if (result.ok === false) setError(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] gradient-mesh-auth flex overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12"
      >
        <div className="absolute top-16 left-16 w-80 h-80 bg-[#c8ff00]/25 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-16 right-12 w-96 h-96 bg-[#ff3cac]/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/3 w-52 h-52 bg-[#00e5ff]/20 rounded-full blur-2xl animate-pulse-soft" />

        <div className="relative z-10 max-w-md text-white">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -25 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 16, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-[#c8ff00] flex items-center justify-center mb-8 border-2 border-black shadow-[6px_6px_0_#ff3cac]"
          >
            <span className="material-symbols-outlined text-4xl text-black">bolt</span>
          </motion.div>
          <h1 className="text-5xl font-extrabold tracking-tight leading-[1.05] text-white font-display">
            get stuff<br />
            <span className="text-gradient">done.</span>
          </h1>
          <p className="text-neutral-400 mt-5 text-lg leading-relaxed font-medium">
            Tasks, boards, chat, stats — all in one place that actually looks good.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            {[
              { icon: 'groups', label: 'team sync' },
              { icon: 'insights', label: 'live stats' },
              { icon: 'shield', label: 'locked in' }
            ].map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, type: 'spring' }}
                whileHover={{ y: -4, scale: 1.05 }}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300"
              >
                <span className="material-symbols-outlined text-[#c8ff00] text-base">{f.icon}</span>
                {f.label}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="w-full max-w-md">
          <motion.div variants={fadeUp} className="text-center lg:text-left mb-8">
            <div className="lg:hidden w-12 h-12 rounded-xl bg-[#c8ff00] flex items-center justify-center mx-auto mb-4 border-2 border-black shadow-[3px_3px_0_#ff3cac]">
              <span className="material-symbols-outlined text-black text-2xl">bolt</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#c8ff00] font-display drop-shadow-sm">yo, welcome back</h2>
            <p className="text-neutral-300 mt-1 text-sm font-medium">drop your creds to hop in</p>
          </motion.div>

          <motion.form
            variants={staggerItem}
            onSubmit={handleSubmit}
            className="liquid-glass lg:bg-white rounded-2xl p-6 sm:p-8 space-y-5 border-2 border-black lg:shadow-[8px_8px_0_#0a0a0a]"
          >
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#ff3cac]/10 border-2 border-[#ff3cac] text-[#ff3cac] text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">error</span>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-ink-muted mb-1.5 uppercase tracking-wider">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="Email" className="input-field" />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-ink-muted mb-1.5 uppercase tracking-wider">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="Password" className="input-field" />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-accent w-full py-3.5 text-sm disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  locking in...
                </span>
              ) : "let's go →"}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
