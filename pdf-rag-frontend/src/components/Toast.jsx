import React from 'react';

export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 bg-ink text-white text-[12.5px] px-3 py-1.5 rounded shadow-dropdown flex items-center gap-2 transform transition-all duration-150 pointer-events-none font-medium animate-in fade-in"
      id="toast"
    >
      <span className="material-symbols-outlined text-[15px] text-emerald-400">
        {toast.type === 'error' ? 'error' : 'check'}
      </span>
      <span>{toast.message}</span>
    </div>
  );
}
