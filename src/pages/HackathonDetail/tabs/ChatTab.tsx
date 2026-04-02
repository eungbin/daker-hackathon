import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreContext } from '../../../store/StoreContext';
import { useAuth } from '../../../store/AuthContext';
import type { HackathonDetail } from '../../../types';

interface Props {
  detail: HackathonDetail;
}

type ChannelKey = 'announcements' | 'qna' | 'recruitment';

const CHANNELS: { key: ChannelKey; label: string; type: 'announce' | 'hash' }[] = [
  { key: 'announcements', label: '공지사항', type: 'announce' },
  { key: 'qna',           label: 'Q&A',     type: 'hash' },
  { key: 'recruitment',   label: '팀원모집', type: 'hash' },
];

const AVATAR_COLORS = [
  'bg-violet-600', 'bg-blue-600', 'bg-green-600', 'bg-rose-600',
  'bg-amber-600', 'bg-teal-600', 'bg-pink-600', 'bg-cyan-600',
];

function avatarColor(username: string) {
  return AVATAR_COLORS[username.charCodeAt(0) % AVATAR_COLORS.length];
}

function formatTime(isoStr: string) {
  const d = new Date(isoStr);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h < 12 ? '오전' : '오후';
  return `${ampm} ${h % 12 || 12}:${m}`;
}

function HashIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
      <path d="M4 9h16M4 15h16M10 3l-2 18M16 3l-2 18" strokeLinecap="round" />
    </svg>
  );
}

function AnnounceIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 000-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.525" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ChatTab({ detail }: Props) {
  const { teams, chats, addChatMessage } = useStoreContext();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const slug = detail.slug;

  const [activeChannel, setActiveChannel] = useState<ChannelKey>('announcements');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isParticipant = currentUser
    ? teams.some(t =>
        t.hackathonSlugs?.includes(slug) &&
        (t.createdBy === currentUser.id || t.members?.includes(currentUser.id))
      )
    : false;

  const allMessages = chats[slug] ?? [];
  const messages = allMessages.filter(m => (m.channel ?? 'qna') === activeChannel);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeChannel]);

  const handleSend = () => {
    const content = input.trim();
    if (!content || !currentUser) return;
    addChatMessage({
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      hackathonSlug: slug,
      channel: activeChannel,
      userId: currentUser.id,
      username: currentUser.username,
      content,
      sentAt: new Date().toISOString(),
    });
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeChannelMeta = CHANNELS.find(c => c.key === activeChannel)!;
  if (!currentUser) {
    return (
      <div className="bg-card border border-card-border rounded-xl p-10 text-center">
        <p className="text-white font-semibold mb-1">로그인이 필요합니다</p>
        <p className="text-gray-500 text-sm mb-5">채팅에 참여하려면 먼저 로그인하세요.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-primary text-white text-sm px-5 py-2 rounded-xl hover:bg-primary/90 transition-colors"
        >
          로그인하기
        </button>
      </div>
    );
  }

  if (!isParticipant) {
    return (
      <div className="bg-card border border-card-border rounded-xl p-10 text-center">
        <p className="text-white font-semibold mb-1">참가자 전용 채팅입니다</p>
        <p className="text-gray-500 text-sm">이 해커톤에 참여 중인 팀원만 채팅할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-card-border rounded-xl flex overflow-hidden h-[580px]">

      {/* Sidebar */}
      <div className={`flex flex-col border-r border-card-border bg-neutral transition-all duration-200 shrink-0 ${sidebarOpen ? 'w-44' : 'w-0 overflow-hidden border-r-0'}`}>
        {/* Sidebar header */}
        <div className="px-3 pt-4 pb-2 flex items-center justify-between shrink-0">
          <span className="text-gray-500 text-[10px] font-bold tracking-widest uppercase select-none">Channels</span>
          <button className="w-5 h-5 text-gray-600 hover:text-gray-300 transition-colors flex items-center justify-center rounded">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
          {CHANNELS.map(ch => {
            const isActive = activeChannel === ch.key;
            return (
              <button
                key={ch.key}
                onClick={() => setActiveChannel(ch.key)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors group ${
                  isActive
                    ? 'bg-primary/20 text-white'
                    : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                }`}
              >
                <span className={isActive ? 'text-primary' : 'text-gray-600 group-hover:text-gray-400'}>
                  {ch.type === 'announce' ? <AnnounceIcon /> : <HashIcon />}
                </span>
                <span className="text-sm truncate flex-1">{ch.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-card-border flex items-center gap-2.5 shrink-0">
          {/* Toggle button */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors shrink-0"
            title={sidebarOpen ? '채널 목록 닫기' : '채널 목록 열기'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>
          <span className={`${activeChannelMeta.type === 'announce' ? 'text-gray-400' : 'text-gray-400'}`}>
            {activeChannelMeta.type === 'announce' ? <AnnounceIcon /> : <HashIcon />}
          </span>
          <span className="text-white font-semibold text-sm">{activeChannelMeta.label}</span>
          <span className="text-gray-600 text-xs ml-auto">참가자 전용</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-3">👋</div>
              <p className="text-gray-400 text-sm font-medium">#{activeChannelMeta.label}의 첫 번째 메시지를 보내보세요!</p>
              <p className="text-gray-600 text-xs mt-1">이 채팅은 해커톤 참가자만 볼 수 있습니다.</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.userId === currentUser.id;
              const prevMsg = messages[i - 1];
              const grouped = prevMsg && prevMsg.userId === msg.userId &&
                new Date(msg.sentAt).getTime() - new Date(prevMsg.sentAt).getTime() < 5 * 60 * 1000;

              return (
                <div key={msg.id} className={grouped ? 'mt-1' : (i === 0 ? '' : 'mt-5')}>
                  {grouped ? (
                    <div className="flex gap-3">
                      <div className="w-9 shrink-0" />
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-words flex-1">
                        {msg.content}
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-3 items-start">
                      <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-bold ${avatarColor(msg.username)}`}>
                        {msg.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className={`text-sm font-semibold ${isMe ? 'text-primary' : 'text-white'}`}>
                            {msg.username}{isMe ? ' (나)' : ''}
                          </span>
                          <span className="text-xs text-gray-600">{formatTime(msg.sentAt)}</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-4 shrink-0">
          <div className="flex items-center gap-2 bg-neutral border border-card-border rounded-xl px-4 py-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`#${activeChannelMeta.label}에 메시지 보내기`}
              rows={1}
              className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 resize-none outline-none leading-relaxed max-h-32 overflow-y-auto"
              style={{ height: 'auto' }}
              onInput={e => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${el.scrollHeight}px`;
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-700 mt-1.5 text-right">Enter로 전송 · Shift+Enter 줄바꿈</p>
        </div>
      </div>
    </div>
  );
}
