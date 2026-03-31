import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStoreContext } from '../../store/StoreContext';
import { useAuth } from '../../store/AuthContext';
import { showConfirm } from '../../components/Dialog';
import JoinHackathonModal from './JoinHackathonModal';
import StatusBadge from '../../components/StatusBadge';
import OverviewTab from './tabs/OverviewTab';
import EvalTab from './tabs/EvalTab';
import TeamsTab from './tabs/TeamsTab';
import InfoTab from './tabs/InfoTab';
import SubmitTab from './tabs/SubmitTab';
import LeaderboardTab from './tabs/LeaderboardTab';

type TabKey = 'overview' | 'eval' | 'teams' | 'info' | 'submit' | 'leaderboard';

const tabs: { key: TabKey; label: string; }[] = [
  { key: 'overview', label: '개요' },
  { key: 'eval', label: '평가' },
  { key: 'teams', label: '팀' },
  { key: 'info', label: '안내' },
  { key: 'submit', label: '제출' },
  { key: 'leaderboard', label: '리더보드' },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
}

function isPast(dateStr: string) {
  return new Date(dateStr) < new Date();
}

function isCurrent(dateStr: string, nextDateStr?: string) {
  const now = new Date();
  const date = new Date(dateStr);
  if (nextDateStr) return date <= now && now < new Date(nextDateStr);
  return false;
}

export default function HackathonDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { hackathons, details, teams } = useStoreContext();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showSchedulePanel, setShowSchedulePanel] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const hackathon = hackathons.find(h => h.slug === slug);
  const detail = details[slug || ''];
  const hasMyTeam = currentUser
    ? teams.some(t => t.hackathonSlug === slug && (t.createdBy === currentUser.id || t.members?.includes(currentUser.id)))
    : false;

  const candidateTeams = useMemo(() =>
    currentUser
      ? teams.filter(t =>
          t.hackathonSlug == null &&
          (t.createdBy === currentUser.id || t.members?.includes(currentUser.id))
        )
      : [],
    [teams, currentUser]
  );

  const handleJoinClick = async () => {
    if (!currentUser) { navigate('/login'); return; }
    if (candidateTeams.length > 0) { setShowJoinModal(true); return; }
    const ok = await showConfirm('해커톤에 참여할 수 있는 팀이 없습니다.\n팀을 생성하거나 기존 팀에 참여하시겠습니까?');
    if (ok) navigate(`/camp?hackathon=${slug}`);
  };

  if (!hackathon || !detail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-white font-semibold mb-2">존재하지 않는 해커톤입니다</h2>
          <p className="text-gray-500 text-sm mb-4">요청하신 해커톤을 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/hackathons')}
            className="bg-primary text-white text-sm px-5 py-2 rounded-xl hover:bg-primary/90 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const { schedule } = detail.sections;

  return (
    <>
    <div className="min-h-screen bg-neutral">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <button onClick={() => navigate('/hackathons')} className="hover:text-white transition-colors">해커톤</button>
          <span>/</span>
          <span className="text-gray-400 truncate max-w-xs">{hackathon.title}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <StatusBadge status={hackathon.status} />
              <div className="flex gap-1.5 flex-wrap">
                {hackathon.tags.map(t => (
                  <span key={t} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">#{t}</span>
                ))}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white leading-tight">{hackathon.title}</h1>
            <p className="text-xs text-gray-500 mt-2">
              제출 마감: {new Date(hackathon.period.submissionDeadlineAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {detail.sections.teams.campEnabled && !hasMyTeam && (
            <button
              onClick={handleJoinClick}
              className="shrink-0 bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-primary/30"
            >
              이 해커톤 참여하기
            </button>
          )}
        </div>

        {/* Layout: Sidebar + Content */}
        <div className="flex gap-6">
          {/* Sidebar - desktop */}
          <aside className="hidden md:flex flex-col w-48 shrink-0 gap-4">
            {/* Tab nav */}
            <nav className="bg-card border border-card-border rounded-xl p-2">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-all mb-0.5 last:mb-0 ${
                    activeTab === tab.key
                      ? 'bg-primary text-white font-medium'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Schedule mini-panel below nav */}
            <div className="bg-card border border-card-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">일정</h4>
                <span className="text-xs text-gray-600 ml-auto">{schedule.timezone.replace('Asia/', '')}</span>
              </div>
              <div className="space-y-2.5">
                {schedule.milestones.map((m, i) => {
                  const past = isPast(m.at);
                  const current = isCurrent(m.at, schedule.milestones[i + 1]?.at);
                  return (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        current ? 'bg-primary shadow-sm shadow-primary/50' :
                        past ? 'bg-green-500' : 'bg-gray-600'
                      }`} />
                      <div className="min-w-0">
                        <p className={`text-xs leading-tight truncate ${
                          current ? 'text-white font-medium' :
                          past ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {m.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">{formatDate(m.at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Mobile tab bar */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D10] border-t border-card-border px-2 py-1.5">
            <div className="flex overflow-x-auto justify-around">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setShowSchedulePanel(false); }}
                  className={`shrink-0 flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-all border-b-2 ${
                    activeTab === tab.key && !showSchedulePanel
                      ? 'text-primary border-primary'
                      : 'text-gray-500 border-transparent'
                  }`}
                >
                  <span className='text-sm'>{tab.label}</span>
                </button>
              ))}
              {/* 일정 버튼 */}
              <button
                onClick={() => setShowSchedulePanel(v => !v)}
                className={`shrink-0 flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-all border-b-2 ${
                  showSchedulePanel ? 'text-primary border-primary' : 'text-gray-500 border-transparent'
                }`}
              >
                <span>일정</span>
              </button>
            </div>
          </div>

          {/* Schedule slide-up panel (mobile) */}
          {showSchedulePanel && (
            <>
              <div
                className="md:hidden fixed inset-0 z-40 bg-black/50"
                onClick={() => setShowSchedulePanel(false)}
              />
              <div className="md:hidden fixed bottom-[56px] left-0 right-0 z-50 bg-card border-t border-card-border rounded-t-2xl px-5 pt-4 pb-6 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <h4 className="text-sm font-semibold text-white">일정</h4>
                    <span className="text-xs text-gray-500">{schedule.timezone.replace('Asia/', '')}</span>
                  </div>
                  <button
                    onClick={() => setShowSchedulePanel(false)}
                    className="text-gray-500 hover:text-white transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* drag handle */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-600 rounded-full" />
                <div className="space-y-3">
                  {schedule.milestones.map((m, i) => {
                    const past = isPast(m.at);
                    const current = isCurrent(m.at, schedule.milestones[i + 1]?.at);
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          current ? 'bg-primary shadow-sm shadow-primary/50' :
                          past ? 'bg-green-500' : 'bg-gray-600'
                        }`} />
                        <div className="flex-1 flex items-start justify-between gap-2">
                          <p className={`text-sm leading-tight ${
                            current ? 'text-white font-medium' :
                            past ? 'text-gray-500' : 'text-gray-300'
                          }`}>
                            {m.name}
                          </p>
                          <p className={`text-xs shrink-0 ${past ? 'text-gray-600' : 'text-gray-500'}`}>
                            {formatDate(m.at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Content */}
          <main className="flex-1 min-w-0 pb-20 md:pb-0">
            {activeTab === 'overview' && <OverviewTab detail={detail} />}
            {activeTab === 'eval' && <EvalTab detail={detail} />}
            {activeTab === 'teams' && <TeamsTab detail={detail} />}
            {activeTab === 'info' && <InfoTab detail={detail} />}
            {activeTab === 'submit' && (
              <SubmitTab detail={detail} onSubmitDone={() => setActiveTab('leaderboard')} />
            )}
            {activeTab === 'leaderboard' && <LeaderboardTab detail={detail} />}
          </main>
        </div>
      </div>
    </div>

      {showJoinModal && currentUser && (
        <JoinHackathonModal
          hackathonSlug={slug!}
          hackathonTitle={hackathon.title}
          currentUserId={currentUser.id}
          candidateTeams={candidateTeams}
          onClose={() => setShowJoinModal(false)}
        />
      )}
    </>
  );
}
