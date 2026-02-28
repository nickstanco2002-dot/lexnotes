import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { question } = await req.json();

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  });

  const { data } = await supabase.rpc("match_textbook_chunks", {
    query_embedding: embedding.data[0].embedding,
    match_threshold: 0.7,
    match_count: 5,
  });

  const context = data.map((d: any) => d.content_chunk).join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Answer only using textbook context." },
      { role: "user", content: `Context:\n${context}\n\nQuestion:${question}` },
    ],
  });

  return NextResponse.json({
    answer: completion.choices[0].message.content,
  });
}
