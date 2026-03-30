import { Toast, useToastManager } from './Toast';

export default function ToastContainer() {
  const { toasts, remove } = useToastManager();
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => remove(t.id)} />
      ))}
    </div>
  );
}
