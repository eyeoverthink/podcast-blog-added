import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const transcriptionSchema = z.object({
  file: z.string().url().optional(),
  file_url: z.string().optional(),
  file_string: z.string().optional(),
  prompt: z.string().optional(),
  language: z.string().optional().default("en"),
  num_speakers: z.number().min(1).max(50).optional(),
  group_segments: z.boolean().default(true),
  offset_seconds: z.number().min(0).default(0),
  transcript_output_format: z.enum(["words_only", "segments_only", "both"]).default("both")
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = transcriptionSchema.parse(body);

    // At least one of file_url, file_string, or file must be provided
    if (!validatedData.file && !validatedData.file_url && !validatedData.file_string) {
      return new NextResponse("At least one audio source must be provided", { status: 400 });
    }

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        "Prefer": "wait"
      },
      body: JSON.stringify({
        version: "cbd15da9f839c5f932742f86ce7def3a03c22e2b4171d42823e83e314547003f",
        input: {
          file: validatedData.file,
          file_url: validatedData.file_url || "",
          file_string: validatedData.file_string,
          prompt: validatedData.prompt,
          language: validatedData.language,
          num_speakers: validatedData.num_speakers,
          group_segments: validatedData.group_segments,
          offset_seconds: validatedData.offset_seconds,
          transcript_output_format: validatedData.transcript_output_format
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[REPLICATE_ERROR]", error);
      throw new Error("Transcription service error");
    }

    const prediction = await response.json();
    
    // If the prediction is still processing, we need to poll for the result
    if (prediction.status === "starting" || prediction.status === "processing") {
      // Poll for the result
      const result = await pollForResult(prediction.urls.get);
      return NextResponse.json(result);
    }

    return NextResponse.json(prediction);
  } catch (error) {
    console.error("[TRANSCRIPTION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

async function pollForResult(getUrl: string, maxAttempts = 30) {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const response = await fetch(getUrl, {
      headers: {
        "Authorization": `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to get prediction status");
    }

    const prediction = await response.json();
    
    if (prediction.status === "succeeded") {
      return prediction;
    }
    
    if (prediction.status === "failed") {
      throw new Error(prediction.error || "Transcription failed");
    }
    
    // Wait for 2 seconds before next attempt
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }
  
  throw new Error("Timeout waiting for transcription result");
}
