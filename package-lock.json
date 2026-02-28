"use client";

import React, { useState } from 'react';

interface FeedbackType {
  score: string;
  critique: string;
  iracScore: {
    issue: number;
    rule: number;
    analysis: number;
    conclusion: number;
  };
}

export default function PracticeView() {
  const [examStarted, setExamStarted] = useState(false);
  const [hypo, setHypo] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [loading, setLoading] = useState(false);

  const startExam = async () => {
    setExamStarted(true);
    setLoading(true);
    // Mock fact pattern for demo; real call would hit /api/practice-exam
    setTimeout(() => {
      setHypo("FACTS: A, a local baker, is carrying a tray of hot pies down Main Street. B, a distracted skateboarder listening to music, collides with A without looking. The pies fly into the air and strike C, a pedestrian standing on the sidewalk, causing second-degree burns on C's face and neck. D, a nearby bystander, records the incident on his phone and laughs loudly, saying 'That's hilarious!' C claims emotional distress from D's laughter. D also posts the video online, where it goes viral. E, a news reporter, uses the video in a news segment without C's permission.\n\nCALL OF THE QUESTION: Discuss the potential tort liabilities of B, D, and E to C. Address all potential claims, defenses, and damages.");
      setLoading(false);
    }, 1500);
  };

  const submitForGrading = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    // Mock grading for demo
    setTimeout(() => {
      setFeedback({
        score: "B+",
        critique: "Good identification of Negligence against B and potential battery. You missed the 'Zone of Danger' and 'Foreseeability' analysis for D's emotional distress claim. Note: D's mere laughter, without more, may not constitute intentional infliction of emotional distress. E's use of the video may involve invasion of privacy or defamation depending on context.",
        iracScore: { issue: 9, rule: 8, analysis: 6, conclusion: 10 }
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg)] fade-in">
      {!examStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-6">⚖️</div>
            <h2 className="text-2xl font-display mb-2">Ready for Practice?</h2>
            <p className="text-[13px] text-[var(--text-muted)] mb-6">Generate a random Torts hypo and test your IRAC analysis.</p>
            <button 
              onClick={startExam}
              className="w-full bg-[var(--accent)] text-black py-3 rounded-[var(--radius)] font-bold hover:bg-[var(--accent2)] transition-colors"
            >
              {loading ? "Generating..." : "Generate Random Hypo"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Fact Pattern */}
          <div className="w-1/2 p-8 overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)]">
            <div className="text-[10px] font-bold text-[var(--accent)] tracking-widest uppercase mb-4 font-mono-ui">Exam Fact Pattern</div>
            <div className="text-[15px] leading-relaxed font-serif text-[var(--text)] whitespace-pre-wrap">
              {hypo}
            </div>
          </div>

          {/* Answer Area */}
          <div className="w-1/2 flex flex-col p-8 bg-[var(--bg)] relative overflow-y-auto">
            {feedback ? (
              <div className="fade-in space-y-4">
                <div>
                  <div className="text-3xl font-bold text-[var(--accent)] mb-2">Grade: {feedback.score}</div>
                </div>
                <div className="bg-[var(--surface2)] border border-[var(--border)] p-4 rounded-lg text-[13px] leading-relaxed space-y-4">
                  <p>{feedback.critique}</p>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono-ui">
                    <div className="p-2 border border-[var(--border)] rounded">
                      <div className="font-bold text-[var(--blue)]">ISSUE</div>
                      <div className="text-[var(--accent)]">{feedback.iracScore.issue}/10</div>
                    </div>
                    <div className="p-2 border border-[var(--border)] rounded">
                      <div className="font-bold text-[var(--blue)]">RULE</div>
                      <div className="text-[var(--accent)]">{feedback.iracScore.rule}/10</div>
                    </div>
                    <div className="p-2 border border-[var(--border)] rounded">
                      <div className="font-bold text-[var(--blue)]">ANALYSIS</div>
                      <div className="text-[var(--accent)]">{feedback.iracScore.analysis}/10</div>
                    </div>
                    <div className="p-2 border border-[var(--border)] rounded">
                      <div className="font-bold text-[var(--blue)]">CONCL</div>
                      <div className="text-[var(--accent)]">{feedback.iracScore.conclusion}/10</div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => { setFeedback(null); setAnswer(""); }}
                  className="mt-4 text-[12px] text-[var(--accent)] underline hover:text-[var(--accent2)]"
                >
                  Try another hypo
                </button>
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <label className="text-[10px] font-bold text-[var(--accent)] tracking-widest uppercase font-mono-ui">Your IRAC Analysis</label>
                </div>
                <textarea 
                  className="flex-1 bg-[var(--surface2)] border border-[var(--border)] rounded-md p-4 outline-none resize-none text-[14px] leading-relaxed font-sans-ui text-[var(--text)] focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-dim)]"
                  placeholder="Begin your analysis here. Structure: Issue → Rule → Application → Conclusion..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <button 
                  onClick={submitForGrading}
                  disabled={loading || !answer.trim()}
                  className="mt-4 bg-[var(--accent)] text-black py-2 px-4 text-[12px] font-bold rounded-[var(--radius)] hover:bg-[var(--accent2)] transition-colors disabled:opacity-50"
                >
                  {loading ? "Grading..." : "Submit for AI Grading"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
