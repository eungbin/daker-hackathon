import { useNavigate } from 'react-router-dom';
import { useStoreContext } from '../store/StoreContext';
import StatusBadge from '../components/StatusBadge';

export default function Home() {
  const navigate = useNavigate();
  const { hackathons, leaderboards, teams } = useStoreContext();

  const ongoingCount = hackathons.filter(h => h.status === 'ongoing').length;
  const totalSubmissions = Object.values(leaderboards).reduce((sum, lb) => sum + lb.entries.length, 0);
  const totalTeams = teams.length;

  const featuredHackathons = hackathons.slice(0, 3);

  return (
    <div className="min-h-screen bg-neutral">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            현재 {ongoingCount}개 해커톤 진행 중
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            혁신의 시작,{' '}
            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              해커로그
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            최고의 해커톤 플랫폼에서 아이디어를 현실로 만드세요.<br />
            팀을 구성하고, 도전하고, 성장하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/hackathons')}
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/30"
            >
              해커톤 보러가기
            </button>
            <button
              onClick={() => navigate('/camp')}
              className="bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-xl border border-white/10 transition-all"
            >
              팀 찾기
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-3 gap-4 mb-16">
          {[
            { label: '진행중 해커톤', value: ongoingCount, suffix: '개' },
            { label: '총 제출 수', value: totalSubmissions, suffix: '건' },
            { label: '참가팀 수', value: totalTeams, suffix: '팀' },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-card-border rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-primary mb-1">{stat.value}{stat.suffix}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            {
              title: '해커톤 보러가기',
              desc: '진행중인 해커톤에 참가하고 실력을 증명하세요.',
              action: () => navigate('/hackathons'),
              color: 'from-purple-900/40 to-blue-900/40',
            },
            {
              title: '팀 찾기',
              desc: '함께할 팀원을 모집하거나 팀에 합류하세요.',
              action: () => navigate('/camp'),
              color: 'from-blue-900/40 to-cyan-900/40',
            },
            {
              title: '랭킹 보기',
              desc: '글로벌 랭킹에서 내 팀의 위치를 확인하세요.',
              action: () => navigate('/rankings'),
              color: 'from-amber-900/40 to-orange-900/40',
            },
          ].map(card => (
            <div
              key={card.title}
              onClick={card.action}
              className={`bg-gradient-to-br ${card.color} border border-card-border rounded-xl p-6 cursor-pointer hover:border-primary/40 transition-all hover:-translate-y-0.5 group`}
            >
              <h3 className="text-white font-semibold text-lg mb-2">{card.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
              <div className="mt-4 text-primary text-sm font-medium group-hover:underline">
                바로가기 →
              </div>
            </div>
          ))}
        </div>

        {/* Featured Hackathons */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">최근 해커톤</h2>
            <button onClick={() => navigate('/hackathons')} className="text-primary text-sm hover:underline">
              전체 보기 →
            </button>
          </div>
          <div className="space-y-3">
            {featuredHackathons.map(h => (
              <div
                key={h.slug}
                onClick={() => navigate(`/hackathons/${h.slug}`)}
                className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary/40 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  H
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{h.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    마감: {new Date(h.period.submissionDeadlineAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <StatusBadge status={h.status} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
