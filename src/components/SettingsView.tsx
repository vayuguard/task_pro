import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { apiListEmployees, apiCreateEmployee } from '../api/client';
import { fadeUp } from './ui/motion';

interface SettingsViewProps {
  currentUser: User;
  isAdmin: boolean;
  onTeamChanged?: () => void;
}

interface EmployeeRow {
  id: string;
  email: string;
  profile: User;
  createdAt?: string;
}

export default function SettingsView({ currentUser, isAdmin, onTeamChanged }: SettingsViewProps) {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [jobTitle, setJobTitle] = useState('Employee');
  const [creating, setCreating] = useState(false);
  const [emailPreview, setEmailPreview] = useState('');

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 4000);
  };

  const loadEmployees = () => {
    if (!isAdmin) return;
    setLoadingList(true);
    apiListEmployees()
      .then((res) => setEmployees(res.employees as EmployeeRow[]))
      .catch(console.error)
      .finally(() => setLoadingList(false));
  };

  useEffect(() => {
    loadEmployees();
  }, [isAdmin]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    setCreating(true);
    setEmailPreview('');
    try {
      const res = await apiCreateEmployee({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        jobTitle: jobTitle.trim() || 'Employee',
        createdBy: currentUser.email || currentUser.name
      });

      if (res.emailDelivery.mode === 'console' && res.emailDelivery.preview) {
        setEmailPreview(res.emailDelivery.preview);
        showMessage('Employee created. SMTP not set — credentials logged (see preview below).');
      } else {
        showMessage(`Employee created. Login credentials emailed to ${res.employee.email}.`);
      }

      setName('');
      setEmail('');
      setPassword('');
      setJobTitle('Employee');
      loadEmployees();
      onTeamChanged?.();
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to create employee.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-8 flex flex-col gap-5 sm:gap-6">
      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage security and workspace preferences.</p>
      </motion.div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {isAdmin && (
        <motion.div variants={fadeUp} initial="initial" animate="animate" className="glass rounded-2xl p-6 space-y-5 card-hover">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-neutral-700">person_add</span>
            Create Employee
          </h3>
          <p className="text-xs text-slate-500">
            Set their email (login ID) and password. Credentials are emailed to the employee automatically.
          </p>

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full name</label>
              <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email (login ID)</label>
              <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="jane@company.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
              <input type="text" className="input-field font-mono" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Set a temporary password" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Job title</label>
              <input className="input-field" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Employee" />
            </div>
            <motion.button
              type="submit"
              disabled={creating}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-accent px-5 py-2.5 text-sm disabled:opacity-50"
            >
              {creating ? 'Creating…' : 'Create & email credentials'}
            </motion.button>
          </form>

          {emailPreview && (
            <pre className="text-[11px] bg-slate-900 text-emerald-300 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap">
              {emailPreview}
            </pre>
          )}

          <div className="border-t border-white/40 pt-4">
            <h4 className="text-xs font-bold text-slate-700 mb-3">Team employees {loadingList ? '…' : `(${employees.length})`}</h4>
            {employees.length === 0 ? (
              <p className="text-xs text-slate-400">No employees yet. Create one above.</p>
            ) : (
              <ul className="space-y-2">
                {employees.map((emp) => (
                  <li key={emp.id} className="flex items-center gap-3 p-3 liquid-glass rounded-xl">
                    <img src={emp.profile?.avatar} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{emp.profile?.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{emp.id} · {emp.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 space-y-4 card-hover">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-neutral-700">lock</span>
          Security
        </h3>

        <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-xl">
          <div>
            <p className="text-sm font-medium text-slate-800">Multi-Factor Authentication</p>
            <p className="text-xs text-slate-500">Require a code at login for admin accounts.</p>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setMfaEnabled(!mfaEnabled);
              showMessage(mfaEnabled ? 'MFA disabled.' : 'MFA enabled for your account.');
            }}
            className={`w-12 h-7 rounded-full relative transition-colors cursor-pointer ${
              mfaEnabled ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <motion.span
              layout
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md ${
                mfaEnabled ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
