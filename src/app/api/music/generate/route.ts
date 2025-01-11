import { NextResponse } from "next/server";
import Replicate from "replicate";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const MUSIC_GENERATION_COST = 1;

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    // Check if user has enough credits
    const user = await prisma.user.findUnique({
      where: { userId: userId },
      select: { credits: true }
    });

    if (!user || user.credits < MUSIC_GENERATION_COST) {
      return new NextResponse("Not enough credits", { status: 402 });
    }

    // Generate music
    const response = await replicate.run(
      "meta/musicgen:b05b1dff1d8c6dc63d14b0cdb42135378dcb87f6373b0d3d341ede46e59e2b38",
      {
        input: {
          model_version: "stereo-large",
          prompt,
          duration: 8
        }
      }
    );

    // Deduct credits
    await prisma.user.update({
      where: { userId: userId },
      data: { credits: { decrement: MUSIC_GENERATION_COST } }
    });

    // Save the generated music to history
    await prisma.music.create({
      data: {
        userId: userId,
        prompt: prompt,
        audioUrl: response as string
      }
    });

    return NextResponse.json({ audioUrl: response });
  } catch (error) {
    console.log("[MUSIC_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
