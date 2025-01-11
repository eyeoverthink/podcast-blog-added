import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
const ELEVEN_LABS_URL = 'https://api.elevenlabs.io/v1/';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse(JSON.stringify({
        success: false,
        error: "Unauthorized"
      }), { status: 401 });
    }

    const { title, description, voiceType } = await req.json();

    // Validate user has enough credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({
        success: false,
        error: "User not found"
      }), { status: 404 });
    }

    if (user.credits < 1) {
      return new NextResponse(JSON.stringify({
        success: false,
        error: "Insufficient credits"
      }), { status: 402 });
    }

    // Generate a proper podcast script
    const prompt = `Create a podcast script about ${title}. ${description}`;
    const scriptPrompt = `Create an engaging podcast script about "${title}". ${description}

    Requirements:
    1. Format as a natural conversation or informative monologue
    2. Include a clear introduction and conclusion
    3. Use conversational language and natural transitions
    4. Break into clear segments or topics
    5. Add speaker names if it's a conversation (e.g., "Host = wendy:", "Guest = jessica:")
    6. Keep it engaging and dynamic
    7. Length: 3-5 minutes when spoken

    Additional context: ${prompt}`;

    try {
      // First generate the script using GPT
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "user",
            content: scriptPrompt
          }],
          temperature: 0.7
        })
      });

      if (!openaiResponse.ok) {
        const error = await openaiResponse.json();
        throw new Error(error.error?.message || "Failed to generate script");
      }

      const scriptData = await openaiResponse.json();
      const generatedScript = scriptData.choices[0].message.content;

      // Generate thumbnail using DALL-E
      const thumbnailResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          prompt: `Create a podcast cover art for a podcast about: ${title}. Modern, professional design.`,
          n: 1,
          size: "1024x1024"
        })
      });

      let thumbnailUrl = null;
      if (thumbnailResponse.ok) {
        const thumbnailData = await thumbnailResponse.json();
        thumbnailUrl = thumbnailData.data[0].url;
      }

      // Generate audio using Eleven Labs API
      console.log("Making request to Eleven Labs...");
      const audioResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceType}`, {
        method: "POST",
        headers: {
          "xi-api-key": ELEVEN_LABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: generatedScript,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        }),
      });

      console.log("Response status:", audioResponse.status);
      
      if (!audioResponse.ok) {
        const errorData = await audioResponse.json();
        console.error("Eleven Labs API error:", errorData);
        throw new Error(errorData.detail?.message || "Failed to generate audio");
      }

      const audioBuffer = await audioResponse.arrayBuffer();
      
      // Generate unique filenames
      const uniqueId = crypto.randomBytes(16).toString('hex');
      const audioFilename = `${uniqueId}-audio.mp3`;
      const thumbnailFilename = thumbnailUrl ? `${uniqueId}-thumbnail.png` : null;
      
      // Save audio file
      const audioPath = path.join(process.cwd(), 'public', 'podcasts', audioFilename);
      await fs.promises.writeFile(audioPath, Buffer.from(audioBuffer));
      
      // Save thumbnail if exists
      let savedThumbnailPath = null;
      if (thumbnailUrl) {
        const thumbnailResponse = await fetch(thumbnailUrl);
        const thumbnailBuffer = await thumbnailResponse.arrayBuffer();
        const thumbnailPath = path.join(process.cwd(), 'public', 'podcasts', thumbnailFilename);
        await fs.promises.writeFile(thumbnailPath, Buffer.from(thumbnailBuffer));
        savedThumbnailPath = `/podcasts/${thumbnailFilename}`;
      }

      // Save to database with file paths
      const content = await prisma.content.create({
        data: {
          userId,
          type: "podcast",
          title,
          description,
          prompt,
          url: `/podcasts/${audioFilename}`,
          thumbnail: savedThumbnailPath,
          script: generatedScript,
          duration: "5:00", // Approximate duration
        },
      });

      // Deduct credits
      await prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: 1 } },
      });

      return NextResponse.json({
        success: true,
        podcast: {
          id: content.id,
          script: generatedScript,
          audioUrl: `/podcasts/${audioFilename}`,
          thumbnailUrl: savedThumbnailPath,
          title,
          description
        }
      });
    } catch (error) {
      console.error("Error in podcast generation:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to generate podcast" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[PODCAST_ERROR]", error);
    return new NextResponse(JSON.stringify({
      success: false,
      error: "Internal Error"
    }), { status: 500 });
  }
}
