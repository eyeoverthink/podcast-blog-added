'use client';

import Link from 'next/link';
import { 
  LayoutGrid, 
  Video, 
  Mic2,
  PenTool,
  Image as ImageIcon,
  Music,
  MessageSquare,
  Book
} from 'lucide-react';

const tools = [
  {
    name: 'Creator Studio',
    description: 'Your creative workspace for all content types',
    icon: LayoutGrid,
    href: '/studio',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
  },
  {
    name: 'AI Video',
    description: 'Create and edit videos with AI assistance',
    icon: Video,
    href: '/video',
    color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
  },
  {
    name: 'AI Podcast',
    description: 'Generate and edit podcast content',
    icon: Mic2,
    href: '/podcast',
    color: 'bg-gradient-to-br from-green-500 to-emerald-500',
  },
  {
    name: 'AI Blog',
    description: 'Write engaging blog posts with AI',
    icon: PenTool,
    href: '/blog',
    color: 'bg-gradient-to-br from-orange-500 to-yellow-500',
  },
  {
    name: 'AI Image',
    description: 'Generate and edit images with AI',
    icon: ImageIcon,
    href: '/image',
    color: 'bg-gradient-to-br from-red-500 to-pink-500',
  },
  {
    name: 'AI Music',
    description: 'Create music and audio with AI',
    icon: Music,
    href: '/music',
    color: 'bg-gradient-to-br from-violet-500 to-purple-500',
  },
  {
    name: 'AI Chat',
    description: 'Chat with AI for creative inspiration',
    icon: MessageSquare,
    href: '/chat',
    color: 'bg-gradient-to-br from-teal-500 to-green-500',
  },
  {
    name: 'AI Audiobook',
    description: 'Convert text to natural-sounding audiobooks',
    icon: Book,
    href: '/audiobook',
    color: 'bg-gradient-to-br from-amber-500 to-orange-500',
  },
];

const Dashboard = () => {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to CreativeAI Studio</h1>
          <p className="text-gray-400 text-xl">Choose a tool to start creating amazing content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link 
              key={tool.name} 
              href={tool.href}
              className="block"
            >
              <div className="bg-[#1a1b1e] rounded-xl p-6 hover:bg-[#2a2b2e] transition-all hover:scale-[1.02] cursor-pointer">
                <div className={`w-16 h-16 rounded-xl ${tool.color} flex items-center justify-center mb-6`}>
                  <tool.icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">{tool.name}</h2>
                <p className="text-gray-400">{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
