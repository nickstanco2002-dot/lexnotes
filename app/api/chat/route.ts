import { NextResponse } from "next/server";
import { openai } from "../../../lib/openai";
import { hasOpenAIKey, jsonError, OPENAI_MODEL, safeJson } from "../../../lib/api";

export const runtime = "nodejs";

type ChatBody = {
  messages?: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  context?: string;
};

export async function POST(req: Request) {
  if (!hasOpenAIKey()) {
    return jsonError("OPENAI_API_KEY is not configured", 500);
  }

  const body = await safeJson<ChatBody>(req);
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return jsonError("Invalid payload: messages[] is required", 400);
  }

  const systemPrompt =
    `You are LexNotes AI, an elite legal study assistant. ` +
    `Help with IRAC analysis and concise, accurate legal reasoning. ` +
    `Current context: ${body.context || "None"}`;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...body.messages],
      temperature: 0.3,
    });

    return NextResponse.json({
      message: response.choices[0]?.message?.content || "",
      model: OPENAI_MODEL,
    });
  } catch (error) {
    return jsonError("AI failed to respond", 500, String(error));
  }
}
