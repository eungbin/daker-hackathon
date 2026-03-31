import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStoreContext } from '../store/StoreContext';
import { useAuth } from '../store/AuthContext';
import TeamCard from '../components/TeamCard';
import type { Team } from '../types';

type SortKey = 'all' | 'recent' | 'urgent';

export default function Camp() {
  const { teams, hackathons, addTeam } = useStoreContext();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialHackathon = searchParams.get('hackathon') || 'all';

  const [hackathonFilter, setHackathonFilter] = useState(initialHackathon);
  const [sortKey, setSortKey] = useState<SortKey>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    let result = [...teams];
    if (hackathonFilter !== 'all') result = result.filter(t => t.hackathonSlug === hackathonFilter);
    if (search) {
      result = result.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.intro.toLowerCase().includes(search.toLowerCase()) ||
        t.lookingFor.some(r => r.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (sortKey === 'recent') result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortKey === 'urgent') result = result.filter(t => t.isOpen);
    return result;
  }, [teams, hackathonFilter, sortKey, search]);

  return (
    <div className="min-h-screen bg-neutral">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">팀원 모집</h1>
            <p className="text-gray-500 text-sm">함께할 팀원을 찾거나 팀에 합류하세요</p>
          </div>
          <button
            onClick={() => currentUser ? setShowModal(true) : navigate('/login')}
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-primary/30 flex items-center gap-2"
          >
            <span>+</span> 팀 모집글 생성
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={hackathonFilter}
            onChange={e => setHackathonFilter(e.target.value)}
            className="bg-card border border-card-border text-white text-sm px-4 py-2 rounded-xl focus:outline-none focus:border-primary/50"
          >
            <option value="all">모든 해커톤</option>
            {hackathons.map(h => (
              <option key={h.slug} value={h.slug}>{h.title}</option>
            ))}
          </select>

          <div className="flex gap-1 bg-card border border-card-border rounded-xl p-1">
            {([
              { key: 'all', label: '전체' },
              { key: 'recent', label: '최신 순' },
              { key: 'urgent', label: '모집중' },
            ] as const).map(f => (
              <button
                key={f.key}
                onClick={() => setSortKey(f.key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  sortKey === f.key ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="팀 검색..."
              className="w-full bg-card border border-card-border rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(team => (
              <TeamCard key={team.teamCode} team={team} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p>조건에 맞는 팀이 없습니다.</p>
            <button
              onClick={() => currentUser ? setShowModal(true) : navigate('/login')}
              className="mt-3 text-primary hover:underline text-sm"
            >
              팀을 만들어 보세요 →
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <CreateTeamModal
          hackathons={hackathons}
          createdBy={currentUser?.id}
          onClose={() => setShowModal(false)}
          onSubmit={team => { addTeam(team); setShowModal(false); }}
        />
      )}
    </div>
  );
}

interface ModalProps {
  hackathons: { slug: string; title: string }[];
  onClose: () => void;
  onSubmit: (team: Team) => void;
  createdBy?: string;
}

function CreateTeamModal({ hackathons, onClose, onSubmit, createdBy }: ModalProps) {
  const [form, setForm] = useState({
    name: '',
    intro: '',
    isOpen: true,
    lookingFor: '',
    contactUrl: '',
    hackathonSlug: hackathons[0]?.slug || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = '팀명을 입력해주세요.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const team: Team = {
      teamCode: `team-${Date.now()}`,
      hackathonSlug: form.hackathonSlug,
      name: form.name.trim(),
      isOpen: form.isOpen,
      memberCount: 1,
      lookingFor: form.lookingFor.split(',').map(s => s.trim()).filter(Boolean),
      intro: form.intro,
      contact: { type: 'link', url: form.contactUrl },
      createdAt: new Date().toISOString(),
      createdBy,
      members: createdBy ? [createdBy] : [],
    };
    onSubmit(team);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-card-border rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">새 팀 모집글 작성</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">팀명 *</label>
            <input
              value={form.name}
              onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); }}
              placeholder="팀 이름을 입력하세요"
              className={`w-full bg-neutral border rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors ${
                errors.name ? 'border-red-500' : 'border-card-border focus:border-primary/50'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">소개</label>
            <textarea
              value={form.intro}
              onChange={e => setForm(f => ({ ...f, intro: e.target.value }))}
              placeholder="팀 소개를 입력하세요..."
              rows={3}
              className="w-full bg-neutral border border-card-border rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">찾는 포지션 (쉼표 구분)</label>
            <input
              value={form.lookingFor}
              onChange={e => setForm(f => ({ ...f, lookingFor: e.target.value }))}
              placeholder="Frontend, Backend, Designer"
              className="w-full bg-neutral border border-card-border rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">연락처 URL</label>
            <input
              value={form.contactUrl}
              onChange={e => setForm(f => ({ ...f, contactUrl: e.target.value }))}
              placeholder="https://discord.gg/..."
              className="w-full bg-neutral border border-card-border rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">해커톤 연결</label>
            <select
              value={form.hackathonSlug}
              onChange={e => setForm(f => ({ ...f, hackathonSlug: e.target.value }))}
              className="w-full bg-neutral border border-card-border rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary/50"
            >
              {hackathons.map(h => (
                <option key={h.slug} value={h.slug}>{h.title}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-gray-400 font-medium">모집 상태</span>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, isOpen: !f.isOpen }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.isOpen ? 'bg-primary' : 'bg-gray-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.isOpen ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl text-sm font-medium transition-colors">
              취소
            </button>
            <button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-primary/30">
              모집 시작하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
