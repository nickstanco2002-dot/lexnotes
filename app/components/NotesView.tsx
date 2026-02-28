"use client";

import React, { useState } from 'react';
import AutoRecorder from './AutoRecorder';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function NotesView() {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [listCollapsed, setListCollapsed] = useState(false);
  const [aiOpen, setAiOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const [activeCourse] = useState('torts');
  const [activeTopic] = useState('negligence');
  const [activeNote] = useState('brief-palsgraf');
  const [activeNoteContent, setActiveNoteContent] = useState('Palsgraf v. Long Island RR: Case about proximate cause and foreseeability in duty of care.');

  const handleMergeComplete = (mergedNote: string) => {
    // Update the note content with the merged result from AutoRecorder
    setActiveNoteContent(mergedNote);
  };

  const handleAskAI = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setChatInput('');
    setAiLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          context: activeNoteContent,
        }),
      });

      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Failed to get AI response.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden bg-[var(--bg)] fade-in">
      {/* LEFT PANEL: Course & Topic Nav */}
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

      {/* MIDDLE PANEL: Note List */}
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

      {/* RIGHT PANEL: Editor Area */}
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
            <div className="w-[320px] border-l border-[var(--border)] bg-[var(--surface)] flex flex-col shrink-0">
              <div className="p-3 px-4 border-b border-[var(--border)] flex items-center justify-between">
                <div className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-[1.5px] font-[family-name:'JetBrains_Mono'] flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse"></div>
                  AI Assistant
                </div>
                <button onClick={() => setAiOpen(false)} className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text)]">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                {chatHistory.length === 0 ? (
                  <div className="text-[12px] text-[var(--text-dim)]">
                    Ask me about the case law, rules, and holdings. I'll help you prepare for cold calls.
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                      {msg.role === 'user' ? (
                        <div className="bg-[var(--accent-dim)] border border-[rgba(201,168,76,0.3)] text-[var(--accent)] text-[12px] px-3 py-2 rounded-lg inline-block max-w-[90%]">
                          {msg.content}
                        </div>
                      ) : (
                        <div className="text-[12px] text-[var(--text-muted)]">
                          <div className="bg-[var(--surface2)] border border-[var(--border)] rounded-lg p-3 text-left">
                            {msg.content.includes('Rule') || msg.content.includes('rule') ? (
                              <div className="border-l-2 border-[var(--accent)] pl-2">{msg.content}</div>
                            ) : msg.content.includes('Holding') || msg.content.includes('holding') ? (
                              <div className="bg-[rgba(91,141,238,0.1)] pl-2">{msg.content}</div>
                            ) : (
                              msg.content
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                {aiLoading && (
                  <div className="text-[12px] text-[var(--text-dim)] animate-pulse">
                    AI is thinking...
                  </div>
                )}
              </div>

              <div className="border-t border-[var(--border)] p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
                    placeholder="Ask about this case..."
                    disabled={aiLoading}
                    className="flex-1 bg-[var(--surface2)] border border-[var(--border)] text-[11px] text-[var(--text)] px-2 py-1.5 rounded outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-dim)]"
                  />
                  <button
                    onClick={handleAskAI}
                    disabled={aiLoading || !chatInput.trim()}
                    className="bg-[var(--accent)] text-black px-2.5 py-1.5 rounded text-[11px] font-medium hover:bg-[var(--accent2)] disabled:opacity-50 transition-colors"
                  >
                    ↳
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <AutoRecorder onMergeComplete={handleMergeComplete} />

      </div>
    </div>
  );
}
