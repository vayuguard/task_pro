import React, { useState, useEffect, useRef } from "react";
import { Member, ChatMessage } from "../types";
import { 
  Send, Hash, Users, MessageSquare, Sparkles, 
  Bot, Clock, HelpCircle, Check, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TeamChatProps {
  members: Member[];
  currentMemberId: string;
}

export default function TeamChat({ members, currentMemberId }: TeamChatProps) {
  const [channels] = useState([
    { id: "general", name: "general", desc: "Sprint Announcements and General Alignment" },
    { id: "dev-migration", name: "dev-migration", desc: "Technical discussions on REST API v3 and Infrastructure" },
    { id: "design-system", name: "design-system", desc: "Design System Accessibility (MFA and Contrast audits)" },
    { id: "marketing-q4", name: "marketing-q4", desc: "Q4 Content calendar and strategic presentation deck feedback" }
  ]);
  const [activeChannel, setActiveChannel] = useState("dev-migration");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  const currentUser = members.find(m => m.id === currentMemberId) || members[0];
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Poll server for chat history of the active channel
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${activeChannel}`);
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error("Failed to load chat:", err);
    }
  };

  // Poll chat every 3 seconds to keep it live!
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeChannel]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  // Submit Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText("");

    // Setup Optimistic local message
    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      channel: activeChannel,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatarUrl,
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, tempMsg]);

    // Check if pinging AI to show the typing loader
    const isAiPing = messageText.includes("@PM-AI");
    if (isAiPing) {
      setIsAiTyping(true);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: activeChannel,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatarUrl,
          content: messageText
        })
      });
      const result = await response.json();
      
      // If AI will respond, we refresh multiple times to fetch the reply
      if (result.aiWillRespond) {
        // Poll for 2.5 seconds to pull the reply
        setTimeout(async () => {
          await fetchMessages();
          setIsAiTyping(false);
        }, 2200);
      }
    } catch (err) {
      console.error(err);
      setIsAiTyping(false);
    }
  };

  return (
    <div id="team-chat-view" className="flex border border-slate-200 rounded-xl overflow-hidden shadow-xs h-[540px] bg-white">
      {/* Channels Sidebar Panel */}
      <div className="w-[220px] bg-slate-50 border-r border-slate-100 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-5">
          {/* Section: Channels */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Channels</p>
            <nav className="space-y-1">
              {channels.map(chan => (
                <button
                  key={chan.id}
                  onClick={() => setActiveChannel(chan.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeChannel === chan.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-200/50"
                  }`}
                >
                  <Hash size={13} className={activeChannel === chan.id ? "text-white" : "text-slate-400"} />
                  <span className="truncate">{chan.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Section: Colleague Status Presence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <span>Sprint Team</span>
              <span className="bg-slate-200/50 text-slate-600 px-1 py-0.2 rounded font-mono font-bold text-[8px]">
                {members.length} Online
              </span>
            </div>
            <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-2">
                  <div className="relative">
                    <img src={m.avatarUrl} alt={m.name} className="w-5.5 h-5.5 rounded-full object-cover" />
                    <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-emerald-500 border border-white rounded-full"></span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-700 truncate">{m.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Assistant Help Notice */}
        <div className="bg-slate-900 text-white p-3 rounded-lg space-y-1">
          <p className="text-[9px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
            <Sparkles size={10} />
            AI Bot Activated
          </p>
          <p className="text-[10px] text-slate-300 leading-normal">
            Ping **@PM-AI** in message to request instant board reviews or summaries!
          </p>
        </div>
      </div>

      {/* Message Streaming Canvas */}
      <div className="flex-1 flex flex-col justify-between h-full bg-white relative">
        {/* Header Info */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Hash size={15} className="text-slate-400" />
              {activeChannel}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
              {channels.find(c => c.id === activeChannel)?.desc}
            </p>
          </div>
        </div>

        {/* Message Streams List Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, idx) => {
            const isAi = msg.senderId === "ai-pm";
            return (
              <div 
                key={msg.id || idx} 
                className={`flex gap-3 text-left ${
                  isAi ? "bg-indigo-50/30 border border-indigo-50/50 p-3.5 rounded-xl" : ""
                }`}
              >
                <img src={msg.senderAvatar} alt={msg.senderName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                      {msg.senderName}
                      {isAi && (
                        <span className="bg-indigo-100 text-indigo-700 text-[8px] px-1 py-0.2 rounded font-bold uppercase tracking-wider flex items-center gap-0.5">
                          <Bot size={8} /> Bot
                        </span>
                      )}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium font-mono">{msg.timestamp}</span>
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}

          {/* AI is Typing Pulse Loader */}
          {isAiTyping && (
            <div className="flex gap-3 text-left bg-indigo-50/30 border border-indigo-50/50 p-3.5 rounded-xl animate-pulse">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-indigo-600 shrink-0">
                <Loader2 size={16} className="animate-spin" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-xs">PM-AI (Project Manager)</span>
                  <span className="bg-indigo-100 text-indigo-700 text-[8px] px-1 py-0.2 rounded font-bold uppercase tracking-wider">Bot Typing...</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-semibold">
                  <span>Reviewing task completion velocities and drafting response parameters...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-slate-50/30 flex gap-2">
          <input
            type="text"
            required
            placeholder="Type your message here... (use @PM-AI to request status audits)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 text-xs border border-slate-200 rounded px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          <button
            type="submit"
            className="p-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
