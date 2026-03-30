import type { HackathonDetail } from '../../../types';

interface Props {
  detail: HackathonDetail;
}

const placeConfig: Record<string, { label: string; icon: string; color: string; border: string; bg: string; size: string }> = {
  '1st': { label: '대상 / 1등', icon: '🥇', color: 'text-yellow-400', border: 'border-yellow-600/50', bg: 'bg-yellow-900/10', size: 'scale-105' },
  '2nd': { label: '최우수 / 2등', icon: '🥈', color: 'text-gray-300', border: 'border-gray-500/50', bg: 'bg-gray-800/20', size: '' },
  '3rd': { label: '우수 / 3등', icon: '🥉', color: 'text-amber-600', border: 'border-amber-700/50', bg: 'bg-amber-900/10', size: '' },
};

export default function PrizeTab({ detail }: Props) {
  const { prize } = detail.sections;
  const total = prize.items.reduce((s, i) => s + i.amountKRW, 0);

  return (
    <div className="space-y-6">
      <div className="bg-card border border-card-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold">상금 및 혜택</h3>
          <div className="text-sm text-gray-500">
            총 상금 <span className="text-white font-semibold">{total.toLocaleString()}원</span>
          </div>
        </div>

        {/* Prize Cards */}
        <div className="flex gap-4 items-end mb-6">
          {prize.items.map(item => {
            const cfg = placeConfig[item.place] || placeConfig['3rd'];
            return (
              <div
                key={item.place}
                className={`flex-1 text-center p-6 rounded-xl border ${cfg.border} ${cfg.bg} ${cfg.size} transition-transform`}
              >
                <div className="text-4xl mb-3">{cfg.icon}</div>
                <div className="text-xs text-gray-500 mb-1">{cfg.label}</div>
                <div className={`text-2xl font-bold ${cfg.color} mb-1`}>
                  {item.amountKRW.toLocaleString()}원
                </div>
                <div className="text-xs text-gray-600">
                  ({(item.amountKRW / 10000).toFixed(0)}만원)
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional benefits */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400 mb-3">추가 혜택</h4>
          {[
            { icon: '📜', text: '수료증 및 참가 인증서 발급' },
            { icon: '🔗', text: '포트폴리오 등록 지원' },
            { icon: '💼', text: '네트워킹 기회 제공' },
          ].map(b => (
            <div key={b.text} className="flex items-center gap-3 py-2 border-b border-card-border last:border-0">
              <span className="text-lg">{b.icon}</span>
              <span className="text-sm text-gray-300">{b.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="bg-amber-900/10 border border-amber-700/30 rounded-xl p-4">
        <p className="text-xs text-amber-400">
          * 상금은 세금 공제 후 지급됩니다. 자세한 내용은 규정을 참고하세요.
        </p>
      </div>
    </div>
  );
}
