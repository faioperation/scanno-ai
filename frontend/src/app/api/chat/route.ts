import { NextRequest, NextResponse } from "next/server";
import {
  buildSystemPrompt,
  CHAT_MODEL,
  getOpenAIClient,
  VISION_MODEL,
} from "@/lib/openai";
import type { ChatApiRequest } from "@/types/chat";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body: ChatApiRequest = await request.json();
    const { messages, image, imageMimeType } = body;

    if (!messages?.length) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();
    const hasImage = Boolean(image);
    const systemPrompt = buildSystemPrompt(hasImage);

    if (hasImage && image) {
      const lastUserMessage = messages[messages.length - 1];
      const visionResponse = await openai.chat.completions.create({
        model: VISION_MODEL,
        max_tokens: 2000,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(0, -1).map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          {
            role: "user",
            content: [
              {
                type: "text" as const,
                text:
                  lastUserMessage?.content ||
                  "Analyze this car image for damage and provide a full inspection report.",
              },
              {
                type: "image_url" as const,
                image_url: {
                  url: `data:${imageMimeType ?? "image/jpeg"};base64,${image}`,
                  detail: "high" as const,
                },
              },
            ],
          },
        ],
      });

      const content = visionResponse.choices[0]?.message?.content;
      if (!content) {
        return NextResponse.json(
          { error: "No response from AI vision model" },
          { status: 502 }
        );
      }

      return NextResponse.json({ message: content });
    }

    const chatResponse = await openai.chat.completions.create({
      model: CHAT_MODEL,
      max_tokens: 2000,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });

    const content = chatResponse.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 502 }
      );
    }

    return NextResponse.json({ message: content });
  } catch (error) {
    console.error("[chat API]", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";

    if (message.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        { error: "AI service is not configured. Please contact support." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process your request. Please try again." },
      { status: 500 }
    );
  }
}
