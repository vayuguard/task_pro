import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { teamMembers } from '../initialData';

interface TeamChatViewProps {
  currentUser: User;
}

interface ChatMessage {
  id: string;
  sender: User;
  text: string;
  timestamp: string;
}

export default function TeamChatView({ currentUser }: TeamChatViewProps) {
  const [activeChannel, setActiveChannel] = useState('#website-redesign-auth');
  const [channels, setChannels] = useState([
    { name: '#website-redesign-auth', description: 'Multi-factor and login flow updates', unread: false },
    { name: '#devops-security', description: 'CI/CD pipeline and secrets audit', unread: true },
    { name: '#billing-stripe', description: 'Stripe transaction hooks and logs', unread: false },
    { name: '#general', description: 'General announcements and company discussion', unread: false }
  ]);

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    '#website-redesign-auth': [
      {
        id: '1',
        sender: teamMembers[1], // Sarah
        text: "Did we verify if Google Authenticator works flawlessly on iOS devices too?",
        timestamp: "10:15 AM"
      },
      {
        id: '2',
        sender: teamMembers[0], // Marcus
        text: "Yes, standard 6-digit RFC 6238 TOTP validation has been verified on both iOS and Android. It passes beautifully.",
        timestamp: "10:18 AM"
      },
      {
        id: '3',
        sender: teamMembers[2], // Alex
        text: "Perfect! I've linked the PDF spec in Task-102 so the security team has all crypto reference parameters recorded.",
        timestamp: "10:20 AM"
      }
    ],
    '#devops-security': [
      {
        id: '1',
        sender: teamMembers[0], // Marcus
        text: "CI/CD setup is green! All PRs to main are now running automated test runners in parallel.",
        timestamp: "Yesterday"
      }
    ],
    '#billing-stripe': [
      {
        id: '1',
        sender: teamMembers[2], // Alex
        text: "Stripe billing webhooks registered on staging! Going to test subscription event relays next.",
        timestamp: "3h ago"
      }
    ],
    '#general': [
      {
        id: '1',
        sender: teamMembers[1], // Sarah
        text: "Reminding everyone that the Q4 Compliance Audit sign-off is on Friday. Let's make sure all high-priority tasks are closed!",
        timestamp: "Yesterday"
      }
    ]
  });

  const [inputVal, setInputVal] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const channelMsgs = messages[activeChannel] || [];
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: currentUser,
      text: inputVal.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages({
      ...messages,
      [activeChannel]: [...channelMsgs, newMsg]
    });

    const userTyped = inputVal.trim();
    setInputVal('');

    // Simulated responsive reply from team members!
    setTimeout(() => {
      const replies = [
        "Sounds good! Let's get that documented in our sprint files.",
        "Understood. I will cross-reference that with the milestone requirements right away.",
        "Excellent point! Let's check if the unit tests cover this branch.",
        "Awesome progress! Let's schedule a brief sync tomorrow to sign off on this."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      
      const responder = activeChannel.includes('security') 
        ? teamMembers[0] // Marcus
        : teamMembers[1]; // Sarah

      const replyMsg: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: responder,
        text: `@${currentUser.name} ${randomReply}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => ({
        ...prev,
        [activeChannel]: [...(prev[activeChannel] || []), replyMsg]
      }));
    }, 1800);
  };

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full h-[calc(100vh-64px)] overflow-hidden bg-white select-none">
      
      {/* Channels Sidebar List */}
      <aside className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Corporate Channels</h3>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {channels.map((chan) => {
            const isActive = activeChannel === chan.name;
            return (
              <button
                key={chan.name}
                onClick={() => {
                  setActiveChannel(chan.name);
                  // clear unread indicator
                  setChannels(channels.map(c => c.name === chan.name ? { ...c, unread: false } : c));
                }}
                className={`w-full text-left p-3 rounded-lg flex flex-col gap-0.5 transition-colors cursor-pointer ${
                  isActive ? 'bg-[#131b2e] text-white' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-bold font-mono">{chan.name}</span>
                  {chan.unread && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
                  )}
                </div>
                <span className={`text-[10px] truncate ${isActive ? 'text-[#7c839b]' : 'text-slate-400'}`}>
                  {chan.description}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Discussion Thread Panel */}
      <section className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Channel Info header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/40 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-mono">{activeChannel}</h3>
            <p className="text-[10px] text-slate-500">
              {channels.find((c) => c.name === activeChannel)?.description}
            </p>
          </div>
          <span className="text-[10px] font-semibold text-[#45464d] bg-white border border-slate-200 px-2.5 py-1 rounded-full">
            {teamMembers.length} Members Online
          </span>
        </div>

        {/* Message streams (Scrollable) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-slate-50/20">
          {(messages[activeChannel] || []).map((msg) => {
            const isMe = msg.sender.name === currentUser.name;
            return (
              <div key={msg.id} className={`flex gap-4 max-w-2xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                <img
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 self-start"
                  src={msg.sender.avatar}
                  alt={msg.sender.name}
                  referrerPolicy="no-referrer"
                />
                
                <div className="flex flex-col gap-1.5">
                  <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs font-bold text-slate-900">{msg.sender.name}</span>
                    <span className="text-[9px] text-[#76777d]">{msg.timestamp}</span>
                  </div>
                  
                  <div className={`p-4 rounded-xl text-sm leading-relaxed ${
                    isMe 
                      ? 'bg-[#131b2e] text-white rounded-tr-none' 
                      : 'bg-white border border-[#c6c6cd] text-slate-800 rounded-tl-none shadow-3xs'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatBottomRef}></div>
        </div>

        {/* Bottom Typing Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 shrink-0 bg-white">
          <div className="flex items-center gap-2 border border-[#c6c6cd] rounded-xl px-4 py-2 bg-slate-50/50 focus-within:ring-2 focus-within:ring-[#131b2e] focus-within:bg-white transition-all">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={`Message ${activeChannel}... (Sarah or Marcus will respond!)`}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1.5 focus:outline-none text-slate-800"
            />
            
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="bg-[#131b2e] text-white hover:bg-slate-800 p-2 rounded-lg font-bold flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer shrink-0"
              title="Send Message"
            >
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
