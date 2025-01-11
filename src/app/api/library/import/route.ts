import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log('Starting import for user:', userId);
    let imported = 0;

    // Import images
    const imageDir = path.join(process.cwd(), 'images-created');
    console.log('Checking image directory:', imageDir);
    
    if (fs.existsSync(imageDir)) {
      const imageFiles = fs.readdirSync(imageDir)
        .filter(file => !file.startsWith('.') && file.match(/\.(jpg|jpeg|png)$/i));
      console.log('Found image files:', imageFiles);

      for (const file of imageFiles) {
        const url = `/api/local-files/image/${encodeURIComponent(file)}`;
        const title = file.replace(/\.[^/.]+$/, "").replace(/-/g, ' ');
        
        // Check if this file is already in the database
        const existing = await prismadb.content.findFirst({
          where: { url, userId }
        });

        if (!existing) {
          await prismadb.content.create({
            data: {
              type: 'image',
              url,
              title,
              description: "Local image",
              prompt: "",
              userId,
              createdAt: fs.statSync(path.join(imageDir, file)).birthtime
            }
          });
          console.log(`Imported image: ${title}`);
          imported++;
        } else {
          console.log(`Image already exists: ${title}`);
        }
      }
    }

    // Import videos
    const videoDir = path.join(process.cwd(), 'videos-created');
    console.log('Checking video directory:', videoDir);
    
    if (fs.existsSync(videoDir)) {
      const videoFiles = fs.readdirSync(videoDir)
        .filter(file => !file.startsWith('.') && file.match(/\.(mp4|webm)$/i));
      console.log('Found video files:', videoFiles);

      for (const file of videoFiles) {
        const url = `/api/local-files/video/${encodeURIComponent(file)}`;
        const title = file.replace(/\.[^/.]+$/, "").replace(/-/g, ' ');
        
        // Check if this file is already in the database
        const existing = await prismadb.content.findFirst({
          where: { url, userId }
        });

        if (!existing) {
          await prismadb.content.create({
            data: {
              type: 'video',
              url,
              title,
              description: "Local video",
              prompt: "",
              userId,
              createdAt: fs.statSync(path.join(videoDir, file)).birthtime
            }
          });
          console.log(`Imported video: ${title}`);
          imported++;
        } else {
          console.log(`Video already exists: ${title}`);
        }
      }
    }

    console.log(`Import completed. Added ${imported} new files.`);
    return NextResponse.json({ 
      success: true, 
      message: `Successfully imported ${imported} files` 
    });
  } catch (error) {
    console.error("[LIBRARY_IMPORT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
