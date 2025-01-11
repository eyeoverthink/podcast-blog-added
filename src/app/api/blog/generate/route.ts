import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

// Dummy data for testing
const dummyOutline = `# Building a Modern Podcast Platform
- Introduction to Podcasting
- Technical Architecture
- Key Features
- User Experience`;

const dummySection1 = `## Introduction to Podcasting

Podcasting has revolutionized digital content creation and consumption.

> "Audio content is experiencing a renaissance in the digital age."

[IMAGE: A professional podcast recording setup with microphone, mixer, and acoustic panels]

**Why Podcasting Matters:**
- *Growing audience reach*
- *Diverse content formats*
- *Monetization opportunities*`;

const dummySection2 = `## Technical Architecture

A robust podcast platform needs a solid technical foundation.

[IMAGE: System architecture diagram showing cloud services, APIs, and data flow]

**Core Components:**
1. *Content Management*
2. *Audio Processing*
3. *User Authentication*`;

const dummySection3 = `## Key Features

Modern podcast platforms require specific features to stand out.

[IMAGE: Dashboard interface showing analytics, upload tools, and user management]

**Essential Features:**
- *AI-powered transcription*
- *Advanced audio editing*
- *Analytics dashboard*`;

const dummySection4 = `## User Experience

Creating an intuitive user experience is crucial.

[IMAGE: Mobile and desktop views of a podcast player interface]

**UX Priorities:**
- *Seamless playback*
- *Easy navigation*
- *Cross-platform sync*`;

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    const streamingProcess = async () => {
      try {
        // Send outline
        await writer.write(encoder.encode(JSON.stringify({ type: 'outline', content: dummyOutline }) + '\n'));
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Send sections with delays
        const sections = [dummySection1, dummySection2, dummySection3, dummySection4];
        for (const section of sections) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          await writer.write(encoder.encode(JSON.stringify({ type: 'section', content: section }) + '\n'));
        }

        await writer.close();
      } catch (error) {
        console.error("[STREAM_ERROR]", error);
        await writer.abort(error);
      }
    };

    // Start the streaming process without awaiting
    streamingProcess();

    // Return the streaming response
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("[BLOG_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
