'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type = 'success',
  duration = 3000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const showTimer = requestAnimationFrame(() => setVisible(true));
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => {
      cancelAnimationFrame(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  const colors = {
    success: 'bg-primary text-white',
    error: 'bg-danger text-white',
    info: 'bg-secondary text-white',
  };

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 z-50 px-5 py-3 rounded-xl shadow-xl
        flex items-center gap-2 text-sm font-medium
        transition-all duration-300 ease-out
        ${colors[type]}
        ${visible ? 'opacity-100 translate-x-[-50%] translate-y-0' : 'opacity-0 translate-x-[-50%] translate-y-4'}
      `}
      role="alert"
      aria-live="polite"
    >
      <span>{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}
