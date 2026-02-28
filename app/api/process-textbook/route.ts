import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import pdf from "pdf-parse";
import { openai } from "@/lib/openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function chunk(text: string, size = 1000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

export async function POST(req: Request) {
  const { textbookId } = await req.json();

  const { data: textbook } = await supabase
    .from("textbooks")
    .select("*")
    .eq("id", textbookId)
    .single();

  const { data: file } = await supabase.storage
    .from("textbooks")
    .download(textbook.file_url);

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = await pdf(buffer);
  const chunks = chunk(parsed.text);

  for (const c of chunks) {
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: c,
    });

    await supabase.from("textbook_embeddings").insert({
      textbook_id: textbookId,
      content_chunk: c,
      embedding: embedding.data[0].embedding,
    });
  }

  await supabase
    .from("textbooks")
    .update({ status: "completed" })
    .eq("id", textbookId);

  return NextResponse.json({ done: true });
}
