import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreContext } from '../../../store/StoreContext';
import { useAuth } from '../../../store/AuthContext';
import type { HackathonDetail, Invitation, User } from '../../../types';

interface Props {
  detail: HackathonDetail;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function TeamsTab({ detail }: Props) {
  const { teams, invitations, addInvitation, updateInvitation } = useStoreContext();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const hackathonTeams = teams.filter(t => t.hackathonSlug === detail.slug);
  const hackathonInvitations = invitations.filter(inv => inv.hackathonSlug === detail.slug);

  const allUsers = useMemo<User[]>(() => {
    try { return JSON.parse(localStorage.getItem('hacklog_users') || '[]'); } catch { return []; }
  }, []);

  const getUserName = (userId: string) =>
    allUsers.find(u => u.id === userId)?.username ?? userId;

  const myTeam = useMemo(() => {
    if (!currentUser) return null;
    return hackathonTeams.find(
      t => t.createdBy === currentUser.id || t.members?.includes(currentUser.id)
    ) ?? null;
  }, [hackathonTeams, currentUser]);

  const isLeader = myTeam?.createdBy === currentUser?.id;

  const myTeamPendingInvitations = myTeam
    ? hackathonInvitations.filter(inv => inv.teamCode === myTeam.teamCode && inv.status === 'pending')
    : [];

  const [invitedTeamCodes, setInvitedTeamCodes] = useState<Set<string>>(new Set());
  const [requestPage, setRequestPage] = useState(0);
  const [memberPage, setMemberPage] = useState(0);
  const REQUESTS_PER_PAGE = 4;
  const MEMBERS_PER_PAGE = 4;

  const handleInvite = (teamCode: string, teamName: string) => {
    const invitation: Invitation = {
      // eslint-disable-next-line react-hooks/purity
      id: `inv-${Date.now()}`,
      hackathonSlug: detail.slug,
      teamCode,
      teamName,
      invitedAt: new Date().toISOString(),
      status: 'pending',
      requestedBy: currentUser?.id,
    };
    addInvitation(invitation);
    setInvitedTeamCodes(prev => new Set([...prev, teamCode]));
  };

  const getTeamInvitation = (teamCode: string) =>
    hackathonInvitations
      .filter(inv => inv.teamCode === teamCode && inv.requestedBy === currentUser?.id)
      .at(-1);

  return (
    <div className="space-y-6">
      {/* My Team panel */}
      {myTeam && (
        <div>
          {/* Title outside card */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-md">내 팀</h3>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
              myTeam.isOpen
                ? 'bg-green-900/30 text-green-400 border-green-700/50'
                : 'bg-gray-800/60 text-gray-400 border-gray-700/50'
            }`}>
              {myTeam.isOpen ? '모집중' : '모집완료'}
            </span>
          </div>

          {/* 3 equal cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

            {/* Card 1: Team description */}
            <div className="bg-card border border-card-border rounded-xl p-5">
              <h4 className="text-white font-bold text-base mb-2">{myTeam.name}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{myTeam.intro}</p>
              {myTeam.lookingFor.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {myTeam.lookingFor.map(r => (
                    <span key={r} className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded-md border border-white/10">
                      #{r}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Card 2: Members */}
            <div className="bg-card border border-card-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-5-5M9 20H4v-2a4 4 0 015-5m6-5a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-gray-300 text-sm font-semibold">멤버 ({myTeam.memberCount}명)</span>
                </div>
                {(myTeam.members?.length ?? 0) > MEMBERS_PER_PAGE && (
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <button
                      onClick={() => setMemberPage(p => Math.max(0, p - 1))}
                      disabled={memberPage === 0}
                      className="w-6 h-6 flex items-center justify-center rounded hover:text-white disabled:opacity-30 transition-colors text-base"
                    >
                      ‹
                    </button>
                    <span className="text-xs">{memberPage + 1} / {Math.ceil((myTeam.members?.length ?? 0) / MEMBERS_PER_PAGE)}</span>
                    <button
                      onClick={() => setMemberPage(p => Math.min(Math.ceil((myTeam.members?.length ?? 0) / MEMBERS_PER_PAGE) - 1, p + 1))}
                      disabled={memberPage >= Math.ceil((myTeam.members?.length ?? 0) / MEMBERS_PER_PAGE) - 1}
                      className="w-6 h-6 flex items-center justify-center rounded hover:text-white disabled:opacity-30 transition-colors text-base"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-2.5">
                {myTeam.members && myTeam.members.length > 0 ? (
                  myTeam.members.slice(memberPage * MEMBERS_PER_PAGE, (memberPage + 1) * MEMBERS_PER_PAGE).map(uid => {
                    const uname = getUserName(uid);
                    const isTeamLeader = uid === myTeam.createdBy;
                    const initials = uname.slice(0, 2).toUpperCase();
                    return (
                      <div key={uid} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-purple-700/40 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {initials}
                          </div>
                          <span className="text-white text-sm truncate">{uname}</span>
                        </div>
                        {isTeamLeader && (
                          <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-medium shrink-0">
                            LEADER
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-xs">멤버 정보가 없습니다.</p>
                )}
              </div>
            </div>

            {/* Card 3: Join requests */}
            <div className="bg-card border border-card-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-300 text-sm font-semibold">요청 ({myTeamPendingInvitations.length})</span>
                </div>
                {myTeamPendingInvitations.length > REQUESTS_PER_PAGE && (
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <button
                      onClick={() => setRequestPage(p => Math.max(0, p - 1))}
                      disabled={requestPage === 0}
                      className="w-6 h-6 flex items-center justify-center rounded hover:text-white disabled:opacity-30 transition-colors text-base"
                    >
                      ‹
                    </button>
                    <span className="text-xs">{requestPage + 1} / {Math.ceil(myTeamPendingInvitations.length / REQUESTS_PER_PAGE)}</span>
                    <button
                      onClick={() => setRequestPage(p => Math.min(Math.ceil(myTeamPendingInvitations.length / REQUESTS_PER_PAGE) - 1, p + 1))}
                      disabled={requestPage >= Math.ceil(myTeamPendingInvitations.length / REQUESTS_PER_PAGE) - 1}
                      className="w-6 h-6 flex items-center justify-center rounded hover:text-white disabled:opacity-30 transition-colors text-base"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
              {myTeamPendingInvitations.length === 0 ? (
                <p className="text-gray-500 text-xs">대기 중인 요청이 없습니다.</p>
              ) : (
                <div className="space-y-2.5">
                  {myTeamPendingInvitations.slice(requestPage * REQUESTS_PER_PAGE, (requestPage + 1) * REQUESTS_PER_PAGE).map(inv => (
                    <div key={inv.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-white text-sm truncate">{inv.requestedBy ? getUserName(inv.requestedBy) : inv.teamName}</p>
                        <p className="text-gray-500 text-xs">{timeAgo(inv.invitedAt)}</p>
                      </div>
                      {isLeader && (
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => updateInvitation(inv.id, 'accepted')}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-gray-300 border border-white/10 hover:bg-green-900/30 hover:text-green-400 hover:border-green-700/40 transition-colors"
                            title="수락"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => updateInvitation(inv.id, 'rejected')}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-gray-300 border border-white/10 hover:bg-red-900/20 hover:text-red-400 hover:border-red-700/30 transition-colors"
                            title="거절"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}


      {/* Team list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">이 해커톤의 팀 ({hackathonTeams.length})</h3>
          <button
            onClick={() => navigate(`/camp?hackathon=${detail.slug}`)}
            className="text-primary text-sm hover:underline"
          >
            모든 팀 보기 →
          </button>
        </div>

      {hackathonTeams.length === 0 ? (
        <div className="bg-card border border-card-border rounded-xl p-10 text-center">
          <div className="text-3xl mb-3">👥</div>
          <p className="text-gray-500 text-sm mb-4">아직 팀이 없습니다.</p>
          <button
            onClick={() => navigate('/camp')}
            className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            팀 만들기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {hackathonTeams.map(team => {
            const latestInv = getTeamInvitation(team.teamCode);
            const isAlreadyInvited = invitedTeamCodes.has(team.teamCode) ||
              (latestInv?.status === 'pending');
            const isAccepted = latestInv?.status === 'accepted';
            const isRejected = latestInv?.status === 'rejected';

            const actionButton = isAccepted ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-400 border border-blue-700/50">합류 완료</span>
            ) : isRejected ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-700/40">거절됨</span>
            ) : !myTeam && team.isOpen && (
              isAlreadyInvited ? (
                <span className="text-xs bg-yellow-900/30 text-yellow-400 border border-yellow-700/40 px-3 py-1.5 rounded-lg">
                  신청 대기 중
                </span>
              ) : (
                <button
                  onClick={() => handleInvite(team.teamCode, team.name)}
                  className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  가입신청
                </button>
              )
            );

            const statusBadge = (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                team.isOpen
                  ? 'bg-green-900/40 text-green-400 border border-green-700/50'
                  : 'bg-gray-800/60 text-gray-400 border border-gray-700/50'
              }`}>
                {team.isOpen ? '모집중' : '모집완료'}
              </span>
            );

            return (
              <div key={team.teamCode} className="bg-card border border-card-border rounded-xl p-5 hover:border-primary/40 transition-all">
                {/* Mobile: card layout */}
                <div className="flex md:hidden flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-purple-700/30 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {team.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-white font-semibold text-sm truncate min-w-0 flex-1">{team.name}</span>
                          {statusBadge}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{timeAgo(team.createdAt)} · 멤버 {team.memberCount}명</div>
                      </div>
                    </div>
                    {actionButton && <div className="shrink-0">{actionButton}</div>}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{team.intro}</p>
                  {team.lookingFor.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {team.lookingFor.map(r => (
                        <span key={r} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20">{r}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop: row layout */}
                <div className="hidden md:flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-purple-700/30 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {team.name.charAt(0)}
                  </div>
                  <div className="w-44 shrink-0 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-white font-semibold text-sm truncate min-w-0 flex-1">{team.name}</span>
                      {statusBadge}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{timeAgo(team.createdAt)} · 멤버 {team.memberCount}명</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 leading-relaxed">{team.intro}</p>
                    {team.lookingFor.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {team.lookingFor.map(r => (
                          <span key={r} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20">{r}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0 items-center">{actionButton}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
