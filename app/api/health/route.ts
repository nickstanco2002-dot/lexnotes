import { NextResponse } from "next/server";
import { hasOpenAIKey, OPENAI_MODEL } from "../../../lib/api";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    openaiConfigured: hasOpenAIKey(),
    model: OPENAI_MODEL,
    timestamp: new Date().toISOString(),
  });
}
