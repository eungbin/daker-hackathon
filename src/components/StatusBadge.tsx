import type { HackathonStatus } from '../types';

const config = {
  ongoing: { label: '진행중', className: 'bg-green-900/40 text-green-400 border border-green-700/50' },
  upcoming: { label: '예정', className: 'bg-blue-900/40 text-blue-400 border border-blue-700/50' },
  ended: { label: '종료', className: 'bg-gray-800/60 text-gray-400 border border-gray-700/50' },
};

export default function StatusBadge({ status }: { status: HackathonStatus }) {
  const { label, className } = config[status];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${className}`}>{label}</span>
  );
}
