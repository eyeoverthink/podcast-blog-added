import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
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

    const { content } = await req.json();

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    const response = await replicate.run(
      "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
      {
        input: {
          prompt: `Enhance this text to make it more engaging and natural for audio narration: ${content}`,
          system_prompt: "You are an expert at improving text for audio narration. Make the text more conversational and engaging while maintaining its meaning.",
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          top_k: 50,
        }
      }
    );

    const enhancedContent = response.output;

    return NextResponse.json({ enhancedContent });

  } catch (error) {
    console.error("[ENHANCE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
