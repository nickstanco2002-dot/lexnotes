"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function DashboardView() {
  const [stats, setStats] = useState({ notes: 14, cases: 38, score: '74%', days: 31 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadDashboardData() {
      try {
        // Real fetch example (uncomment when your tables exist):
        // const { count: notesCount } = await supabase.from('notes').select('*', { head: true, count: 'exact' });
        // const { count: casesCount } = await supabase.from('cases').select('*', { head: true, count: 'exact' });

        // For now, simulate a short delay so UI feels live while using mock data.
        setTimeout(() => {
          if (!mounted) return;
          setStats({ notes: 14, cases: 38, score: '74%', days: 31 });
          setLoading(false);
        }, 800);
      } catch (err) {
        if (!mounted) return;
        setLoading(false);
      }
    }
    loadDashboardData();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-8 text-[var(--text-dim)] font-mono-ui animate-pulse">Loading Workspace...</div>;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-8 gap-8 fade-in">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-bold">Good morning, Jordan 👋</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-1 font-mono-ui">
            Monday, Feb 13, 2025 <span className="mx-2 text-[var(--border)]">|</span> 1L Fall Semester
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-[var(--surface2)] border border-[var(--border)] px-4 py-2 rounded-[var(--radius)] text-[12px] hover:text-[var(--accent)] transition-colors">
            Edit Layout
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Notes This Week" value={String(stats.notes)} trend="↑ 3" color="var(--accent)" />
        <StatCard label="Cases Briefed" value={String(stats.cases)} trend="Across 5 courses" color="var(--blue)" />
        <StatCard label="Practice Score" value={stats.score} trend="↑ 8%" color="var(--green)" />
        <StatCard label="Days to Finals" value={String(stats.days)} trend="Contracts first" color="var(--red)" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: Schedule & Active Cases */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          
          {/* Today's Schedule Widget */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[14px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Today's Schedule</h3>
              <span className="text-[11px] text-[var(--accent)] cursor-pointer hover:underline">View Calendar →</span>
            </div>
            <div className="space-y-4">
              <ScheduleItem time="09:00 AM" title="Torts: Proximate Cause" room="Room 204" color="var(--red)" active />
              <ScheduleItem time="11:30 AM" title="Contracts: Parol Evidence" room="Room 110" color="var(--blue)" />
              <ScheduleItem time="02:00 PM" title="Legal Research & Writing" room="Library B" color="var(--green)" />
            </div>
          </div>

          {/* Recent Notes Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-[var(--surface2)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--accent)] transition-all cursor-pointer group">
                <div className="text-[10px] font-bold text-[var(--red)] uppercase mb-2">Torts</div>
                <div className="text-[15px] font-medium mb-1 group-hover:text-[var(--accent)]">Palsgraf v. Long Island RR</div>
                <div className="text-[12px] text-[var(--text-muted)] line-clamp-2">The duty of care is owed only to foreseeable plaintiffs...</div>
             </div>
             <div className="bg-[var(--surface2)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--accent)] transition-all cursor-pointer group">
                <div className="text-[10px] font-bold text-[var(--blue)] uppercase mb-2">Contracts</div>
                <div className="text-[15px] font-medium mb-1 group-hover:text-[var(--accent)]">Lucy v. Zehmer</div>
                <div className="text-[12px] text-[var(--text-muted)] line-clamp-2">Objective theory of contracts; outward expression of intent...</div>
             </div>
          </div>
        </div>

        {/* Right Column: AI Insights & Quick Actions */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10 text-[60px]">⚡</div>
            <h3 className="text-[14px] font-semibold text-[var(--accent)] mb-4">AI Study Insight</h3>
            <p className="text-[13px] leading-relaxed text-[var(--text)] mb-4">
              You've briefed 5 cases in <span className="text-[var(--red)] font-medium">Torts</span> this week. You might want to review the 
              "Hand Formula" before your Wednesday lecture.
            </p>
            <button className="w-full py-2 bg-[var(--accent-dim)] border border-[rgba(201,168,76,0.3)] text-[var(--accent)] text-[12px] rounded-md hover:bg-[var(--accent)] hover:text-black transition-all">
              Generate Practice Quiz
            </button>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-[14px] font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <ActionButton icon="📄" label="New Brief" />
              <ActionButton icon="🎙" label="Record" />
              <ActionButton icon="📚" label="Upload PDF" />
              <ActionButton icon="✍️" label="Practice" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- Helper UI Components ---

function StatCard({ label, value, trend, color }: any) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 relative overflow-hidden group hover:border-[var(--text-dim)] transition-colors" style={{ '--stat-color': color } as any}>
      <div className="absolute top-0 left-0 w-1 h-full bg-[--stat-color]"></div>
      <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono-ui mb-2">{label}</div>
      <div className="text-[28px] font-bold font-display mb-1">{value}</div>
      <div className="text-[11px] text-[var(--text-dim)]">{trend}</div>
    </div>
  );
}

function ScheduleItem({ time, title, room, color, active = false }: any) {
  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${active ? 'bg-[var(--surface2)] border-[var(--border)]' : 'border-transparent opacity-60 hover:opacity-100'}`} style={{ '--dot-color': color } as any}>
      <div className="text-[11px] font-mono-ui w-16 text-[var(--text-muted)]">{time}</div>
      <div className="w-1.5 h-1.5 rounded-full bg-[--dot-color]"></div>
      <div className="flex-1">
        <div className="text-[13px] font-medium">{title}</div>
        <div className="text-[11px] text-[var(--text-dim)]">{room}</div>
      </div>
      {active && <span className="text-[10px] bg-[var(--accent-dim)] text-[var(--accent)] px-2 py-0.5 rounded uppercase font-bold tracking-tighter">Now</span>}
    </div>
  );
}

function ActionButton({ icon, label }: any) {
  return (
    <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-[var(--surface2)] border border-[var(--border)] hover:border-[var(--accent)] transition-all gap-2 group">
      <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-[11px] text-[var(--text-muted)] group-hover:text-[var(--text)]">{label}</span>
    </button>
  );
}
