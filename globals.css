import { NextResponse } from "next/server";
import { safeJson } from "../../../lib/api";

export const runtime = "nodejs";

type ProcessBody = {
  textbookId?: string;
};

export async function POST(req: Request) {
  const body = await safeJson<ProcessBody>(req);
  if (!body?.textbookId) {
    return NextResponse.json({ error: "textbookId is required" }, { status: 400 });
  }

  return NextResponse.json({
    done: true,
    textbookId: body.textbookId,
    message: "Textbook processing endpoint is wired. Embeddings pipeline pending.",
  });
}
