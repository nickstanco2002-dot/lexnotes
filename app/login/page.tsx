"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");

  async function signIn() {
    await supabase.auth.signInWithOtp({ email });
    alert("Check your email!");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-neutral-900 p-10 rounded-xl w-96">
        <h1 className="text-2xl mb-6">Login</h1>
        <input
          className="w-full p-3 bg-neutral-800"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={signIn}
          className="mt-4 w-full bg-yellow-600 py-3"
        >
          Send Magic Link
        </button>
      </div>
    </div>
  );
}
