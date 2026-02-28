"use client";

import React, { useState, useRef } from 'react';

export default function AutoRecorder({ onMergeComplete }: { onMergeComplete: (newContent: any) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);
        audioChunks.current = [];
        mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
        mediaRecorder.current.onstop = processAudio;
        mediaRecorder.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Failed to start recording:', error);
      }
    } else {
      mediaRecorder.current?.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async () => {
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('file', audioBlob);

    try {
      // 1. Transcribe
      const transRes = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const { text } = await transRes.json();

      // 2. Merge with existing note state
      const mergeRes = await fetch('/api/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transcript: text, 
          existingNote: {} 
        }) 
      });
      const { mergedNote } = await mergeRes.json();
      
      onMergeComplete(mergedNote);
    } catch (error) {
      console.error('Processing error:', error);
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 bg-[var(--surface2)] rounded-lg border border-[var(--border)]">
      <button 
        onClick={toggleRecording}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-[var(--red)]'}`}
      >
        <span className="text-white text-xs">{isRecording ? '■' : '🎙'}</span>
      </button>
      <div className="text-[11px]">
        <div className="font-bold">{isRecording ? "Recording Lecture..." : "Record & Auto-Merge"}</div>
        <div className="text-[var(--text-dim)] font-mono">Whisper v3 active</div>
      </div>
    </div>
  );
}
