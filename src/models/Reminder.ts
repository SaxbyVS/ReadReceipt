import mongoose, { Schema, Document } from "mongoose";

export interface IReminder extends Document {
  email: string;
  bookTitle: string;
  bookISBN: string;
  readingPlan: {
    hoursPerDay: number;
    pagesPerDay: number;
    projectedFinishDate: string;
  };
  createdAt: Date;
  expiresAt: Date;
  lastSentAt: Date | null;
}

const ReminderSchema = new Schema<IReminder>({
  email: { type: String, required: true },
  bookTitle: { type: String, required: true },
  bookISBN: { type: String, required: true },
  readingPlan: {
    hoursPerDay: { type: Number, required: true },
    pagesPerDay: { type: Number, required: true },
    projectedFinishDate: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, expires: 0 }, // TTL: auto-delete when expired
  lastSentAt: { type: Date, default: null },
});

// Compound index to prevent duplicate reminders for same email + book
ReminderSchema.index({ email: 1, bookISBN: 1 }, { unique: true });

export default mongoose.models.Reminder ||
  mongoose.model<IReminder>("Reminder", ReminderSchema);
