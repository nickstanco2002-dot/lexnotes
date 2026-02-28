import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as Blob | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const data = await pdf(buffer as Buffer);
    return NextResponse.json({ text: data.text, pageCount: data.numpages });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 });
  }
}
