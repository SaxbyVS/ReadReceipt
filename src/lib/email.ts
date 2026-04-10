import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface ReminderEmailParams {
  to: string;
  bookTitle: string;
  hoursPerDay?: number;
  pagesPerDay?: number;
  percentPerDay?: number;
  projectedFinishDate: string;
}

export async function sendReminderEmail(params: ReminderEmailParams) {
  const { to, bookTitle, hoursPerDay, pagesPerDay, percentPerDay, projectedFinishDate } =
    params;

  const finishStr = new Date(projectedFinishDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const planText =
    typeof percentPerDay === "number"
      ? `${percentPerDay}% of the book/day`
      : `${hoursPerDay} hours/day (${pagesPerDay} pages/day)`;

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1a1a2e;">📖 ReadReceipt — Weekly Reminder</h2>
      <p>Hi there! This is your weekly reading reminder.</p>
      <div style="background: #f5f0e8; border-radius: 8px; padding: 20px; margin: 16px 0;">
        <h3 style="margin-top: 0; color: #16213e;">${bookTitle}</h3>
        <p><strong>Your plan:</strong> ${planText}</p>
        <p><strong>Projected finish:</strong> ${finishStr}</p>
      </div>
      <p>Keep it up! Consistency is what gets books finished. Even a few pages today counts.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;" />
      <p style="font-size: 12px; color: #999;">
        This reminder was set up via ReadReceipt. It will automatically stop after your projected finish date or 3 months, whichever comes first.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"ReadReceipt" <${process.env.GMAIL_USER}>`,
    to,
    subject: `📖 Reading Reminder: ${bookTitle}`,
    html,
  });
}
