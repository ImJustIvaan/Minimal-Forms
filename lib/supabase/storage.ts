import "server-only";
import { supabaseAdmin } from "./admin";

const BUCKET = "form-assets";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

/** Uploads an image to the public `form-assets` bucket and returns its public URL. */
export async function uploadImage(file: File, pathPrefix: string) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Please upload a PNG, JPEG, WebP, or GIF image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Images must be 5MB or smaller.");
  }

  const ext = file.type.split("/")[1];
  const path = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;

  const db = supabaseAdmin();
  const { error } = await db.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(error.message);

  const { data } = db.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Best-effort delete of a previously uploaded image, given its public URL. */
export async function deleteImageByUrl(url: string | null | undefined) {
  if (!url) return;
  const marker = `/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;
  const path = url.slice(index + marker.length);
  if (!path) return;

  const db = supabaseAdmin();
  await db.storage.from(BUCKET).remove([path]);
}
