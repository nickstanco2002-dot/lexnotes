"use client";

import React from 'react';

export default function Topbar({ activeView, triggerToast }: { activeView: string, triggerToast: (msg: string) => void }) {
  const titles: Record<string, string> = { dashboard: 'Dashboard', notes: 'Notes', outline: 'Outlines', practice: 'Practice Questions', calendar: 'Calendar', docs: 'Documents', textbooks: 'Textbooks', integrations: 'Integrations' };
  const ctas: Record<string, string> = { dashboard: '⊞ Customize', notes: '+ New Note', outline: '⚡ Regenerate', practice: '▶ Start Session', docs: '+ New Document', textbooks: '+ Add Textbook' };

  const handleCta = () => {
    const msg = ctas[activeView] || '+ New';
    triggerToast(msg);
  };

  return (
    <div className="topbar-blur h-[56px] border-b border-[var(--border)] flex items-center px-6 gap-4 bg-[var(--surface)] shrink-0">
      <div className="font-display text-[18px] font-bold text-[var(--text)] flex-1 capitalize">
        {titles[activeView] || activeView}
      </div>
      <button onClick={handleCta} className="px-3.5 py-1.5 rounded-[var(--radius)] text-[12.5px] font-medium bg-[var(--accent)] text-black hover:bg-[var(--accent2)] transition-colors">
        {ctas[activeView] || '+ New'}
      </button>
    </div>
  );
}
