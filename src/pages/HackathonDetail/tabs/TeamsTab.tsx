import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreContext } from '../../../store/StoreContext';
import { useAuth } from '../../../store/AuthContext';
import Pager from '../../../components/Pager';
import { usePagination } from '../../../hooks/usePagination';
import type { HackathonDetail, Invitation, Team } from '../../../types';

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

const INVITES_PER_PAGE = 4;

export default function TeamsTab({ detail }: Props) {
  const { teams, invitations, addInvitation, updateInvitation, updateTeam } = useStoreContext();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const hackathonTeams = teams.filter(t => t.hackathonSlugs?.includes(detail.slug));
  const hackathonInvitations = invitations.filter(inv => inv.hackathonSlug === detail.slug);

  const myTeam = useMemo(() => {
    if (!currentUser) return null;
    return hackathonTeams.find(
      t => t.createdBy === currentUser.id || t.members?.includes(currentUser.id)
    ) ?? null;
  }, [hackathonTeams, currentUser]);

  const isSoloParticipant = myTeam !== null && (myTeam.members?.length ?? myTeam.memberCount) === 1;
  const isLeader = myTeam?.createdBy === currentUser?.id;

  // 내가 받은 초대 (type='invite', 나를 초대한 것, pending만)
  const myReceivedInvites = useMemo(() =>
    !currentUser ? [] :
    hackathonInvitations.filter(inv =>
      inv.type === 'invite' &&
      inv.invitedUserId === currentUser.id &&
      inv.status === 'pending'
    ),
    [hackathonInvitations, currentUser]
  );

  const invitePager = usePagination(myReceivedInvites.length, INVITES_PER_PAGE);

  // 초대하기 버튼: 이미 초대했는지 확인
  const isAlreadyInvitedByMe = (soloTeam: Team) => {
    const soloUserId = soloTeam.members?.[0] ?? soloTeam.createdBy;
    return hackathonInvitations.some(
      inv => inv.type === 'invite' &&
             inv.invitedUserId === soloUserId &&
             inv.teamCode === myTeam?.teamCode &&
             inv.status === 'pending'
    );
  };

  const handleSendInvite = (soloTeam: Team) => {
    if (!myTeam || !currentUser) return;
    const soloUserId = soloTeam.members?.[0] ?? soloTeam.createdBy;
    const invitation: Invitation = {
      // eslint-disable-next-line react-hooks/purity
      id: `inv-${Date.now()}`,
      hackathonSlug: detail.slug,
      teamCode: myTeam.teamCode,
      teamName: myTeam.name,
      invitedAt: new Date().toISOString(),
      status: 'pending',
      type: 'invite',
      invitedUserId: soloUserId,
    };
    addInvitation(invitation);
  };

  const handleToggleReceiving = () => {
    if (!myTeam) return;
    updateTeam(myTeam.teamCode, { receivingInvites: myTeam.receivingInvites === false ? true : false });
  };

  const receivingInvites = myTeam?.receivingInvites !== false; // undefined도 true


  return (
    <div className="space-y-6">

      {/* 내가 받은 초대 섹션 — solo 참가자에게만 */}
      {isSoloParticipant && (
        <div className="bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-300 text-sm font-semibold">받은 초대 ({myReceivedInvites.length})</span>
            </div>
            <div className="flex items-center gap-3">
              <Pager {...invitePager} />
              {/* 초대받기 토글 */}
              <button
                onClick={handleToggleReceiving}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  receivingInvites
                    ? 'bg-primary/15 text-primary border-primary/30 hover:bg-primary/25'
                    : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${receivingInvites ? 'bg-primary' : 'bg-gray-600'}`} />
                초대받기 {receivingInvites ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {myReceivedInvites.length === 0 ? (
            <p className="text-gray-500 text-xs">받은 초대가 없습니다.</p>
          ) : (
            <div className="space-y-2.5">
              {invitePager.slice(myReceivedInvites).map(inv => (
                <div key={inv.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-white text-sm truncate font-medium">{inv.teamName}</p>
                    <p className="text-gray-500 text-xs">{timeAgo(inv.invitedAt)}</p>
                  </div>
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 팀 목록 */}
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
              const isSoloTeam = (team.members?.length ?? team.memberCount) === 1;

              // 초대하기 버튼 조건
              const canInvite =
                isLeader &&
                isSoloTeam &&
                team.teamCode !== myTeam?.teamCode &&
                team.receivingInvites !== false;

              const inviteButton = canInvite ? (
                isAlreadyInvitedByMe(team) ? (
                  <span className="text-xs bg-blue-900/30 text-blue-400 border border-blue-700/40 px-3 py-1.5 rounded-lg">
                    초대 완료
                  </span>
                ) : (
                  <button
                    onClick={() => handleSendInvite(team)}
                    className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    초대하기
                  </button>
                )
              ) : null;

              const finalAction = inviteButton;

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
                  {/* Mobile */}
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
                      {finalAction && <div className="shrink-0">{finalAction}</div>}
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

                  {/* Desktop */}
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
                    <div className="flex gap-2 shrink-0 items-center">{finalAction}</div>
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
