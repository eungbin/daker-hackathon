import { useEffect, useState, useCallback } from 'react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

// Module-level setter so showToast() can be called from anywhere
let _setToasts: React.Dispatch<React.SetStateAction<ToastItem[]>> | null = null;

export function showToast(message: string, type: ToastItem['type'] = 'info') {
  if (_setToasts) {
    const id = `toast-${Date.now()}-${Math.random()}`;
    _setToasts(prev => [...prev, { id, message, type }]);
  }
}

export function useToastManager() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  _setToasts = setToasts;

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, remove };
}

interface ToastProps {
  message: string;
  type: ToastItem['type'];
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    info: 'bg-blue-900/90 border-blue-700/60 text-blue-100',
    success: 'bg-green-900/90 border-green-700/60 text-green-100',
    error: 'bg-red-900/90 border-red-700/60 text-red-100',
    warning: 'bg-yellow-900/90 border-yellow-700/60 text-yellow-100',
  };
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl transition-all duration-300 max-w-sm ${colors[type]} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <span>{icons[type]}</span>
      <span className="text-sm font-medium flex-1">{message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        className="opacity-60 hover:opacity-100 text-xs"
      >
        ✕
      </button>
    </div>
  );
}
