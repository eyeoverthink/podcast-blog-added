import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: "Unauthorized" 
      }), { status: 401 });
    }

    const { title, description, duration } = await req.json();

    if (!title || !description) {
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: "Title and description are required" 
      }), { status: 400 });
    }

    // Validate user has enough credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: "User not found" 
      }), { status: 404 });
    }

    if (user.credits < 1) {
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: "Insufficient credits" 
      }), { status: 402 });
    }

    // Generate script using the same model as podcast
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "cbd15da9f839c5f932742f86ce7def3a03c22e2b4171d42823e83e314547003f",
        input: {
          prompt: `Create a detailed audiobook script for "${title}". ${description}. Include natural dialogue between characters and clear scene transitions.`,
          language: "en",
          num_speakers: 2,
          group_segments: true,
          transcript_output_format: "both"
        }
      })
    });

    if (!response.ok) {
      console.error("Failed to generate script:", await response.text());
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: "Failed to generate script" 
      }), { status: response.status });
    }

    const result = await response.json();
    const script = result.output.segments.map((s: any) => s.text).join("\n\n");

    // Deduct credits
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      script,
      credits: user.credits - 1
    });

  } catch (error) {
    console.error("[AUDIOBOOK_SCRIPT_ERROR]", error);
    return new NextResponse(JSON.stringify({ 
      success: false, 
      error: "Internal error" 
    }), { status: 500 });
  }
}
