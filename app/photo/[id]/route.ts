import { getProfilePhoto } from "@/db/queries";
import { isAdmin } from "@/lib/auth";
import { isValidId, PHOTO_PREFIX } from "@/lib/validation";

// A Route Handler: plain HTTP, no React. The browser's <img src="/photo/abc123"> lands here
// and gets JPEG bytes back, so pages stay small even with fifty photos on them.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidId(id)) return new Response("Not found", { status: 404 });

  const row = await getProfilePhoto(id);
  if (!row?.photo || !row.photo.startsWith(PHOTO_PREFIX)) return new Response("Not found", { status: 404 });
  if (row.hidden && !(await isAdmin())) return new Response("Not found", { status: 404 });

  const bytes = Buffer.from(row.photo.slice(PHOTO_PREFIX.length), "base64");
  return new Response(new Uint8Array(bytes), {
    headers: {
      "content-type": "image/jpeg",
      "content-length": String(bytes.byteLength),
      "cache-control": "private, max-age=3600",
    },
  });
}
