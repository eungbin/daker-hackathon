import type { HackathonDetail } from '../../../types';

interface Props {
  detail: HackathonDetail;
}

const criteriaCards = [
  { label: '혁신성', desc: '창의적이고 독창적인 아이디어', weight: 25 },
  { label: '기술성', desc: '기술적 완성도와 구현 난이도', weight: 30 },
  { label: '실용성', desc: '실제 문제 해결 가능성', weight: 25 },
  { label: 'UI/UX', desc: '사용자 경험과 디자인 완성도', weight: 20 },
];

export default function EvalTab({ detail }: Props) {
  const { eval: evalSection } = detail.sections;

  return (
    <div className="space-y-6">
      {/* Score Method */}
      <div className="bg-card border border-card-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">평가 기준</h3>
          {evalSection.scoreDisplay && (
            <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full">
              {evalSection.scoreDisplay.label}
            </span>
          )}
        </div>
        <p className="text-gray-400 text-sm leading-relaxed mb-4">{evalSection.description}</p>

        {/* Score Breakdown */}
        {evalSection.scoreDisplay && (
          <div className="space-y-3">
            {evalSection.scoreDisplay.breakdown.map(item => (
              <div key={item.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">{item.label}</span>
                  <span className="text-sm font-semibold text-primary">{item.weightPercent}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-purple-400 rounded-full transition-all"
                    style={{ width: `${item.weightPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Limits */}
        {evalSection.limits && (
          <div className="mt-4 pt-4 border-t border-card-border grid grid-cols-2 gap-4">
            {evalSection.limits.maxRuntimeSec && (
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-white mb-1">{evalSection.limits.maxRuntimeSec}초</div>
                <div className="text-xs text-gray-500">최대 실행 시간</div>
              </div>
            )}
            {evalSection.limits.maxSubmissionsPerDay && (
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-white mb-1">{evalSection.limits.maxSubmissionsPerDay}회</div>
                <div className="text-xs text-gray-500">일일 최대 제출</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Criteria Cards */}
      <div>
        <h3 className="text-white font-semibold mb-4">세부 평가 항목</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {criteriaCards.map(card => (
            <div key={card.label} className="bg-card border border-card-border rounded-xl p-4 text-center hover:border-primary/40 transition-colors">
              <div className="text-sm font-semibold text-white mb-1">{card.label}</div>
              <div className="text-xs text-gray-500 leading-relaxed mb-2">{card.desc}</div>
              <div className="text-xs font-bold text-primary">{card.weight}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Metric Info */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-white">최종 지표: {evalSection.metricName}</span>
        </div>
        <p className="text-xs text-gray-400">
          모든 평가 항목의 점수를 종합하여 최종 순위를 결정합니다. 동점자 발생 시 제출 시간이 빠른 팀이 우선합니다.
        </p>
      </div>
    </div>
  );
}
