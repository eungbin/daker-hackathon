import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Team } from '../types';

interface Props {
  myTeams: Team[];
  currentTeamCode?: string;
}

export default function CampSidebar({ myTeams, currentTeamCode }: Props) {
  const location = useLocation();
  const isListActive = location.pathname === '/camp' && !currentTeamCode;
  const [teamsOpen, setTeamsOpen] = useState(myTeams.length > 0 || !!currentTeamCode);

  return (
    <aside className="hidden md:flex flex-col w-48 shrink-0">
      <nav className="bg-card border border-card-border rounded-xl p-2">
        <Link
          to="/camp"
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-all mb-0.5 ${
            isListActive
              ? 'bg-primary text-white font-medium'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          팀원 모집
        </Link>

        <button
          onClick={() => setTeamsOpen(o => !o)}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-all mb-0.5 ${
            !isListActive && !teamsOpen
              ? 'text-gray-400 hover:text-white hover:bg-white/5'
              : currentTeamCode
              ? 'text-gray-300 hover:text-white hover:bg-white/5'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>내 팀</span>
          <svg
            className={`w-3.5 h-3.5 transition-transform shrink-0 ${teamsOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {teamsOpen && (
          <div className="ml-3 pl-2 border-l border-card-border mb-0.5">
            {myTeams.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-600 italic">소속 팀 없음</p>
            ) : (
              myTeams.map(team => (
                <Link
                  key={team.teamCode}
                  to={`/camp/teams/${team.teamCode}`}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-all mb-0.5 last:mb-0 truncate ${
                    currentTeamCode === team.teamCode
                      ? 'bg-primary text-white font-medium'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {team.name}
                </Link>
              ))
            )}
          </div>
        )}
      </nav>
    </aside>
  );
}
