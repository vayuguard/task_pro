import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { scaleIn } from './ui/motion';

interface HeaderProps {
  currentUser: User;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLogout: () => void;
  onMenuClick: () => void;
}

export default function Header({
  currentUser,
  searchQuery,
  onSearchChange,
  onLogout,
  onMenuClick
}: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 lg:left-[280px] h-14 sm:h-16 glass flex justify-between items-center gap-2 sm:gap-4 px-3 sm:px-6 z-40 border-b border-white/50"
    >
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 rounded-xl border-2 border-black bg-white flex items-center justify-center shrink-0 cursor-pointer shadow-[2px_2px_0_#c8ff00]"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>

        <motion.div
          animate={{ scale: searchFocused ? 1.01 : 1 }}
          className="relative w-full max-w-md min-w-0"
        >
          <span
            className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg sm:text-xl transition-colors ${
              searchFocused ? 'text-[#ff3cac]' : 'text-ink-subtle'
            }`}
          >
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="find anything..."
            className="w-full pl-10 sm:pl-11 pr-9 py-2 sm:py-2.5 bg-white/85 border-2 border-black/10 rounded-xl text-sm font-medium text-ink focus:ring-0 focus:bg-white focus:border-black focus:outline-none transition-all placeholder:text-ink-subtle shadow-[2px_2px_0_transparent] focus:shadow-[3px_3px_0_#c8ff00]"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5 rounded-full hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 relative shrink-0">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-sm font-semibold text-ink">{currentUser.name}</span>
          <span className="text-[10px] text-neutral-700 font-medium">{currentUser.role || 'Member'}</span>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 p-1 rounded-full focus:outline-none cursor-pointer ring-2 ring-transparent hover:ring-cyan-200 transition-all"
        >
          <img
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shadow-md"
            src={currentUser.avatar}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
          />
        </motion.button>

        <AnimatePresence>
          {showMenu && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <motion.div
                variants={scaleIn}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute right-0 top-full mt-3 w-52 max-w-[calc(100vw-1.5rem)] glass rounded-2xl py-2 z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-100/80 bg-linear-to-r from-neutral-100/50 to-transparent">
                  <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onLogout();
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50/80 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Sign out
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
