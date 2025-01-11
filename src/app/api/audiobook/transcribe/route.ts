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

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("File is required", { status: 400 });
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString('base64');

    const response = await replicate.run(
      "openai/whisper:91ee9c0c3df30478510ff8c8a3a545add1ad0259ad3a9f78fba57fbc05ee64f7",
      {
        input: {
          audio: base64Audio,
          model: "large-v3",
          transcription: "plain text",
          language: "en"
        }
      }
    );

    return NextResponse.json({ transcript: response.text });

  } catch (error) {
    console.log("[TRANSCRIBE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
