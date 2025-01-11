import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import Replicate from "replicate";
import { prismadb } from "@/lib/prismadb";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

const MODEL = "tencent/hunyuan-video:847dfa8b01e739637fc76f480ede0c1d76408e1d694b830b5dfb8e547bf98405";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt } = body;

    if (!userId) {
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: "Unauthorized" 
      }), { status: 401 });
    }

    if (!prompt) {
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: "Prompt is required" 
      }), { status: 400 });
    }

    const user = await prismadb.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        credits: true
      }
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: "User not found" 
      }), { status: 404 });
    }

    if (user.credits < 25) {
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: "Insufficient credits" 
      }), { status: 402 });
    }

    console.log('Generating video with prompt:', prompt);

    try {
      const input = {
        width: 854,
        height: 480,
        prompt,
        flow_shift: 7,
        infer_steps: 50,
        video_length: 129,
        embedded_guidance_scale: 6,
      };

      console.log('Using model:', MODEL);
      console.log('With input:', input);

      console.log('Running...');
      const prediction = await replicate.predictions.create({
        version: MODEL.split(':')[1],
        input
      });

      const output = await replicate.wait(prediction);
      console.log('Done! Output:', output);

      if (!output) {
        throw new Error("Failed to generate video");
      }

      const videoUrl = Array.isArray(output.output) ? output.output[0] : output.output;

      if (!videoUrl || typeof videoUrl !== 'string') {
        console.error('Invalid output format:', output);
        throw new Error("Invalid video output format");
      }

      // Use a transaction to ensure both operations succeed or fail together
      const result = await prismadb.$transaction([
        prismadb.user.update({
          where: { id: userId },
          data: { 
            credits: {
              decrement: 25
            }
          }
        }),
        prismadb.content.create({
          data: {
            userId,
            type: "video",
            url: videoUrl,
            prompt,
            title: prompt.substring(0, 50)
          }
        })
      ]);

      return NextResponse.json({ 
        success: true, 
        url: videoUrl,
        credits: result[0].credits
      });
    } catch (replicateError) {
      console.error("[REPLICATE_ERROR]", replicateError);
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: "Failed to generate video. Please try again." 
      }), { status: 500 });
    }
  } catch (error) {
    console.error("[VIDEO_ERROR]", error);
    return new NextResponse(JSON.stringify({ 
      success: false, 
      error: "Internal error" 
    }), { status: 500 });
  }
}
