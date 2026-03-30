import type { HackathonDetail } from '../../../types';

interface Props {
  detail: HackathonDetail;
}

export default function OverviewTab({ detail }: Props) {
  const { overview, prize } = detail.sections;
  const totalPrize = prize.items.reduce((sum, item) => sum + item.amountKRW, 0);

  const prizeConfig = [
    { border: 'border-yellow-600/50 bg-yellow-900/10', text: 'text-yellow-400', label: '🥇 1st Place' },
    { border: 'border-gray-500/50 bg-gray-800/20', text: 'text-gray-300', label: '🥈 2nd Place' },
    { border: 'border-amber-700/50 bg-amber-900/10', text: 'text-amber-600', label: '🥉 3rd Place' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-card border border-card-border rounded-xl p-6">
        <h3 className="text-white font-semibold mb-3">대회 개요</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{overview.summary}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-card-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {overview.teamPolicy.allowSolo ? '1' : '2'}~{overview.teamPolicy.maxTeamSize}
          </div>
          <div className="text-xs text-gray-500">팀 인원</div>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4 text-center">
          <div className="text-xl font-bold text-primary mb-1">온라인</div>
          <div className="text-xs text-gray-500">진행 방식</div>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4 text-center">
          <div className="text-xl font-bold text-green-400 mb-1">누구나</div>
          <div className="text-xs text-gray-500">참가 대상</div>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4 text-center">
          <div className="text-lg font-bold text-yellow-400 mb-1">
            {(totalPrize / 10000).toFixed(0)}만원
          </div>
          <div className="text-xs text-gray-500">총 상금</div>
        </div>
      </div>

      {/* Participation info */}
      <div className="bg-card border border-card-border rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">참가 정보</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-card-border">
            <span className="text-gray-400 text-sm">솔로 참가</span>
            <span className={`text-sm font-medium px-2 py-0.5 rounded-lg ${
              overview.teamPolicy.allowSolo ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'
            }`}>
              {overview.teamPolicy.allowSolo ? '가능' : '불가'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-card-border">
            <span className="text-gray-400 text-sm">최대 팀 인원</span>
            <span className="text-sm font-medium text-white">{overview.teamPolicy.maxTeamSize}명</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-400 text-sm">진행 방식</span>
            <span className="text-sm font-medium text-white">온라인</span>
          </div>
        </div>
      </div>

      {/* Prize — full display (상금 탭 통합) */}
      <div className="bg-card border border-card-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold">상금 및 혜택</h3>
          <span className="text-xs text-gray-500">
            총 <span className="text-yellow-400 font-semibold">{totalPrize.toLocaleString()}</span>원
          </span>
        </div>

        <div className="flex gap-3">
          {prize.items.map((item, i) => {
            const cfg = prizeConfig[i] ?? prizeConfig[2];
            return (
              <div key={item.place} className={`flex-1 flex flex-col items-center gap-1.5 border rounded-xl p-4 ${cfg.border}`}>
                <div className="text-xs text-gray-400">{cfg.label}</div>
                <div className={`font-bold text-lg ${cfg.text}`}>
                  {item.amountKRW.toLocaleString()}원
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 bg-white/3 border border-card-border rounded-xl p-3 space-y-1">
          <p className="text-xs text-gray-500">• 수상팀에게는 상금 외 추가 혜택이 제공될 수 있습니다.</p>
          <p className="text-xs text-gray-500">• 자세한 내용은 규정을 확인하세요.</p>
        </div>
      </div>

      {/* Contact */}
      <div className="flex gap-3">
        <button className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 py-2.5 rounded-xl text-sm font-medium transition-colors">
          문의하기
        </button>
        <button className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 border border-card-border py-2.5 rounded-xl text-sm font-medium transition-colors">
          공유하기
        </button>
      </div>
    </div>
  );
}
