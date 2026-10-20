import { PHOTO_MAX_BYTES } from "./validation";

export const PHOTO_SIZE = 512;

/**
 * Browser only. Shrinks any picture to a 512×512 JPEG (centre crop), so a 4 MB download from
 * ChatGPT becomes ~80 KB before it is ever sent to the server. Tries lower quality until it fits.
 */
export async function resizePhotoToDataUrl(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("not-image");
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = PHOTO_SIZE;
  canvas.height = PHOTO_SIZE;
  const context = canvas.getContext("2d")!;
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;
  context.drawImage(bitmap, sx, sy, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
  bitmap.close();
  for (const quality of [0.86, 0.72, 0.58, 0.45]) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (dataUrl.length * 0.75 <= PHOTO_MAX_BYTES) return dataUrl;
  }
  throw new Error("too-large");
}

export function photoErrorMessage(error: unknown) {
  return error instanceof Error && error.message === "not-image"
    ? "That file is not an image. Pick the PNG or JPG you downloaded."
    : "We could not read that picture. Try saving it again as PNG or JPG.";
}
