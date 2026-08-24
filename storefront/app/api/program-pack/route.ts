import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const state = typeof body?.state === "string" ? body.state.trim() : "";
  const source = typeof body?.source === "string" ? body.source.trim() : "direct";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const webhookUrl = process.env.MAKE_PROGRAM_PACK_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error(
      "MAKE_PROGRAM_PACK_WEBHOOK_URL is not set. Add it to storefront/.env.local — see README.md."
    );
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, state, source }),
    });

    if (!res.ok) {
      throw new Error(`Webhook responded ${res.status}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delivery failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
