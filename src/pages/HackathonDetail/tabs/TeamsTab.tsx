import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreContext } from '../../../store/StoreContext';
import type { HackathonDetail, Invitation } from '../../../types';

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
  const navigate = useNavigate();

  const hackathonTeams = teams.filter(t => t.hackathonSlug === detail.slug);
  const hackathonInvitations = invitations.filter(inv => inv.hackathonSlug === detail.slug);

  const pendingInvitations = hackathonInvitations.filter(inv => inv.status === 'pending');

  const [invitedTeamCodes, setInvitedTeamCodes] = useState<Set<string>>(new Set());

  const handleInvite = (teamCode: string, teamName: string) => {
    const invitation: Invitation = {
      id: `inv-${Date.now()}`,
      hackathonSlug: detail.slug,
      teamCode,
      teamName,
      invitedAt: new Date().toISOString(),
      status: 'pending',
    };
    addInvitation(invitation);
    setInvitedTeamCodes(prev => new Set([...prev, teamCode]));
  };

  const getTeamInvitation = (teamCode: string) =>
    hackathonInvitations.filter(inv => inv.teamCode === teamCode).at(-1);

  return (
    <div className="space-y-6">
      {/* Pending invitations panel */}
      {pendingInvitations.length > 0 && (
        <div className="bg-yellow-900/10 border border-yellow-700/30 rounded-xl p-5">
          <h4 className="text-yellow-400 font-semibold text-sm mb-3">
            📬 받은 초대 요청 ({pendingInvitations.length})
          </h4>
          <div className="space-y-2">
            {pendingInvitations.map(inv => (
              <div key={inv.id} className="flex items-center justify-between gap-3 bg-white/5 rounded-lg px-4 py-3">
                <div>
                  <span className="text-white text-sm font-medium">{inv.teamName}</span>
                  <span className="text-gray-500 text-xs ml-2">{timeAgo(inv.invitedAt)}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateInvitation(inv.id, 'accepted')}
                    className="text-xs bg-green-900/40 text-green-400 border border-green-700/50 px-3 py-1 rounded-lg hover:bg-green-900/60 transition-colors"
                  >
                    수락
                  </button>
                  <button
                    onClick={() => updateInvitation(inv.id, 'rejected')}
                    className="text-xs bg-red-900/30 text-red-400 border border-red-700/40 px-3 py-1 rounded-lg hover:bg-red-900/50 transition-colors"
                  >
                    거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team list header */}
      <div className="flex items-center justify-between">
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

            return (
              <div key={team.teamCode} className="bg-card border border-card-border rounded-xl p-5 hover:border-primary/40 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-purple-700/30 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {team.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-sm">{team.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          team.isOpen
                            ? 'bg-green-900/40 text-green-400 border border-green-700/50'
                            : 'bg-gray-800/60 text-gray-400 border border-gray-700/50'
                        }`}>
                          {team.isOpen ? '모집중' : '모집완료'}
                        </span>
                        {isAccepted && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-400 border border-blue-700/50">합류 완료</span>
                        )}
                        {isRejected && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-700/40">거절됨</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{timeAgo(team.createdAt)} · 멤버 {team.memberCount}명</div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 shrink-0">
                    {team.isOpen && !isAccepted && !isRejected && (
                      <>
                        {isAlreadyInvited ? (
                          <span className="text-xs bg-yellow-900/30 text-yellow-400 border border-yellow-700/40 px-3 py-1.5 rounded-lg">
                            초대 대기 중...
                          </span>
                        ) : (
                          <button
                            onClick={() => handleInvite(team.teamCode, team.name)}
                            className="text-xs bg-primary/10 text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                          >
                            초대 요청
                          </button>
                        )}
                        <a
                          href={team.contact.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          가입하기
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-3 leading-relaxed">{team.intro}</p>

                {team.lookingFor.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="text-xs text-gray-500">찾는 포지션:</span>
                    {team.lookingFor.map(r => (
                      <span key={r} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20">
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
