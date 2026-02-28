import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  return NextResponse.json({
    text: `[PDF content from ${file.name} - mock data for MVP]`,
    pageCount: 1,
    fileName: file.name,
    size: file.size,
  });
}
