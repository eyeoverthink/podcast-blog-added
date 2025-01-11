import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import fs from "fs";
import path from "path";

const isValidUrl = (url: string) => {
  try {
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
  } catch {
    return false;
  }
};

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log('Getting library items for user:', userId);

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    let query: { userId: string; type?: string } = { userId };

    if (type && type !== 'all') {
      const validTypes = ['image', 'video', 'music', 'podcast', 'blog', 'transcription'];
      if (!validTypes.includes(type)) {
        return new NextResponse("Invalid content type", { status: 400 });
      }
      query.type = type;
    }

    // Get database content
    const dbContent = await prismadb.content.findMany({
      where: query,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        url: true,
        title: true,
        description: true,
        prompt: true,
        duration: true,
        thumbnail: true,
        createdAt: true
      }
    });

    // Transform URLs to handle both external and local files
    const transformedContent = dbContent.map(item => ({
      ...item,
      url: item.url.startsWith('data:') ? item.url : 
           isValidUrl(item.url) ? item.url : 
           `/api/local-library/${encodeURIComponent(item.url)}`,
      thumbnail: item.thumbnail ? (
        isValidUrl(item.thumbnail) ? item.thumbnail :
        `/api/local-library/${encodeURIComponent(item.thumbnail)}`
      ) : null,
      createdAt: item.createdAt.toISOString()
    }));

    console.log('Database content:', transformedContent);

    // Get local files
    let localFiles = [];

    // Read local image files
    const imageDir = path.join(process.cwd(), "images-created");
    console.log('Checking image directory:', imageDir);
    console.log('Image directory exists:', fs.existsSync(imageDir));
    
    if (fs.existsSync(imageDir)) {
      try {
        const files = fs.readdirSync(imageDir)
          .filter(file => !file.startsWith('.') && file.match(/\.(jpg|jpeg|png)$/i));
        console.log('Found image files:', files);
        
        const imageFiles = files.map(file => ({
          id: `local-image-${file}`,
          type: 'image',
          url: `/api/local-files/image/${encodeURIComponent(file)}`,
          title: file.replace(/\.[^/.]+$/, "").replace(/-/g, ' '),
          description: "Local image",
          prompt: "",
          duration: null,
          thumbnail: null,
          createdAt: fs.statSync(path.join(imageDir, file)).birthtime
        }));
        console.log('Processed image files:', imageFiles);
        localFiles.push(...imageFiles);
      } catch (error) {
        console.error('Error reading image directory:', error);
      }
    }

    // Read local video files
    const videoDir = path.join(process.cwd(), "videos-created");
    console.log('Checking video directory:', videoDir);
    console.log('Video directory exists:', fs.existsSync(videoDir));
    
    if (fs.existsSync(videoDir)) {
      try {
        const files = fs.readdirSync(videoDir)
          .filter(file => !file.startsWith('.') && file.match(/\.(mp4|webm)$/i));
        console.log('Found video files:', files);
        
        const videoFiles = files.map(file => ({
          id: `local-video-${file}`,
          type: 'video',
          url: `/api/local-files/video/${encodeURIComponent(file)}`,
          title: file.replace(/\.[^/.]+$/, "").replace(/-/g, ' '),
          description: "Local video",
          prompt: "",
          duration: null,
          thumbnail: null,
          createdAt: fs.statSync(path.join(videoDir, file)).birthtime
        }));
        console.log('Processed video files:', videoFiles);
        localFiles.push(...videoFiles);
      } catch (error) {
        console.error('Error reading video directory:', error);
      }
    }

    // Combine and sort all content
    const allContent = [
      ...transformedContent,
      ...localFiles
    ].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log('Total content count:', allContent.length);
    console.log('First few items:', allContent.slice(0, 3));

    return NextResponse.json(allContent);
  } catch (error) {
    console.error("[LIBRARY_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { type, title, description, imageUrl, prompt, content: transcriptionContent } = body;

    if (!type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Handle different content types
    let url = imageUrl;
    let contentData = undefined;

    if (type === 'audiobook' && transcriptionContent) {
      contentData = transcriptionContent;
      url = transcriptionContent.id ? `https://api.replicate.com/v1/predictions/${transcriptionContent.id}` : "";
    } else if (!imageUrl || !isValidUrl(imageUrl)) {
      return new NextResponse("Invalid image URL", { status: 400 });
    }

    const content = await prismadb.content.create({
      data: {
        userId,
        type,
        url: url || "",
        title: title || undefined,
        description: description || undefined,
        prompt: prompt || "",
        content: contentData ? JSON.stringify(contentData) : undefined,
        createdAt: new Date(),
      }
    });

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("[LIBRARY_POST_ERROR]", error);
    return new NextResponse(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to save to library" 
    }), { status: 500 });
  }
}
