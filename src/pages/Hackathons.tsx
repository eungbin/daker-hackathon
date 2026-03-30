import { useState, useMemo } from 'react';
import { useStoreContext } from '../store/StoreContext';
import HackathonCard from '../components/HackathonCard';
import type { HackathonStatus } from '../types';

type FilterStatus = 'all' | HackathonStatus;

const statusFilters: { key: FilterStatus; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'ongoing', label: '진행중' },
  { key: 'upcoming', label: '예정' },
  { key: 'ended', label: '종료' },
];

export default function Hackathons() {
  const { hackathons } = useStoreContext();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  const filtered = useMemo(() => {
    return hackathons.filter(h => {
      const matchStatus = activeFilter === 'all' || h.status === activeFilter;
      const matchSearch = search === '' ||
        h.title.toLowerCase().includes(search.toLowerCase()) ||
        h.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      return matchStatus && matchSearch;
    });
  }, [hackathons, activeFilter, search]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-neutral">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">해커톤 목록</h1>
          <p className="text-gray-500 text-sm">총 {hackathons.length}개의 해커톤</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Status Tabs */}
          <div className="flex gap-1 bg-card border border-card-border rounded-xl p-1">
            {statusFilters.map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === f.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="해커톤 검색..."
              className="w-full bg-card border border-card-border rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* Grid */}
        {visible.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {visible.map((hackathon, i) => (
                <HackathonCard key={hackathon.slug} hackathon={hackathon} index={i} />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="text-center">
                <button
                  onClick={() => setVisibleCount(c => c + 6)}
                  className="bg-card border border-card-border text-gray-300 hover:text-white hover:border-primary/40 px-8 py-2.5 rounded-xl text-sm font-medium transition-all"
                >
                  더 많은 해커톤 불러오기
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <div className="text-4xl mb-3">🔍</div>
            <p>조건에 맞는 해커톤이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
