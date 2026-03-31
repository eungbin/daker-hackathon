import { useState, useMemo } from 'react';
import { useStoreContext } from '../../store/StoreContext';
import { showToast } from '../../components/Toast';
import type { Team } from '../../types';

interface Props {
  hackathonSlug: string;
  hackathonTitle: string;
  currentUserId: string;
  candidateTeams: Team[];
  onClose: () => void;
}

type JoinTab = 'solo' | 'team';

export default function JoinHackathonModal({ hackathonSlug, hackathonTitle, currentUserId, candidateTeams, onClose }: Props) {
  const { updateTeam } = useStoreContext();

  const soloTeams = useMemo(() =>
    candidateTeams.filter(t => (t.members?.length ?? t.memberCount) === 1),
    [candidateTeams]
  );

  const groupTeams = useMemo(() =>
    candidateTeams.filter(t =>
      t.createdBy === currentUserId &&
      (t.members?.length ?? t.memberCount) >= 2
    ),
    [candidateTeams, currentUserId]
  );

  const [activeTab, setActiveTab] = useState<JoinTab>(() =>
    soloTeams.length > 0 ? 'solo' : 'team'
  );
  const [selectedTeamCode, setSelectedTeamCode] = useState<string>('');

  const currentList = activeTab === 'solo' ? soloTeams : groupTeams;

  const handleTabChange = (tab: JoinTab) => {
    setActiveTab(tab);
    setSelectedTeamCode('');
  };

  const handleJoin = () => {
    if (!selectedTeamCode) return;
    updateTeam(selectedTeamCode, { hackathonSlug });
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

        {/* Tabs */}
        <div className="flex gap-1 mx-6 mb-4 bg-neutral rounded-xl p-1 shrink-0">
          <button
            onClick={() => handleTabChange('solo')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'solo' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            개인으로 참가
          </button>
          <button
            onClick={() => handleTabChange('team')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'team' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            팀으로 참가
          </button>
        </div>

        {/* Tab description */}
        <p className="text-gray-500 text-xs px-6 mb-3 shrink-0">
          {activeTab === 'solo'
            ? '나 혼자 있는 팀을 선택해 개인 자격으로 참가합니다.'
            : '내가 리더이고 2인 이상인 팀을 선택해 참가합니다.'}
        </p>

        {/* Team list */}
        <div className="flex-1 overflow-y-auto px-6 space-y-2 min-h-0">
          {currentList.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500 text-sm">
                {activeTab === 'solo'
                  ? '개인으로 참가할 수 있는 팀이 없습니다.\n1인으로 구성된 팀이 필요합니다.'
                  : '팀으로 참가할 수 있는 팀이 없습니다.\n리더이면서 2인 이상인 팀이 필요합니다.'}
              </p>
            </div>
          ) : (
            currentList.map(team => {
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
