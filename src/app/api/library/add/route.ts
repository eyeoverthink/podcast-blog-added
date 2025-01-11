import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, description, url, type, thumbnail } = await req.json();

    // Save to library
    const content = await prisma.content.create({
      data: {
        userId: userId,
        type: type,
        url: url,
        title: title,
        description: description,
        thumbnail: thumbnail,
        prompt: description,
      },
    });

    return NextResponse.json({
      success: true,
      content: content
    });
  } catch (error) {
    console.error("[LIBRARY_ADD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
