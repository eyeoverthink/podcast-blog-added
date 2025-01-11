import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, content, description, prompt, thumbnail } = await req.json();

    // Validate user has enough credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.credits < 1) {
      return new NextResponse("Insufficient credits", { status: 402 });
    }

    // Save thumbnail if exists
    let savedThumbnailPath = null;
    if (thumbnail) {
      const thumbnailFilename = `${uuidv4()}.png`;
      const thumbnailResponse = await fetch(thumbnail);
      const thumbnailBuffer = await thumbnailResponse.arrayBuffer();
      const thumbnailPath = path.join(process.cwd(), 'public', 'blogs', thumbnailFilename);
      
      // Ensure directory exists
      const dir = path.join(process.cwd(), 'public', 'blogs');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      await fs.promises.writeFile(thumbnailPath, Buffer.from(thumbnailBuffer));
      savedThumbnailPath = `/blogs/${thumbnailFilename}`;
    }

    // Save to database with all required fields
    const blogPost = await prisma.content.create({
      data: {
        userId,
        type: "blog",
        title,
        description,
        prompt: prompt || "",
        url: "", // For blogs, we'll store content in the script field
        thumbnail: savedThumbnailPath,
        script: content, // Store blog content in the script field
        duration: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Deduct credits
    await prisma.user.update({
      where: { id: userId },
      data: { credits: user.credits - 1 },
    });

    return NextResponse.json(blogPost);
  } catch (error) {
    console.error("[BLOG_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
