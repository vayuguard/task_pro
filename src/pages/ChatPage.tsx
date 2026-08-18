import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useAuth } from '../auth/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import {
  apiListChannels,
  apiGetChatMessages,
  apiSendChatMessage,
  apiReactToMessage,
  apiCreateChannel,
  apiUpdateChannelMembers,
  apiDeleteChannel,
  type ChatChannelDto,
  type ChatMessageDto
} from '../api/client';
import { PageHeader, Panel } from '../components/ui/Panel';
import { PageLoading } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Avatar, AvatarStack } from '../components/ui/Badge';
import { formatDayLabelIST, formatTimeIST, istDayKey } from '../utils/time';
import type { User } from '../types';

const QUICK_REACTIONS = ['👍', '✅', '🎉', '❤️', '👀', '🙏'];
const GROUP_WINDOW_MS = 5 * 60_000;
const POLL_MS = 15_000;

function userKeyOf(u: { email?: string; name?: string } | undefined) {
  return (u?.email || u?.name || '').trim().toLowerCase();
}

function messageEpoch(m: ChatMessageDto) {
  const ms = m.createdAt ? Date.parse(m.createdAt) : NaN;
  return Number.isFinite(ms) ? ms : 0;
}

function clockTime(m: ChatMessageDto) {
  const epoch = messageEpoch(m);
  if (!epoch) return m.timestamp || '';
  return formatTimeIST(new Date(epoch));
}

/** Cheap change detector so 8s polling does not re-render an unchanged thread. */
function threadSignature(messages: ChatMessageDto[]) {
  return messages
    .map((m) => {
      const reactionMap: Record<string, string[]> = m.reactions ?? {};
      const reactions = Object.entries(reactionMap)
        .filter(([, users]) => users.length)
        .map(([emoji, users]) => `${emoji}${users.length}`)
        .sort()
        .join(',');
      return `${m.id}:${reactions}`;
    })
    .join('|');
}

function highlightMentions(text: string) {
  return text.split(/(@[\w.+-]+)/g).map((part, i) =>
    part.startsWith('@') ? (
      <span key={i} className="font-semibold" style={{ color: 'var(--accent)' }}>
        {part}
      </span>
    ) : (
      part
    )
  );
}

interface MessageGroup {
  key: string;
  sender: User;
  mine: boolean;
  epoch: number;
  messages: ChatMessageDto[];
}

interface DaySection {
  key: string;
  label: string;
  groups: MessageGroup[];
}

export default function ChatPage() {
  const { session } = useAuth();
  const { teamMembers } = useData();
  const { toast } = useToast();
  const reducedMotion = useReducedMotion();

  const isAdmin = session?.role === 'admin';
  const myKey = userKeyOf({ email: session?.email, name: session?.profile.name });

  const [channels, setChannels] = useState<ChatChannelDto[]>([]);
  const [active, setActive] = useState('');
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [channelQuery, setChannelQuery] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'thread'>('list');

  const [showCreate, setShowCreate] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [newChannel, setNewChannel] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMemberPick, setNewMemberPick] = useState<string[]>([]);
  const [memberPick, setMemberPick] = useState<string[]>([]);

  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const atBottomRef = useRef(true);
  const prevCountRef = useRef(0);
  const [showJump, setShowJump] = useState(false);
  const [unseen, setUnseen] = useState(0);

  const activeChannel = channels.find((c) => c.name === active);
  const memberKey = (activeChannel?.memberEmails || []).join(',');

  const loadChannels = useCallback(async () => {
    const res = await apiListChannels();
    setChannels(res.channels);
    setActive((prev) => prev || res.channels[0]?.name || '');
  }, []);

  useEffect(() => {
    loadChannels()
      .catch(() => toast('Could not load channels', 'error'))
      .finally(() => setLoading(false));
  }, [loadChannels, toast]);

  const applyMessages = useCallback((next: ChatMessageDto[]) => {
    setMessages((prev) => (threadSignature(prev) === threadSignature(next) ? prev : next));
  }, []);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    prevCountRef.current = 0;
    atBottomRef.current = true;
    setUnseen(0);
    setShowJump(false);

    const fetchMessages = () =>
      apiGetChatMessages(active)
        .then((res) => {
          if (!cancelled) applyMessages(res.messages);
        })
        .catch(() => {});

    fetchMessages();
    const id = setInterval(fetchMessages, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [active, applyMessages]);

  useEffect(() => {
    if (activeChannel?.memberEmails) setMemberPick(activeChannel.memberEmails);
  }, [active, memberKey, activeChannel?.memberEmails]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    atBottomRef.current = true;
    setShowJump(false);
    setUnseen(0);
  }, []);

  useEffect(() => {
    const added = messages.length - prevCountRef.current;
    const firstPaint = prevCountRef.current === 0;
    prevCountRef.current = messages.length;
    if (added <= 0) return;

    if (atBottomRef.current) {
      requestAnimationFrame(() => scrollToBottom(firstPaint || reducedMotion ? 'auto' : 'smooth'));
    } else {
      setUnseen((u) => u + added);
      setShowJump(true);
    }
  }, [messages, scrollToBottom, reducedMotion]);

  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [text]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    atBottomRef.current = bottom;
    setShowJump(!bottom && messages.length > 0);
    if (bottom) setUnseen(0);
  };

  const sections = useMemo<DaySection[]>(() => {
    const out: DaySection[] = [];
    for (const m of messages) {
      const epoch = messageEpoch(m);
      const dayKey = epoch ? istDayKey(epoch) : 'unknown';

      let section = out[out.length - 1];
      if (!section || section.key !== dayKey) {
        section = { key: dayKey, label: epoch ? formatDayLabelIST(epoch) : 'Earlier', groups: [] };
        out.push(section);
      }

      const last = section.groups[section.groups.length - 1];
      const sameSender = last && userKeyOf(last.sender) === userKeyOf(m.sender);
      const closeInTime = last && epoch && last.epoch && epoch - last.epoch < GROUP_WINDOW_MS;

      if (last && sameSender && closeInTime) {
        last.messages.push(m);
        last.epoch = epoch || last.epoch;
      } else {
        section.groups.push({
          key: m.id,
          sender: m.sender,
          mine: userKeyOf(m.sender) === myKey,
          epoch,
          messages: [m]
        });
      }
    }
    return out;
  }, [messages, myKey]);

  const filteredChannels = useMemo(() => {
    const q = channelQuery.trim().toLowerCase();
    if (!q) return channels;
    return channels.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)
    );
  }, [channels, channelQuery]);

  const channelMembers = useMemo(() => {
    const emails = new Set(activeChannel?.memberEmails || []);
    return teamMembers.filter((m) => emails.has(userKeyOf(m)));
  }, [activeChannel?.memberEmails, teamMembers, memberKey]);

  const mentionMatches = useMemo(() => {
    if (mentionQuery == null) return [];
    const q = mentionQuery.toLowerCase();
    return teamMembers
      .filter((m) => m.name.toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q))
      .slice(0, 5);
  }, [mentionQuery, teamMembers]);

  const selectChannel = (name: string) => {
    setActive(name);
    setMobileView('thread');
    setPickerFor(null);
  };

  const send = async () => {
    const body = text.trim();
    if (!body || !active || sending) return;
    setSending(true);
    try {
      const res = await apiSendChatMessage(active, { ...session!.profile, email: session!.email }, body);
      setMessages((prev) => [...prev, res.message]);
      setChannels((prev) =>
        prev.map((c) => (c.name === active ? { ...c, messageCount: (c.messageCount ?? 0) + 1 } : c))
      );
      setText('');
      setMentionQuery(null);
      atBottomRef.current = true;
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Message failed to send', 'error');
    } finally {
      setSending(false);
      composerRef.current?.focus();
    }
  };

  const react = async (messageId: string, emoji: string) => {
    if (!active) return;
    setPickerFor(null);
    try {
      const res = await apiReactToMessage(active, messageId, emoji, myKey);
      setMessages((prev) => prev.map((m) => (m.id === messageId ? res.message : m)));
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not add reaction', 'error');
    }
  };

  const onComposerChange = (value: string, caret: number) => {
    setText(value);
    const upto = value.slice(0, caret);
    const match = upto.match(/(?:^|\s)@([\w.+-]*)$/);
    setMentionQuery(match ? match[1] : null);
    setMentionIndex(0);
  };

  const applyMention = (member: User) => {
    const el = composerRef.current;
    const caret = el?.selectionStart ?? text.length;
    const handle = (member.name.split(' ')[0] || member.name).toLowerCase();
    const before = text.slice(0, caret).replace(/@([\w.+-]*)$/, `@${handle} `);
    setText(before + text.slice(caret));
    setMentionQuery(null);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(before.length, before.length);
    });
  };

  const onComposerKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionMatches.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex((i) => (i + 1) % mentionMatches.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex((i) => (i - 1 + mentionMatches.length) % mentionMatches.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applyMention(mentionMatches[mentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setMentionQuery(null);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const createChannel = async (e: FormEvent) => {
    e.preventDefault();
    if (!newChannel.trim()) return;
    try {
      const res = await apiCreateChannel({
        name: newChannel,
        description: newDesc,
        memberEmails: newMemberPick
      });
      toast('Channel created', 'success');
      setShowCreate(false);
      setNewChannel('');
      setNewDesc('');
      setNewMemberPick([]);
      await loadChannels();
      selectChannel(res.channel.name);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not create channel', 'error');
    }
  };

  const saveMembers = async () => {
    if (!active || !isAdmin) return;
    try {
      await apiUpdateChannelMembers(active, memberPick);
      toast('Members updated', 'success');
      setShowMembers(false);
      loadChannels();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not update members', 'error');
    }
  };

  const removeChannel = async () => {
    if (!active || !isAdmin) return;
    if (!window.confirm(`Delete ${active} and all of its messages? This cannot be undone.`)) return;
    try {
      await apiDeleteChannel(active);
      toast('Channel deleted', 'success');
      setShowMembers(false);
      setActive('');
      setMessages([]);
      setMobileView('list');
      loadChannels();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not delete channel', 'error');
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[30rem] flex flex-col">
      <PageHeader
        title="Team chat"
        subtitle={`${channels.length} channel${channels.length === 1 ? '' : 's'} · ${teamMembers.length} members`}
        action={
          isAdmin ? (
            <Button variant="secondary" icon="add_comment" onClick={() => setShowCreate(true)}>
              New channel
            </Button>
          ) : undefined
        }
      />

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Channel list */}
        <Panel
          padded={false}
          className={`${mobileView === 'list' ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-64 shrink-0 min-h-0 p-2`}
        >
          {channels.length > 4 && (
            <div className="p-1 pb-2 shrink-0">
              <input
                type="search"
                className="input py-1.5 text-xs"
                placeholder="Filter channels…"
                value={channelQuery}
                onChange={(e) => setChannelQuery(e.target.value)}
                aria-label="Filter channels"
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0.5">
            {channels.length === 0 ? (
              <EmptyState
                bare
                icon="forum"
                title="No channels"
                description={isAdmin ? 'Create one to start the conversation.' : 'An admin will add you to a channel.'}
                actionLabel={isAdmin ? 'New channel' : undefined}
                onAction={isAdmin ? () => setShowCreate(true) : undefined}
              />
            ) : filteredChannels.length === 0 ? (
              <p className="text-xs text-ink-faint p-3 text-center">No channels match “{channelQuery}”.</p>
            ) : (
              filteredChannels.map((c) => {
                const isActive = active === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => selectChannel(c.name)}
                    aria-current={isActive}
                    className={`w-full text-left px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      isActive ? '' : 'row-hover'
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }
                        : { color: 'var(--ink-muted)' }
                    }
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-[16px] shrink-0">tag</span>
                      <span className="text-sm font-semibold truncate">{c.name.replace(/^#/, '')}</span>
                      {c.messageCount != null && c.messageCount > 0 && (
                        <span className="ml-auto text-[10px] font-bold tabular-nums shrink-0 text-ink-faint">
                          {c.messageCount}
                        </span>
                      )}
                    </span>
                    {c.description && (
                      <span className="block text-[11px] text-ink-faint truncate mt-0.5 pl-6">{c.description}</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </Panel>

        {/* Thread */}
        <Panel
          padded={false}
          className={`${mobileView === 'list' ? 'hidden' : 'flex'} lg:flex flex-1 flex-col min-h-0 overflow-hidden relative`}
        >
          {!active ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                bare
                icon="forum"
                title="Select a channel"
                description="Pick a channel on the left to read and reply."
              />
            </div>
          ) : (
            <>
              <div className="border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  className="btn-ghost p-1.5 rounded-lg lg:hidden shrink-0"
                  aria-label="Back to channels"
                  onClick={() => setMobileView('list')}
                >
                  <span className="material-symbols-outlined text-xl">arrow_back</span>
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink truncate flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-ink-faint">tag</span>
                    {active.replace(/^#/, '')}
                  </p>
                  <p className="text-xs text-ink-faint truncate">
                    {activeChannel?.description || 'Team discussion'}
                    {channelMembers.length > 0 && ` · ${channelMembers.length} members`}
                  </p>
                </div>
                {channelMembers.length > 0 && (
                  <div className="hidden sm:block shrink-0">
                    <AvatarStack users={channelMembers} max={4} size={26} />
                  </div>
                )}
                {isAdmin && (
                  <button
                    type="button"
                    className="btn-ghost p-1.5 rounded-lg shrink-0"
                    aria-label="Manage channel"
                    title="Manage channel"
                    onClick={() => setShowMembers(true)}
                  >
                    <span className="material-symbols-outlined text-xl">group</span>
                  </button>
                )}
              </div>

              <div
                ref={scrollRef}
                onScroll={onScroll}
                className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-4"
              >
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <EmptyState
                      bare
                      icon="waving_hand"
                      title="No messages yet"
                      description="Be the first to say something in this channel."
                    />
                  </div>
                ) : (
                  sections.map((section) => (
                    <div key={section.key} className="space-y-4">
                      <div className="flex items-center gap-3 py-1">
                        <span className="flex-1 h-px bg-border" />
                        <span
                          className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: 'var(--surface-sunken)', color: 'var(--ink-faint)' }}
                        >
                          {section.label}
                        </span>
                        <span className="flex-1 h-px bg-border" />
                      </div>

                      {section.groups.map((group) => (
                        <motion.div
                          key={group.key}
                          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className={`flex gap-2.5 ${group.mine ? 'flex-row-reverse' : ''}`}
                        >
                          <Avatar name={group.sender.name} src={group.sender.avatar} size={32} />

                          <div
                            className={`min-w-0 max-w-[80%] flex flex-col gap-1 ${
                              group.mine ? 'items-end' : 'items-start'
                            }`}
                          >
                            <div className="flex items-baseline gap-2 px-1">
                              <span className="text-xs font-semibold text-ink">
                                {group.mine ? 'You' : group.sender.name}
                              </span>
                              <span className="text-[10px] text-ink-faint tabular-nums">
                                {clockTime(group.messages[0])}
                              </span>
                            </div>

                            {group.messages.map((m, i) => {
                              const reactionMap: Record<string, string[]> = m.reactions ?? {};
                              const reactionEntries = Object.entries(reactionMap).filter(
                                ([, users]) => users.length > 0
                              );
                              return (
                                <div key={m.id} className={`group/msg relative flex flex-col ${group.mine ? 'items-end' : 'items-start'}`}>
                                  <div className={`flex items-center gap-1 ${group.mine ? 'flex-row-reverse' : ''}`}>
                                    <div
                                      className={`text-sm px-3.5 py-2 whitespace-pre-wrap break-words rounded-2xl ${
                                        i === 0 ? (group.mine ? 'rounded-tr-md' : 'rounded-tl-md') : ''
                                      }`}
                                      style={{
                                        backgroundColor: group.mine
                                          ? 'var(--accent-soft)'
                                          : 'var(--surface-sunken)',
                                        color: 'var(--ink)'
                                      }}
                                    >
                                      {highlightMentions(m.text)}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => setPickerFor((prev) => (prev === m.id ? null : m.id))}
                                      aria-label="Add reaction"
                                      className="opacity-0 group-hover/msg:opacity-100 focus-visible:opacity-100 transition-opacity shrink-0 w-7 h-7 rounded-full flex items-center justify-center border border-border bg-surface-raised hover:border-accent cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[15px] text-ink-muted">
                                        add_reaction
                                      </span>
                                    </button>
                                  </div>

                                  <AnimatePresence>
                                    {pickerFor === m.id && (
                                      <motion.div
                                        initial={reducedMotion ? false : { opacity: 0, scale: 0.9, y: 4 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.15 }}
                                        className="panel flex gap-0.5 p-1 mt-1"
                                        style={{ boxShadow: 'var(--elevation-2)' }}
                                      >
                                        {QUICK_REACTIONS.map((emoji) => (
                                          <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => react(m.id, emoji)}
                                            className="w-7 h-7 rounded-md text-sm row-hover cursor-pointer"
                                          >
                                            {emoji}
                                          </button>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

                                  {reactionEntries.length > 0 && (
                                    <div
                                      className={`flex flex-wrap gap-1 mt-1 ${group.mine ? 'justify-end' : ''}`}
                                    >
                                      {reactionEntries.map(([emoji, users]) => {
                                        const mine = users.includes(myKey);
                                        return (
                                          <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => react(m.id, emoji)}
                                            title={`${users.length} reacted`}
                                            className="text-xs px-2 py-0.5 rounded-full border cursor-pointer transition-colors tabular-nums"
                                            style={{
                                              borderColor: mine ? 'var(--accent)' : 'var(--border)',
                                              backgroundColor: mine
                                                ? 'var(--accent-soft)'
                                                : 'var(--surface-raised)',
                                              color: mine ? 'var(--accent)' : 'var(--ink-muted)'
                                            }}
                                          >
                                            {emoji} {users.length}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ))
                )}
              </div>

              <AnimatePresence>
                {showJump && (
                  <motion.button
                    type="button"
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    onClick={() => scrollToBottom()}
                    className="absolute left-1/2 -translate-x-1/2 bottom-24 z-10 btn btn-primary text-xs px-3 py-1.5 rounded-full"
                    style={{ boxShadow: 'var(--elevation-2)' }}
                  >
                    {unseen > 0 ? `${unseen} new message${unseen === 1 ? '' : 's'}` : 'Jump to latest'}
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="border-t border-border p-3 shrink-0 relative">
                <AnimatePresence>
                  {mentionMatches.length > 0 && (
                    <motion.ul
                      initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-3 right-3 mb-2 panel p-1 max-h-56 overflow-y-auto custom-scrollbar z-20"
                      style={{ boxShadow: 'var(--elevation-3)' }}
                    >
                      {mentionMatches.map((m, i) => (
                        <li key={userKeyOf(m) || m.name}>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyMention(m)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left cursor-pointer"
                            style={
                              i === mentionIndex
                                ? { backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }
                                : undefined
                            }
                          >
                            <Avatar name={m.name} src={m.avatar} size={22} />
                            <span className="text-sm font-medium truncate">{m.name}</span>
                            {m.email && <span className="text-xs text-ink-faint truncate ml-auto">{m.email}</span>}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>

                <div className="flex items-end gap-2">
                  <textarea
                    ref={composerRef}
                    rows={1}
                    className="input flex-1 resize-none py-2.5 leading-relaxed"
                    placeholder={`Message ${active.replace(/^#/, '')}…  Use @ to mention`}
                    value={text}
                    onChange={(e) => onComposerChange(e.target.value, e.target.selectionStart ?? 0)}
                    onKeyDown={onComposerKeyDown}
                    onBlur={() => setMentionQuery(null)}
                    aria-label="Message"
                  />
                  <Button
                    onClick={send}
                    loading={sending}
                    disabled={!text.trim()}
                    icon={sending ? undefined : 'send'}
                    aria-label="Send message"
                  >
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </div>
                <p className="text-[10px] text-ink-faint mt-1.5 px-1 hidden sm:block">
                  <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift + Enter</kbd> for a
                  new line
                </p>
              </div>
            </>
          )}
        </Panel>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create channel">
        <form onSubmit={createChannel} className="space-y-4">
          <Input
            label="Channel name"
            value={newChannel}
            onChange={(e) => setNewChannel(e.target.value)}
            required
            placeholder="general"
            hint="Spaces become dashes and a # is added automatically."
          />
          <Input
            label="Description"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="What is this channel for?"
          />
          <div>
            <p className="label">Members</p>
            <p className="text-xs text-ink-faint mb-2">Leave empty to keep the channel admin-only for now.</p>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((m) => {
                const email = userKeyOf(m);
                const on = newMemberPick.includes(email);
                return (
                  <button
                    key={email}
                    type="button"
                    onClick={() =>
                      setNewMemberPick((prev) =>
                        on ? prev.filter((e) => e !== email) : [...prev, email]
                      )
                    }
                    className={`chip ${on ? 'chip-active' : ''}`}
                  >
                    {on && <span className="material-symbols-outlined text-[14px]">check</span>}
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit">Create channel</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={showMembers}
        onClose={() => setShowMembers(false)}
        title={`Manage ${active.replace(/^#/, '')}`}
        description="Members can read and post in this channel."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {teamMembers.length === 0 ? (
              <p className="text-sm text-ink-muted">No team members yet.</p>
            ) : (
              teamMembers.map((m) => {
                const email = userKeyOf(m);
                const on = memberPick.includes(email);
                return (
                  <button
                    key={email}
                    type="button"
                    onClick={() =>
                      setMemberPick((prev) => (on ? prev.filter((e) => e !== email) : [...prev, email]))
                    }
                    className={`chip ${on ? 'chip-active' : ''}`}
                  >
                    {on && <span className="material-symbols-outlined text-[14px]">check</span>}
                    {m.name}
                  </button>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
            <Button variant="danger" icon="delete" onClick={removeChannel}>
              Delete channel
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowMembers(false)}>
                Cancel
              </Button>
              <Button onClick={saveMembers}>Save members</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
