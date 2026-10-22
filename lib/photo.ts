// Browser-only: shrinks a photo to a small JPEG before sending, so it is fast and uses little data.
export async function photoToJpegDataUrl(file: File, maxSide = 1024, quality = 0.8): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("not-an-image");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no-canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}
