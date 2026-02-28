import { NextResponse } from "next/server";
import { openai } from "../../../lib/openai";
import { hasOpenAIKey, jsonError, OPENAI_MODEL, safeJson } from "../../../lib/api";

export const runtime = "nodejs";

type OutlineBody = {
  courseId?: string;
  notes?: unknown;
};

export async function POST(req: Request) {
  if (!hasOpenAIKey()) {
    return jsonError("OPENAI_API_KEY is not configured", 500);
  }

  const body = await safeJson<OutlineBody>(req);
  if (!body || !body.courseId) {
    return jsonError("Invalid payload: courseId is required", 400);
  }

  const prompt = `Create a comprehensive law-school course outline for ${body.courseId}.\n\nNotes:\n${JSON.stringify(body.notes || [])}`;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "system", content: prompt }],
      temperature: 0.2,
    });

    return NextResponse.json({ outline: response.choices[0]?.message?.content || "" });
  } catch (error) {
    return jsonError("Outline generation failed", 500, String(error));
  }
}
