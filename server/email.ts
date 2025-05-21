import nodemailer from "nodemailer";
import { storage } from "./storage";

let transporter: nodemailer.Transporter;

export function setupEmailService() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";
  const fromEmail = process.env.EMAIL_FROM || "noreply@mysafety.com";

  if (!host || !user || !pass) {
    console.warn("Warning: Email configuration incomplete. Email sending will be disabled.");
    return;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  // Verify the connection
  transporter.verify((error) => {
    if (error) {
      console.error("Email configuration error:", error);
    } else {
      console.log("Email service ready");
    }
  });
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: any[];
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!transporter) {
    console.warn("Email service not configured. Cannot send email.");
    return false;
  }

  const fromEmail = process.env.EMAIL_FROM || "noreply@mysafety.com";

  try {
    const result = await transporter.sendMail({
      from: options.from || fromEmail,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });

    console.log("Email sent:", result.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export async function sendTemplatedEmail(
  templateName: string,
  to: string | string[],
  data: Record<string, any>,
  tenantId?: number
): Promise<boolean> {
  try {
    // Try to find tenant-specific template first
    let template = tenantId
      ? await storage.getEmailTemplateByName(templateName, tenantId)
      : null;

    // Fallback to common template
    if (!template) {
      template = await storage.getEmailTemplateByName(templateName);
    }

    if (!template) {
      console.error(`Email template "${templateName}" not found`);
      return false;
    }

    // Replace template variables
    let subject = template.subject;
    let body = template.body;

    // Replace all variables in the format {{variableName}}
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      subject = subject.replace(regex, String(value));
      body = body.replace(regex, String(value));
    }

    return await sendEmail({
      to,
      subject,
      html: body,
    });
  } catch (error) {
    console.error("Failed to send templated email:", error);
    return false;
  }
}

export async function sendHazardNotification(
  hazardId: number,
  recipients: string[],
  hazardData: Record<string, any>,
  tenantId: number
): Promise<boolean> {
  return sendTemplatedEmail(
    "hazard_notification",
    recipients,
    {
      hazardId,
      hazardTitle: hazardData.title,
      hazardLocation: hazardData.location,
      hazardSeverity: hazardData.severity,
      reportedBy: hazardData.reportedBy,
      reportedDate: new Date(hazardData.createdAt).toLocaleString(),
      siteDetails: hazardData.siteDetails,
      actionLink: `${process.env.APP_URL || ""}/hazards/${hazardId}`,
    },
    tenantId
  );
}

export async function sendUserRegistrationEmail(
  email: string,
  firstName: string,
  lastName: string,
  tempPassword: string,
  tenantId: number
): Promise<boolean> {
  return sendTemplatedEmail(
    "user_registration",
    email,
    {
      firstName,
      lastName,
      email,
      tempPassword,
      loginLink: `${process.env.APP_URL || ""}/auth`,
    },
    tenantId
  );
}
