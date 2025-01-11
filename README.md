# Podcastify - AI-Powered Podcast Platform

A modern, Spotify-inspired podcast platform with AI features, built with Next.js, Convex, Cloudinary, and Clerk.

## Features

- 🎙️ AI-powered podcast creation and management
- 👥 User authentication and profiles
- 📱 Responsive Spotify-like interface
- 🔍 Advanced search with filters
- 📊 Analytics dashboard
- 🔔 Real-time notifications
- 💬 Comments and social interactions
- 📝 AI-generated descriptions and tags
- 📋 Playlist management
- 🎵 Audio waveform visualization
- 🎥 AI Video Generation
- 📝 Blog Generation
- 🎨 Image Generation with Replicate
- 🎵 Music Generation with Replicate's MusicGen
- 🤖 AI Chatbot
- 💬 Real-time Chat
- 💳 Credit-based Monetization
- 📚 Audio Book Creation

## Implemented Features

### AI Music Studio
- Generate original music using Replicate's MusicGen model
- Adjustable duration control (8-32 seconds)
- Real-time audio playback with volume control
- Download generated tracks
- Credit-based generation system
- Recent tracks history

### AI Image Studio
- Create custom images using Replicate
- Multiple model options
- Advanced prompt interface
- Image history and management
- Download generated images

## Upcoming Enhancements

### Music Generation
- Multiple AI models (Stable Audio, AudioCraft, MusicLM)
- Extended duration options
- Genre-specific models
- Style transfer capabilities
- Stem separation
- Music mixing tools
- Collaborative music creation

### Image Generation
- Image editing capabilities
- Style transfer
- Batch generation
- Custom model fine-tuning
- Image restoration
- Background removal
- Image variations

### Platform Features
- Social sharing capabilities
- Public galleries
- Custom model training
- API access
- Collaborative workspaces
- Advanced analytics
- Export to various formats
- Integration with DAWs
- Mobile app support

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Convex
- **Authentication**: Clerk
- **AI**: OpenAI
- **Database**: Convex
- **Real-time**: Convex Live Queries
- **UI Components**: shadcn/ui
- **Audio Processing**: wavesurfer.js
- **Analytics**: Recharts

## Prerequisites

- Node.js 18+ and npm
- Clerk account for authentication
- Convex account for backend
- OpenAI API key for AI features
- Cloudinary account for media storage

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd podcastify
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CONVEX_URL=
OPENAI_API_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/src/app` - Next.js app router pages and layouts
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and shared logic
- `/src/hooks` - Custom React hooks
- `/convex` - Convex backend functions and schema
- `/public` - Static assets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Environment Variables

Make sure to set up the following environment variables in your `.env.local` file:

```bash
REPLICATE_API_TOKEN=your_replicate_api_token
OPENAI_API_KEY=your_openai_api_key
ELEVEN_LABS_API_KEY=your_eleven_labs_api_key
```

### Using Replicate

```typescript
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const input = {
  prompt: "photorealistic fashionable lady full body shot in street texting",
  aspect_ratio: "16:9",
  image_reference_weight: 0.85,
  style_reference_weight: 0.85
};

const output = await replicate.run("luma/photon", { input });
console.log(output);

### Video Creation: 
#install dep's first
npx create-replicate --model=tencent/hunyuan-video


or set up a project from scratch
Install Replicate’s Node.js client library
npm install replicate

Copy
Set the REPLICATE_API_TOKEN environment variable
export REPLICATE_API_TOKEN=<paste-your-token-here>

Visibility

Copy
Find your API token in your account settings.

Import and set up the client
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

Copy
Run tencent/hunyuan-video using Replicate’s API. Check out the model's schema for an overview of inputs and outputs.

const output = await replicate.run(
  "tencent/hunyuan-video:847dfa8b01e739637fc76f480ede0c1d76408e1d694b830b5dfb8e547bf98405",
  {
    input: {
      width: 854,
      height: 480,
      prompt: "A cat walks on the grass, realistic style.",
      flow_shift: 7,
      infer_steps: 50,
      video_length: 129,
      embedded_guidance_scale: 6
    }
  }
);
console.log(output);
