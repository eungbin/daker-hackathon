import { useNavigate } from 'react-router-dom';
import type { Hackathon } from '../types';
import StatusBadge from './StatusBadge';

const gradients = [
  'from-purple-900 to-blue-900',
  'from-indigo-900 to-purple-900',
  'from-blue-900 to-cyan-900',
];

export default function HackathonCard({ hackathon, index = 0 }: { hackathon: Hackathon; index?: number }) {
  const navigate = useNavigate();
  const gradient = gradients[index % gradients.length];

  const deadline = new Date(hackathon.period.submissionDeadlineAt);
  const now = new Date();
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

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
