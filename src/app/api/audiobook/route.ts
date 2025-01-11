import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  audio: z.string(),
  title: z.string(),
  prompt: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedBody = requestSchema.parse(body);

    // Call Replicate API
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "cbd15da9f839c5f932742f86ce7def3a03c22e2b4171d42823e83e314547003f",
        input: {
          file_string: validatedBody.audio,
          prompt: validatedBody.prompt || "",
          language: "en",
          num_speakers: 2,
          group_segments: true,
          offset_seconds: 0,
          transcript_output_format: "both"
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Replicate API Error:", error);
      return new NextResponse("Failed to transcribe audio", { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error("[AUDIOBOOK_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
