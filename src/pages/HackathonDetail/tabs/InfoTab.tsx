import type { HackathonDetail } from '../../../types';

interface Props {
  detail: HackathonDetail;
}

export default function InfoTab({ detail }: Props) {
  const { info } = detail.sections;

  return (
    <div className="space-y-6">
      {/* Notice */}
      <div className="bg-card border border-card-border rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">공지 및 안내사항</h3>
        <ul className="space-y-3">
          {info.notice.map((n, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                {i + 1}
              </span>
              <span className="text-sm text-gray-300 leading-relaxed">{n}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Links */}
      <div className="bg-card border border-card-border rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">관련 링크</h3>
        <div className="grid grid-cols-2 gap-3">
          <a
            href={info.links.rules}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-card-border rounded-xl p-4 transition-colors group"
          >
            <div>
              <div className="text-sm font-medium text-white group-hover:text-primary transition-colors">대회 규정</div>
              <div className="text-xs text-gray-500">자세한 규정 확인</div>
            </div>
          </a>
          <a
            href={info.links.faq}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-card-border rounded-xl p-4 transition-colors group"
          >
            <div>
              <div className="text-sm font-medium text-white group-hover:text-primary transition-colors">FAQ</div>
              <div className="text-xs text-gray-500">자주 묻는 질문</div>
            </div>
          </a>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-red-900/10 border border-red-700/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-red-400">중요 안내</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          규정 위반 시 실격 처리될 수 있습니다. 참가 전 반드시 대회 규정을 숙지해 주세요.
        </p>
      </div>
    </div>
  );
}
