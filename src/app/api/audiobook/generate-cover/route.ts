import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
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

    const { prompt, title, description } = await req.json();

    // Use provided prompt or generate one based on title and description
    const finalPrompt = prompt || 
      `Professional book cover for "${title}", ${description}. Artistic, high quality, professional design`;

    const response = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: finalPrompt,
          negative_prompt: "blurry, bad quality, distorted, text, words, letters",
          width: 768,
          height: 1024,
        }
      }
    );

    // The response will be an array with the image URL
    const imageUrl = Array.isArray(response) ? response[0] : response;

    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error("[COVER_GENERATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
