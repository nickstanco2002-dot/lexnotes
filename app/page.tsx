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
        <main className="flex-1 overflow-hidden flex relative">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'notes' && <NotesView />}
          {activeView === 'textbooks' && <TextbookView />}
          {activeView === 'outline' && <OutlineView />}

          {/* Coming Soon Overlays */}
          {['calendar', 'practice', 'docs', 'integrations'].includes(activeView) && (
            <div className="flex-1 flex items-center justify-center text-[var(--text-dim)] font-[family-name:'JetBrains_Mono'] text-center">
              <div>
                <div className="text-3xl mb-2">⚙️</div>
                <div>{activeView.toUpperCase()} MODULE CONNECTING...</div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-[var(--surface3)] border border-[var(--border)] rounded-lg shadow-2xl text-[13px] fade-in z-[100]">
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// OLD INLINE CODE REMOVED - NOW USING IMPORTED COMPONENTS
function OldSidebar({ view, setView }: { view: string, setView: (v: string) => void }) {
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
        <div className="font-[family-name:'Playfair_Display'] text-[22px] font-bold text-[var(--accent)] tracking-[-0.5px]">LexNotes</div>
        <div className="text-[10px] text-[var(--text-muted)] tracking-[2px] uppercase mt-0.5 font-[family-name:'JetBrains_Mono']">Law School OS</div>
      </div>

      <div className="p-4 px-3 pt-4">
        <div className="text-[9px] font-semibold tracking-[2.5px] uppercase text-[var(--text-dim)] px-2 mb-1.5 font-[family-name:'JetBrains_Mono']">Workspace</div>
        {navItems.map(item => (
          <div 
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-2.5 p-2 px-2.5 rounded-[var(--radius)] cursor-pointer text-[13.5px] transition-all duration-150 border border-transparent
              ${view === item.id 
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

function Topbar({ view }: { view: string }) {
  const titles: Record<string, string> = { dashboard: 'Dashboard', notes: 'Notes', outline: 'Outlines', practice: 'Practice Questions', calendar: 'Calendar', docs: 'Documents', textbooks: 'Textbooks', integrations: 'Integrations' };
  const ctas: Record<string, string> = { dashboard: '⊞ Customize', notes: '+ New Note', outline: '⚡ Regenerate', practice: '▶ Start Session', docs: '+ New Document', textbooks: '+ Add Textbook' };

  return (
    <div className="h-[56px] border-b border-[var(--border)] flex items-center px-6 gap-4 bg-[var(--surface)] shrink-0">
      <div className="font-[family-name:'Playfair_Display'] text-[18px] font-bold text-[var(--text)] flex-1 capitalize">
        {titles[view] || view}
      </div>
      <button className="px-3.5 py-1.5 rounded-[var(--radius)] text-[12.5px] font-medium bg-[var(--accent)] text-black hover:bg-[var(--accent2)] transition-colors">
        {ctas[view] || '+ New'}
      </button>
    </div>
  );
}

function DashboardView() {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-7 gap-6 fade-in">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <div className="font-[family-name:'Playfair_Display'] text-[20px] font-bold">Good morning, Jordan 👋</div>
          <div className="text-[12px] text-[var(--text-muted)] mt-0.5 font-[family-name:'JetBrains_Mono']">Monday, Feb 13, 2025 · 1L Fall Semester</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3.5 shrink-0">
        {[
          { label: 'Notes This Week', value: '14', sub: '↑ 3 from last week' },
          { label: 'Cases Briefed', value: '38', sub: 'Across 5 courses' },
          { label: 'Practice Score', value: '74%', sub: '↑ 8% this month' },
          { label: 'Days to Finals', value: '31', sub: 'Contracts exam first' }
        ].map(stat => (
          <div key={stat.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-[10px] p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--accent)] opacity-60"></div>
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[1.5px] font-[family-name:'JetBrains_Mono']">{stat.label}</div>
            <div className="font-[family-name:'Playfair_Display'] text-[32px] font-bold text-[var(--accent)] my-1.5 leading-none">{stat.value}</div>
            <div className="text-[12px] text-[var(--text-muted)]">{stat.sub}</div>
          </div>
        ))}
      </div>
      
      {/* Add your other dashboard widgets here */}
    </div>
  );
}

function NotesView() {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [listCollapsed, setListCollapsed] = useState(false);
  const [aiOpen, setAiOpen] = useState(true);

  const [activeCourse] = useState('torts');
  const [activeTopic] = useState('negligence');
  const [activeNote] = useState('brief-palsgraf');
  const [activeFilter] = useState('all');

  return (
    <div className="flex flex-1 overflow-hidden bg-[var(--bg)] fade-in">
      <div 
        className={`bg-[var(--surface)] border-r border-[var(--border)] flex flex-col shrink-0 relative transition-all duration-200 ease-in-out ${navCollapsed ? 'w-0 overflow-hidden border-none' : 'w-[210px]'}`}
      >
        <button 
          onClick={() => setNavCollapsed(!navCollapsed)} 
          className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-[22px] h-[22px] bg-[var(--surface2)] border border-[var(--border)] rounded-full flex items-center justify-center text-[9px] text-[var(--text-dim)] cursor-pointer z-10 hover:bg-[var(--accent-dim)] hover:text-[var(--accent)] hover:border-[rgba(201,168,76,0.4)]"
        >
          {navCollapsed ? '›' : '‹'}
        </button>
        
        <div className="p-3.5 border-b border-[var(--border)] flex items-center justify-between shrink-0">
          <span className="text-[12px] font-semibold text-[var(--text)]">My Courses</span>
          <button className="bg-[var(--accent)] text-black px-2.5 py-1 rounded-[var(--radius)] text-[11px] font-medium hover:bg-[var(--accent2)]">+ Course</button>
        </div>
        
        <div className="p-3 pb-0">
          <input 
            type="text" 
            placeholder="Search all notes..." 
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-md px-3 py-1.5 text-[12.5px] text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-dim)]"
          />
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <div className="mb-0.5">
            <div className="flex items-center justify-between p-2 px-3.5 cursor-pointer bg-[var(--surface2)]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--red)]"></div>
                <span className="text-[13px] font-medium text-[var(--text)]">Torts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-[family-name:'JetBrains_Mono'] text-[var(--text-dim)] bg-[var(--surface3)] px-1.5 py-[1px] rounded-full">12</span>
                <span className="text-[10px] text-[var(--text-dim)]">▾</span>
              </div>
            </div>
            <div className="py-0.5 pb-1.5">
              <div className="flex items-center px-3.5 pl-[30px] py-1.5 text-[12.5px] cursor-pointer text-[var(--accent)] border-l-2 border-[var(--accent)] bg-[var(--accent-dim)]">
                <span className="text-[8px] mr-2 opacity-50">⬡</span> Negligence
                <span className="ml-auto text-[10px] font-[family-name:'JetBrains_Mono'] text-[var(--text-dim)]">5</span>
              </div>
              <div className="flex items-center px-3.5 pl-[30px] py-1.5 text-[12.5px] cursor-pointer text-[var(--text-muted)] border-l-2 border-transparent hover:bg-[var(--surface2)] hover:text-[var(--text)]">
                <span className="text-[8px] mr-2 opacity-50">⬡</span> Assault & Battery
                <span className="ml-auto text-[10px] font-[family-name:'JetBrains_Mono'] text-[var(--text-dim)]">3</span>
              </div>
              <div className="px-3.5 pl-[30px] py-1 text-[11.5px] text-[var(--text-dim)] cursor-pointer hover:text-[var(--accent)] mt-1">+ Add Topic</div>
            </div>
          </div>
          <div className="mb-0.5">
            <div className="flex items-center justify-between p-2 px-3.5 cursor-pointer hover:bg-[var(--surface2)]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--blue)]"></div>
                <span className="text-[13px] font-medium text-[var(--text)]">Contracts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-[family-name:'JetBrains_Mono'] text-[var(--text-dim)] bg-[var(--surface3)] px-1.5 py-[1px] rounded-full">18</span>
                <span className="text-[10px] text-[var(--text-dim)]">▸</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div 
        className={`bg-[var(--surface)] border-r border-[var(--border)] flex flex-col shrink-0 relative transition-all duration-200 ease-in-out ${listCollapsed ? 'w-0 overflow-hidden border-none' : 'w-[260px]'}`}
      >
        <button 
          onClick={() => setListCollapsed(!listCollapsed)} 
          className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-[22px] h-[22px] bg-[var(--surface2)] border border-[var(--border)] rounded-full flex items-center justify-center text-[9px] text-[var(--text-dim)] cursor-pointer z-10 hover:bg-[var(--accent-dim)] hover:text-[var(--accent)] hover:border-[rgba(201,168,76,0.4)]"
        >
          {listCollapsed ? '›' : '‹'}
        </button>

        <div className="p-3.5 pb-3 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[var(--text-muted)] font-[family-name:'JetBrains_Mono'] uppercase tracking-[1px] mb-0.5">Torts</div>
            <div className="text-[14px] font-semibold">Negligence</div>
          </div>
          <button className="bg-[var(--accent)] text-black px-2.5 py-1 rounded-[var(--radius)] text-[11px] font-medium hover:bg-[var(--accent2)]">+</button>
        </div>

        <div className="flex gap-1.5 p-2 px-3 border-b border-[var(--border)] flex-wrap">
          <span className="bg-[var(--accent-dim)] text-[var(--accent)] border border-[rgba(201,168,76,0.35)] px-2 py-0.5 rounded-full text-[10px] font-[family-name:'JetBrains_Mono'] cursor-pointer">All</span>
          <span className="bg-[var(--surface2)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--text-dim)] px-2 py-0.5 rounded-full text-[10px] font-[family-name:'JetBrains_Mono'] cursor-pointer">📋 Brief</span>
          <span className="bg-[var(--surface2)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--text-dim)] px-2 py-0.5 rounded-full text-[10px] font-[family-name:'JetBrains_Mono'] cursor-pointer">✎ Class</span>
        </div>

        <div className="flex-1 overflow-y-auto p-1.5 px-2">
          <div className="p-2.5 rounded-r-md cursor-pointer bg-[var(--surface2)] border-l-2 border-[var(--accent)] mb-0.5">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[9px] font-bold tracking-[1.5px] uppercase font-[family-name:'JetBrains_Mono'] text-[#5b8dee]">📋 Case Brief</div>
            </div>
            <div className="text-[12.5px] font-medium mb-0.5 leading-snug">Palsgraf v. Long Island RR</div>
            <div className="text-[11px] text-[var(--text-muted)] whitespace-nowrap overflow-hidden text-ellipsis">Proximate cause — duty owed only to foreseeable plaintiffs...</div>
            <div className="text-[10px] text-[var(--text-dim)] mt-1 font-[family-name:'JetBrains_Mono']">Feb 13, 2025</div>
          </div>

          <div className="p-2.5 rounded-md cursor-pointer hover:bg-[var(--surface2)] border-l-2 border-transparent mb-0.5">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[9px] font-bold tracking-[1.5px] uppercase font-[family-name:'JetBrains_Mono'] text-[#e05555]">✎ Class Notes</div>
              <span className="text-[9px] bg-[rgba(201,168,76,0.1)] text-[var(--accent)] border border-[rgba(201,168,76,0.2)] px-1.5 rounded-sm font-[family-name:'JetBrains_Mono']">🎙 Audio</span>
            </div>
            <div className="text-[12.5px] font-medium mb-0.5 leading-snug">Negligence — Feb 12</div>
            <div className="text-[11px] text-[var(--text-muted)] whitespace-nowrap overflow-hidden text-ellipsis">Reasonable person standard, Hand Formula...</div>
            <div className="text-[10px] text-[var(--text-dim)] mt-1 font-[family-name:'JetBrains_Mono']">Feb 12, 2025</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg)]">
        {(navCollapsed && listCollapsed) && (
          <div className="flex items-center gap-2 p-2 px-4 border-b border-[var(--border)] bg-[var(--surface)] shrink-0">
            <button 
              onClick={() => { setNavCollapsed(false); setListCollapsed(false); }}
              className="bg-[var(--surface2)] border border-[var(--border)] rounded px-2.5 py-1 text-[11px] text-[var(--text-muted)] font-[family-name:'JetBrains_Mono'] hover:text-[var(--accent)]"
            >
              ›› Show panels
            </button>
            <span className="text-[10px] font-[family-name:'JetBrains_Mono'] text-[var(--text-dim)] tracking-[1px]">Focus Mode</span>
            <span className="text-[10px] font-[family-name:'JetBrains_Mono'] bg-[var(--accent-dim)] text-[var(--accent)] border border-[rgba(201,168,76,0.25)] rounded-full px-2 py-0.5">Torts › Negligence</span>
          </div>
        )}

        <div className="p-2.5 px-5 border-b border-[var(--border)] flex items-center gap-2.5 bg-[var(--surface)]">
          <span className="bg-[rgba(91,141,238,0.1)] text-[#5b8dee] border border-[rgba(91,141,238,0.2)] px-2 py-0.5 rounded-full text-[10px] font-semibold font-[family-name:'JetBrains_Mono'] tracking-[0.5px]">📋 Case Brief</span>
          <span className="text-[11px] text-[var(--text-muted)] font-[family-name:'JetBrains_Mono']">Torts › Negligence</span>
          <div className="flex-1"></div>
          <button className="bg-[var(--surface2)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--text-dim)] px-3 py-1.5 rounded-[var(--radius)] text-[12px] font-medium transition-colors">⇌ Merge w/ Auto Notes</button>
          <button onClick={() => setAiOpen(!aiOpen)} className="bg-[var(--surface2)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--text-dim)] px-3 py-1.5 rounded-[var(--radius)] text-[12px] font-medium transition-colors">⚡ AI</button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto py-11 px-0 flex flex-col items-center">
            <div className="w-full max-w-[700px] px-12 box-border">
              <input 
                className="font-[family-name:'Playfair_Display'] text-[28px] font-bold text-[var(--text)] bg-transparent border-none outline-none w-full mb-1.5 tracking-[-0.3px] leading-snug" 
                defaultValue="Palsgraf v. Long Island RR (1928)" 
              />
              <div className="text-[11px] text-[var(--text-dim)] font-[family-name:'JetBrains_Mono'] mb-7 flex gap-3 flex-wrap pb-5 border-b border-[var(--border)]">
                <span>Torts › Negligence</span><span>·</span><span>248 N.Y. 339</span><span>·</span><span>Prof. Chen</span>
              </div>

              {[
                { label: 'Facts', val: 'A railroad guard helped a passenger board a moving train, knocking loose a package of fireworks that exploded...' },
                { label: 'Issue', val: 'Whether a defendant owes a duty of care to a plaintiff who was not in the foreseeable zone of danger...' },
                { label: 'Rule / Holding', val: 'No duty — and thus no liability — to unforeseeable plaintiffs. Duty is relational...' },
              ].map((sec, i) => (
                <div key={i} className="mb-6">
                  <label className="text-[9px] font-bold tracking-[2.5px] uppercase text-[var(--accent)] font-[family-name:'JetBrains_Mono'] mb-2 block opacity-80">{sec.label}</label>
                  <textarea 
                    className="bg-transparent border border-[var(--border)] rounded-md p-3 text-[13.5px] leading-relaxed text-[var(--text)] outline-none w-full min-h-[60px] resize-none font-[family-name:'DM_Sans'] transition-colors focus:border-[rgba(201,168,76,0.5)] focus:bg-[rgba(201,168,76,0.03)]"
                    defaultValue={sec.val}
                  />
                </div>
              ))}
            </div>
          </div>

          {aiOpen && (
            <div className="w-[284px] border-l border-[var(--border)] bg-[var(--surface)] flex flex-col shrink-0">
              <div className="p-3 px-4 border-b border-[var(--border)] flex items-center justify-between">
                <div className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-[1.5px] font-[family-name:'JetBrains_Mono'] flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse"></div>
                  AI Assistant
                </div>
                <button onClick={() => setAiOpen(false)} className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text)]">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-3.5">
                <div className="mb-5">
                  <div className="text-[9px] font-bold tracking-[2px] uppercase text-[var(--text-dim)] font-[family-name:'JetBrains_Mono'] mb-2">Topic Connections</div>
                  <div className="bg-[var(--surface2)] border border-[var(--border)] rounded-md p-2 px-2.5 text-[12px] leading-relaxed text-[var(--text-muted)] mb-1.5 cursor-pointer hover:border-[rgba(201,168,76,0.35)] hover:text-[var(--text)] hover:bg-[var(--surface3)] transition-colors">
                    🔗 Connects to <strong className="text-[var(--text)]">Blyth v. Birmingham Waterworks</strong> — defines "reasonable person"
                  </div>
                </div>
                <div className="mb-5">
                  <div className="text-[9px] font-bold tracking-[2px] uppercase text-[var(--text-dim)] font-[family-name:'JetBrains_Mono'] mb-2">Exam Tip</div>
                  <div className="bg-[var(--accent-dim)] border border-[rgba(201,168,76,0.2)] rounded-md p-2 px-2.5 text-[12px] leading-relaxed text-[var(--text-muted)] cursor-default">
                    ⚡ Always argue BOTH Cardozo AND Andrews on exam hypos — professors love seeing both frameworks applied.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[var(--surface)] border-t border-[var(--border)] p-2 px-5 flex items-center gap-3 shrink-0">
          <button className="w-[30px] h-[30px] rounded-full bg-[var(--red)] border-none cursor-pointer flex items-center justify-center text-[13px] transition-all hover:bg-red-600">
            🎙
          </button>
          <div className="text-[11.5px] text-[var(--text-muted)] flex-1 font-[family-name:'JetBrains_Mono']">Click 🎙 to record lecture · timestamps will sync to your notes</div>
          <div className="font-[family-name:'JetBrains_Mono'] text-[11.5px] text-[var(--accent)]">00:00</div>
        </div>

      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---

export default function LexNotesApp() {
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <div className="flex h-screen w-full bg-[var(--bg)] text-[var(--text)]">
      <Sidebar view={activeView} setView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar view={activeView} />
        <div className="flex-1 overflow-hidden flex">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'notes' && <NotesView />}
          {activeView === 'textbooks' && <div className="p-8 text-[var(--text-muted)] fade-in">Textbooks view coming soon...</div>}
          {/* Add the rest of your views here as you build them out */}
        </div>
      </div>
    </div>
  );
}
