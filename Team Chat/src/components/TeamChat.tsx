import React, { useState, useEffect, useRef } from "react";
import { 
  PlusCircle, 
  Search, 
  Star, 
  UserPlus, 
  Info, 
  Paperclip, 
  Smile, 
  Send, 
  Download, 
  FileText, 
  Pin, 
  X,
  Sparkles,
  Bold,
  Italic,
  Code,
  Link,
  MessageSquare,
  ChevronRight,
  Eye,
  File
} from "lucide-react";
import { Message, Channel, Member, FileAttachment } from "../types";

interface TeamChatProps {
  onTasksUpdated?: () => void;
}

export default function TeamChat({ onTasksUpdated }: TeamChatProps) {
  const [channels] = useState<Channel[]>([
    { id: "general", name: "general", description: "Company-wide announcements and general chatter." },
    { id: "project-alpha", name: "project-alpha", description: "Central coordination for the Alpha Release. Keep it focused." },
    { id: "emergency", name: "emergency", description: "Critical system alerts and urgent server issues." },
  ]);

  const [activeChannelId, setActiveChannelId] = useState<string>("project-alpha");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hardlinked avatars from the user's template
  const avatars = {
    user: "https://lh3.googleusercontent.com/aida-public/AB6AXuC094eM06sW5W0zl9Qc6ZEH3Mc66wfumLvkjiUFBlVKnQV8ct9IbJuXYpYWRoYuhkaJgLHqCUxVi7GdNb5y3fQ4lbXPPTALfvX3euW1KhZlyultm0Ma-HDtYs-5iVEbdJxZuBAoElJB3JEFe1MiWLxB2HHT-Lm2DVIn_1KIRO9ekTLFIKtjnNG8uVTtxKLHJlQDzJRM9fXYJCZ9eIdJCl_JdMCOyxLcpA16UBAiDObFQckmyGXezstzbHwZAXPNuXXVMzDralR_hJqa",
    alex: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlkP6S61HDnanPNbAvqmcVUm38u9wh4DmKCq5YymooHJKnJBFruprlJSdSUnSlCNNc7Jg5z2cPddSCtfNOK_kUDnuDQhxSVuZX4Jsd9EdEfqpQKi6ajVUPS7brHFb-shUGlYjDoVNrzYUa_svi5NY_TavTzNMTupXoenXDUPpaX6dhgAsre7sZoGbB603ziJReZeptO_U4clqfVmd8rLN4e38shLBMnj2CE7vrH7Po1xuQwK7qgEmXVTa9sm2Vxs8qL6OzEfK64npc",
    sarah: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBn_a936c4V2fw_LZlU-So4eUga12Eu-kSiEOP7T3dBL6toBiNIiQhsYlPga2xy6b0h-Q5yFX0dB8gugjuSVUqOGf_jvZIBhlZ6ecCgbDrXQtXO2WzhNSvQls4GwBzlXmursud96odF3gszXCOF0j4M3TzOQ8zAXMJhWJp3vF7XJ5v3UY3C8xXuOnCSCxymULpv3j64EaxfBxfyEGtqr3lCMyIzf7xLo36PrWitw19uvKTIZbag086UcHzI3SPIH87RIFB2Zq2ofFx",
    david: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmmzscXXNoFV78sRKoANk0xATK3-DoSTKorkoz4S1QwNfTt3gCiFrZxn3BZyVVJiLdgBvzNrQmd5DujjIBg-98y8diX7WqCbi6LDjCLpk5VfguzoIRmwfVQMxnWE9aDBBVimgeJ9fVB3o5DMS2v8P-qjjbiC3oO_wnLA81xXoT6zcA4KbycCa6FfH14_OAkihP6ln-KprxYwARFGYuPI87Im5a8FQCk9Ice-X2EGHlDtQsp_IWK61R2UrfXufCzmqsunL0zwSd1Y8S",
    gemini: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80",
    member1: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJumQBgUPZvVdAx7dPP9b1l44hN-ldelbRMfF8Tg7IsmyniF_6KwsOnN4x5joI0cIqNN1kBVvFEoPXt75U0MuJyyNeD1QVrgkB8CdZbcljGKVkMtbKr5ZxUPm-IiRMGuFuj50I7qnId-hyfLegEXwUuxYl2t9pNtdobupvLmqhurSJyT8tn9oiMULQ1FbTGds5tYaRr4pDfS5IrtrWlyCYF8nzZn-CIpzqOtIjWF0XFX1bK0PMJFOOhGMCpfvoyJFL0is-q8Ws6WoK",
    member2: "https://lh3.googleusercontent.com/aida-public/AB6AXuCm-3UFK8IkJHEqEJBdAnErXOi0DH33azjw8RTtGS7vLeBlmHcR39pbRRZ4nILYB_z4m2kkfX2IDq6F3xag3PpEE9Q2p4IYALgunhJy6si0Bgq2PQ3m938qUdze1rJdz5MX-K2yd0Ctqc1bKpFts5UUptfr73AwR1wQHYbQ8nUlC-AqARM3xfCzIFQZzWkIzx18MtJA7TRg1Sh4GfyP8X98z5Kpq92DF4VyR111GDlLbsT-ixVTGBBgfLncq1gvvI_eC91RU7mQrSVB"
  };

  const members: Member[] = [
    { id: "alex", name: "Alex Rivers", avatar: avatars.alex, status: "online", textStatus: "Reviewing the PR now..." },
    { id: "sarah", name: "Sarah Chen", avatar: avatars.sarah, status: "online", textStatus: "Design files are ready." },
    { id: "david", name: "David Miller", avatar: avatars.david, status: "offline", textStatus: "Last seen 2h ago" },
  ];

  // Fetch messages from server on mount or channel switch
  useEffect(() => {
    fetch(`/api/messages/${activeChannelId}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        scrollToBottom();
      })
      .catch(err => console.error("Error loading messages:", err));
  }, [activeChannelId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async (textToSend?: string, attachment?: FileAttachment) => {
    const textContent = textToSend !== undefined ? textToSend : messageText;
    if (!textContent.trim() && !attachment) return;

    if (textContent.trim().toLowerCase().includes("gemini") || activeChannelId === "gemini-ai") {
      setIsTyping(true);
    }

    // Prepare message payload
    const payload = {
      text: textContent,
      senderName: "User",
      senderAvatar: avatars.user,
      fileAttachment: attachment,
      isSentByMe: true
    };

    try {
      const response = await fetch(`/api/messages/${activeChannelId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      // Refresh message logs
      // Server returns both user message and AI co-worker message if applicable
      setMessages(prev => {
        const next = [...prev, data.userMsg];
        if (data.aiMsg) {
          next.push(data.aiMsg);
        }
        return next;
      });

      if (!textToSend) {
        setMessageText("");
      }
      setIsTyping(false);
      scrollToBottom();

      if (onTasksUpdated && (textContent.toLowerCase().includes("task") || textContent.toLowerCase().includes("added"))) {
        onTasksUpdated();
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const triggerAttachmentSelection = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileSizeString = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${(file.size / 1024).toFixed(0)} KB`;
      
      const attachment: FileAttachment = {
        name: file.name,
        size: fileSizeString,
        type: file.type.includes("pdf") ? "PDF Document" : "Image File"
      };

      handleSendMessage(`📎 Uploaded shared attachment: ${file.name}`, attachment);
    }
  };

  const formatText = (style: 'bold' | 'italic' | 'code' | 'link') => {
    if (style === 'bold') {
      setMessageText(p => `**${p}**`);
    } else if (style === 'italic') {
      setMessageText(p => `_${p}_`);
    } else if (style === 'code') {
      setMessageText(p => `\`${p}\``);
    } else if (style === 'link') {
      setMessageText(p => `[${p}](https://)`);
    }
  };

  const activeChannel = channels.find(c => c.id === activeChannelId) || {
    id: "gemini-ai",
    name: "gemini-ai",
    description: "Your fully functional generative AI assistant and co-worker."
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.textStatus?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="team-chat-view" className="flex-1 flex overflow-hidden h-full bg-white font-sans">
      {/* Channels Sidebar List */}
      <aside className="w-72 bg-surface-container-lowest border-r border-outline-variant flex flex-col h-full flex-shrink-0">
        <div className="p-6 overflow-y-auto hide-scrollbar flex-1">
          {/* Channels Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Channels</h3>
              <button 
                id="btn-add-channel"
                className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                title="Add Channel"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-1">
              {channels.map((chan) => {
                const isActive = activeChannelId === chan.id;
                return (
                  <li key={chan.id}>
                    <button
                      id={`channel-link-${chan.id}`}
                      onClick={() => setActiveChannelId(chan.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                        isActive 
                          ? "bg-secondary-fixed/30 text-on-secondary-fixed font-semibold"
                          : chan.id === "emergency" 
                            ? "text-error hover:bg-error/5" 
                            : "text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      <span className="font-mono text-xs opacity-50">#</span>
                      <span className="truncate">{chan.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Direct Messages Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Direct Messages</h3>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60" />
                <input 
                  type="text" 
                  placeholder="Filter..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-surface-container-low border-none rounded-md px-2 py-0.5 pr-6 text-xs w-24 focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>

            <ul className="space-y-2">
              {/* Gemini Co-worker Contact */}
              <li 
                id="dm-link-gemini"
                onClick={() => setActiveChannelId("gemini-ai")}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  activeChannelId === "gemini-ai" ? "bg-secondary-fixed/30 font-semibold" : "hover:bg-surface-container"
                }`}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-violet-100 border border-violet-200 flex items-center justify-center">
                    <Sparkles className="w-4.5 h-4.5 text-violet-600 animate-pulse" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-violet-500 rounded-full border-2 border-white"></span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-violet-950 flex items-center gap-1">
                    Gemini AI 
                    <span className="text-[9px] bg-violet-100 text-violet-700 px-1 rounded font-bold font-sans uppercase">Co-Worker</span>
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">Generative Technical Assistant</p>
                </div>
              </li>

              {filteredMembers.map((member) => {
                const isActive = activeChannelId === member.id;
                return (
                  <li 
                    id={`dm-link-${member.id}`}
                    key={member.id}
                    onClick={() => setActiveChannelId(member.id)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      isActive ? "bg-secondary-fixed/30 font-semibold" : "hover:bg-surface-container"
                    } ${member.status === 'offline' ? 'opacity-70' : ''}`}
                  >
                    <div className="relative">
                      <div className={`w-8 h-8 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant ${member.status === 'offline' ? 'grayscale' : ''}`}>
                        <img className="w-full h-full object-cover" src={member.avatar} alt={member.name} referrerPolicy="no-referrer" />
                      </div>
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        member.status === "online" ? "bg-green-500" : "bg-outline-variant"
                      }`}></span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold truncate">{member.name}</p>
                      <p className="text-xs text-on-surface-variant truncate">{member.textStatus}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Chat Conversation Column */}
      <section id="chat-conversation-pane" className="flex-1 flex flex-col bg-white relative h-full">
        {/* Chat Header Banner */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-outline-variant">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-on-surface-variant font-bold text-lg">
                  {activeChannelId === "gemini-ai" ? "✨" : "#"}
                </span>
                <h2 className="text-base font-bold text-slate-900">{activeChannel.name}</h2>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 cursor-pointer" />
              </div>
              <p className="text-xs text-on-surface-variant truncate max-w-lg">{activeChannel.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Avatars Stack */}
            <div className="flex -space-x-2 mr-2">
              <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-surface-variant">
                <img className="w-full h-full object-cover" src={avatars.member1} alt="Collaborator" referrerPolicy="no-referrer" />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-surface-variant">
                <img className="w-full h-full object-cover" src={avatars.member2} alt="Collaborator" referrerPolicy="no-referrer" />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-secondary-fixed flex items-center justify-center text-[10px] font-bold text-on-secondary-fixed">
                +14
              </div>
            </div>

            <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
              <UserPlus className="w-4.5 h-4.5" />
            </button>
            <button 
              id="btn-toggle-channel-info"
              onClick={() => setShowRightPanel(p => !p)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                showRightPanel ? "bg-slate-100 text-slate-800" : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
              title="Channel Details"
            >
              <Info className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Message Logs Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col hide-scrollbar">
          {messages.map((msg, idx) => {
            const isMe = msg.isSentByMe;
            return (
              <div 
                key={msg.id || idx} 
                className={`flex gap-3 max-w-[80%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                {!isMe && (
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-outline-variant bg-slate-100">
                    {msg.senderName === "Gemini AI" ? (
                      <div className="w-full h-full bg-violet-100 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-violet-600" />
                      </div>
                    ) : (
                      <img className="w-full h-full object-cover" src={msg.senderAvatar} alt={msg.senderName} referrerPolicy="no-referrer" />
                    )}
                  </div>
                )}

                {/* Bubble details */}
                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-800">{msg.senderName}</span>
                    <span className="text-[10px] text-on-surface-variant">{msg.timestamp}</span>
                  </div>

                  {/* Bubble card */}
                  <div className={`rounded-2xl p-4 shadow-sm ${
                    isMe 
                      ? "bg-slate-900 text-white rounded-tr-none" 
                      : msg.senderName.includes("Error")
                        ? "bg-rose-50 border border-rose-200 text-rose-950 rounded-tl-none"
                        : "bg-surface-container-low border border-outline-variant text-slate-800 rounded-tl-none"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                    {/* PDF Attachment UI block matching mockup */}
                    {msg.fileAttachment && (
                      <div className="bg-white border border-outline-variant rounded-lg p-3 mt-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors group">
                        <div className="w-10 h-10 rounded bg-rose-100 flex items-center justify-center text-rose-700">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-primary transition-colors">
                            {msg.fileAttachment.name}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {msg.fileAttachment.size} · {msg.fileAttachment.type}
                          </p>
                        </div>
                        <Download className="w-4 h-4 text-on-surface-variant group-hover:text-slate-800" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-violet-100 flex items-center justify-center border border-violet-200">
                <Sparkles className="w-5 h-5 text-violet-600 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 mb-1">Gemini AI</span>
                <div className="bg-surface-container-low border border-outline-variant rounded-2xl rounded-tl-none p-3 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce"></span>
                  <span className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2.5 h-2.5 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form panel */}
        <div className="p-6 pt-0 border-t border-slate-100 mt-2 bg-white">
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-2 transition-all focus-within:ring-2 focus-within:ring-primary/5 focus-within:border-outline">
            {/* Rich Format Controls */}
            <div className="flex items-center gap-1 mb-2 px-2">
              <button 
                onClick={() => formatText('bold')}
                className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                title="Bold"
              >
                <Bold className="w-4 h-4 text-slate-600" />
              </button>
              <button 
                onClick={() => formatText('italic')}
                className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                title="Italic"
              >
                <Italic className="w-4 h-4 text-slate-600" />
              </button>
              <button 
                onClick={() => formatText('code')}
                className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                title="Code"
              >
                <Code className="w-4 h-4 text-slate-600" />
              </button>
              <div className="w-px h-4 bg-outline-variant mx-1"></div>
              <button 
                onClick={() => formatText('link')}
                className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                title="Link"
              >
                <Link className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Input area & attachments */}
            <div className="flex items-end gap-2 px-2 pb-2">
              <button 
                onClick={triggerAttachmentSelection}
                className="p-2 text-on-surface-variant hover:text-primary transition-colors flex-shrink-0 cursor-pointer" 
                title="Attach Files"
              >
                <Paperclip className="w-5 h-5 text-slate-500 hover:text-slate-800" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              
              <textarea 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 resize-none py-1.5 text-sm max-h-36 font-sans text-slate-800" 
                id="message-input" 
                placeholder={`Message #${activeChannel.name}`}
                rows={1}
              />

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button 
                  onClick={() => setShowEmojiPicker(p => !p)}
                  className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer" 
                  title="Emoji"
                >
                  <Smile className="w-5 h-5 text-slate-500 hover:text-slate-800" />
                </button>
                <button 
                  onClick={() => handleSendMessage()}
                  className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-slate-800 hover:brightness-110 shadow-lg shadow-primary/10 transition-all flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4.5 h-4.5 fill-white" />
                </button>
              </div>
            </div>

            {/* Emoji Selection Bar simulation */}
            {showEmojiPicker && (
              <div className="border-t border-slate-200 mt-2 p-2 flex items-center gap-2 flex-wrap bg-slate-50 rounded-lg">
                {["😀", "💡", "🚀", "🔥", "👍", "👏", "📋", "🚨", "🎯", "🤖", "🎉"].map(emoji => (
                  <button 
                    key={emoji}
                    onClick={() => {
                      setMessageText(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="p-1 text-base hover:bg-white rounded transition-colors cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-2 flex justify-end">
            <p className="text-[10px] text-on-surface-variant flex items-center gap-1">
              <span className="font-mono border border-outline-variant px-1 rounded bg-slate-50">Return</span> to send · 
              <span className="font-mono border border-outline-variant px-1 rounded bg-slate-50">Shift + Return</span> for new line
            </p>
          </div>
        </div>
      </section>

      {/* Collapsible Right Sidebar Detail Pane */}
      {showRightPanel && (
        <aside id="chat-details-sidebar" className="w-80 bg-surface border-l border-outline-variant flex flex-col flex-shrink-0 h-full">
          <div className="h-16 px-6 border-b border-outline-variant flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Channel Details</h3>
            <button 
              onClick={() => setShowRightPanel(false)}
              className="text-on-surface-variant hover:text-primary cursor-pointer p-1 rounded-md hover:bg-slate-100"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto hide-scrollbar space-y-8 flex-1">
            {/* Photo Preview block */}
            <div>
              <div className="w-full aspect-video rounded-xl bg-surface-container-high border border-outline-variant mb-4 overflow-hidden shadow-sm">
                <img 
                  className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-300" 
                  alt="Corporate office" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_eB3eTtjfPZCX2-jnmMnXG1AZ2HkJClZDkiWqRgK3EOHR7diA2-EYdRY2l3-AsqB20iap0cfIFfYfvuGZMEqnbWRlJ1uqnk7wurzXUbzYihdlAR4EJQUe6J9YYDNJW9lXz2srFMrCwJqgZrxXRo9oFXtMxJnX-KCCnn7bMDuEn9pHbiaRu6r7_8EIQ6QKrnAgrbCudf4pAkdJkkM3fViw6IcnZw7yT2tOJUtex4CZ8c46DYGtsOqaSAe-JhxVnDcVS24gMJogXSVz" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">Description</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {activeChannelId === "gemini-ai" 
                  ? "This dedicated stream lets you interact directly with our Gemini AI co-worker. Leverage LLM automation to summarize sprints, evaluate performance, or coordinate project planning specs."
                  : `This channel is for cross-functional communication regarding the ${activeChannel.name} release cycle. Topics include milestone tracking, urgent blockers, and weekly sync notes.`}
              </p>
            </div>

            {/* Pinned Messages */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wide">Pinned Messages</h4>
              <div className="space-y-3">
                <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-1.5 mb-1 text-slate-600">
                    <Pin className="w-3.5 h-3.5 text-on-surface-variant rotate-45" />
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">ROADMAP V2</span>
                  </div>
                  <p className="text-xs text-on-surface leading-normal font-sans text-slate-800">
                    Link to the current release roadmap and Figma designs directory on Notion workspace...
                  </p>
                </div>
              </div>
            </div>

            {/* Shared Files Grid matching images in mockups */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wide">Shared Files</h4>
              <div className="grid grid-cols-2 gap-2">
                <div 
                  onClick={() => setShowFilesModal(true)}
                  className="aspect-square rounded-lg bg-surface-container-high border border-outline-variant overflow-hidden cursor-pointer group shadow-sm"
                >
                  <img 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    alt="Glass office building" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKvkcMlzYKKAtffBMeRPRgWjPfBPFKkuBCV8XqV2LvcsP5Fj8mg8-U_iSElBEhqDIqk2-6ymGc7PXqZa6mK6MFJr1885ky5DTNoCRZX7aqyacniv_HnFwiRHvLMylFgsPN5_EaOqy7bwl5y-JwNSjzFQn7-aDPVLtzjOdAVaRyjnnnSWUxGNSxyZ7PL1kRWnmlxpdYHzIUf8IYauTddJT7-d1SWmGOr58k_g9Q3a1nv1S-eNTyh6zf84tSRrWkx0XC_ER5urd3TcEX" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div 
                  onClick={() => setShowFilesModal(true)}
                  className="aspect-square rounded-lg bg-surface-container-high border border-outline-variant overflow-hidden cursor-pointer group shadow-sm"
                >
                  <img 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    alt="Laptop on desk" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuABzp8p0zneyEFhKmVXSk6xkWGP2iuUEnrHZvGE7fh0hg5FPrKwxfVQZF5-RNBMtu7xieq3ktZnw23ZZ6rwr--SnnCLXH7Dj7RRgrO_dBd2fwBCyj-jxmOPuCSxK5jJm17dBfOzGU2sX4KABW1Uhm-pCOIJC7QHxwiZysQR0cJxsqiM3tKqeRkPBo3W2Du85R1Mq1qu2ign4i8BwL0PZid8FngDHk9pWzON9ykDWlwOvG3JpCIADx1VaydNqG9ruMrTW5rgCTtH-kWw" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <button 
                id="btn-view-all-files"
                onClick={() => setShowFilesModal(true)}
                className="w-full mt-4 text-center text-xs font-bold text-slate-900 hover:underline transition-all cursor-pointer bg-slate-50 py-2 border border-slate-250 rounded hover:bg-slate-100"
              >
                View All 42 Files
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Beautiful Shared Files Explorer Modal */}
      {showFilesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <File className="w-5 h-5 text-sky-400" />
                  Shared Document Vault (42 Files)
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">Asset manager for #{activeChannel.name}</p>
              </div>
              <button 
                onClick={() => setShowFilesModal(false)}
                className="text-slate-300 hover:text-white cursor-pointer bg-slate-800 p-1.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { name: "Alpha_Dashboard_Final.pdf", size: "4.2 MB", type: "PDF Document", date: "Today", icon: FileText, color: "text-rose-600 bg-rose-50" },
                  { name: "Workspace_Guidelines_V3.pdf", size: "1.8 MB", type: "PDF Document", date: "Yesterday", icon: FileText, color: "text-rose-600 bg-rose-50" },
                  { name: "Figma_Layout_Specs.png", size: "8.4 MB", type: "PNG Image", date: "3 days ago", icon: Eye, color: "text-sky-600 bg-sky-50" },
                  { name: "Backend_Migration_Blueprint.docx", size: "310 KB", type: "Word Doc", date: "Last week", icon: File, color: "text-indigo-600 bg-indigo-50" },
                  { name: "Sprint_Objectives_Alpha.xlsx", size: "1.1 MB", type: "Excel Sheet", date: "Last week", icon: File, color: "text-emerald-600 bg-emerald-50" },
                  { name: "Corporate_Asset_Log.csv", size: "45 KB", type: "CSV Log", date: "2 weeks ago", icon: File, color: "text-slate-600 bg-slate-100" }
                ].map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all">
                      <div className={`w-10 h-10 rounded flex items-center justify-center ${f.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 truncate">{f.name}</p>
                        <p className="text-[10px] text-slate-500">{f.size} · {f.type}</p>
                      </div>
                      <button 
                        onClick={() => {
                          alert(`Downloading ${f.name} simulated payload...`);
                        }}
                        className="p-1.5 hover:bg-white border border-slate-200 rounded text-slate-700 hover:text-black cursor-pointer"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowFilesModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold cursor-pointer hover:bg-slate-800"
              >
                Close Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
