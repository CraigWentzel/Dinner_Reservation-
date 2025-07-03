import { useEffect } from 'react';

export default function ToastBanner({ type = 'success', message, onClose, duration = 4000 }) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timeout);
  }, [duration, onClose]);

  const colorMap = {
    success: 'from-emerald-500 to-teal-600',
    error: 'from-red-500 to-pink-500',
    info: 'from-blue-500 to-sky-600'
  };

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 text-white px-5 py-3 rounded-md shadow-lg bg-gradient-to-r ${colorMap[type]} animate-fade-in`}>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}