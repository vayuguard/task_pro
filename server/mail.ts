import nodemailer from 'nodemailer';

export interface CredentialEmailPayload {
  to: string;
  name: string;
  employeeId: string;
  email: string;
  password: string;
}

export interface SendResult {
  sent: boolean;
  mode: 'smtp' | 'console';
  messageId?: string;
  preview?: string;
}

function buildHtml(payload: CredentialEmailPayload): string {
  return `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #312e81;">Welcome to TaskPro</h2>
      <p>Hi ${payload.name},</p>
      <p>An admin created your employee account. Use these credentials to sign in:</p>
      <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #e2e8f0; background: #f8fafc;"><strong>Employee ID</strong></td>
          <td style="padding: 8px; border: 1px solid #e2e8f0; font-family: monospace;">${payload.employeeId}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e2e8f0; background: #f8fafc;"><strong>Login (email)</strong></td>
          <td style="padding: 8px; border: 1px solid #e2e8f0; font-family: monospace;">${payload.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e2e8f0; background: #f8fafc;"><strong>Password</strong></td>
          <td style="padding: 8px; border: 1px solid #e2e8f0; font-family: monospace;">${payload.password}</td>
        </tr>
      </table>
      <p style="color: #64748b; font-size: 13px;">Please change your password after first login if your admin requires it.</p>
      <p>— TaskPro Admin</p>
    </div>
  `;
}

function buildText(payload: CredentialEmailPayload): string {
  return [
    `Welcome to TaskPro, ${payload.name}!`,
    '',
    'Your employee account credentials:',
    `Employee ID: ${payload.employeeId}`,
    `Login (email): ${payload.email}`,
    `Password: ${payload.password}`,
    '',
    '— TaskPro Admin'
  ].join('\n');
}

/** Send employee credentials by email. Falls back to console if SMTP is not configured. */
export async function sendEmployeeCredentials(payload: CredentialEmailPayload): Promise<SendResult> {
  const html = buildHtml(payload);
  const text = buildText(payload);
  const subject = 'Your TaskPro employee account credentials';

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'TaskPro <noreply@taskpro.com>';

  if (host && user && pass) {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass }
    });

    const info = await transporter.sendMail({
      from,
      to: payload.to,
      subject,
      text,
      html
    });

    console.log(`[mail] Sent credentials to ${payload.to} (${info.messageId})`);
    return { sent: true, mode: 'smtp', messageId: info.messageId };
  }

  // Dev / no-SMTP fallback — log clearly so admin flow still works
  console.log('\n========== EMPLOYEE CREDENTIALS EMAIL (SMTP not configured) ==========');
  console.log(`To: ${payload.to}`);
  console.log(`Subject: ${subject}`);
  console.log(text);
  console.log('======================================================================\n');

  return {
    sent: false,
    mode: 'console',
    preview: text
  };
}
