import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { question } = await req.json();

  try {
    // TODO: Implement textbook search with Supabase embeddings
    // For MVP, return a helpful response without textbook context
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful law school study assistant. Provide clear explanations of legal concepts. Full textbook context will be available in the next release." 
        },
        { role: "user", content: question },
      ],
      temperature: 0.7,
    });

    return NextResponse.json({
      answer: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error('Textbook question error:', error);
    return NextResponse.json(
      { error: 'Failed to process question' }, 
      { status: 500 }
    );
  }
}
