// WhatsApp adapter. Free default = console (logs the message). If Twilio creds
// are set, sends via the Twilio WhatsApp API (sandbox for dev, approved sender
// for prod). Best-effort — never throws into the request path.
//
// Prod note: business-initiated WhatsApp messages must use Meta-approved
// templates and are billed per conversation; the sandbox allows free-form text
// to numbers that have opted in.

export interface WhatsAppMessage {
  to: string;   // phone, any format; normalized to E.164 here
  text: string;
}

export interface WhatsAppProvider {
  readonly name: string;
  send(msg: WhatsAppMessage): Promise<void>;
}

/** Normalize a phone to E.164-ish: keep digits, ensure a leading '+'. */
export function toE164(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  return digits ? `+${digits}` : '';
}

class ConsoleWhatsApp implements WhatsAppProvider {
  readonly name = 'console';
  async send(m: WhatsAppMessage): Promise<void> {
    console.log(`[whatsapp:console] to=${toE164(m.to)}\n${m.text}\n`);
  }
}

class TwilioWhatsApp implements WhatsAppProvider {
  readonly name = 'twilio';
  constructor(private sid: string, private token: string, private from: string) {}
  async send(m: WhatsAppMessage): Promise<void> {
    const to = toE164(m.to);
    if (!to) throw new Error('numéro destinataire manquant');
    const auth = Buffer.from(`${this.sid}:${this.token}`).toString('base64');
    const body = new URLSearchParams({
      From: `whatsapp:${this.from}`,
      To: `whatsapp:${to}`,
      Body: m.text,
    });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.sid}/Messages.json`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) {
      const detail = await res.json().catch(() => null);
      throw new Error(`Twilio ${res.status}: ${detail?.message ?? 'envoi refusé'}`);
    }
  }
}

let provider: WhatsAppProvider | null = null;

export function getWhatsAppProvider(): WhatsAppProvider {
  if (provider) return provider;
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM } = process.env;
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_FROM) {
    provider = new TwilioWhatsApp(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM);
  } else {
    provider = new ConsoleWhatsApp();
  }
  return provider;
}

/** Best-effort send: logs and swallows errors so it can't break a request. */
export async function sendWhatsApp(msg: WhatsAppMessage): Promise<void> {
  if (!msg.to) return;
  try {
    await getWhatsAppProvider().send(msg);
  } catch (e) {
    console.error('[whatsapp] send failed:', e);
  }
}
