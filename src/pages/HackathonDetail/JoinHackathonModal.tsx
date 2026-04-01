import { useState } from 'react';
import { useStoreContext } from '../../store/StoreContext';
import { showToast } from '../../components/Toast';
import type { Team } from '../../types';

interface Props {
  hackathonSlug: string;
  hackathonTitle: string;
  candidateTeams: Team[];
  onClose: () => void;
}

export default function JoinHackathonModal({ hackathonSlug, hackathonTitle, candidateTeams, onClose }: Props) {
  const { updateTeam } = useStoreContext();
  const [selectedTeamCode, setSelectedTeamCode] = useState<string>('');

  const handleJoin = () => {
    if (!selectedTeamCode) return;
    const team = candidateTeams.find(t => t.teamCode === selectedTeamCode);
    const currentSlugs = team?.hackathonSlugs ?? [];
    if (!currentSlugs.includes(hackathonSlug)) {
      updateTeam(selectedTeamCode, { hackathonSlugs: [...currentSlugs, hackathonSlug] });
    }
    showToast(`${hackathonTitle}에 참가했습니다!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-card-border rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">해커톤 참여</h2>
            <p className="text-gray-500 text-xs mt-0.5 truncate max-w-xs">{hackathonTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none ml-4">✕</button>
        </div>

        <p className="text-gray-500 text-xs px-6 mb-3 shrink-0">참가할 팀을 선택하세요.</p>

        {/* Team list */}
        <div className="flex-1 overflow-y-auto px-6 space-y-2 min-h-0">
          {candidateTeams.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500 text-sm">참가할 수 있는 팀이 없습니다.</p>
            </div>
          ) : (
            candidateTeams.map(team => {
              const memberCount = team.members?.length ?? team.memberCount;
              const isSelected = selectedTeamCode === team.teamCode;
              return (
                <button
                  key={team.teamCode}
                  onClick={() => setSelectedTeamCode(team.teamCode)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-card-border hover:border-primary/40 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white font-semibold text-sm truncate">{team.name}</span>
                    <span className="text-gray-500 text-xs shrink-0">멤버 {memberCount}명</span>
                  </div>
                  {team.intro && (
                    <p className="text-gray-400 text-xs mt-1 line-clamp-1">{team.intro}</p>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-4 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleJoin}
            disabled={!selectedTeamCode}
            className="flex-1 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-primary/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            참가하기
          </button>
        </div>
      </div>
    </div>
  );
}
