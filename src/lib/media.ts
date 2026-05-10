import fs from "node:fs/promises";
import path from "node:path";
import { getUploadsDir } from "@/lib/config";
import { createId } from "@/lib/ids";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_VIDEO_MIME = new Set(["video/mp4", "video/quicktime", "video/webm"]);

export type StoredMedia = {
  absolutePath: string;
  relativePath: string;
  mimeType: string;
  mediaType: "image" | "video";
  originalFilename: string | null;
  bytes: Buffer;
};

export function mediaTypeFromMime(mimeType: string) {
  if (ALLOWED_IMAGE_MIME.has(mimeType)) return "image";
  if (ALLOWED_VIDEO_MIME.has(mimeType)) return "video";
  return null;
}

export async function saveUploadedMedia(file: File): Promise<StoredMedia> {
  const mimeType = file.type;
  const mediaType = mediaTypeFromMime(mimeType);

  if (!mediaType) {
    throw new Error(`Unsupported media type: ${mimeType || "unknown"}`);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error("Upload is too large. The local demo limit is 25MB.");
  }

  const extension = extensionForMime(mimeType);
  const filename = `${createId("media")}.${extension}`;
  const relativePath = path.join(mediaType, filename);
  const absolutePath = path.join(getUploadsDir(), relativePath);

  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, bytes);

  return {
    absolutePath,
    relativePath,
    mimeType,
    mediaType,
    originalFilename: file.name || null,
    bytes,
  };
}

export async function readStoredMedia(relativePath: string) {
  const normalized = path.normalize(relativePath);
  if (normalized.startsWith("..") || path.isAbsolute(normalized)) {
    throw new Error("Invalid media path");
  }

  return fs.readFile(path.join(getUploadsDir(), normalized));
}

export async function deleteStoredMedia(relativePath: string) {
  const normalized = path.normalize(relativePath);
  if (normalized.startsWith("..") || path.isAbsolute(normalized)) {
    throw new Error("Invalid media path");
  }

  try {
    await fs.unlink(path.join(getUploadsDir(), normalized));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

export function toDataUrl(bytes: Buffer, mimeType: string) {
  return `data:${mimeType};base64,${bytes.toString("base64")}`;
}

function extensionForMime(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "video/mp4":
      return "mp4";
    case "video/quicktime":
      return "mov";
    case "video/webm":
      return "webm";
    default:
      return "bin";
  }
}
