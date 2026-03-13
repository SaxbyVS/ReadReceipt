import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Reminder from "@/models/Reminder";
import { sendReminderEmail } from "@/lib/email";
import { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
  // Protect the endpoint with a secret
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await dbConnect();

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Find reminders that:
    // 1. Haven't expired yet
    // 2. Haven't been sent in the last 7 days (or never sent)
    const reminders = await Reminder.find({
      expiresAt: { $gt: now },
      $or: [
        { lastSentAt: null },
        { lastSentAt: { $lt: sevenDaysAgo } },
      ],
    }).limit(50); // Process max 50 per invocation to stay within timeout

    let sent = 0;
    let failed = 0;

    for (const reminder of reminders) {
      try {
        await sendReminderEmail({
          to: reminder.email,
          bookTitle: reminder.bookTitle,
          hoursPerDay: reminder.readingPlan.hoursPerDay,
          pagesPerDay: reminder.readingPlan.pagesPerDay,
          projectedFinishDate: reminder.readingPlan.projectedFinishDate,
        });

        reminder.lastSentAt = now;
        await reminder.save();
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${reminder.email}:`, err);
        failed++;
      }
    }

    return NextResponse.json<ApiResponse<{ sent: number; failed: number; total: number }>>({
      success: true,
      data: { sent, failed, total: reminders.length },
    });
  } catch (error) {
    console.error("Cron send error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to process reminders." },
      { status: 500 }
    );
  }
}
