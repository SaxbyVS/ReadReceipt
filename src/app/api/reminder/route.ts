import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Reminder from "@/models/Reminder";
import { ApiResponse, CreateReminderPayload } from "@/types";

// Simple email regex
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Max reminder duration: 3 months
const MAX_DURATION_MS = 90 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body: CreateReminderPayload = await request.json();
    const { email, bookTitle, bookISBN, readingPlan } = body;

    // Validation
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!bookTitle || !bookISBN) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Book title and ISBN are required." },
        { status: 400 }
      );
    }

    if (
      !readingPlan ||
      !readingPlan.hoursPerDay ||
      !readingPlan.pagesPerDay ||
      !readingPlan.projectedFinishDate
    ) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "A complete reading plan is required." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Determine expiry: projected finish date or 3 months, whichever is sooner
    const projectedEnd = new Date(readingPlan.projectedFinishDate);
    const maxEnd = new Date(Date.now() + MAX_DURATION_MS);
    const expiresAt = projectedEnd < maxEnd ? projectedEnd : maxEnd;

    // Upsert: if same email+book exists, update instead of duplicate
    const reminder = await Reminder.findOneAndUpdate(
      { email: email.toLowerCase().trim(), bookISBN },
      {
        email: email.toLowerCase().trim(),
        bookTitle,
        bookISBN,
        readingPlan,
        createdAt: new Date(),
        expiresAt,
        lastSentAt: null,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json<ApiResponse<{ id: string }>>(
      {
        success: true,
        data: { id: reminder._id.toString() },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Reminder creation error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to create reminder." },
      { status: 500 }
    );
  }
}
