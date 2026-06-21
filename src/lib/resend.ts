import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@projectpulse.app";

export async function sendTaskDueEmail(to: string, taskTitle: string, projectTitle: string, dueDate: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Task Due Today: ${taskTitle}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h1 style="color:#3b82f6">ProjectPulse</h1>
          <h2>Task Due Today</h2>
          <p>Your task <strong>${taskTitle}</strong> in project <strong>${projectTitle}</strong> is due today (${dueDate}).</p>
          <p>Log in to ProjectPulse to update the status.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background:#3b82f6;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">
            Open ProjectPulse
          </a>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send task due email:", err);
  }
}

export async function sendOverdueEmail(to: string, taskTitle: string, projectTitle: string, dueDate: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Overdue Task: ${taskTitle}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h1 style="color:#3b82f6">ProjectPulse</h1>
          <h2 style="color:#ef4444">Overdue Task Alert</h2>
          <p>Your task <strong>${taskTitle}</strong> in project <strong>${projectTitle}</strong> was due on <strong>${dueDate}</strong> and is now overdue.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background:#ef4444;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">
            View Task
          </a>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send overdue email:", err);
  }
}

export async function sendMilestoneEmail(to: string, milestoneTitle: string, projectTitle: string, targetDate: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Upcoming Milestone: ${milestoneTitle}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h1 style="color:#3b82f6">ProjectPulse</h1>
          <h2>Milestone Approaching</h2>
          <p>Milestone <strong>${milestoneTitle}</strong> in project <strong>${projectTitle}</strong> is approaching (${targetDate}).</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background:#3b82f6;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">
            View Milestone
          </a>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send milestone email:", err);
  }
}
