import { writeFile } from "node:fs/promises";

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForCompletion(predictionId) {
  const maxAttempts = 60; // 5 minutes total
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
      return prediction.output;
    } else if (prediction.status === 'failed') {
      throw new Error('Image generation failed: ' + prediction.error);
    }

    attempts++;
    await sleep(5000); // Wait 5 seconds between checks
  }

  throw new Error('Timed out waiting for prediction');
}

async function generateImage() {
  try {
    console.log('Starting image generation...');
    
    const response = await fetch('https://api.replicate.com/v1/models/luma/photon/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`
      },
      body: JSON.stringify({
        input: {
          prompt: "photorealistic fashionable afro-american male, full body;in the china streets texting",
          aspect_ratio: "16:9",
          image_reference_weight: 0.85,
          style_reference_weight: 0.85
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    const prediction = await response.json();
    console.log('Prediction created:', prediction.id);

    const output = await waitForCompletion(prediction.id);
    console.log('Generation completed! Downloading image...');

    const imageResponse = await fetch(output);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }

    const buffer = await imageResponse.arrayBuffer();
    await writeFile("output.jpg", Buffer.from(buffer));
    console.log('Image saved to output.jpg');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

generateImage();
