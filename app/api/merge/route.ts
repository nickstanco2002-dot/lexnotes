import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { existingNote, transcript } = await req.json();

  const prompt = `
    You are an expert law clerk. I have a Case Brief and a raw Lecture Transcript.
    Merge the lecture insights into the brief without deleting original content.
    
    1. Create a "Professor's Comments" section for specific class takeaways.
    2. If the professor mentioned a hypothetical, add it to an "Exam Hypos" section.
    3. Update the "Analysis" if the professor clarified the court's reasoning.
    
    Existing Brief: ${JSON.stringify(existingNote)}
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
