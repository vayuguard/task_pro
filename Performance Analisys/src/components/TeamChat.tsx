import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Hash, 
  Send, 
  Users, 
  Sparkles,
  Info,
  Laptop
} from 'lucide-react';
import { ChatMessage, Employee } from '../types';

interface ChatProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  currentUser: { name: string; role: string; avatar: string; id: string | null };
  employees: Employee[];
}

export default function TeamChat({ messages, setMessages, currentUser, employees }: ChatProps) {
  const [activeChannel, setActiveChannel] = useState('#general');
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingColleague, setTypingColleague] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const channels = ['#general', '#project-alpha', '#morale-booster', '#dev-ops', '#qa-automation'];

  // Scroll to bottom of chat when messages or activeChannel changes
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel, isTyping]);

  const activeMessages = useMemo(() => {
    return messages.filter(msg => msg.channel === activeChannel);
  }, [messages, activeChannel]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedText.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id || 'user-sj',
      senderName: currentUser.name,
      senderInitials: currentUser.name.split(' ').map(n => n[0]).join(''),
      senderBg: 'bg-slate-900',
      text: typedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: activeChannel
    };

    setMessages(prev => [...prev, userMessage]);
    const originalInput = typedText;
    setTypedText('');

    // Colleague simulated response logic!
    setIsTyping(true);
    // Pick a random colleague to reply
    const randomColleague = employees[Math.floor(Math.random() * employees.length)];
    setTypingColleague(randomColleague.name);

    setTimeout(() => {
      let replyText = `Thanks for sharing, ${currentUser.name}! Let's capture that as a formal task point on the Kanban board.`;
      
      const lowerInput = originalInput.toLowerCase();
      if (lowerInput.includes('status') || lowerInput.includes('migration')) {
        replyText = `Great point! The Cloud Migration containers on port 3000 are currently 90% synchronized. I will trigger the automated verification pipeline.`;
      } else if (lowerInput.includes('design') || lowerInput.includes('ui') || lowerInput.includes('figma')) {
        replyText = `Awesome! I completely agree with the UI layout polish. Let's make sure our contrast ratios and bento structures comply with WCAG 2.1 specifications.`;
      } else if (lowerInput.includes('coffee') || lowerInput.includes('morale') || lowerInput.includes('lunch')) {
        replyText = `Haha totally agree! Break time! I am grabbing a double espresso from the breakroom. Who's in? ☕️`;
      } else if (lowerInput.includes('test') || lowerInput.includes('bugs') || lowerInput.includes('qa')) {
        replyText = `I am reviewing the failure logs in chrome-headless right now. Let me push an updated container build shortly.`;
      }

      const colleagueMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: randomColleague.id,
        senderName: randomColleague.name,
        senderInitials: randomColleague.initials,
        senderBg: randomColleague.avatarBg,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: activeChannel
      };

      setMessages(prev => [...prev, colleagueMessage]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div id="chat-workspace-container" className="grid grid-cols-1 md:grid-cols-4 h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Channels Sidebar List */}
      <div id="chat-channels-sidebar" className="md:col-span-1 bg-slate-900 text-white p-5 space-y-6 border-r border-slate-800 flex flex-col h-full">
        <div>
          <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Users className="w-3.5 h-3.5" /> Workspace Channels
          </h4>
          
          <div className="space-y-1">
            {channels.map(chan => (
              <button
                id={`channel-btn-${chan.replace('#', '')}`}
                key={chan}
                onClick={() => setActiveChannel(chan)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
                  activeChannel === chan 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                }`}
              >
                <Hash className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{chan}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Help box */}
        <div className="mt-auto bg-slate-800/40 p-3.5 rounded-lg border border-slate-800 space-y-1.5 text-[10px]">
          <p className="font-bold text-slate-300 flex items-center gap-1">
            <Info className="w-3 h-3 text-indigo-400" /> Coworker Chat Simulator
          </p>
          <p className="text-slate-400 leading-normal">
            Type anything in the chat! Colleagues like <b>Alex</b>, <b>Marcus</b>, or <b>Sarah Chen</b> will respond in real-time depending on keywords.
          </p>
        </div>
      </div>

      {/* Primary Message Stream */}
      <div id="chat-stream-column" className="md:col-span-3 bg-white flex flex-col h-full relative">
        
        {/* Channel top bar */}
        <div className="h-14 border-b border-slate-100 flex items-center px-6 justify-between flex-shrink-0">
          <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <Hash className="w-4 h-4 text-slate-500" />
            {activeChannel}
          </h4>
          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
            <Laptop className="w-3.5 h-3.5 text-slate-400" /> Port 3000 Ingress Routing Active
          </span>
        </div>

        {/* Message container scroll list */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {activeMessages.map((msg) => (
            <div id={`chat-msg-${msg.id}`} key={msg.id} className="flex gap-4 items-start text-xs max-w-3xl leading-snug">
              <div className={`w-8 h-8 rounded-full ${msg.senderBg || 'bg-slate-700'} text-white flex items-center justify-center font-bold shadow-xs flex-shrink-0`}>
                {msg.senderInitials}
              </div>
              
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{msg.senderName}</span>
                  <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                </div>
                <p className="text-slate-600 bg-slate-50/70 border border-slate-100 p-3 rounded-2xl inline-block leading-relaxed">
                  {msg.text}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-4 items-start text-xs max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs flex-shrink-0 animate-pulse">
                ...
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-400 italic">{typingColleague} is typing...</span>
                <div className="flex gap-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 w-16 items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Send message form bar */}
        <form id="chat-send-form" onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex gap-2 flex-shrink-0">
          <input
            id="chat-composer-input"
            type="text"
            placeholder={`Message ${activeChannel}...`}
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-400 bg-slate-50 focus:bg-white transition-all"
          />
          <button
            id="chat-send-submit"
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white p-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
