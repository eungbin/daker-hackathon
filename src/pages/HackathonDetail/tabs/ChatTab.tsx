import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreContext } from '../../../store/StoreContext';
import { useAuth } from '../../../store/AuthContext';
import type { HackathonDetail } from '../../../types';

interface Props {
  detail: HackathonDetail;
}

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

export default function ChatTab({ detail }: Props) {
  const { teams, chats, addChatMessage } = useStoreContext();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const slug = detail.slug;

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isParticipant = currentUser
    ? teams.some(t =>
        t.hackathonSlugs?.includes(slug) &&
        (t.createdBy === currentUser.id || t.members?.includes(currentUser.id))
      )
    : false;

  const messages = chats[slug] ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    const content = input.trim();
    if (!content || !currentUser) return;

    addChatMessage({
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      hackathonSlug: slug,
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
    <div className="bg-card border border-card-border rounded-xl flex flex-col h-[580px]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-card-border flex items-center gap-2 shrink-0">
        <span className="text-white font-semibold text-sm"># {detail.title}</span>
        <span className="text-gray-600 text-xs ml-auto">참가자 전용 채팅</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3">👋</div>
            <p className="text-gray-400 text-sm font-medium">첫 번째 메시지를 보내보세요!</p>
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
                  /* Grouped: no avatar/name, just content with left padding */
                  <div className="flex gap-3">
                    <div className="w-9 shrink-0" />
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-words flex-1">
                      {msg.content}
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-3 items-start">
                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-bold ${avatarColor(msg.username)}`}>
                      {msg.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Name + time */}
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className={`text-sm font-semibold ${isMe ? 'text-primary' : 'text-white'}`}>
                          {msg.username}{isMe ? ' (나)' : ''}
                        </span>
                        <span className="text-xs text-gray-600">{formatTime(msg.sentAt)}</span>
                      </div>
                      {/* Content */}
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
            placeholder="메시지를 입력하세요..."
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
  );
}
