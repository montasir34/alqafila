import nodemailer from "nodemailer";

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

  console.log("[email] sending to:", email);
  console.log("[email] from:", process.env.GMAIL_USER);
  console.log("[email] verifyUrl:", verifyUrl);

  const transporter = createTransporter();

  const result = await transporter.sendMail({
    from: `القافلة <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "تأكيد بريدك الإلكتروني — القافلة",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px;">
        <h2 style="color: #B91C1C;">مرحباً بك في القافلة 🚛</h2>
        <p style="color: #57534E; line-height: 1.6;">
          اضغط على الزر أدناه لتأكيد بريدك الإلكتروني وتفعيل حسابك.
          الرابط صالح لمدة 24 ساعة.
        </p>
        <a href="${verifyUrl}"
           style="display:inline-block; margin: 16px 0; padding: 12px 28px; background:#B91C1C; color:#fff; text-decoration:none; border-radius:10px; font-weight:bold;">
          تأكيد البريد الإلكتروني
        </a>
        <p style="color: #A8A29E; font-size: 12px; margin-top: 24px;">
          إذا لم تسجّل في القافلة، تجاهل هذا الإيميل.
        </p>
        <hr style="border-color: #EFE9E4; margin: 16px 0;" />
        <p style="color: #A8A29E; font-size: 11px;">${verifyUrl}</p>
      </div>
    `,
  });

  console.log("[email] result:", result.messageId);
}
