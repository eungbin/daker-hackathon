import { useState, useMemo } from 'react';
import { useStoreContext } from '../store/StoreContext';
import { useAuth } from '../store/AuthContext';
import type { User } from '../types';

type TimeFilter = '7d' | '30d' | 'all';

function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem('hacklog_users') || '[]');
  } catch {
    return [];
  }
}

interface RankEntry {
  key: string;
  displayName: string;
  isUser: boolean;
  totalScore: number;
  hackathonCount: number;
  latestSubmittedAt: string;
}

export default function Rankings() {
  const { leaderboards, submissions, teams } = useStoreContext();
  const { currentUser } = useAuth();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const users = useMemo(() => getUsers(), []);
  const userMap = useMemo(() => {
    const m: Record<string, User> = {};
    users.forEach(u => { m[u.id] = u; });
    return m;
  }, [users]);

  const cutoff = useMemo(() => {
    if (timeFilter === 'all') return null;
    const d = new Date();
    d.setDate(d.getDate() - (timeFilter === '7d' ? 7 : 30));
    return d;
  }, [timeFilter]);

  const teamMap = useMemo(() => {
    const m = new Map<string, typeof teams[0]>();
    teams.forEach(t => (t.hackathonSlugs ?? []).forEach(slug => m.set(`${slug}:${t.name}`, t)));
    return m;
  }, [teams]);

  const ranked = useMemo(() => {
    const map: Record<string, RankEntry> = {};

    Object.entries(leaderboards).forEach(([slug, lb]) => {
      lb.entries.forEach(entry => {
        if (cutoff && new Date(entry.submittedAt) < cutoff) return;

        const team = teamMap.get(`${slug}:${entry.teamName}`);

        type Contributor = { key: string; displayName: string; isUser: boolean };
        const contributors: Contributor[] = [];

        if (team?.members && team.members.length > 0) {
          team.members.forEach(userId => {
            const user = userMap[userId];
            if (user) contributors.push({ key: userId, displayName: user.username, isUser: true });
          });
        }

        if (contributors.length === 0) {
          const matchSub = submissions.find(s => s.hackathonSlug === slug && s.teamName === entry.teamName);
          if (matchSub?.submittedBy && userMap[matchSub.submittedBy]) {
            contributors.push({ key: matchSub.submittedBy, displayName: userMap[matchSub.submittedBy].username, isUser: true });
          } else {
            contributors.push({ key: `team:${entry.teamName}`, displayName: entry.teamName, isUser: false });
          }
        }

        contributors.forEach(({ key, displayName, isUser }) => {
          if (!map[key]) {
            map[key] = { key, displayName, isUser, totalScore: 0, hackathonCount: 0, latestSubmittedAt: entry.submittedAt };
          }
          map[key].totalScore += entry.score;
          map[key].hackathonCount += 1;
          if (new Date(entry.submittedAt) > new Date(map[key].latestSubmittedAt)) {
            map[key].latestSubmittedAt = entry.submittedAt;
          }
        });
      });
    });

    return Object.values(map).sort((a, b) => b.totalScore - a.totalScore);
  }, [leaderboards, submissions, userMap, teamMap, cutoff]);

  const myRank = currentUser ? ranked.findIndex(r => r.key === currentUser.id) + 1 : 0;
  const myEntry = currentUser ? ranked.find(r => r.key === currentUser.id) : null;

  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <div className="bg-neutral">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <div className="lg:w-64 space-y-4 shrink-0">
            <div className="bg-card border border-card-border rounded-xl p-5">
              <h2 className="text-white font-bold text-base mb-4">글로벌 랭킹</h2>

              {myEntry && (
                <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">내 순위</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold text-sm">{myEntry.displayName}</span>
                    <span className="text-primary font-bold">#{myRank}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">총 {myEntry.totalScore.toFixed(1)}점</p>
                </div>
              )}

              <div className="space-y-1">
                {(['all', '30d', '7d'] as TimeFilter[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setTimeFilter(f)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      timeFilter === f ? 'bg-primary/20 text-primary font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {f === 'all' ? '전체 기간' : f === '30d' ? '최근 30일' : '최근 7일'}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3">통계</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">총 참가자</span>
                  <span className="text-white font-medium">{ranked.length}명</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">해커톤 수</span>
                  <span className="text-white font-medium">{Object.keys(leaderboards).length}개</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">글로벌 랭킹</h1>
              <p className="text-gray-500 text-sm">해커톤 누적 점수 기준 순위입니다</p>
            </div>

            {ranked.length === 0 ? (
              <div className="bg-card border border-card-border rounded-xl p-10 text-center">
                <div className="text-4xl mb-3">🏆</div>
                <p className="text-gray-500 text-sm">아직 랭킹 데이터가 없습니다.</p>
              </div>
            ) : (
              <>
                {/* Podium */}
                {top3.length >= 1 && (
                  <div className="bg-card border border-card-border rounded-xl p-8">
                    <div className="flex items-end justify-center gap-4">
                      {podiumOrder.map((entry, podiumIdx) => {
                        const actualRank = ranked.indexOf(entry) + 1;
                        const isMe = currentUser && entry.key === currentUser.id;
                        const heights = top3.length === 3 ? ['h-24', 'h-32', 'h-20'] : ['h-32'];
                        const colors = ['bg-gray-700', 'bg-yellow-600', 'bg-amber-800'];
                        const textColors = ['text-gray-300', 'text-yellow-400', 'text-amber-600'];
                        const medals = ['🥈', '🥇', '🥉'];

                        return (
                          <div
                            key={entry.key}
                            className={`flex flex-col items-center gap-2 ${podiumIdx === 1 ? 'order-2' : podiumIdx === 0 ? 'order-1' : 'order-3'}`}
                          >
                            <div className={`text-2xl ${isMe ? 'ring-2 ring-primary rounded-full p-1' : ''}`}>
                              {medals[podiumIdx] ?? `#${actualRank}`}
                            </div>
                            <div className="text-center">
                              <p className={`text-sm font-bold ${textColors[podiumIdx]} ${isMe ? 'underline' : ''}`}>
                                {entry.displayName}{isMe ? ' (나)' : ''}
                              </p>
                              <p className="text-xs text-gray-500">{entry.totalScore.toFixed(1)}점</p>
                            </div>
                            <div className={`w-20 ${heights[podiumIdx] ?? 'h-16'} ${colors[podiumIdx]} rounded-t-lg flex items-center justify-center`}>
                              <span className={`text-lg font-bold ${textColors[podiumIdx]}`}>#{actualRank}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Table */}
                {rest.length > 0 && (
                  <div className="bg-card border border-card-border rounded-xl overflow-hidden">
                    <div className="grid grid-cols-[3rem_1fr_6rem_6rem_8rem] text-xs text-gray-500 px-5 py-3 border-b border-card-border bg-white/5">
                      <span>RANK</span>
                      <span>NAME</span>
                      <span className="text-right">총 점수</span>
                      <span className="text-right">참가 수</span>
                      <span className="text-right">최근 제출</span>
                    </div>
                    <div className="divide-y divide-card-border">
                      {rest.map((entry, i) => {
                        const rank = i + 4;
                        const isMe = currentUser && entry.key === currentUser.id;
                        return (
                          <div
                            key={entry.key}
                            className={`grid grid-cols-[3rem_1fr_6rem_6rem_8rem] items-center px-5 py-4 transition-colors hover:bg-white/5 ${
                              isMe ? 'bg-primary/10 border-l-2 border-primary' : ''
                            }`}
                          >
                            <span className="text-sm text-gray-400">#{rank}</span>
                            <div className="min-w-0">
                              <span className={`text-sm font-medium truncate ${isMe ? 'text-primary' : 'text-white'}`}>
                                {entry.displayName}{isMe ? ' (나)' : ''}
                              </span>
                              {!entry.isUser && (
                                <span className="ml-2 text-xs text-gray-600">팀</span>
                              )}
                            </div>
                            <span className="text-right text-sm font-semibold text-white">{entry.totalScore.toFixed(1)}</span>
                            <span className="text-right text-xs text-gray-400">{entry.hackathonCount}회</span>
                            <span className="text-right text-xs text-gray-500">
                              {new Date(entry.latestSubmittedAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
