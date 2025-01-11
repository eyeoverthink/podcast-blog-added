import Link from "next/link";
import { 
  Video, 
  Mic, 
  PenTool, 
  Image as ImageIcon, 
  Music, 
  MessageSquare, 
  ArrowUpRight 
} from "lucide-react";

const tools = [
  {
    label: "AI Video Creation",
    icon: Video,
    color: "violet",
    href: "/ai-tools/video",
    description: "Create amazing ai video creation with AI"
  },
  {
    label: "AI Podcast Creation",
    icon: Mic,
    color: "pink",
    href: "/ai-tools/podcast",
    description: "Create amazing ai podcast creation with AI"
  },
  {
    label: "AI Blog Writing",
    icon: PenTool,
    color: "emerald",
    href: "/ai-tools/blog",
    description: "Create amazing ai blog writing with AI"
  },
  {
    label: "AI Image Generation",
    icon: ImageIcon,
    color: "blue",
    href: "/ai-tools/image",
    description: "Create amazing ai image generation with AI"
  },
  {
    label: "AI Music Creation",
    icon: Music,
    color: "orange",
    href: "/ai-tools/music",
    description: "Create amazing ai music creation with AI"
  },
  {
    label: "AI Chat Assistant",
    icon: MessageSquare,
    color: "yellow",
    href: "/chat",
    description: "Create amazing ai chat assistant with AI"
  }
];

export default function CreatorStudioPage() {
  return (
    <div className="h-full p-4 space-y-4">
      {/* Tools Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 w-fit rounded-md bg-${tool.color}-500/10`}>
                <tool.icon className={`w-6 h-6 text-${tool.color}-500`} />
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-white transition" />
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-white mb-2">{tool.label}</h3>
              <p className="text-sm text-gray-400">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-4">Recent Projects</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-4 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No projects yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
