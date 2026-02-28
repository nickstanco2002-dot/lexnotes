"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [ready, setReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const frameSrc = "/lexnotes-skeleton.html";

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "lexnotes-ready") setReady(true);
    }
    window.addEventListener("message", onMessage);
    const t = window.setTimeout(() => setTimedOut(true), 7000);
    return () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(t);
    };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0b0c0e" }}>
      <iframe
        src={frameSrc}
        title="LexNotes Skeleton"
        onLoad={() => setFrameLoaded(true)}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          border: "0",
          display: "block",
          opacity: ready ? 1 : 0.02,
          transition: "opacity 220ms ease",
        }}
      />

      {!ready && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            padding: 24,
            color: "#e6e4dc",
            fontFamily: "DM Sans, system-ui, sans-serif",
          }}
        >
          <div
            style={{
              width: "min(560px, 100%)",
              border: "1px solid #252830",
              borderRadius: 12,
              background: "#111215",
              padding: 20,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Loading LexNotes…</div>
            <div style={{ color: "#6e7280", fontSize: 13 }}>
              {frameLoaded
                ? "Initializing workspace UI."
                : "Preparing application frame."}
            </div>

            {timedOut && (
              <div style={{ marginTop: 14 }}>
                <div style={{ color: "#d95f5f", fontSize: 12, marginBottom: 10 }}>
                  The embedded app took too long to initialize.
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <a
                    href="/lexnotes-skeleton.html"
                    style={{
                      textDecoration: "none",
                      padding: "8px 12px",
                      borderRadius: 6,
                      background: "#c9a84c",
                      color: "#0b0c0e",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Open Standalone
                  </a>
                  <button
                    onClick={() => window.location.reload()}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      background: "transparent",
                      color: "#e6e4dc",
                      border: "1px solid #2e3240",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Reload
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
