"use client";

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardView from './components/Dashboard';
import NotesView from './components/NotesView';
import TextbookView from './components/TextbookView';
import OutlineView from './components/OutlineView';
import PracticeView from './components/PracticeView';

export default function LexNotesApp() {
  const [activeView, setActiveView] = useState('dashboard');
  const [toast, setToast] = useState<{ msg: string; visible: boolean }>({ msg: '', visible: false });

  const triggerToast = (msg: string) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast({ msg: '', visible: false }), 3000);
  };

  return (
    <div className="flex h-screen w-full bg-[var(--bg)] text-[var(--text)] overflow-hidden">
      {/* Permanent Sidebar */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Dynamic Topbar */}
        <Topbar activeView={activeView} triggerToast={triggerToast} />

        {/* View Container */}
        <div className="flex-1 overflow-hidden flex">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'notes' && <NotesView />}
          {activeView === 'textbooks' && <TextbookView />}
          {activeView === 'outline' && <OutlineView />}
          {activeView === 'practice' && <PracticeView />}
          
          {/* Coming Soon Overlays */}
          {activeView === 'calendar' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center fade-in">
                <div className="text-[18px] font-[family-name:'Playfair_Display'] font-bold mb-2">Calendar</div>
                <div className="text-[12px] text-[var(--text-muted)]">Coming soon in the next release</div>
              </div>
            </div>
          )}
          {activeView === 'docs' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center fade-in">
                <div className="text-[18px] font-[family-name:'Playfair_Display'] font-bold mb-2">Documents</div>
                <div className="text-[12px] text-[var(--text-muted)]">Coming soon in the next release</div>
              </div>
            </div>
          )}
          {activeView === 'integrations' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center fade-in">
                <div className="text-[18px] font-[family-name:'Playfair_Display'] font-bold mb-2">Integrations</div>
                <div className="text-[12px] text-[var(--text-muted)]">Coming soon in the next release</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-4 right-4 bg-[var(--accent)] text-black px-4 py-2 rounded-lg text-[12px] font-medium animate-pulse fade-in">
          {toast.msg}
        </div>
      )}
    </div>
  );
}
