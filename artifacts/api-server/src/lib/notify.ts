import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.NOTIFY_FROM_EMAIL ?? "hiring@vera.example.com";

export type NotifyEvent =
  | { type: "stage_changed"; candidateName: string; candidateEmail: string; stage: string; positionTitle?: string }
  | { type: "interview_scheduled"; candidateName: string; candidateEmail: string; interviewType: string; scheduledAt?: string; positionTitle?: string }
  | { type: "offer_extended"; candidateName: string; candidateEmail: string; positionTitle?: string }
  | { type: "application_received"; candidateName: string; candidateEmail: string; positionTitle?: string };

const stageLabels: Record<string, string> = {
  applied: "Applied",
  screening: "Screening",
  technical: "Technical Interview",
  hr_interview: "HR Interview",
  final_interview: "Final Interview",
  offer: "Offer Extended",
  hired: "Hired",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

function buildEmailContent(event: NotifyEvent): { subject: string; html: string } {
  switch (event.type) {
    case "stage_changed":
      return {
        subject: `Update on your application${event.positionTitle ? ` for ${event.positionTitle}` : ""}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <div style="background: #00205b; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
              <h1 style="margin:0; font-size: 20px;">Vera Talent Acquisition</h1>
            </div>
            <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
              <p>Dear ${event.candidateName},</p>
              <p>We have an update regarding your application${event.positionTitle ? ` for <strong>${event.positionTitle}</strong>` : ""}.</p>
              <p>Your application status has been updated to: <strong>${stageLabels[event.stage] ?? event.stage}</strong></p>
              <p>Our team will be in touch with next steps. Thank you for your interest in Vera.</p>
              <p style="color: #64748b; font-size: 13px; margin-top: 32px;">Vera Talent Acquisition Team</p>
            </div>
          </div>
        `,
      };
    case "interview_scheduled":
      return {
        subject: `Interview Scheduled${event.positionTitle ? ` — ${event.positionTitle}` : ""}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <div style="background: #00205b; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
              <h1 style="margin:0; font-size: 20px;">Vera Talent Acquisition</h1>
            </div>
            <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
              <p>Dear ${event.candidateName},</p>
              <p>An interview has been scheduled for your application${event.positionTitle ? ` for <strong>${event.positionTitle}</strong>` : ""}.</p>
              <p><strong>Interview type:</strong> ${event.interviewType.replace(/_/g, " ")}</p>
              ${event.scheduledAt ? `<p><strong>Date & time:</strong> ${new Date(event.scheduledAt).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</p>` : ""}
              <p>Please confirm your availability by replying to this email.</p>
              <p style="color: #64748b; font-size: 13px; margin-top: 32px;">Vera Talent Acquisition Team</p>
            </div>
          </div>
        `,
      };
    case "offer_extended":
      return {
        subject: `Congratulations — Offer from Vera${event.positionTitle ? ` for ${event.positionTitle}` : ""}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <div style="background: #00205b; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
              <h1 style="margin:0; font-size: 20px;">Vera Talent Acquisition</h1>
            </div>
            <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
              <p>Dear ${event.candidateName},</p>
              <p>We are delighted to inform you that Vera would like to extend an offer${event.positionTitle ? ` for the position of <strong>${event.positionTitle}</strong>` : ""}.</p>
              <p>A member of our HR team will contact you shortly with the details of the offer.</p>
              <p style="color: #64748b; font-size: 13px; margin-top: 32px;">Vera Talent Acquisition Team</p>
            </div>
          </div>
        `,
      };
    case "application_received":
      return {
        subject: `Application Received${event.positionTitle ? ` — ${event.positionTitle}` : ""}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <div style="background: #00205b; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
              <h1 style="margin:0; font-size: 20px;">Vera Talent Acquisition</h1>
            </div>
            <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
              <p>Dear ${event.candidateName},</p>
              <p>Thank you for applying${event.positionTitle ? ` for the <strong>${event.positionTitle}</strong> position` : ""} at Vera.</p>
              <p>We have received your application and our team will review it carefully. We will be in touch regarding the next steps.</p>
              <p style="color: #64748b; font-size: 13px; margin-top: 32px;">Vera Talent Acquisition Team</p>
            </div>
          </div>
        `,
      };
  }
}

export async function sendNotification(event: NotifyEvent): Promise<{ sent: boolean; preview?: string }> {
  const { subject, html } = buildEmailContent(event);
  const toEmail = event.candidateEmail;

  if (!resend) {
    console.log(`[notify] No RESEND_API_KEY set — email would be sent to ${toEmail}: ${subject}`);
    return { sent: false, preview: "No email API key configured — notification logged" };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject,
      html,
    });
    console.log(`[notify] Email sent to ${toEmail}: ${subject}`, result);
    return { sent: true };
  } catch (err) {
    console.error(`[notify] Failed to send email to ${toEmail}:`, err);
    return { sent: false };
  }
}
