import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { course, topic, mode } = await req.json();

  const systemPrompt = `
    You are a Law School Professor. 
    Generate a complex ${course} fact pattern regarding ${topic}.
    The fact pattern should be 3-4 paragraphs long, full of 'red herrings' and multiple potential torts/breaches.
    Include a 'Call of the Question' at the end (e.g., 'Discuss the liabilities of all parties').
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'system', content: systemPrompt }],
      temperature: 0.8,
    });

    return NextResponse.json({ factPattern: response.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate fact pattern' }, { status: 500 });
  }
}
