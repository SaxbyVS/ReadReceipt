import mongoose, { Schema, Document } from "mongoose";

export interface ICachedBook extends Document {
  isbn: string;
  title: string;
  authors: string[];
  language: string | null;
  pageCount: number | null;
  wordCount: number | null;
  publishDate: string | null;
  coverUrl: string | null;
  openLibraryUrl: string | null;
  cachedAt: Date;
}

const CachedBookSchema = new Schema<ICachedBook>({
  isbn: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  authors: { type: [String], default: [] },
  language: { type: String, default: null },
  pageCount: { type: Number, default: null },
  wordCount: { type: Number, default: null },
  publishDate: { type: String, default: null },
  coverUrl: { type: String, default: null },
  openLibraryUrl: { type: String, default: null },
  cachedAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 }, // TTL: 30 days
});

export default mongoose.models.CachedBook ||
  mongoose.model<ICachedBook>("CachedBook", CachedBookSchema);
