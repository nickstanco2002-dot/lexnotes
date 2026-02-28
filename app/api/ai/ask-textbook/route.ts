import { NextResponse } from "next/server";
import { openai } from "../../../../lib/openai";
import { hasOpenAIKey, jsonError, OPENAI_MODEL, safeJson } from "../../../../lib/api";

export const runtime = "nodejs";

type AskBody = {
  question?: string;
};

export async function POST(req: Request) {
  if (!hasOpenAIKey()) {
    return jsonError("OPENAI_API_KEY is not configured", 500);
  }

  const body = await safeJson<AskBody>(req);
  if (!body?.question?.trim()) {
    return jsonError("Invalid payload: question is required", 400);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a law-school study assistant. Give direct, accurate explanations with issue-spotting guidance.",
        },
        { role: "user", content: body.question },
      ],
      temperature: 0.5,
    });

    return NextResponse.json({ answer: completion.choices[0]?.message?.content || "" });
  } catch (error) {
    return jsonError("Failed to process question", 500, String(error));
  }
}
