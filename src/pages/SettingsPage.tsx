import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useUI } from '../context/UIContext';
import {
  apiListEmployees,
  apiCreateEmployee,
  apiDeleteEmployee,
  apiListScheduleExceptions,
  apiCreateScheduleException,
  apiDeleteScheduleException,
  apiChangePassword,
  apiCreateHoliday,
  apiDeleteHoliday,
  type ScheduleExceptionDto
} from '../api/client';
import { PageHeader, Panel } from '../components/ui/Panel';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function SettingsPage() {
  const { session } = useAuth();
  const { reload, holidays } = useData();
  const { toast } = useToast();
  const isAdmin = session?.role === 'admin';
  const { mode, resolved, setMode } = useTheme();
  const { sidebarCollapsed, toggleSidebar } = useUI();
  const [employees, setEmployees] = useState<Array<{ id: string; email: string; profile: { name: string } }>>([]);
  const [exceptions, setExceptions] = useState<ScheduleExceptionDto[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [exEmail, setExEmail] = useState('');
  const [exStart, setExStart] = useState(9);
  const [exEnd, setExEnd] = useState(19);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayName, setHolidayName] = useState('');

  const load = () => {
    if (!isAdmin) return;
    apiListEmployees().then((r) => setEmployees(r.employees));
    apiListScheduleExceptions().then((r) => setExceptions(r.exceptions)).catch(() => {});
  };

  useEffect(() => {
    load();
  }, [isAdmin]);

  const createEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiCreateEmployee({ name, email, password, createdBy: session!.email });
    toast('Employee created', 'success');
    setName('');
    setEmail('');
    setPassword('');
    load();
    reload();
  };

  const addException = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiCreateScheduleException({ email: exEmail, startHour: exStart, endHour: exEnd });
    toast('Schedule exception saved', 'success');
    setExEmail('');
    load();
  };

  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader title="Settings" subtitle="Account and team" />
      <Panel>
        <h2 className="text-sm font-semibold mb-3">Profile</h2>
        <p className="text-sm text-ink">{session?.profile.name}</p>
        <p className="text-sm text-ink-muted">{session?.email}</p>
        <p className="text-xs text-ink-faint mt-2">MFA is enforced server-side for admin accounts.</p>
        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await apiChangePassword(currentPassword, newPassword);
              toast('Password updated', 'success');
              setCurrentPassword('');
              setNewPassword('');
            } catch (err) {
              toast(err instanceof Error ? err.message : 'Password update failed', 'error');
            }
          }}
        >
          <h3 className="text-xs font-semibold text-ink-muted">Change password</h3>
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
          <Button type="submit">Update password</Button>
        </form>
      </Panel>

      <Panel>
        <h2 className="text-sm font-semibold mb-4">Preferences</h2>
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold text-ink-muted mb-2">Theme</p>
            <div className="flex items-center gap-3 flex-wrap">
              <select
                className="input w-auto py-2 px-3"
                value={mode}
                onChange={(e) => setMode(e.target.value as typeof mode)}
                aria-label="Theme mode"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
              <span className="text-xs text-ink-faint">
                Resolved: {resolved}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-ink-muted mb-2">Sidebar</p>
            <Button variant="ghost" onClick={toggleSidebar} icon={sidebarCollapsed ? 'chevron_right' : 'chevron_left'}>
              {sidebarCollapsed ? 'Expand' : 'Collapse'}
            </Button>
          </div>

          <div>
            <p className="text-xs font-semibold text-ink-muted mb-2">Shortcuts</p>
            <ul className="text-xs text-ink-faint space-y-1">
              <li>Ctrl/⌘ K — Command palette</li>
            </ul>
          </div>
        </div>
      </Panel>
      {isAdmin && (
        <>
          <Panel>
            <h2 className="text-sm font-semibold mb-4">Add employee</h2>
            <form onSubmit={createEmployee} className="space-y-3">
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              <Button type="submit">Create & invite</Button>
            </form>
          </Panel>
          <Panel>
            <h2 className="text-sm font-semibold mb-3">Team ({employees.length})</h2>
            <ul className="divide-y divide-border">
              {employees.map((emp) => (
                <li key={emp.id} className="flex justify-between py-2 text-sm">
                  <span>{emp.profile.name} · {emp.email}</span>
                  <Button variant="ghost" className="text-danger text-xs" onClick={async () => {
                    await apiDeleteEmployee(emp.id);
                    load();
                    reload();
                  }}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <h2 className="text-sm font-semibold mb-2">Schedule exceptions</h2>
            <p className="text-xs text-ink-muted mb-4">Alternate work windows (Mon–Sat, max 8h/day credited). WFH uses same rules unless exception set.</p>
            <form onSubmit={addException} className="grid sm:grid-cols-3 gap-3 mb-4">
              <Input label="Employee email" value={exEmail} onChange={(e) => setExEmail(e.target.value)} required />
              <Input label="Start hour" type="number" min={0} max={23} value={exStart} onChange={(e) => setExStart(Number(e.target.value))} />
              <Input label="End hour" type="number" min={1} max={24} value={exEnd} onChange={(e) => setExEnd(Number(e.target.value))} />
              <Button type="submit" className="sm:col-span-3">Add exception</Button>
            </form>
            <ul className="text-sm space-y-2">
              {exceptions.map((ex) => (
                <li key={ex.id} className="flex justify-between">
                  <span>{ex.email}: {ex.startHour}:00–{ex.endHour}:00 IST</span>
                  <button type="button" className="text-danger text-xs cursor-pointer" onClick={() => apiDeleteScheduleException(ex.id).then(load)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <h2 className="text-sm font-semibold mb-2">Company holidays</h2>
            <p className="text-xs text-ink-muted mb-4">
              Holiday dates credit zero In Progress hours. Use YYYY-MM-DD in IST.
            </p>
            <form
              className="grid sm:grid-cols-2 gap-3 mb-4"
              onSubmit={async (e) => {
                e.preventDefault();
                await apiCreateHoliday(holidayDate, holidayName);
                toast('Holiday added', 'success');
                setHolidayDate('');
                setHolidayName('');
                reload();
              }}
            >
              <Input
                label="Date"
                type="date"
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
                required
              />
              <Input
                label="Name"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                placeholder="Independence Day"
                required
              />
              <Button type="submit" className="sm:col-span-2">
                Add holiday
              </Button>
            </form>
            <ul className="text-sm space-y-2">
              {holidays.length === 0 && <li className="text-ink-faint">No holidays yet.</li>}
              {holidays.map((h) => (
                <li key={h.id} className="flex justify-between">
                  <span>
                    {h.date} · {h.name}
                  </span>
                  <button
                    type="button"
                    className="text-danger text-xs cursor-pointer"
                    onClick={async () => {
                      await apiDeleteHoliday(h.id);
                      reload();
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        </>
      )}
    </div>
  );
}
