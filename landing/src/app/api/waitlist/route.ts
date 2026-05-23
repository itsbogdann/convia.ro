import { NextResponse } from "next/server";

type WaitlistPayload = {
  email?: string;
  company?: string;
};

export async function POST(request: Request) {
  let payload: WaitlistPayload = {};
  try {
    payload = (await request.json()) as WaitlistPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (payload.email ?? "").trim().toLowerCase();
  const company = (payload.company ?? "").trim();

  if (!email || !email.includes("@") || email.length < 5) {
    return NextResponse.json({ error: "Email invalid" }, { status: 400 });
  }

  // TODO: Wire up to Resend, Supabase, or any storage backend.
  // For now we just log so the form gives feedback in dev.
  // eslint-disable-next-line no-console
  console.log("[waitlist]", { email, company, at: new Date().toISOString() });

  return NextResponse.json({ ok: true });
}
