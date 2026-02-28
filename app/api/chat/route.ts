import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  const systemPrompt = `
    You are LexNotes AI, an elite legal study assistant. 
    Your goal is to help law students analyze cases, distill rules, and prepare for cold calls.
    Focus on the IRAC framework. Be precise, academic, yet concise.
    Current Context (Note/Textbook): ${context || 'None provided'}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.3,
    });

    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    return NextResponse.json({ error: 'AI failed to respond' }, { status: 500 });
  }
}
