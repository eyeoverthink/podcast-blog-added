'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid,
  Video,
  Mic2,
  PenTool,
  Image as ImageIcon,
  Music,
  MessageSquare,
  Book,
  Palette,
  CreditCard,
  Library
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Creator Studio', href: '/dashboard', icon: LayoutGrid },
    { name: 'Library', href: '/dashboard/library', icon: Library },
    { name: 'AI Video', href: '/ai-tools/video', icon: Video },
    { name: 'AI Podcast', href: '/ai-tools/podcast', icon: Mic2 },
    { name: 'AI Blog', href: '/ai-tools/blog', icon: PenTool },
    { name: 'AI Image', href: '/ai-tools/image', icon: ImageIcon },
    { name: 'AI Music', href: '/ai-tools/music', icon: Music },
    { name: 'AI Chat', href: '/ai-tools/chat', icon: MessageSquare },
    { name: 'AI Audiobook', href: '/ai-tools/audiobook', icon: Book },
    { name: 'Design Tools', href: '/ai-tools/design', icon: Palette },
    { name: 'Credits', href: '/credits', icon: CreditCard },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <Link href="/dashboard" className="p-6">
        <h1 className="text-xl font-bold text-purple-500">CreativeAI Studio</h1>
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = 
            item.href === '/dashboard' 
              ? pathname === '/dashboard'
              : pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== '/dashboard');
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-purple-600/20 text-purple-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-purple-500' : 'text-gray-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 mx-3 mb-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
          <CreditCard className="w-5 h-5 text-purple-500" />
          <span className="text-white font-medium">1000 Credits</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
