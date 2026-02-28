"use client";

import React, { useState, useRef } from 'react';

export default function TranscriptBar({ onMerge }: { onMerge: (merged: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'lecture.wav');

        // 1. Get Transcription
        const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
        const { text } = await res.json();

        // 2. Trigger Merge (Passing the transcript text back to the main editor)
        onMerge(text);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="bg-[var(--surface)] border-t border-[var(--border)] p-3 px-6 flex items-center gap-4">
      <button 
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-[var(--red)] hover:scale-105'}`}
      >
        <span className="text-white text-lg">{isRecording ? '■' : '🎙'}</span>
      </button>
      <div className="flex-1">
        <div className="text-[12px] font-medium text-[var(--text)]">
          {isRecording ? "Listening to lecture..." : "Click to record lecture"}
        </div>
        <div className="text-[10px] text-[var(--text-dim)] font-mono">
          AI will auto-sync transcript to your active brief
        </div>
      </div>
    </div>
  );
}
