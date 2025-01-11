import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { text, voice, chapterId } = await req.json();

    // Validate user has enough credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.credits < 1) {
      return new NextResponse("Not enough credits", { status: 402 });
    }

    // Generate audio with Replicate
    const response = await replicate.run(
      "suno-ai/bark:b76242b40d67c76ab6742e987628478ed2fb916b6f3f5258e16164c2d344752d",
      {
        input: {
          prompt: text,
          voice_preset: voice || "v2/en_speaker_6"
        }
      }
    );

    // Update user credits
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 1 } },
    });

    return NextResponse.json(response);

  } catch (error) {
    console.log("[AUDIO_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
