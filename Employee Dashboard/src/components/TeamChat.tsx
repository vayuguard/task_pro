import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, TeamMember } from '../types';
import { Send, Hash, Users, MessageSquare, Info } from 'lucide-react';

interface TeamChatProps {
  initialMessages: ChatMessage[];
  teamMembers: TeamMember[];
}

export default function TeamChat({ initialMessages, teamMembers }: TeamChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [selectedChannel, setSelectedChannel] = useState('#design-system');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or channel switch
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChannel, isTyping]);

  const channels = ['#general', '#design-system', '#platform-modernization'];

  const filteredMessages = messages.filter(m => m.channel === selectedChannel);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: `chat-user-${Date.now()}`,
      channel: selectedChannel,
      author: 'Alex Rivera',
      role: 'Product Designer',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT1jtDA7el1WpSvRQpYrCb4gOoavKhjM8ckwZ5geOgJclzrsJ8MLETWnDpYogNDGdn42U4dL6HjC0945Fqvf61PkuVw0ZiVtTgrn2Gx5c6YPEkEeP7Bx_A93_YtNuuXYfEPUGskKYz_1OkiCMkLpoGaozUDBADf-1M4lS_mYxX0iU0JJwFrIF_6Zf6nYTXV5wnMU5GetDRf1ANE7oMqR-Wdhx-8LyagWiiJuXTUCHIns3R1M7Llq9-IFZmrBvu32tHEBRNNEqNODOa',
      content: inputText.trim(),
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMessage]);
    const typedText = inputText.trim();
    setInputText('');

    // Simulated reply based on channel
    triggerSimulatedReply(selectedChannel, typedText);
  };

  const triggerSimulatedReply = (channel: string, userText: string) => {
    let responder: TeamMember | undefined;
    let replyContent = '';

    if (channel === '#design-system') {
      responder = teamMembers.find(m => m.name === 'Sarah Chen');
      replyContent = `Thanks for updating the spec, @Alex! I am checking out the slate variables right now. Fits our brand and accessibility standards perfectly.`;
    } else if (channel === '#platform-modernization') {
      responder = teamMembers.find(m => m.name === 'Lila Vance');
      replyContent = `Acknowledged. I'm verifying our container scaling configurations and memory limits. I will post a summary here once completed.`;
    } else {
      responder = teamMembers.find(m => m.name === 'Marcus Thorne');
      replyContent = `Good point, @Alex. Let's make sure this is added as a blocker reference in the next backlog sync. I'll flag it.`;
    }

    if (!responder) return;

    // Wait 1.2 seconds, set typing indicator
    setTimeout(() => {
      setIsTyping(`${responder.name} is typing...`);
      
      // Wait another 1.8 seconds, append response
      setTimeout(() => {
        setIsTyping(null);
        const replyMessage: ChatMessage = {
          id: `chat-reply-${Date.now()}`,
          channel: channel,
          author: responder.name,
          role: responder.role,
          avatar: responder.avatar,
          content: replyContent,
          timestamp: 'Just now'
        };
        setMessages(prev => [...prev, replyMessage]);
      }, 1600);

    }, 800);
  };

  return (
    <div className="flex border border-slate-200 rounded-xl h-[calc(100vh-120px)] overflow-hidden bg-white shadow-sm animate-fadeIn">
      
      {/* Channels List (Left bar) */}
      <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col h-full">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <MessageSquare size={14} className="text-slate-400" />
            Slack Channels
          </h3>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {channels.map(chan => {
            const isSelected = selectedChannel === chan;
            const channelMsgCount = messages.filter(m => m.channel === chan).length;
            return (
              <button
                key={chan}
                onClick={() => setSelectedChannel(chan)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-left cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-slate-900 text-white font-bold shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Hash size={14} className={isSelected ? 'text-blue-400' : 'text-slate-400'} />
                  {chan.replace('#', '')}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {channelMsgCount}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Directory details */}
        <div className="p-4 border-t border-slate-200 bg-white space-y-3">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Users size={12} />
            Members ({teamMembers.length})
          </h4>
          <div className="space-y-2">
            {teamMembers.map(m => (
              <div key={m.id} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <div className="relative">
                  <img src={m.avatar} alt={m.name} referrerPolicy="no-referrer" className="w-5.5 h-5.5 rounded-full object-cover" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
                </div>
                <span className="truncate">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Feed (Right pane) */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        {/* Channel Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <Hash size={18} className="text-slate-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">{selectedChannel.replace('#', '')} channel</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Active team collaboration chat for specifications review.</p>
            </div>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          {filteredMessages.map((msg) => {
            const isMe = msg.author === 'Alex Rivera';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-2xl ${isMe ? 'ml-auto flex-row-reverse text-right' : ''}`}
              >
                <img 
                  src={msg.avatar} 
                  alt={msg.author} 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 mt-0.5 flex-shrink-0" 
                />
                <div>
                  <div className={`flex items-baseline gap-2 text-[11px] ${isMe ? 'justify-end' : ''}`}>
                    <span className="font-bold text-slate-800">{msg.author}</span>
                    <span className="text-[9px] text-slate-400 font-semibold">{msg.timestamp}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold leading-none mt-0.5">{msg.role}</p>
                  
                  <div className={`mt-1.5 p-3 rounded-2xl text-xs leading-relaxed inline-block text-left ${
                    isMe 
                      ? 'bg-blue-500 text-white rounded-tr-none' 
                      : 'bg-slate-100 text-slate-700 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-center text-xs text-slate-400 italic">
              <div className="flex gap-1 items-center bg-slate-100 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="font-semibold text-[11px]">{isTyping}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat input box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex gap-2.5 bg-white flex-shrink-0">
          <input 
            type="text" 
            required
            placeholder={`Message ${selectedChannel}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping !== null}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all placeholder-slate-400 disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || isTyping !== null}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white rounded-xl px-4 py-2 flex items-center justify-center transition-all cursor-pointer"
          >
            <Send size={14} />
          </button>
        </form>

      </div>

    </div>
  );
}
