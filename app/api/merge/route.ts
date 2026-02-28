import { POST as mergeNotesPost } from "../merge-notes/route";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return mergeNotesPost(req);
}
