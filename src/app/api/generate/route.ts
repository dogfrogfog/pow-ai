import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
// export const runtime = "edge";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { prompt, language } = await req.json();

  const result = await streamText({
    model: anthropic("claude-3-haiku-20240307"),
    messages: [
      {
        role: "system",
        content: `Simple 2+2 app in ${language}`,
      },
      { role: "user", content: prompt },
    ],
  });

  return result.toDataStreamResponse();
}
