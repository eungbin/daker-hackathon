import { useState, useEffect, useCallback } from 'react';

interface DialogState {
  id: string;
  type: 'alert' | 'confirm';
  message: string;
  resolve: (value: boolean) => void;
}

let _setDialog: React.Dispatch<React.SetStateAction<DialogState | null>> | null = null;

// eslint-disable-next-line react-refresh/only-export-components
export function showAlert(message: string): Promise<void> {
  return new Promise(resolve => {
    _setDialog?.({
      id: `dialog-${Date.now()}`,
      type: 'alert',
      message,
      resolve: () => resolve(),
    });
  });
}

// eslint-disable-next-line react-refresh/only-export-components
export function showConfirm(message: string): Promise<boolean> {
  return new Promise(resolve => {
    _setDialog?.({
      id: `dialog-${Date.now()}`,
      type: 'confirm',
      message,
      resolve,
    });
  });
}

function useDialogManager() {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  // eslint-disable-next-line react-hooks/globals
  _setDialog = setDialog;
  return { dialog, setDialog };
}

export default function DialogContainer() {
  const { dialog, setDialog } = useDialogManager();

  const handleConfirm = useCallback(() => {
    dialog?.resolve(true);
    setDialog(null);
  }, [dialog, setDialog]);

  const handleCancel = useCallback(() => {
    dialog?.resolve(false);
    setDialog(null);
  }, [dialog, setDialog]);

  useEffect(() => {
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel();
      if (e.key === 'Enter') handleConfirm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog, handleConfirm, handleCancel]);

  if (!dialog) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCancel} />
      <div className="relative bg-card border border-card-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <p className="text-white text-sm leading-relaxed whitespace-pre-line mb-6">{dialog.message}</p>
        <div className="flex gap-3">
          {dialog.type === 'confirm' && (
            <button
              onClick={handleCancel}
              className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              취소
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="flex-1 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-primary/30"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
