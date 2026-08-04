import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, UserRole } from '../types';
import { enrichUserWithEmail } from '../utils/tasks';
import {
  apiGetChatMessages,
  apiSendChatMessage,
  apiListChannels,
  apiCreateChannel,
  apiUpdateChannelMembers,
  apiRemoveChannelMember,
  apiDeleteChannel,
  apiReactToMessage,
  apiListEmployees,
  ChatMessageDto,
  ChatChannelDto
} from '../api/client';

interface TeamChatViewProps {
  currentUser: User;
  teamMembers?: User[];
  isAdmin: boolean;
  userRole: UserRole;
}

const QUICK_REACTIONS = ['🔥', '✨', '👏', '💯', '❤️', '😂'];

function userKey(u: User) {
  return (u.email || u.name).toLowerCase();
}

function isSameUser(a: User, b: User) {
  return userKey(a) === userKey(b);
}

function renderMessageText(text: string, meName: string) {
  const parts = text.split(/(@[\w.\-]+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      const mention = part.slice(1);
      const isMe = mention.toLowerCase() === meName.toLowerCase();
      return (
        <span
          key={i}
          className={`font-bold px-1 rounded ${
            isMe ? 'bg-black/15 text-black' : 'bg-[#ff3cac]/15 text-[#c2185b]'
          }`}
        >
          {part}
        </span>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export default function TeamChatView({
  currentUser,
  teamMembers = [],
  isAdmin,
  userRole
}: TeamChatViewProps) {
  const me = enrichUserWithEmail(currentUser);
  const myEmail = (me.email || '').toLowerCase();
  const myKey = userKey(me);

  const [channels, setChannels] = useState<ChatChannelDto[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>('');
  const [messages, setMessages] = useState<Record<string, ChatMessageDto[]>>({});
  const [inputVal, setInputVal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showChannelsMobile, setShowChannelsMobile] = useState(false);
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [newMemberEmails, setNewMemberEmails] = useState<string[]>([]);
  const [channelError, setChannelError] = useState('');
  const [managingMembers, setManagingMembers] = useState(false);
  const [editMemberEmails, setEditMemberEmails] = useState<string[]>([]);
  const [memberSaveError, setMemberSaveError] = useState('');
  const [savingMembers, setSavingMembers] = useState(false);
  const [deletingChannel, setDeletingChannel] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Array<{ email: string; profile: User }>>([]);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const [reactPickerFor, setReactPickerFor] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState('');

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const seenCounts = useRef<Record<string, number>>({});
  const pollBusy = useRef(false);

  const directory = useMemo(() => {
    const map = new Map<string, User>();
    for (const m of teamMembers) {
      const enriched = enrichUserWithEmail(m);
      if (enriched.email) map.set(enriched.email.toLowerCase(), enriched);
    }
    for (const e of employees) {
      const email = e.email.toLowerCase();
      map.set(email, enrichUserWithEmail({ ...e.profile, email }));
    }
    map.set(myEmail || myKey, me);
    return [...map.values()];
  }, [teamMembers, employees, me, myEmail, myKey]);

  const activeMeta = channels.find((c) => c.name === activeChannel);
  const channelMemberEmails = useMemo(
    () => (activeMeta?.memberEmails || []).map((e) => e.toLowerCase()),
    [activeMeta]
  );

  /** People visible in the active channel (members + admins). */
  const channelPeople = useMemo(() => {
    return directory.filter((m) => {
      if (isSameUser(m, me)) return true;
      if ((m.role || '').toLowerCase() === 'admin') return true;
      return Boolean(m.email && channelMemberEmails.includes(m.email.toLowerCase()));
    });
  }, [directory, channelMemberEmails, me]);

  const loadChannels = useCallback(async () => {
    if (!myEmail) {
      setLoadError('Your account needs an email to use chat.');
      return;
    }
    try {
      const res = await apiListChannels(myEmail, userRole);
      setChannels(res.channels);
      setLoadError('');
      setActiveChannel((prev) => {
        if (prev && res.channels.some((c) => c.name === prev)) return prev;
        return res.channels[0]?.name || '';
      });
    } catch (err) {
      console.error(err);
      setLoadError('Could not load channels.');
    }
  }, [myEmail, userRole]);

  useEffect(() => {
    void loadChannels();
  }, [loadChannels]);

  useEffect(() => {
    if (!isAdmin) return;
    apiListEmployees()
      .then((res) =>
        setEmployees(
          res.employees.map((e) => ({
            email: e.email.toLowerCase(),
            profile: { ...e.profile, email: e.email }
          }))
        )
      )
      .catch(console.error);
  }, [isAdmin]);

  const mergeMessages = useCallback((channel: string, next: ChatMessageDto[]) => {
    setMessages((prev) => {
      const existing = prev[channel] || [];
      if (
        existing.length === next.length &&
        existing.every(
          (m, i) =>
            m.id === next[i]?.id &&
            JSON.stringify(m.reactions) === JSON.stringify(next[i]?.reactions)
        )
      ) {
        return prev;
      }
      return { ...prev, [channel]: next };
    });
  }, []);

  const fetchMessages = useCallback(
    async (channel: string, silent = false) => {
      if (!channel || !myEmail) return;
      if (pollBusy.current && silent) return;
      pollBusy.current = true;
      try {
        const res = await apiGetChatMessages(channel, myEmail, userRole);
        const nextCount = res.messages.length;
        if (!silent || channel === activeChannel) {
          mergeMessages(channel, res.messages);
          seenCounts.current[channel] = nextCount;
          setChannels((chs) =>
            chs.map((c) =>
              c.name === channel
                ? { ...c, messageCount: nextCount, unread: channel === activeChannel ? false : c.unread }
                : c
            )
          );
        }
        setLoadError('');
      } catch (err) {
        if (!silent) {
          console.error(err);
          setLoadError(err instanceof Error ? err.message : 'Could not load messages.');
        }
      } finally {
        pollBusy.current = false;
      }
    },
    [activeChannel, mergeMessages, myEmail, userRole]
  );

  useEffect(() => {
    if (!activeChannel) return;
    void fetchMessages(activeChannel);
    setReactPickerFor(null);
    setShowChannelsMobile(false);
    setManagingMembers(false);
    const meta = channels.find((c) => c.name === activeChannel);
    setEditMemberEmails([...(meta?.memberEmails || [])].map((e) => e.toLowerCase()));
  }, [activeChannel, fetchMessages]);

  useEffect(() => {
    if (!activeChannel) return;
    const id = window.setInterval(() => {
      void fetchMessages(activeChannel, true);
    }, 4000);
    return () => window.clearInterval(id);
  }, [activeChannel, fetchMessages]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages[activeChannel]?.length, activeChannel]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [inputVal]);

  const channelMessages = messages[activeChannel] || [];
  const filteredMessages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return channelMessages;
    return channelMessages.filter(
      (m) => m.text.toLowerCase().includes(q) || m.sender.name.toLowerCase().includes(q)
    );
  }, [channelMessages, searchQuery]);

  const mentionCandidates = useMemo(() => {
    if (!mentionOpen) return [];
    const q = mentionFilter.toLowerCase();
    return channelPeople
      .filter((m) => !isSameUser(m, me))
      .filter(
        (m) =>
          !q ||
          m.name.toLowerCase().includes(q) ||
          (m.email || '').toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [mentionOpen, mentionFilter, channelPeople, me]);

  const employeeOptions = useMemo(() => {
    if (employees.length > 0) return employees;
    return directory
      .filter((m) => m.email && !isSameUser(m, me))
      .map((m) => ({ email: m.email!.toLowerCase(), profile: m }));
  }, [employees, directory, me]);

  const detectMention = (value: string, caret: number) => {
    const before = value.slice(0, caret);
    const match = before.match(/@([\w.\-]*)$/);
    if (match) {
      setMentionOpen(true);
      setMentionFilter(match[1]);
      setMentionIndex(0);
    } else {
      setMentionOpen(false);
      setMentionFilter('');
    }
  };

  const insertMention = (member: User) => {
    const el = textareaRef.current;
    const caret = el?.selectionStart ?? inputVal.length;
    const before = inputVal.slice(0, caret);
    const after = inputVal.slice(caret);
    const replaced = before.replace(/@([\w.\-]*)$/, `@${member.name} `);
    setInputVal(replaced + after);
    setMentionOpen(false);
    requestAnimationFrame(() => {
      el?.focus();
      const pos = replaced.length;
      el?.setSelectionRange(pos, pos);
    });
  };

  const toggleEmail = (list: string[], email: string) => {
    const e = email.toLowerCase();
    return list.includes(e) ? list.filter((x) => x !== e) : [...list, e];
  };

  const handleSend = async () => {
    const text = inputVal.trim();
    if (!text || sending || !activeChannel) return;
    setSending(true);
    setInputVal('');
    setMentionOpen(false);

    try {
      const res = await apiSendChatMessage(activeChannel, me, text, userRole);
      setMessages((prev) => ({
        ...prev,
        [activeChannel]: [...(prev[activeChannel] || []), res.message]
      }));
      seenCounts.current[activeChannel] = (seenCounts.current[activeChannel] || 0) + 1;
    } catch (err) {
      console.error(err);
      setInputVal(text);
      setLoadError(err instanceof Error ? err.message : 'Failed to send.');
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const onComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionOpen && mentionCandidates.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex((i) => (i + 1) % mentionCandidates.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex((i) => (i - 1 + mentionCandidates.length) % mentionCandidates.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(mentionCandidates[mentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionOpen(false);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    try {
      const res = await apiReactToMessage(activeChannel, messageId, emoji, myKey, myEmail, userRole);
      setMessages((prev) => ({
        ...prev,
        [activeChannel]: (prev[activeChannel] || []).map((m) => (m.id === messageId ? res.message : m))
      }));
    } catch (err) {
      console.error(err);
    }
    setReactPickerFor(null);
  };

  const createChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setChannelError('');
    if (!newChannelName.trim()) {
      setChannelError('Name required');
      return;
    }
    try {
      const res = await apiCreateChannel({
        name: newChannelName,
        description: newChannelDesc,
        memberEmails: newMemberEmails,
        email: myEmail,
        role: userRole
      });
      setChannels((prev) => [...prev, { ...res.channel, messageCount: 0, unread: false }]);
      setActiveChannel(res.channel.name);
      setCreatingChannel(false);
      setNewChannelName('');
      setNewChannelDesc('');
      setNewMemberEmails([]);
    } catch (err) {
      setChannelError(err instanceof Error ? err.message : 'Could not create channel');
    }
  };

  const saveMembers = async () => {
    if (!isAdmin || !activeChannel) return;
    setSavingMembers(true);
    setMemberSaveError('');
    try {
      const res = await apiUpdateChannelMembers(activeChannel, editMemberEmails, userRole);
      setChannels((chs) =>
        chs.map((c) =>
          c.name === activeChannel
            ? { ...c, memberEmails: res.channel.memberEmails || editMemberEmails }
            : c
        )
      );
      setManagingMembers(false);
    } catch (err) {
      setMemberSaveError(err instanceof Error ? err.message : 'Could not update members');
    } finally {
      setSavingMembers(false);
    }
  };

  const removeMember = async (email: string) => {
    if (!isAdmin || !activeChannel) return;
    const name =
      employeeOptions.find((e) => e.email === email)?.profile.name || email;
    if (!window.confirm(`Remove ${name} from ${activeChannel}? They will lose access immediately.`)) {
      return;
    }
    setRemovingEmail(email);
    setMemberSaveError('');
    try {
      const res = await apiRemoveChannelMember(activeChannel, email, userRole);
      const next = res.channel.memberEmails || [];
      setEditMemberEmails(next.map((e) => e.toLowerCase()));
      setChannels((chs) =>
        chs.map((c) => (c.name === activeChannel ? { ...c, memberEmails: next } : c))
      );
    } catch (err) {
      setMemberSaveError(err instanceof Error ? err.message : 'Could not remove member');
    } finally {
      setRemovingEmail(null);
    }
  };

  const deleteChannel = async () => {
    if (!isAdmin || !activeChannel) return;
    if (
      !window.confirm(
        `Delete group ${activeChannel}? All messages in this group will be permanently removed.`
      )
    ) {
      return;
    }
    setDeletingChannel(true);
    setLoadError('');
    try {
      const deletedName = activeChannel;
      await apiDeleteChannel(deletedName, userRole);
      setMessages((prev) => {
        const next = { ...prev };
        delete next[deletedName];
        return next;
      });
      setManagingMembers(false);
      setChannels((prev) => {
        const remaining = prev.filter((c) => c.name !== deletedName);
        setActiveChannel(remaining[0]?.name || '');
        return remaining;
      });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not delete group');
    } finally {
      setDeletingChannel(false);
    }
  };

  const selectChannel = (name: string) => {
    setActiveChannel(name);
    setChannels((prev) => prev.map((c) => (c.name === name ? { ...c, unread: false } : c)));
  };

  const currentMemberRows = useMemo(() => {
    return channelMemberEmails.map((email) => {
      const emp = employeeOptions.find((e) => e.email === email);
      const fromDir = directory.find((m) => m.email?.toLowerCase() === email);
      return {
        email,
        name: emp?.profile.name || fromDir?.name || email,
        avatar: emp?.profile.avatar || fromDir?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}`
      };
    });
  }, [channelMemberEmails, employeeOptions, directory]);

  const memberPicker = (
    selected: string[],
    onChange: (next: string[]) => void,
    emptyHint: string
  ) => (
    <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1 rounded-xl border-2 border-black/15 bg-white p-2">
      {employeeOptions.length === 0 ? (
        <p className="text-[10px] text-slate-400 px-1 py-2">{emptyHint}</p>
      ) : (
        employeeOptions.map((emp) => {
          const checked = selected.includes(emp.email);
          return (
            <label
              key={emp.email}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-xs ${
                checked ? 'bg-[#c8ff00]/40' : 'hover:bg-slate-50'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onChange(toggleEmail(selected, emp.email))}
                className="accent-black"
              />
              <img
                src={emp.profile.avatar}
                alt=""
                className="w-5 h-5 rounded-full border border-black/20"
                referrerPolicy="no-referrer"
              />
              <span className="font-semibold text-slate-800 truncate">{emp.profile.name}</span>
              <span className="text-[9px] text-slate-400 truncate ml-auto">{emp.email}</span>
            </label>
          );
        })
      )}
    </div>
  );

  const channelList = (
    <>
      <div className="p-4 border-b border-black/10 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff3cac]">
            {isAdmin ? 'Admin groups' : 'Your groups'}
          </p>
          <h3 className="font-display text-lg font-bold text-black leading-tight">Channels</h3>
        </div>
        {isAdmin && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => setCreatingChannel((v) => !v)}
            className="w-9 h-9 rounded-xl border-2 border-black bg-[#c8ff00] shadow-[2px_2px_0_#000] flex items-center justify-center cursor-pointer"
            title="New channel"
          >
            <span className="material-symbols-outlined text-lg">{creatingChannel ? 'close' : 'add'}</span>
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {creatingChannel && isAdmin && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={createChannel}
            className="overflow-hidden border-b border-black/10 bg-white/50 px-3 py-3 space-y-2"
          >
            <input
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="channel-name"
              className="w-full text-xs px-3 py-2 rounded-xl border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
            />
            <input
              value={newChannelDesc}
              onChange={(e) => setNewChannelDesc(e.target.value)}
              placeholder="What's this group for?"
              className="w-full text-xs px-3 py-2 rounded-xl border-2 border-black/20 bg-white focus:outline-none"
            />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Add employees</p>
            {memberPicker(
              newMemberEmails,
              setNewMemberEmails,
              'Create employees in Settings first, then add them here.'
            )}
            {channelError && <p className="text-[10px] text-rose-600 font-semibold">{channelError}</p>}
            <button type="submit" className="btn-accent w-full text-xs py-2 rounded-xl cursor-pointer">
              Create group
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="px-3 py-2 border-b border-black/5">
        <div className="flex -space-x-2 overflow-hidden py-1">
          {channelPeople.slice(0, 6).map((m) => (
            <img
              key={userKey(m)}
              src={m.avatar}
              alt={m.name}
              title={m.name}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full border-2 border-white object-cover"
            />
          ))}
        </div>
        <p className="text-[10px] text-slate-500 font-medium">
          {activeChannel
            ? `${channelMemberEmails.length} employee${channelMemberEmails.length === 1 ? '' : 's'} in group`
            : 'Pick a channel'}
          {isAdmin ? ' · you manage access' : ' · assigned by admin'}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {channels.map((chan) => {
          const isActive = activeChannel === chan.name;
          const count = chan.memberEmails?.length ?? 0;
          return (
            <motion.button
              key={chan.name}
              type="button"
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectChannel(chan.name)}
              className={`w-full text-left p-3 rounded-2xl flex flex-col gap-0.5 cursor-pointer transition-all border-2 ${
                isActive
                  ? 'bg-black text-white border-black shadow-[3px_3px_0_#c8ff00]'
                  : 'border-transparent hover:border-black/15 hover:bg-white/60 text-slate-800'
              }`}
            >
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs font-bold font-mono truncate">{chan.name}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[9px] font-bold tabular-nums ${isActive ? 'text-white/50' : 'text-slate-400'}`}>
                    {count}p
                  </span>
                  {chan.unread && !isActive && (
                    <span className="min-w-[8px] h-2 w-2 rounded-full bg-[#ff3cac] animate-pulse" />
                  )}
                </div>
              </div>
              <span className={`text-[10px] truncate ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                {chan.description}
              </span>
            </motion.button>
          );
        })}
        {channels.length === 0 && (
          <p className="text-xs text-slate-400 p-3 text-center">
            {isAdmin
              ? 'No groups yet — create one and add employees.'
              : 'No groups assigned yet. Ask your admin to add you.'}
          </p>
        )}
      </nav>
    </>
  );

  return (
    <div className="h-full min-h-0 flex max-w-7xl mx-auto w-full overflow-hidden p-3 sm:p-4 gap-3 sm:gap-4 relative box-border">
      <aside className="hidden md:flex w-72 liquid-glass rounded-3xl flex-col shrink-0 overflow-hidden border-2 border-black/10">
        {channelList}
      </aside>

      <AnimatePresence>
        {showChannelsMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowChannelsMobile(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-[280px] z-50 bg-[#f6fff0] flex flex-col shadow-2xl border-r-2 border-black"
            >
              {channelList}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <section className="flex-1 liquid-glass rounded-3xl flex flex-col min-w-0 overflow-hidden border-2 border-black/10">
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-black/10 flex justify-between items-center gap-3 bg-gradient-to-r from-[#c8ff00]/25 via-transparent to-[#ff3cac]/15">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="md:hidden w-9 h-9 rounded-xl border-2 border-black bg-white flex items-center justify-center cursor-pointer shrink-0"
              onClick={() => setShowChannelsMobile(true)}
            >
              <span className="material-symbols-outlined text-lg">tag</span>
            </button>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-black font-mono truncate">
                {activeChannel || 'No channel'}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                {activeMeta?.description ||
                  (isAdmin ? 'Create a group and assign employees' : 'Waiting for admin to add you')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && activeChannel && (
              <>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    setEditMemberEmails([...(activeMeta?.memberEmails || [])].map((e) => e.toLowerCase()));
                    setManagingMembers((v) => !v);
                  }}
                  className={`h-9 px-3 rounded-xl border-2 border-black flex items-center gap-1 text-[10px] font-bold cursor-pointer ${
                    managingMembers ? 'bg-[#ff3cac] text-white' : 'bg-white'
                  }`}
                  title="Manage members"
                >
                  <span className="material-symbols-outlined text-base">group_add</span>
                  <span className="hidden sm:inline">Members</span>
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  disabled={deletingChannel}
                  onClick={() => void deleteChannel()}
                  className="h-9 w-9 sm:w-auto sm:px-3 rounded-xl border-2 border-black bg-white hover:bg-rose-50 text-rose-600 flex items-center justify-center gap-1 text-[10px] font-bold cursor-pointer disabled:opacity-40"
                  title="Delete group"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  <span className="hidden sm:inline">{deletingChannel ? '…' : 'Delete'}</span>
                </motion.button>
              </>
            )}
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => setShowSearch((v) => !v)}
              className={`w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center cursor-pointer ${
                showSearch ? 'bg-[#00e5ff]' : 'bg-white'
              }`}
              title="Search messages"
            >
              <span className="material-symbols-outlined text-lg">search</span>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {managingMembers && isAdmin && activeChannel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-black/10 bg-white/70"
            >
              <div className="px-4 py-3 space-y-3">
                <div>
                  <p className="text-xs font-bold text-black">
                    Members in <span className="font-mono">{activeChannel}</span>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Remove someone to revoke access instantly. Use checkboxes below to add people, then Save.
                  </p>
                </div>

                <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1 rounded-xl border-2 border-black/15 bg-white p-2">
                  {currentMemberRows.length === 0 ? (
                    <p className="text-[10px] text-slate-400 px-1 py-2">No employees in this group yet.</p>
                  ) : (
                    currentMemberRows.map((m) => (
                      <div
                        key={m.email}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-slate-50"
                      >
                        <img
                          src={m.avatar}
                          alt=""
                          className="w-6 h-6 rounded-full border border-black/20"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 truncate">{m.name}</p>
                          <p className="text-[9px] text-slate-400 truncate">{m.email}</p>
                        </div>
                        <button
                          type="button"
                          disabled={removingEmail === m.email}
                          onClick={() => void removeMember(m.email)}
                          className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg border-2 border-black bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer disabled:opacity-40"
                        >
                          {removingEmail === m.email ? '…' : 'Remove'}
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                    Add / adjust access
                  </p>
                  {memberPicker(
                    editMemberEmails,
                    setEditMemberEmails,
                    'No employees yet — create them in Settings → Team.'
                  )}
                </div>

                {memberSaveError && (
                  <p className="text-[10px] text-rose-600 font-semibold">{memberSaveError}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void saveMembers()}
                    disabled={savingMembers}
                    className="btn-accent text-xs px-4 py-2 rounded-xl cursor-pointer disabled:opacity-40"
                  >
                    {savingMembers ? 'Saving…' : 'Save member list'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setManagingMembers(false)}
                    className="text-xs px-3 py-2 rounded-xl border-2 border-black/20 bg-white cursor-pointer"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    disabled={deletingChannel}
                    onClick={() => void deleteChannel()}
                    className="text-xs px-3 py-2 rounded-xl border-2 border-rose-500 bg-rose-50 text-rose-700 font-bold cursor-pointer disabled:opacity-40 ml-auto"
                  >
                    {deletingChannel ? 'Deleting…' : 'Delete group'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-black/10"
            >
              <div className="px-4 py-2">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search this channel…"
                  className="w-full text-sm px-3 py-2 rounded-xl border-2 border-black/20 bg-white/80 focus:outline-none focus:border-black"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loadError && (
          <div className="mx-4 mt-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            {loadError}
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-1">
          {!activeChannel && (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 rounded-3xl border-2 border-black bg-[#c8ff00] shadow-[4px_4px_0_#ff3cac] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl">lock</span>
              </div>
              <h4 className="font-display text-xl font-bold text-black mb-1">
                {isAdmin ? 'Create your first group' : 'No access yet'}
              </h4>
              <p className="text-sm text-slate-500 max-w-xs">
                {isAdmin
                  ? 'Hit + to create a channel, then add employees so they can chat here.'
                  : 'Your admin hasn’t added you to any chat groups yet.'}
              </p>
            </div>
          )}

          {activeChannel && filteredMessages.length === 0 && !loadError && (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 rounded-3xl border-2 border-black bg-[#c8ff00] shadow-[4px_4px_0_#ff3cac] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl">forum</span>
              </div>
              <h4 className="font-display text-xl font-bold text-black mb-1">
                {searchQuery ? 'No matches' : 'Start the thread'}
              </h4>
              <p className="text-sm text-slate-500 max-w-xs">
                {searchQuery
                  ? 'Try another keyword or clear search.'
                  : isAdmin && channelMemberEmails.length === 0
                    ? 'No employees in this group yet — use Members to add them.'
                    : `Drop the first message in ${activeChannel}.`}
              </p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {filteredMessages.map((msg, idx) => {
              const isMe = isSameUser(msg.sender, me);
              const prev = filteredMessages[idx - 1];
              const grouped = prev && isSameUser(prev.sender, msg.sender);
              const reactions = Object.entries(msg.reactions || {}).filter(([, users]) => users.length > 0);

              return (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group flex gap-2.5 max-w-[min(100%,36rem)] ${isMe ? 'ml-auto flex-row-reverse' : ''} ${
                    grouped ? 'mt-1' : 'mt-4'
                  }`}
                >
                  <div className="w-8 shrink-0">
                    {!grouped ? (
                      <img
                        className="w-8 h-8 rounded-full object-cover border-2 border-black shadow-[2px_2px_0_#00e5ff]"
                        src={msg.sender.avatar}
                        alt=""
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                  </div>

                  <div className={`flex flex-col gap-1 min-w-0 ${isMe ? 'items-end' : 'items-start'}`}>
                    {!grouped && (
                      <div className={`flex items-center gap-2 text-[10px] ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span className="font-bold text-slate-900">{msg.sender.name}</span>
                        {msg.sender.role && (
                          <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                            {msg.sender.role}
                          </span>
                        )}
                        <span className="text-slate-400">{msg.timestamp}</span>
                      </div>
                    )}

                    <div className="relative">
                      <div
                        className={`px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words border-2 border-black ${
                          isMe
                            ? 'bg-[#c8ff00] text-black rounded-2xl rounded-tr-md shadow-[3px_3px_0_#ff3cac]'
                            : 'bg-white text-slate-800 rounded-2xl rounded-tl-md shadow-[3px_3px_0_#00e5ff]'
                        }`}
                      >
                        {renderMessageText(msg.text, me.name)}
                      </div>

                      <div
                        className={`absolute -bottom-3 ${isMe ? 'left-0' : 'right-0'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5`}
                      >
                        <button
                          type="button"
                          onClick={() => setReactPickerFor((id) => (id === msg.id ? null : msg.id))}
                          className="w-7 h-7 rounded-lg border-2 border-black bg-white text-xs shadow-[1px_1px_0_#000] cursor-pointer hover:bg-[#c8ff00]"
                          title="React"
                        >
                          ☺
                        </button>
                      </div>

                      <AnimatePresence>
                        {reactPickerFor === msg.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4 }}
                            className={`absolute z-20 top-full mt-2 ${isMe ? 'right-0' : 'left-0'} flex gap-1 p-1.5 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0_#000]`}
                          >
                            {QUICK_REACTIONS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => void toggleReaction(msg.id, emoji)}
                                className="w-8 h-8 rounded-xl hover:bg-[#c8ff00]/50 text-base cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {reactions.length > 0 && (
                      <div className={`flex flex-wrap gap-1 mt-2 ${isMe ? 'justify-end' : ''}`}>
                        {reactions.map(([emoji, users]) => {
                          const mine = users.includes(myKey);
                          return (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => void toggleReaction(msg.id, emoji)}
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border-2 border-black cursor-pointer ${
                                mine ? 'bg-[#ff3cac] text-white' : 'bg-white text-black'
                              }`}
                            >
                              {emoji} {users.length}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <div ref={chatBottomRef} />
        </div>

        {activeChannel && (
          <div className="p-3 sm:p-4 border-t border-black/10 bg-white/40 relative">
            <AnimatePresence>
              {mentionOpen && mentionCandidates.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-full left-3 right-3 sm:left-4 sm:right-auto sm:min-w-[240px] mb-2 rounded-2xl border-2 border-black bg-white shadow-[4px_4px_0_#000] overflow-hidden z-30"
                >
                  {mentionCandidates.map((m, i) => (
                    <li key={userKey(m)}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          insertMention(m);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm cursor-pointer ${
                          i === mentionIndex ? 'bg-[#c8ff00]' : 'hover:bg-slate-50'
                        }`}
                      >
                        <img
                          src={m.avatar}
                          alt=""
                          className="w-6 h-6 rounded-full border border-black/20"
                          referrerPolicy="no-referrer"
                        />
                        <span className="font-semibold text-slate-900">{m.name}</span>
                        {m.role && <span className="text-[10px] text-slate-400 ml-auto">{m.role}</span>}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
              className="flex items-end gap-2 rounded-2xl border-2 border-black bg-white px-3 py-2 shadow-[3px_3px_0_#00e5ff] focus-within:shadow-[3px_3px_0_#ff3cac] transition-shadow"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  detectMention(e.target.value, e.target.selectionStart);
                }}
                onKeyDown={onComposerKeyDown}
                onClick={(e) => detectMention(inputVal, (e.target as HTMLTextAreaElement).selectionStart)}
                placeholder={`Message ${activeChannel} · only members can see this`}
                className="flex-1 bg-transparent border-none focus:outline-none text-sm py-1.5 text-slate-800 placeholder:text-slate-400 resize-none max-h-[140px] custom-scrollbar"
              />
              <motion.button
                type="submit"
                disabled={!inputVal.trim() || sending}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-accent p-2.5 rounded-xl disabled:opacity-30 cursor-pointer shrink-0 border-2 border-black"
              >
                <span className="material-symbols-outlined text-sm">
                  {sending ? 'hourglass_empty' : 'send'}
                </span>
              </motion.button>
            </form>
            <p className="sr-only">
              {isAdmin
                ? 'Use Members to control who can see this group'
                : 'You only see groups your admin added you to'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
