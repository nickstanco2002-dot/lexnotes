import { NextResponse } from "next/server";
import { openai } from "../../../lib/openai";
import { hasOpenAIKey, jsonError, OPENAI_MODEL, safeJson } from "../../../lib/api";

export const runtime = "nodejs";

type PracticeBody = {
  course?: string;
  topic?: string;
};

export async function POST(req: Request) {
  if (!hasOpenAIKey()) {
    return jsonError("OPENAI_API_KEY is not configured", 500);
  }

  const body = await safeJson<PracticeBody>(req);
  if (!body || !body.course || !body.topic) {
    return jsonError("Invalid payload: course and topic are required", 400);
  }

  const prompt = `Generate a challenging ${body.course} exam-style fact pattern about ${body.topic}. Include a call of the question.`;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "system", content: prompt }],
      temperature: 0.8,
    });

    return NextResponse.json({ factPattern: response.choices[0]?.message?.content || "" });
  } catch (error) {
    return jsonError("Failed to generate fact pattern", 500, String(error));
  }
}
