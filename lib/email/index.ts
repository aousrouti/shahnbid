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

class ResendEmail implements EmailProvider {
  readonly name = 'resend';
  constructor(private key: string, private from: string) {}
  async send(m: EmailMessage): Promise<void> {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: this.from, to: m.to, subject: m.subject, text: m.text }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}`);
  }
}

let provider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (provider) return provider;
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'ShahnBid <noreply@shahnbid.ma>';
  provider = key ? new ResendEmail(key, from) : new ConsoleEmail();
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
