import { NextResponse } from "next/server";
import { openai } from "../../../lib/openai";
import { hasOpenAIKey, jsonError } from "../../../lib/api";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!hasOpenAIKey()) {
    return jsonError("OPENAI_API_KEY is not configured", 500);
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError("Invalid payload: file is required", 400);
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "en",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    return jsonError("Transcription failed", 500, String(error));
  }
}
