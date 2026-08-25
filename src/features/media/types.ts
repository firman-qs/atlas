export type MediaPurpose = "authoring" | "attempt" | "chat";

export interface UploadedMedia {
  id: string;
  purpose: MediaPurpose;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
}
