import type { HackathonDetail } from '../../../types';

interface Props {
  detail: HackathonDetail;
}

const phaseLabels = ['REGISTRATION', 'IDEATION', 'CODING', 'SUBMISSION', 'EVALUATION', 'ANNOUNCEMENT', 'MILESTONE', 'MILESTONE'];

function formatDateTime(dateStr: string): { date: string; time: string } {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    time: d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
  };
}

function isPast(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

function isCurrent(dateStr: string, nextDateStr?: string): boolean {
  const now = new Date();
  const date = new Date(dateStr);
  if (nextDateStr) {
    return date <= now && now < new Date(nextDateStr);
  }
  return false;
}

export default function ScheduleTab({ detail }: Props) {
  const { schedule } = detail.sections;

  return (
    <div className="space-y-6">
      <div className="bg-card border border-card-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold">대회 일정</h3>
          <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-lg">{schedule.timezone}</span>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-card-border" />

          <div className="space-y-0">
            {schedule.milestones.map((milestone, i) => {
              const { date, time } = formatDateTime(milestone.at);
              const past = isPast(milestone.at);
              const current = isCurrent(milestone.at, schedule.milestones[i + 1]?.at);
              const phase = phaseLabels[i] || 'MILESTONE';

              return (
                <div key={i} className="relative flex gap-6 pb-6 last:pb-0">
                  {/* Dot */}
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border-2 ${
                    current
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 animate-pulse'
                      : past
                      ? 'bg-green-900/50 border-green-600 text-green-400'
                      : 'bg-card-border border-card-border text-gray-500'
                  }`}>
                    {past && !current ? '✓' : i + 1}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 py-1 ${current ? 'opacity-100' : past ? 'opacity-70' : 'opacity-60'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                        current ? 'bg-primary/20 text-primary' :
                        past ? 'bg-green-900/30 text-green-500' :
                        'bg-white/5 text-gray-500'
                      }`}>
                        {phase}
                      </span>
                      {current && (
                        <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">진행중</span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-white mb-0.5">{milestone.name}</div>
                    <div className="text-xs text-gray-500">{date} {time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
