import { useState, useMemo } from 'react';
import type { Invitation, Team } from '../types';
import { useAuth } from '../store/AuthContext';
import { useStoreContext } from '../store/StoreContext';
import { showConfirm } from './Dialog';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function TeamCard({ team }: { team: Team }) {
  const { currentUser } = useAuth();
  const { teams, invitations, addInvitation, updateTeam, hackathons } = useStoreContext();
  const linkedHackathons = (team.hackathonSlugs ?? []).map(s => hackathons.find(h => h.slug === s)).filter(Boolean);
  const isOwner = !!(currentUser && team.createdBy === currentUser.id);
  const isMember = !!(currentUser && team.members?.includes(currentUser.id));
  const [editing, setEditing] = useState(false);
  const [editIntro, setEditIntro] = useState(team.intro);
  const [editLookingFor, setEditLookingFor] = useState(team.lookingFor.join(', '));

  // 이 팀의 해커톤들 중 내가 이미 참가 중인 해커톤 슬러그 목록
  // (각 슬러그별로 내 팀이 있는지 확인, solo 여부도 함께 파악)
  const myTeamsPerSlug = useMemo(() => {
    if (!currentUser || !team.hackathonSlugs?.length) return new Map<string, typeof teams[0]>();
    const map = new Map<string, typeof teams[0]>();
    for (const slug of team.hackathonSlugs) {
      const found = teams.find(
        t => t.hackathonSlugs?.includes(slug) &&
             (t.createdBy === currentUser.id || t.members?.includes(currentUser.id))
      );
      if (found) map.set(slug, found);
    }
    return map;
  }, [teams, currentUser, team.hackathonSlugs]);

  // 가입신청 가능 여부: 해커톤에 소속된 팀이고, 모든 해커톤에서 내 팀이 없거나 solo인 경우
  const canApply = useMemo(() => {
    if (!currentUser || !team.isOpen || isOwner || isMember) return false;
    // 어느 하나의 해커톤에서라도 multi 팀으로 참가 중이면 불가
    for (const [, myTeam] of myTeamsPerSlug) {
      if ((myTeam.members?.length ?? myTeam.memberCount) > 1) return false;
    }
    return true;
  }, [currentUser, team.isOpen, isOwner, isMember, myTeamsPerSlug]);

  // 가입신청 상태 조회 (teamCode 기준 최신 1건)
  const latestRequest = useMemo(() =>
    !currentUser ? undefined :
    invitations
      .filter(inv =>
        inv.teamCode === team.teamCode &&
        (inv.type === 'request' || !inv.type) &&
        inv.requestedBy === currentUser.id
      )
      .at(-1),
    [invitations, currentUser, team.teamCode]
  );

  const handleApply = async () => {
    if (!currentUser) return;
    const ok = await showConfirm(`"${team.name}" 팀에 가입신청하시겠습니까?`);
    if (!ok) return;
    const invitation: Invitation = {
      id: `inv-${Date.now()}`,
      hackathonSlug: team.hackathonSlugs?.[0] ?? '',
      teamCode: team.teamCode,
      teamName: team.name,
      invitedAt: new Date().toISOString(),
      status: 'pending',
      type: 'request',
      requestedBy: currentUser.id,
    };
    addInvitation(invitation);
  };

  const handleSave = () => {
    updateTeam(team.teamCode, {
      intro: editIntro,
      lookingFor: editLookingFor.split(',').map(s => s.trim()).filter(Boolean),
    });
    setEditing(false);
  };

  const handleToggleOpen = () => {
    updateTeam(team.teamCode, { isOpen: !team.isOpen });
  };

  const applyButton = (() => {
    if (!canApply) return null;
    if (latestRequest?.status === 'rejected') {
      return <span className="text-xs px-3 py-1 rounded-lg bg-red-900/30 text-red-400 border border-red-700/40">거절됨</span>;
    }
    if (latestRequest?.status === 'pending') {
      return <span className="text-xs px-3 py-1 rounded-lg bg-yellow-900/30 text-yellow-400 border border-yellow-700/40">신청 대기 중</span>;
    }
    return (
      <button
        onClick={handleApply}
        className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-lg hover:bg-primary/30 transition-colors"
      >
        가입신청
      </button>
    );
  })();

  return (
    <div className={`bg-card border border-card-border rounded-xl p-5 space-y-3 transition-all ${
      team.isOpen ? 'hover:border-primary/40' : 'opacity-50 hover:opacity-70'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">{team.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{timeAgo(team.createdAt)}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            team.isOpen
              ? 'bg-green-900/40 text-green-400 border border-green-700/50'
              : 'bg-gray-800/60 text-gray-400 border border-gray-700/50'
          }`}>
            {team.isOpen ? '모집중' : '모집완료'}
          </span>
          {isOwner && (
            <>
              <button
                onClick={() => setEditing(!editing)}
                title="수정"
                className="text-xs text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-2 py-0.5 rounded-lg transition-colors"
              >
                수정하기
              </button>
              <button
                onClick={handleToggleOpen}
                title={team.isOpen ? '모집 마감' : '모집 재개'}
                className={`text-xs px-2 py-0.5 rounded-lg transition-colors ${
                  team.isOpen
                    ? 'text-red-400 bg-red-900/20 hover:bg-red-900/30'
                    : 'text-green-400 bg-green-900/20 hover:bg-green-900/30'
                }`}
              >
                {team.isOpen ? '마감' : '재개'}
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={editIntro}
            onChange={e => setEditIntro(e.target.value)}
            rows={3}
            className="w-full bg-neutral border border-card-border rounded-lg py-2 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 resize-none"
            placeholder="팀 소개..."
          />
          <input
            value={editLookingFor}
            onChange={e => setEditLookingFor(e.target.value)}
            className="w-full bg-neutral border border-card-border rounded-lg py-1.5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
            placeholder="찾는 포지션 (쉼표 구분)"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-primary text-white text-xs py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              저장
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 bg-white/5 text-gray-300 text-xs py-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{team.intro}</p>
      )}

      {!editing && team.lookingFor.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {team.lookingFor.map(role => (
            <span key={role} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20">
              {role}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs py-1 border-t border-card-border">
        <svg className="w-3 h-3 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {linkedHackathons.length > 0 ? (
          <span className="text-gray-400 truncate">{linkedHackathons.map(h => h!.title).join(', ')}</span>
        ) : (
          <span className="text-gray-600">참여 중인 대회 없음</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">멤버 {team.memberCount}명</span>
        <div className="flex items-center gap-2">
          {applyButton}
        </div>
      </div>
    </div>
  );
}
