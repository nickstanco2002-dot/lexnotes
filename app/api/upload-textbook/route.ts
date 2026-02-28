import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  const { data: upload } = await supabase.storage
    .from("textbooks")
    .upload(`uploads/${Date.now()}-${file.name}`, file);

  const { data: textbook } = await supabase
    .from("textbooks")
    .insert({
      title: file.name,
      file_url: upload?.path,
      status: "processing"
    })
    .select()
    .single();

  // Trigger background processor
  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/process-textbook`, {
    method: "POST",
    body: JSON.stringify({ textbookId: textbook.id })
  });

  return NextResponse.json({ success: true });
}
