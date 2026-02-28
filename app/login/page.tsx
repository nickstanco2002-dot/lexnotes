"use client";

import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function signIn() {
    // TODO: Integrate Supabase authentication
    setSubmitted(true);
    alert("Magic link login coming soon!");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div className="bg-[var(--surface)] p-10 rounded-xl w-96 border border-[var(--border)]">
        <h1 className="text-2xl font-[family-name:'Playfair_Display'] font-bold mb-2">LexNotes</h1>
        <p className="text-[var(--text-muted)] text-sm mb-6">Sign in to continue</p>
        <input
          className="w-full p-3 bg-[var(--surface2)] border border-[var(--border)] rounded text-[var(--text)] placeholder:text-[var(--text-dim)] focus:border-[var(--accent)] focus:outline-none"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={signIn}
          className="mt-4 w-full bg-[var(--accent)] text-black py-3 rounded font-medium hover:bg-[var(--accent2)] transition-colors"
        >
          {submitted ? "Check your email..." : "Send Magic Link"}
        </button>
        <p className="text-[10px] text-[var(--text-dim)] mt-4 text-center">
          Authentication will be available in the next release
        </p>
      </div>
    </div>
  );
}
