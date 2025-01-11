import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = params.id;
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch transcription");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[TRANSCRIPTION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
