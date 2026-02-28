import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { existingNote, transcript } = await req.json();

  const prompt = `
    You are an expert law student. 
    I have an existing Case Brief with Facts, Issue, and Rule.
    I also have a raw Lecture Transcript from today's class.
    
    TASK: Merge the lecture insights into the brief. 
    1. Add a new section called 'Professor's Take'.
    2. Update the 'Analysis' section with any specific hypotheticals the professor mentioned.
    3. Keep the original facts and rule intact unless the professor corrected them.
    
    Existing Note: ${JSON.stringify(existingNote)}
    Transcript: ${transcript}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.2,
    });

    return NextResponse.json({ mergedNote: response.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: 'Merge failed' }, { status: 500 });
  }
}
