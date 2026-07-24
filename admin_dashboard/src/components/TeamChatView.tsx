import { useState, useRef, useEffect, useMemo, FormEvent } from 'react';
import { Channel, Message } from '../types';

interface TeamChatViewProps {
  channels: Channel[];
  messages: Message[];
  onSendMessage: (channelId: string, text: string) => void;
  onClearUnreads: (channelId: string) => void;
  onReceiveSimulatedMessage: (channelId: string, user: string, role: string, avatar: string, text: string) => void;
}

export default function TeamChatView({
  channels,
  messages,
  onSendMessage,
  onClearUnreads,
  onReceiveSimulatedMessage
}: TeamChatViewProps) {
  const [selectedChannelId, setSelectedChannelId] = useState(channels[1]?.id || channels[0]?.id || '');
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Clear unreads when switching channels
  useEffect(() => {
    if (selectedChannelId) {
      onClearUnreads(selectedChannelId);
    }
  }, [selectedChannelId]);

  // Find active channel
  const activeChannel = useMemo(() => {
    return channels.find(c => c.id === selectedChannelId);
  }, [channels, selectedChannelId]);

  // Filter messages for active channel
  const activeMessages = useMemo(() => {
    return messages.filter(m => m.channelId === selectedChannelId);
  }, [messages, selectedChannelId]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChannelId) return;

    const userText = inputText.trim();
    onSendMessage(selectedChannelId, userText);
    setInputText('');

    // Trigger simulated response
    setTimeout(() => {
      let replyUser = 'Sarah Chen';
      let replyRole = 'Lead Engineer';
      let replyAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120';
      let replyText = 'Understood! I am syncing our pipeline nodes to verify those adjustments right now.';

      if (activeChannel?.name === 'security-alerts') {
        replyUser = 'Cloud Sentinel';
        replyRole = 'Automated Bot';
        replyAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120';
        replyText = 'WARNING RESOLVED: Threat packets neutralized. Double-checking firewall blackhole list configurations.';
      } else if (activeChannel?.name === 'general') {
        replyUser = 'Marcus Thorne';
        replyRole = 'Chief Operations';
        replyAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120';
        replyText = 'Splendid progression team. Let\'s make sure these SLA targets are aligned before the weekend standup.';
      } else if (activeChannel?.name === 'product-updates') {
        replyUser = 'Emily Rose';
        replyRole = 'Product Director';
        replyAvatar = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120';
        replyText = 'Excellent! Adding these token specs directly to the Q3 design documentation staging branch.';
      }

      onReceiveSimulatedMessage(selectedChannelId, replyUser, replyRole, replyAvatar, replyText);
    }, 1500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden grid grid-cols-12 h-[calc(100vh-140px)] animate-fade-in shadow-sm">
      
      {/* Channels Explorer Sidebar */}
      <div className="col-span-12 md:col-span-4 border-r border-slate-200 flex flex-col justify-between bg-slate-50/50">
        <div>
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sky-500 text-base">forum</span>
              <span>Team Channels</span>
            </h4>
          </div>

          <nav className="p-2 space-y-1">
            {channels.map((chan) => {
              const isSelected = chan.id === selectedChannelId;
              return (
                <button
                  key={chan.id}
                  onClick={() => setSelectedChannelId(chan.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left text-xs font-semibold transition-all border-none ${
                    isSelected
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-400 font-mono">#</span>
                    <span>{chan.name}</span>
                  </div>
                  {chan.unreadCount > 0 && !isSelected && (
                    <span className="bg-rose-500 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-full">
                      {chan.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Channels sidebar bottom footer */}
        <div className="p-4 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 text-center">
          Secure Tunnel • AES-256
        </div>
      </div>

      {/* Main Chat Conversation Thread */}
      <div className="col-span-12 md:col-span-8 flex flex-col justify-between bg-white h-full">
        
        {/* Chat Thread Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/20 flex justify-between items-center shrink-0">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1">
              <span className="font-mono text-slate-400">#</span>
              <span>{activeChannel?.name || 'select-channel'}</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeChannel?.name === 'engineering' && 'Discussion regarding AWS server containers, DB replication, and CI pipelines.'}
              {activeChannel?.name === 'general' && 'General updates, announcements, and executive board reviews.'}
              {activeChannel?.name === 'product-updates' && 'Visual assets review, token libraries, and stakeholder logs.'}
              {activeChannel?.name === 'security-alerts' && 'Automated system warnings, intrusion blacklists, and SSL checks.'}
            </p>
          </div>
        </div>

        {/* Message Feeds content area scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeMessages.length > 0 ? (
            activeMessages.map((msg) => (
              <div key={msg.id} className="flex gap-3 text-sm items-start">
                <img
                  src={msg.avatar}
                  alt={msg.user}
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0"
                />
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-slate-800 text-xs">{msg.user}</span>
                    <span className="text-[9px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.2 rounded font-sans uppercase tracking-wide">
                      {msg.userRole}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-medium pl-1">{msg.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans pr-4">{msg.text}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs">
              <span className="material-symbols-outlined text-4xl mb-1 text-slate-200">chat_bubble</span>
              <p>No communications recorded inside channel database ledger.</p>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Message Input Drawer Form shrink-0 */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-slate-50/50 flex gap-3 shrink-0">
          <input
            type="text"
            required
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message #${activeChannel?.name || 'channel'}...`}
            className="flex-1 px-3.5 py-2.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-400 text-slate-800 placeholder-slate-300"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow flex items-center gap-1.5 hover:shadow-md"
          >
            <span>Send</span>
            <span className="material-symbols-outlined text-sm font-bold">send</span>
          </button>
        </form>

      </div>
    </div>
  );
}
