import type { HackathonDetail } from '../../../types';
import { useStoreContext } from '../../../store/StoreContext';

interface Props {
  detail: HackathonDetail;
}

const rankStyle: Record<number, string> = {
  1: 'text-yellow-400 font-bold',
  2: 'text-gray-300 font-bold',
  3: 'text-amber-600 font-bold',
};

const rankBg: Record<number, string> = {
  1: 'bg-yellow-900/10 border-yellow-600/30',
  2: 'bg-gray-800/20 border-gray-600/30',
  3: 'bg-amber-900/10 border-amber-700/30',
};

export default function LeaderboardTab({ detail }: Props) {
  const { leaderboards, teams } = useStoreContext();

  const lb = leaderboards[detail.slug];
  const hasVote = detail.sections.eval.scoreSource === 'vote';
  const breakdown = detail.sections.eval.scoreDisplay?.breakdown ?? [];

  const hackathonTeams = teams.filter(t => t.hackathonSlugs?.includes(detail.slug));
  const submittedTeamNames = new Set((lb?.entries ?? []).map(e => e.teamName));
  const unsubmittedTeams = hackathonTeams.filter(t => !submittedTeamNames.has(t.name));

  const hasAny = (lb?.entries?.length ?? 0) > 0 || unsubmittedTeams.length > 0;

  if (!hasAny) {
    return (
      <div className="bg-card border border-card-border rounded-xl p-10 text-center">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-gray-500 text-sm">아직 제출된 결과가 없습니다.</p>
      </div>
    );
  }

  const colClass = hasVote
    ? 'grid-cols-[3rem_1fr_5rem_5rem_5rem_8rem]'
    : 'grid-cols-[3rem_1fr_6rem_8rem]';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">실시간 리더보드</h3>
        {lb && (
          <span className="text-xs text-gray-500">
            LAST UPDATE: {new Date(lb.updatedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Vote breakdown visual bar */}
      {hasVote && breakdown.length > 0 && (
        <div className="bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white">점수 산정 방식</span>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-lg">
              {breakdown.map(b => `${b.label} ${b.weightPercent}%`).join(' + ')}
            </span>
          </div>
          <div className="flex rounded-xl overflow-hidden h-3">
            {breakdown.map((b, i) => (
              <div
                key={b.key}
                style={{ width: `${b.weightPercent}%` }}
                className={i === 0 ? 'bg-primary' : 'bg-[#B06B00]'}
                title={`${b.label}: ${b.weightPercent}%`}
              />
            ))}
          </div>
          <div className="flex gap-4 mt-2">
            {breakdown.map((b, i) => (
              <div key={b.key} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-primary' : 'bg-[#B06B00]'}`} />
                <span className="text-xs text-gray-400">{b.label} ({b.weightPercent}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {lb && (
        <div className="bg-blue-900/10 border border-blue-700/30 rounded-xl p-3">
          <p className="text-xs text-blue-400">{detail.sections.leaderboard.note}</p>
        </div>
      )}

      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        <div className={`grid text-xs text-gray-500 px-5 py-3 border-b border-card-border bg-white/5 ${colClass}`}>
          <span>RANK</span>
          <span>TEAM NAME</span>
          <span className="text-right">SCORE</span>
          {hasVote && <span className="text-right">참가자</span>}
          {hasVote && <span className="text-right">심사위원</span>}
          <span className="text-right">제출 시간</span>
        </div>

        <div className="divide-y divide-card-border">
          {(lb?.entries ?? []).map(entry => (
            <div
              key={`${entry.rank}-${entry.teamName}`}
              className={`grid items-center px-5 py-4 transition-colors hover:bg-white/5 ${colClass} ${rankBg[entry.rank] || ''}`}
            >
              <span className={`text-sm ${rankStyle[entry.rank] || 'text-gray-400'}`}>
                {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">{entry.teamName}</div>
                {entry.artifacts?.planTitle && (
                  <div className="text-xs text-gray-500 truncate mt-0.5">{entry.artifacts.planTitle}</div>
                )}
                {entry.artifacts && (
                  <div className="flex gap-2 mt-1">
                    {entry.artifacts.webUrl && (
                      <a href={entry.artifacts.webUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline" onClick={e => e.stopPropagation()}>
                        🔗 웹
                      </a>
                    )}
                    {entry.artifacts.pdfUrl && (
                      <a href={entry.artifacts.pdfUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-red-400 hover:underline" onClick={e => e.stopPropagation()}>
                        📄 PDF
                      </a>
                    )}
                  </div>
                )}
              </div>
              <span className={`text-right text-sm font-semibold ${rankStyle[entry.rank] || 'text-white'}`}>
                {entry.score === 0
                  ? <span className="text-xs text-gray-500">평가중</span>
                  : entry.score.toFixed(entry.score < 1 ? 4 : 1)
                }
              </span>
              {hasVote && <span className="text-right text-xs text-gray-400">{entry.scoreBreakdown?.participant ?? '-'}</span>}
              {hasVote && <span className="text-right text-xs text-gray-400">{entry.scoreBreakdown?.judge ?? '-'}</span>}
              <span className="text-right text-xs text-gray-500">
                {new Date(entry.submittedAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {unsubmittedTeams.map(team => (
            <div key={team.teamCode} className={`grid items-center px-5 py-4 opacity-50 ${colClass}`}>
              <span className="text-sm text-gray-600">--</span>
              <span className="text-sm text-gray-500 truncate">{team.name}</span>
              <span className="text-right">
                <span className="text-xs bg-gray-800/80 text-gray-500 border border-gray-700/50 px-2 py-0.5 rounded-full">미제출</span>
              </span>
              {hasVote && <span className="text-right text-xs text-gray-600">-</span>}
              {hasVote && <span className="text-right text-xs text-gray-600">-</span>}
              <span className="text-right text-xs text-gray-600">-</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
