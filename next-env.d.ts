"use client";

import React, { useState } from 'react';

export default function OutlineView() {
  const [generating, setGenerating] = useState(false);
  const [outline, setOutline] = useState<string | null>(null);

  const startGeneration = async () => {
    setGenerating(true);
    // Real call: const res = await fetch('/api/generate-outline', { method: 'POST', body: JSON.stringify({ courseId: 'torts', notes: [...] }) });
    // For demo, simulate API delay:
    setTimeout(() => {
      setOutline("# Torts Course Outline\n\n## I. Intentional Torts\n### A. Battery\n1. Intent (Volitional act...)\n2. Contact (Harmful or offensive...)");
      setGenerating(false);
    }, 3000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg)] fade-in overflow-hidden">
      {/* Control Header */}
      <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)] flex justify-between items-center">
        <div>
          <h2 className="text-[14px] font-semibold">Torts: Fall 2025</h2>
          <p className="text-[11px] text-[var(--text-dim)] font-mono-ui">Synthesizing 42 documents...</p>
        </div>
        <button 
          onClick={startGeneration}
          disabled={generating}
          className="bg-[var(--accent)] text-black px-4 py-2 rounded-[var(--radius)] text-[12px] font-bold hover:bg-[var(--accent2)] transition-all disabled:opacity-50"
        >
          {generating ? '⚡ Analyzing Notes...' : 'Regenerate Outline'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-[#0e0f12]">
        <div className="w-full max-w-[850px] bg-[var(--surface)] border border-[var(--border)] shadow-2xl rounded-lg p-16 min-h-[1000px]">
          {!outline && !generating ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4 opacity-20">📜</div>
              <h3 className="text-xl font-display">No Outline Generated</h3>
              <p className="text-[13px] text-[var(--text-muted)] mt-2">Click the button above to synthesize your semester notes.</p>
            </div>
          ) : generating ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-8 bg-[var(--surface2)] w-1/3 rounded"></div>
              <div className="h-4 bg-[var(--surface2)] w-full rounded"></div>
              <div className="h-4 bg-[var(--surface2)] w-full rounded"></div>
              <div className="h-64 bg-[var(--surface2)] w-full rounded"></div>
            </div>
          ) : (
            <article className="space-y-8">
              <h1 className="font-display text-4xl border-b border-[var(--border)] pb-4 text-[var(--accent)]">Torts Comprehensive Outline</h1>
              <div className="space-y-8 font-sans-ui text-[15px] leading-relaxed">
                <section>
                  <h2 className="text-2xl font-bold text-[var(--text)]">I. INTENTIONAL TORTS</h2>
                  <div className="pl-6 mt-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-[var(--accent2)] text-lg">A. Battery</h3>
                      <p className="text-[var(--text-muted)] mt-2">Definition: The intentional infliction of a harmful or offensive contact with the person of the plaintiff.</p>
                      <div className="bg-[var(--surface2)] p-3 rounded mt-3 border-l-2 border-[var(--blue)]">
                        <span className="text-[11px] font-bold text-[var(--blue)] block mb-1">CASE REFERENCE</span>
                        <span className="italic text-[var(--text)]">Vosburg v. Putney</span>
                        <p className="text-[13px] text-[var(--text-muted)] mt-1">Intent to do harm is not required; only intent to cause the contact which happens to be unlawful.</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <h3 className="font-semibold text-[var(--accent2)] text-lg">B. Assault</h3>
                      <p className="text-[var(--text-muted)] mt-2">Definition: An act that makes the other apprehensive of an imminent harmful or offensive contact.</p>
                      <div className="bg-[rgba(91,141,238,0.1)] p-3 rounded mt-3 border-l-2 border-[var(--blue)]">
                        <span className="text-[11px] font-bold text-[var(--blue)] block mb-1">HOLDING</span>
                        <p className="text-[var(--text)] text-[13px]">Apprehension must be of an imminent contact; threat of future harm does not constitute assault.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-[var(--text)]">II. NEGLIGENCE</h2>
                  <div className="pl-6 mt-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-[var(--accent2)] text-lg">A. Duty of Care</h3>
                      <p className="text-[var(--text-muted)] mt-2">Establishing duty: Reasonable person standard. The defendant must owe a legal duty to the plaintiff.</p>
                      <div className="bg-[var(--surface2)] p-3 rounded mt-3 border-l-2 border-[var(--accent)]">
                        <span className="text-[11px] font-bold text-[var(--accent)] block mb-1">EXAM TIP</span>
                        <p className="text-[var(--text)] text-[13px]">Always focus on foreseeability of injury and proximity. Cardozo's approach limits duty; Andrews' approach expands it.</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
