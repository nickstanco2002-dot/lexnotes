import { NextResponse } from "next/server";
import { openai } from "../../../lib/openai";
import { hasOpenAIKey, jsonError, OPENAI_MODEL, safeJson } from "../../../lib/api";

export const runtime = "nodejs";

type MergeBody = {
  existingNote?: unknown;
  transcript?: string;
};

const BASE_PROMPT = `You are an expert law clerk. Merge lecture insights into the existing brief without removing original content. Add sections: Professor's Comments and Exam Hypos when relevant.`;

export async function POST(req: Request) {
  if (!hasOpenAIKey()) {
    return jsonError("OPENAI_API_KEY is not configured", 500);
  }

  const body = await safeJson<MergeBody>(req);
  if (!body || !body.existingNote || !body.transcript) {
    return jsonError("Invalid payload: existingNote and transcript are required", 400);
  }

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: BASE_PROMPT },
        {
          role: "user",
          content: `Existing brief:\n${JSON.stringify(body.existingNote)}\n\nTranscript:\n${body.transcript}`,
        },
      ],
      temperature: 0.2,
    });

    return NextResponse.json({ mergedNote: response.choices[0]?.message?.content || "" });
  } catch (error) {
    return jsonError("Merge failed", 500, String(error));
  }
}
