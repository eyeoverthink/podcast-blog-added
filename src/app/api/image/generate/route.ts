import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import Replicate from "replicate";
import { prismadb } from "@/lib/prismadb";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isValidUrl = (url: string) => {
  try {
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

async function waitForPrediction(predictionId: string) {
  const maxAttempts = 60;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to check prediction status: ${response.status}`);
    }

    const prediction = await response.json();
    console.log(`Status: ${prediction.status}`);

    if (prediction.status === 'succeeded') {
      const output = prediction.output;
      // Validate the output URL
      if (Array.isArray(output) && output.length > 0 && isValidUrl(output[0])) {
        return output;
      }
      throw new Error('Invalid image URL received from API');
    } else if (prediction.status === 'failed') {
      throw new Error('Image generation failed: ' + prediction.error);
    }

    attempts++;
    await sleep(5000);
  }

  throw new Error('Timed out waiting for prediction');
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, width = 1024, height = 1024 } = body;

    if (!userId) {
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: "Unauthorized" 
      }), { status: 401 });
    }

    if (!prompt) {
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: "Prompt is required" 
      }), { status: 400 });
    }

    let user = await prismadb.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      user = await prismadb.user.create({
        data: {
          id: userId,
          email: "eyeoverthink@gmail.com",
          credits: 1000
        }
      });
    }

    if (user.credits < 5) {
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: "Insufficient credits" 
      }), { status: 402 });
    }

    console.log('Starting image generation with prompt:', prompt);

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`
      },
      body: JSON.stringify({
        version: "da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf",
        input: {
          prompt,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 50
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    const prediction = await response.json();
    console.log('Prediction created:', prediction.id);

    const output = await waitForPrediction(prediction.id);
    console.log('Generation completed!');

    if (!Array.isArray(output) || !output.length || !isValidUrl(output[0])) {
      throw new Error('Invalid image URL received from API');
    }

    await prismadb.user.update({
      where: { id: userId },
      data: { credits: user.credits - 5 }
    });

    const imageUrl = output[0];
    
    // Only save to content if we have a valid URL
    if (isValidUrl(imageUrl)) {
      await prismadb.content.create({
        data: {
          userId,
          type: "image",
          url: imageUrl,
          prompt,
          title: prompt.substring(0, 50)
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      imageUrl
    });
  } catch (error) {
    console.error("[IMAGE_ERROR]", error);
    return new NextResponse(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "Internal error" 
    }), { status: 500 });
  }
}
