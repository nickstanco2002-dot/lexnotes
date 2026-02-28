import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { courseId, notes } = await req.json();

  const prompt = `
    You are an expert law school academic. 
    Task: Create a Comprehensive Course Outline based on the provided notes.
    Structure: 
    1. Table of Contents
    2. Black Letter Law (Restatements/Statutes)
    3. Case Summaries (Facts/Holding) integrated into the rules
    4. Exam Tips
    
    Notes Data: ${JSON.stringify(notes)}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.2,
    });

    return NextResponse.json({ outline: response.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: 'Outline generation failed' }, { status: 500 });
  }
}
