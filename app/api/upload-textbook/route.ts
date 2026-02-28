import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "Textbook upload endpoint is wired. Storage integration pending.",
    textbookId: `mock-${Date.now()}`,
    fileName: file.name,
    size: file.size,
    type: file.type,
  });
}
