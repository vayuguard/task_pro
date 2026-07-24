import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  ToggleLeft, 
  ToggleRight, 
  Shield, 
  BellRing, 
  Sliders, 
  Database,
  Check
} from 'lucide-react';

export default function SettingsView() {
  const [notifSound, setNotifSound] = useState(true);
  const [autoVerify, setAutoVerify] = useState(true);
  const [developerLog, setDeveloperLog] = useState(false);
  const [defaultPoints, setDefaultPoints] = useState('5');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div id="settings-view-container" className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-64px)] max-w-4xl">
      <div>
        <h3 className="text-lg font-bold text-slate-900">TaskPro Preferences</h3>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">Fine-tune your personal and enterprise parameters</p>
      </div>

      <div className="space-y-6 bg-white border border-slate-200 p-6 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        
        {/* Settings Block 1 - General Notifications */}
        <div className="space-y-4">
          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <BellRing className="w-4 h-4 text-indigo-600" /> Notifications & Audio Alerts
          </h4>
          
          <div className="flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-slate-800">Direct Message Sound Effects</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Play a notification sound when coworkers submit mock chat messages</p>
            </div>
            <button 
              id="setting-toggle-notif-sound"
              onClick={() => setNotifSound(!notifSound)} 
              className="text-slate-500 cursor-pointer"
            >
              {notifSound ? (
                <ToggleRight className="w-10 h-10 text-slate-900" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* Settings Block 2 - Security Pipeline */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <Shield className="w-4 h-4 text-emerald-600" /> DevOps & Automated Integrations
          </h4>
          
          <div className="flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-slate-800">Automate QA Code Assertion Tests</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Deploy automatic checking mechanisms whenever tasks are slid to In Review stage</p>
            </div>
            <button 
              id="setting-toggle-auto-verify"
              onClick={() => setAutoVerify(!autoVerify)} 
              className="text-slate-500 cursor-pointer"
            >
              {autoVerify ? (
                <ToggleRight className="w-10 h-10 text-slate-900" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-slate-300" />
              )}
            </button>
          </div>

          <div className="flex justify-between items-center text-xs pt-2">
            <div>
              <p className="font-bold text-slate-800">Expose Telemetry Console Streams</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Toggle live system diagnostics logs for troubleshooting</p>
            </div>
            <button 
              id="setting-toggle-dev-log"
              onClick={() => setDeveloperLog(!developerLog)} 
              className="text-slate-500 cursor-pointer"
            >
              {developerLog ? (
                <ToggleRight className="w-10 h-10 text-slate-900" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* Settings Block 3 - Complexity Tuning */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <Sliders className="w-4 h-4 text-blue-600" /> Sprint Settings
          </h4>

          <div className="flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-slate-800">Default Task Points Weight</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Starting points bound to newly created tasks</p>
            </div>
            <select
              id="setting-points-select"
              value={defaultPoints}
              onChange={(e) => setDefaultPoints(e.target.value)}
              className="border border-slate-200 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-slate-900 outline-none cursor-pointer bg-white"
            >
              <option value="1">1 pt (Tiny)</option>
              <option value="3">3 pts (Medium-Low)</option>
              <option value="5">5 pts (Medium)</option>
              <option value="8">8 pts (High)</option>
              <option value="13">13 pts (Epic)</option>
            </select>
          </div>
        </div>

        {/* Settings Block 4 - Environment Metadata */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <Database className="w-4 h-4 text-purple-600" /> Environment Diagnostics
          </h4>
          <div className="grid grid-cols-2 gap-4 text-[11px] font-mono bg-slate-50 p-4 rounded-lg text-slate-600">
            <div>
              <p className="text-slate-400">SERVER STATUS</p>
              <p className="font-bold text-emerald-700">● COMPILING ONLINE</p>
            </div>
            <div>
              <p className="text-slate-400">INGRESS HOST</p>
              <p className="font-bold text-slate-800">http://0.0.0.0:3000</p>
            </div>
            <div>
              <p className="text-slate-400">RUNTIME PLATFORM</p>
              <p className="font-bold text-slate-800">React 19 + Tailwind v4</p>
            </div>
            <div>
              <p className="text-slate-400">VIRTUAL WORKSPACE</p>
              <p className="font-bold text-slate-800">TaskPro Enterprise Node</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center gap-4">
          <button
            id="settings-save-btn"
            onClick={handleSave}
            className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-sm"
          >
            Save Preferences
          </button>
          {isSaved && (
            <span id="settings-save-success-msg" className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" /> System credentials saved successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
