import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;

    const response = await replicate.run(
      "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
      {
        input: {
          prompt: lastMessage,
          system_prompt: "You are a helpful AI assistant.",
          max_new_tokens: 500,
          temperature: 0.75,
          top_p: 0.9,
          top_k: 50,
        }
      }
    );

    return NextResponse.json(response);

  } catch (error) {
    console.log("[CHAT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
