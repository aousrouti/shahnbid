// Email adapter. Free default = console (logs the message). If RESEND_API_KEY is
// set, uses Resend over fetch (free tier, no extra package). Azure later: add an
// AzureCommunicationEmail provider and select it here. Sending is best-effort —
// it never throws into the request path.

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

export interface EmailProvider {
  readonly name: string;
  send(msg: EmailMessage): Promise<void>;
}

class ConsoleEmail implements EmailProvider {
  readonly name = 'console';
  async send(m: EmailMessage): Promise<void> {
    console.log(`[email:console] to=${m.to} subject="${m.subject}"\n${m.text}\n`);
  }
}

class SmtpEmail implements EmailProvider {
  readonly name = 'smtp';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transporter: any;
  constructor(private opts: { host: string; port: number; user: string; pass: string; from: string }) {}
  private async tx() {
    if (!this.transporter) {
      const nodemailer = await import('nodemailer');
      this.transporter = nodemailer.createTransport({
        host: this.opts.host,
        port: this.opts.port,
        secure: this.opts.port === 465,
        auth: { user: this.opts.user, pass: this.opts.pass },
      });
    }
    return this.transporter;
  }
  async send(m: EmailMessage): Promise<void> {
    const t = await this.tx();
    await t.sendMail({ from: this.opts.from, to: m.to, subject: m.subject, text: m.text });
  }
}

class ResendEmail implements EmailProvider {
  readonly name = 'resend';
  constructor(private key: string, private from: string) {}
  async send(m: EmailMessage): Promise<void> {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: this.from, to: m.to, subject: m.subject, text: m.text }),
    });
    if (!res.ok) {
      const detail = await res.json().catch(() => null);
      throw new Error(`Resend ${res.status}: ${detail?.message ?? 'envoi refusé'}`);
    }
  }
}

let provider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (provider) return provider;
  const from = process.env.EMAIL_FROM || 'ShahnBid <onboarding@resend.dev>';
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, RESEND_API_KEY } = process.env;
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    // SMTP via your own provider (e.g. Gmail) — lets you send from a personal address.
    provider = new SmtpEmail({ host: SMTP_HOST, port: Number(process.env.SMTP_PORT) || 465, user: SMTP_USER, pass: SMTP_PASS, from });
  } else if (RESEND_API_KEY) {
    provider = new ResendEmail(RESEND_API_KEY, from);
  } else {
    provider = new ConsoleEmail();
  }
  return provider;
}

/** Best-effort send: logs and swallows errors so it can't break a request. */
export async function sendEmail(msg: EmailMessage): Promise<void> {
  try {
    await getEmailProvider().send(msg);
  } catch (e) {
    console.error('[email] send failed:', e);
  }
}
