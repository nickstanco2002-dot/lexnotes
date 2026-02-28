import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as Blob | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  try {
    // TODO: Integrate actual PDF parsing with pdf-parse library
    // For now, return mock data for MVP
    const fileName = (file as any).name || 'document.pdf';
    return NextResponse.json({ 
      text: `[PDF content from ${fileName} - mock data for MVP]`, 
      pageCount: 1 
    });
  } catch (err) {
    console.error('PDF parse error:', err);
    // Fallback: return mock data if parsing fails
    return NextResponse.json({ 
      text: '[PDF parsing - mock data fallback]', 
      pageCount: 1 
    });
  }
}
