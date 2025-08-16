export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { recipient, summary } = (await req.json()) as {
      recipient?: string;
      summary?: string;
    };

    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      return NextResponse.json(
        { error: "RESEND_API_KEY or EMAIL_FROM not configured" },
        { status: 500 }
      );
    }
    if (!recipient?.trim() || !summary?.trim()) {
      return NextResponse.json(
        { error: "recipient and summary are required" },
        { status: 400 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: recipient,
      subject: "AI-Generated Meeting Summary",
      text: summary
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
