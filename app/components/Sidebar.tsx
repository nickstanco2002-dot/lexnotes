"use client";

import React from 'react';

export default function Sidebar({ activeView, setActiveView }: { activeView: string, setActiveView: (v: string) => void }) {
  const navItems = [
    { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
    { id: 'notes', icon: '✎', label: 'Notes' },
    { id: 'outline', icon: '≡', label: 'Outlines' },
    { id: 'practice', icon: '◎', label: 'Practice' },
    { id: 'calendar', icon: '▦', label: 'Calendar' },
    { id: 'docs', icon: '📄', label: 'Documents' },
    { id: 'textbooks', icon: '📚', label: 'Textbooks' },
    { id: 'integrations', icon: '⌁', label: 'Integrations' },
  ];

  return (
    <div className="w-[240px] bg-[var(--surface)] border-r border-[var(--border)] flex flex-col shrink-0">
      <div className="p-5 pb-4 border-b border-[var(--border)]">
        <div className="font-display text-[22px] font-bold text-[var(--accent)] tracking-[-0.5px]">LexNotes</div>
        <div className="text-[10px] text-[var(--text-muted)] tracking-[2px] uppercase mt-0.5 font-mono-ui">Law School OS</div>
      </div>

      <div className="p-4 px-3 pt-4">
        <div className="text-[9px] font-semibold tracking-[2.5px] uppercase text-[var(--text-dim)] px-2 mb-1.5 font-mono-ui">Workspace</div>
        {navItems.map(item => (
          <div 
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex items-center gap-2.5 p-2 px-2.5 rounded-[var(--radius)] cursor-pointer text-[13.5px] transition-all duration-150 border border-transparent
              ${activeView === item.id 
                ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-[rgba(201,168,76,0.2)]' 
                : 'text-[var(--text-muted)] hover:bg-[var(--surface2)] hover:text-[var(--text)]'}`}
          >
            <span className="text-[15px] w-[18px] text-center">{item.icon}</span> {item.label}
          </div>
        ))}
      </div>

      <div className="mt-auto p-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-2.5 p-2 px-2.5 rounded-[var(--radius)] cursor-pointer hover:bg-[var(--surface2)] transition-colors">
          <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[var(--accent)] to-[#8b6914] flex items-center justify-center text-[12px] font-semibold text-black shrink-0">JD</div>
          <div>
            <div className="text-[13px] font-medium">Jordan Davis</div>
            <div className="text-[11px] text-[var(--text-muted)]">1L · Fall 2025</div>
          </div>
        </div>
      </div>
    </div>
  );
}
