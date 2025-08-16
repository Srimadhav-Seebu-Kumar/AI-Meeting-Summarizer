export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { transcript, prompt } = (await req.json()) as {
      transcript?: string;
      prompt?: string;
    };

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured" },
        { status: 500 }
      );
    }
    if (!transcript || !transcript.trim()) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content:
            "You are a concise assistant that produces structured, business-ready meeting summaries."
        },
        {
          role: "user",
          content:
            `${prompt || "Summarize in clear bullet points."}\n\n` +
            `Transcript:\n"""${transcript}"""\n\n` +
            `Provide:\n- Key decisions\n- Action items (owner, due date)\n- Risks/blocks\n- Next steps`
        }
      ]
    });

    const summary = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ summary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to summarize";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
