import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse(JSON.stringify({
        success: false,
        error: "Unauthorized"
      }), { status: 401 });
    }

    const content = await prisma.content.findUnique({
      where: {
        id: params.id,
        userId: userId,
      },
    });

    if (!content) {
      return new NextResponse(JSON.stringify({
        success: false,
        error: "Content not found"
      }), { status: 404 });
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("[LIBRARY_GET_ERROR]", error);
    return new NextResponse(JSON.stringify({
      success: false,
      error: "Internal Error"
    }), { status: 500 });
  }
}
