"use client";

import React, { useState } from 'react';

export default function TextbookView() {
  const [isUploading, setIsUploading] = useState(false);
  const [activeBook, setActiveBook] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // In production, you would upload this to Supabase Storage:
    // await supabase.storage.from('textbooks').upload(`${user.id}/${file.name}`, file);
    
    setTimeout(() => {
      setActiveBook(file.name);
      setIsUploading(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg)] fade-in">
      {!activeBook ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10">
          <div className="w-full max-w-md border-2 border-dashed border-[var(--border)] rounded-2xl p-12 text-center hover:border-[var(--accent)] transition-colors group">
            <div className="text-4xl mb-4 opacity-50 group-hover:scale-110 transition-transform">📚</div>
            <h2 className="text-xl font-semibold mb-2 font-display">Upload Textbook</h2>
            <p className="text-[13px] text-[var(--text-muted)] mb-6">Drop your Casebook PDF here to start intelligent reading.</p>
            <label className="bg-[var(--accent)] text-black px-6 py-2.5 rounded-[var(--radius)] font-medium cursor-pointer hover:bg-[var(--accent2)] transition-colors">
              {isUploading ? "Processing PDF..." : "Select File"}
              <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={isUploading} />
            </label>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 bg-[var(--surface2)] flex flex-col overflow-hidden border-r border-[var(--border)]">
            <div className="h-10 bg-[var(--surface)] border-b border-[var(--border)] flex items-center px-4 justify-between text-[11px] font-mono-ui text-[var(--text-muted)]">
              <span>{activeBook}</span>
              <div className="flex gap-4">
                <span>Page 124 of 850</span>
                <span className="text-[var(--accent)] cursor-pointer">Find: "Strict Liability"</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-[#2a2d35]">
              <div className="w-full max-w-[800px] aspect-[1/1.41] bg-white text-black p-16 shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-0 hover:opacity-100 cursor-text"></div>
                <h1 className="text-3xl font-serif mb-8 italic">Chapter 4: Strict Liability</h1>
                <p className="text-lg leading-relaxed mb-6 font-serif">
                   <mark className="bg-[rgba(201,168,76,0.3)]">Strict liability is the legal responsibility for damages, or injury, even if the person found responsible was not at fault or negligent.</mark> 
                   In tort law, strict liability is the imposition of liability on a party without a finding of fault...
                </p>
              </div>
            </div>
          </div>

          <div className="w-[320px] bg-[var(--surface)] flex flex-col shrink-0">
             <div className="p-4 border-b border-[var(--border)]">
                <div className="text-[10px] font-bold tracking-widest uppercase text-[var(--accent)] mb-1">AI Smart Context</div>
                <div className="text-[13px] font-medium">Selected Definition</div>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="bg-[var(--surface2)] border border-[var(--border)] rounded-lg p-3">
                   <div className="text-[11px] text-[var(--text-dim)] mb-2 font-mono">DEFINITION</div>
                   <p className="text-[13px] italic">"Liability without fault."</p>
                   <button className="mt-3 w-full py-1.5 bg-[var(--surface3)] text-[11px] rounded border border-[var(--border)] hover:text-[var(--accent)]">
                     Add to Glossary
                   </button>
                </div>
                
                <div>
                  <div className="text-[11px] text-[var(--text-dim)] mb-2 font-mono">RELEVANT CASES</div>
                  <div className="space-y-2">
                    <div className="text-[12px] p-2 bg-[var(--accent-dim)] border border-[rgba(201,168,76,0.1)] rounded cursor-pointer">
                       Rylands v Fletcher (1868)
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
