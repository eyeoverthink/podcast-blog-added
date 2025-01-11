'use client';

import { 
  Rocket, 
  Palette, 
  Globe2 as Globe, 
  Bot as Robot, 
  Users2 as Users, 
  Smartphone as Devices,
  Paintbrush 
} from 'lucide-react';
import Link from 'next/link';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20 pt-20">
          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-pink-400 text-transparent bg-clip-text">
            CreativeAI Studio
          </h1>
          <p className="text-2xl text-gray-400 mb-12">
            Create amazing content with the power of AI
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/signup" 
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-semibold hover:opacity-90 transition"
            >
              Get Started
            </Link>
            <Link 
              href="/sign-in" 
              className="px-8 py-3 bg-[#1a1b1e] rounded-full text-white font-semibold hover:bg-[#2a2b2e] transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* AI Content Creation */}
          <div className="bg-[#1a1b1e] p-8 rounded-xl hover:bg-[#2a2b2e] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Paintbrush className="w-8 h-8 text-purple-500" />
              <h2 className="text-2xl font-semibold">AI Content Creation</h2>
            </div>
            <p className="text-gray-400">
              Create videos, podcasts, blogs, images, and more with advanced AI tools.
            </p>
          </div>

          {/* Creator Studio */}
          <div className="bg-[#1a1b1e] p-8 rounded-xl hover:bg-[#2a2b2e] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Rocket className="w-8 h-8 text-purple-500" />
              <h2 className="text-2xl font-semibold">Creator Studio</h2>
            </div>
            <p className="text-gray-400">
              Professional tools to edit, mix, and enhance your AI-generated content.
            </p>
          </div>

          {/* Share & Monetize */}
          <div className="bg-[#1a1b1e] p-8 rounded-xl hover:bg-[#2a2b2e] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-8 h-8 text-purple-500" />
              <h2 className="text-2xl font-semibold">Share & Monetize</h2>
            </div>
            <p className="text-gray-400">
              Share your creations with the world and earn through our credit system.
            </p>
          </div>

          {/* Smart Assistant */}
          <div className="bg-[#1a1b1e] p-8 rounded-xl hover:bg-[#2a2b2e] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Robot className="w-8 h-8 text-purple-500" />
              <h2 className="text-2xl font-semibold">Smart Assistant</h2>
            </div>
            <p className="text-gray-400">
              Get help from our AI chatbot to optimize your content creation process.
            </p>
          </div>

          {/* Community */}
          <div className="bg-[#1a1b1e] p-8 rounded-xl hover:bg-[#2a2b2e] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-purple-500" />
              <h2 className="text-2xl font-semibold">Community</h2>
            </div>
            <p className="text-gray-400">
              Connect with other creators, collaborate, and share inspiration.
            </p>
          </div>

          {/* Multi-platform */}
          <div className="bg-[#1a1b1e] p-8 rounded-xl hover:bg-[#2a2b2e] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Devices className="w-8 h-8 text-purple-500" />
              <h2 className="text-2xl font-semibold">Multi-platform</h2>
            </div>
            <p className="text-gray-400">
              Access your content and create from any device, anywhere.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
