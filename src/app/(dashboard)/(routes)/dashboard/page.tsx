import { 
  Mic, 
  PanelsTopLeft, 
  Video, 
  PenTool, 
  Image as ImageIcon, 
  Music, 
  MessageSquare, 
  BookOpen,
  Library 
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const tools = [
    {
      label: "Creator Studio",
      icon: PanelsTopLeft,
      href: "/studio",
      color: "from-purple-500 to-pink-500",
      description: "Your creative workspace for all content types"
    },
    {
      label: "AI Video",
      icon: Video,
      href: "/ai-tools/video",
      color: "from-blue-500 to-cyan-500",
      description: "Create and edit videos with AI assistance"
    },
    {
      label: "AI Podcast",
      icon: Mic,
      href: "/ai-tools/podcast",
      color: "from-green-500 to-emerald-500",
      description: "Generate and edit podcast content"
    },
    {
      label: "AI Blog",
      icon: PenTool,
      href: "/ai-tools/blog",
      color: "from-yellow-500 to-orange-500",
      description: "Write engaging blog posts with AI"
    },
    {
      label: "AI Image",
      icon: ImageIcon,
      href: "/ai-tools/image",
      color: "from-red-500 to-pink-500",
      description: "Generate and edit images with AI"
    },
    {
      label: "AI Music",
      icon: Music,
      href: "/ai-tools/music",
      color: "from-indigo-500 to-purple-500",
      description: "Create music and audio with AI"
    },
    {
      label: "AI Chat",
      icon: MessageSquare,
      href: "/chat",
      color: "from-teal-500 to-green-500",
      description: "Chat with AI for creative inspiration"
    },
    {
      label: "AI Audiobook",
      icon: BookOpen,
      href: "/ai-tools/audiobook",
      color: "from-orange-500 to-red-500",
      description: "Convert text to natural-sounding audiobooks"
    },
    {
      label: "Library",
      icon: Library,
      href: "/dashboard/library",
      color: "from-blue-600 to-violet-600",
      description: "Access your content library and imported files"
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to Podcastify</h1>
        <p className="text-gray-400">Choose a tool to start creating amazing content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${tool.color} mb-4`}>
              <tool.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{tool.label}</h3>
            <p className="text-gray-400 text-sm">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
