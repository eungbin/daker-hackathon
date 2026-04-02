import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStoreContext } from '../store/StoreContext';
import { useAuth } from '../store/AuthContext';
import CampSidebar from '../components/CampSidebar';
import Pager from '../components/Pager';
import { usePagination } from '../hooks/usePagination';
import type { User } from '../types';

export default function TeamDetail() {
  const { teamCode } = useParams<{ teamCode: string }>();
  const { teams, hackathons, invitations, updateTeam, updateInvitation } = useStoreContext();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const team = teams.find(t => t.teamCode === teamCode);

  const users = useMemo<User[]>(() => {
    try {
      const stored = localStorage.getItem('hacklog_users');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  }, []);
  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users]);

  const myTeams = useMemo(() =>
    teams.filter(t => currentUser && (t.createdBy === currentUser.id || t.members?.includes(currentUser.id))),
    [teams, currentUser]
  );

  const isLeader = !!currentUser && team?.createdBy === currentUser.id;

  const pendingInvitations = useMemo(() =>
    invitations.filter(inv => inv.teamCode === teamCode && inv.status === 'pending'),
    [invitations, teamCode]
  );

  const teamHackathons = useMemo(() =>
    hackathons.filter(h => team?.hackathonSlugs?.includes(h.slug)),
    [hackathons, team]
  );

  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [roleInput, setRoleInput] = useState('');
  const requestPager = usePagination(pendingInvitations.length, 4);
  const memberPager = usePagination((team?.members ?? []).length, 4);

  const startEdit = (memberId: string) => {
    setEditingMember(memberId);
    setRoleInput(team?.memberRoles?.[memberId] ?? '');
  };

  const saveRole = (memberId: string) => {
    if (!team) return;
    updateTeam(team.teamCode, {
      memberRoles: { ...(team.memberRoles ?? {}), [memberId]: roleInput.trim() },
    });
    setEditingMember(null);
  };

  const kickMember = (memberId: string) => {
    if (!team) return;
    const newMembers = (team.members ?? []).filter(id => id !== memberId);
    const newRoles = { ...(team.memberRoles ?? {}) };
    delete newRoles[memberId];
    updateTeam(team.teamCode, {
      members: newMembers,
      memberCount: newMembers.length,
      memberRoles: newRoles,
    });
  };

  const statusLabel = (status: string) => {
    if (status === 'ongoing') return { text: '진행중', cls: 'text-green-400 bg-green-500/10' };
    if (status === 'upcoming') return { text: '예정', cls: 'text-blue-400 bg-blue-500/10' };
    return { text: '종료', cls: 'text-gray-400 bg-gray-500/10' };
  };

  return (
    <div className="bg-neutral min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-8">
        <CampSidebar myTeams={myTeams} currentTeamCode={teamCode} />

        <div className="flex-1 min-w-0">
          {!team ? (
            <div className="text-center py-20 text-gray-500">
              <p>팀을 찾을 수 없습니다.</p>
              <button onClick={() => navigate('/camp')} className="mt-3 text-primary hover:underline text-sm">
                팀 목록으로 →
              </button>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Team Info */}
              <div className="bg-card border border-card-border rounded-2xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      team.isOpen ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-400'
                    }`}>
                      {team.isOpen ? '모집중' : '모집 완료'}
                    </span>
                    <span className="text-xs text-gray-600 font-mono">{team.teamCode}</span>
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">{team.name}</h1>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">
                  {team.intro || '팀 소개가 없습니다.'}
                </p>

                <div className="flex flex-wrap gap-6 text-sm border-t border-card-border pt-4">
                  <div>
                    <div className="text-gray-500 text-xs mb-1">멤버</div>
                    <div className="text-white font-semibold">{team.memberCount}명</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">참여 해커톤</div>
                    <div className="text-white font-semibold">{team.hackathonSlugs?.length ?? 0}개</div>
                  </div>
                  {team.lookingFor.length > 0 && (
                    <div>
                      <div className="text-gray-500 text-xs mb-1">모집 포지션</div>
                      <div className="flex gap-1 flex-wrap">
                        {team.lookingFor.map(r => (
                          <span key={r} className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full">{r}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {team.contact.url && (
                    <div>
                      <div className="text-gray-500 text-xs mb-1">연락처</div>
                      <a
                        href={team.contact.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-xs hover:underline"
                      >
                        {team.contact.url}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Participating Hackathons */}
              {teamHackathons.length > 0 && (
                <div className="bg-card border border-card-border rounded-2xl p-6">
                  <h2 className="text-white font-semibold mb-4">참여 중인 해커톤</h2>
                  <div className="space-y-3">
                    {teamHackathons.map(h => {
                      const s = statusLabel(h.status);
                      return (
                        <div key={h.slug} className="flex items-center justify-between py-1">
                          <button
                            onClick={() => navigate(`/hackathons/${h.slug}`)}
                            className="text-white text-sm font-medium hover:text-primary transition-colors text-left"
                          >
                            {h.title}
                          </button>
                          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-4 ${s.cls}`}>{s.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Member List */}
              <div className="bg-card border border-card-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold">팀 멤버 구성</h2>
                  <Pager {...memberPager} />
                </div>
                {(team.members ?? []).length === 0 ? (
                  <p className="text-gray-500 text-sm">멤버 정보가 없습니다.</p>
                ) : (
                  <div className="divide-y divide-card-border">
                    {memberPager.slice(team.members ?? []).map(memberId => {
                      const user = userMap[memberId];
                      const displayName = user?.username ?? memberId;
                      const currentRole = team.memberRoles?.[memberId] ?? '';
                      const isEditing = editingMember === memberId;

                      return (
                        <div key={memberId} className="py-3 first:pt-0 last:pb-0">
                          <div className="flex items-start sm:items-center gap-4">
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                              {displayName[0]?.toUpperCase()}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {/* Name row (공통) */}
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <p className="text-white text-sm font-medium truncate">{displayName}</p>
                                  {memberId === team.createdBy && (
                                    <span className="text-xs text-yellow-500/80 flex-shrink-0">팀장</span>
                                  )}
                                </div>
                                {/* 데스크탑: 포지션 + 액션 인라인 */}
                                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                                  {isEditing && isLeader ? (
                                    <>
                                      <input
                                        type="text"
                                        value={roleInput}
                                        onChange={e => setRoleInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') saveRole(memberId); if (e.key === 'Escape') setEditingMember(null); }}
                                        placeholder="포지션 입력"
                                        className="bg-neutral border border-primary/40 rounded-lg px-2.5 py-1 text-xs text-white w-32 focus:outline-none focus:border-primary"
                                        autoFocus
                                      />
                                      <button onClick={() => saveRole(memberId)} className="text-xs text-primary hover:text-primary/80 font-medium">저장</button>
                                      <button onClick={() => setEditingMember(null)} className="text-xs text-gray-500 hover:text-gray-300">취소</button>
                                    </>
                                  ) : (
                                    <>
                                      <span className={`text-xs px-1 py-0.5 rounded-full ${
                                        currentRole ? 'bg-white/8 text-gray-300' : 'text-gray-600'
                                      }`}>
                                        {currentRole || '포지션 미지정'}
                                      </span>
                                      {isLeader && (
                                        <>
                                          <button onClick={() => startEdit(memberId)} className="text-xs text-gray-600 hover:text-primary transition-colors">편집</button>
                                          {memberId !== team.createdBy ? (
                                            <button onClick={() => kickMember(memberId)} className="text-xs text-red-500/70 hover:text-red-400 transition-colors">추방하기</button>
                                          ) : (
                                            <span className="invisible text-xs">추방하기</span>
                                          )}
                                        </>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* 모바일: 포지션 + 액션 아랫줄 */}
                              <div className="sm:hidden mt-1.5 space-y-1.5">
                                {isEditing && isLeader ? (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <input
                                      type="text"
                                      value={roleInput}
                                      onChange={e => setRoleInput(e.target.value)}
                                      onKeyDown={e => { if (e.key === 'Enter') saveRole(memberId); if (e.key === 'Escape') setEditingMember(null); }}
                                      placeholder="포지션 입력"
                                      className="bg-neutral border border-primary/40 rounded-lg px-2.5 py-1 text-xs text-white w-28 focus:outline-none focus:border-primary"
                                      autoFocus
                                    />
                                    <button onClick={() => saveRole(memberId)} className="text-xs text-primary hover:text-primary/80 font-medium">저장</button>
                                    <button onClick={() => setEditingMember(null)} className="text-xs text-gray-500 hover:text-gray-300">취소</button>
                                  </div>
                                ) : (
                                  <>
                                    <p className={`text-xs ${currentRole ? 'text-gray-300' : 'text-gray-600'}`}>
                                      {currentRole || '포지션 미지정'}
                                    </p>
                                    {isLeader && (
                                      <div className="flex gap-3">
                                        <button onClick={() => startEdit(memberId)} className="text-xs text-gray-600 hover:text-primary transition-colors">편집</button>
                                        {memberId !== team.createdBy && (
                                          <button onClick={() => kickMember(memberId)} className="text-xs text-red-500/70 hover:text-red-400 transition-colors">추방하기</button>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Join Request Management — leader only */}
              {isLeader && (
                <div className="bg-card border border-card-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-semibold flex items-center gap-2">
                      가입 요청 관리
                      {pendingInvitations.length > 0 && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          {pendingInvitations.length}
                        </span>
                      )}
                    </h2>
                    <Pager {...requestPager} />
                  </div>
                  {pendingInvitations.length === 0 ? (
                    <p className="text-gray-500 text-sm">대기 중인 가입 요청이 없습니다.</p>
                  ) : (
                    <div className="divide-y divide-card-border">
                      {requestPager.slice(pendingInvitations).map(inv => {
                        const requesterId = inv.type === 'invite' ? inv.invitedUserId : inv.requestedBy;
                        const requester = requesterId ? userMap[requesterId] : null;
                        const displayName = requester?.username ?? requesterId ?? '알 수 없음';
                        return (
                          <div key={inv.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                            <div>
                              <p className="text-white text-sm font-medium">{displayName}</p>
                              <p className="text-gray-500 text-xs mt-0.5">
                                {new Date(inv.invitedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}
                                {inv.type === 'invite' && <span className="ml-2 text-blue-400/70">초대</span>}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateInvitation(inv.id, 'accepted')}
                                className="text-xs bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 rounded-lg font-medium transition-colors"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => updateInvitation(inv.id, 'rejected')}
                                className="text-xs bg-white/5 hover:bg-white/10 text-gray-400 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                거절
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
