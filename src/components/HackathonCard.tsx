import { useNavigate } from 'react-router-dom';
import type { Hackathon, HackathonStatus } from '../types';
import StatusBadge from './StatusBadge';
import { useAuth } from '../store/AuthContext';
import { useStoreContext } from '../store/StoreContext';

const gradients = [
  'from-purple-900 to-blue-900',
  'from-indigo-900 to-purple-900',
  'from-blue-900 to-cyan-900',
];

const STATUS_CYCLE: HackathonStatus[] = ['upcoming', 'ongoing', 'ended'];
const STATUS_LABEL: Record<HackathonStatus, string> = {
  upcoming: '예정',
  ongoing: '진행중',
  ended: '종료',
};

export default function HackathonCard({ hackathon, index = 0 }: { hackathon: Hackathon; index?: number }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { updateHackathonStatus } = useStoreContext();
  const isAdmin = !!currentUser?.isAdmin;
  const gradient = gradients[index % gradients.length];

  const deadline = new Date(hackathon.period.submissionDeadlineAt);
  const now = new Date();
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const handleStatusChange = (e: React.MouseEvent, next: HackathonStatus) => {
    e.stopPropagation();
    updateHackathonStatus(hackathon.slug, next);
  };

  return (
    <div
      onClick={() => navigate(`/hackathons/${hackathon.slug}`)}
      className="bg-card border border-card-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 group"
    >
      {/* Thumbnail */}
      <div className={`h-40 bg-gradient-to-br ${gradient} relative flex items-center justify-center`}>
        {hackathon.status === 'ongoing' && daysLeft > 0 && (
          <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
            D-{daysLeft}
          </span>
        )}
        {hackathon.status === 'upcoming' && daysLeft > 0 && (
          <span className="absolute top-3 right-3 bg-black/60 text-blue-300 text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
            D-{daysLeft}
          </span>
        )}
        <div className="absolute bottom-3 left-3">
          <StatusBadge status={hackathon.status} />
        </div>
      </div>

      {/* Admin status controls */}
      {isAdmin && (
        <div
          className="flex items-center gap-1 px-4 pt-3 pb-0"
          onClick={e => e.stopPropagation()}
        >
          {STATUS_CYCLE.map(s => {
            const isCurrent = hackathon.status === s;
            return (
              <button
                key={s}
                onClick={e => !isCurrent && handleStatusChange(e, s)}
                disabled={isCurrent}
                className={`flex-1 py-1 rounded-md text-xs font-medium transition-colors ${
                  isCurrent
                    ? 'bg-primary text-white cursor-default'
                    : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'
                }`}
              >
                {STATUS_LABEL[s]}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">{hackathon.title}</h3>
        <div className="flex flex-wrap gap-1.5">
          {hackathon.tags.map(tag => (
            <span key={tag} className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded-md">#{tag}</span>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          제출 마감: {new Date(hackathon.period.submissionDeadlineAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
