'use client';

import { UserButton } from "@clerk/nextjs";
import { CreditDisplay } from "@/components/shared/credit-display";
import Link from "next/link";
import { 
  Mic, 
  PanelsTopLeft, 
  Video, 
  PenTool, 
  Image, 
  Music, 
  MessageSquare, 
  BookOpen, 
  Palette, 
  CreditCard,
  Library 
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Creator Studio', href: '/dashboard', icon: PanelsTopLeft },
    { name: 'Library', href: '/dashboard/library', icon: Library },
    { name: 'AI Video', href: '/ai-tools/video', icon: Video },
    { name: 'AI Podcast', href: '/ai-tools/podcast', icon: Mic },
    { name: 'AI Blog', href: '/ai-tools/blog', icon: PenTool },
    { name: 'AI Image', href: '/ai-tools/image', icon: Image },
    { name: 'AI Music', href: '/ai-tools/music', icon: Music },
    { name: 'AI Chat', href: '/ai-tools/chat', icon: MessageSquare },
    { name: 'AI Audiobook', href: '/ai-tools/audiobook', icon: BookOpen },
    { name: 'Design Tools', href: '/ai-tools/design', icon: Palette },
    { name: 'Credits', href: '/credits', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <main>
        <div className="h-screen flex bg-gray-900">
          {/* Sidebar */}
          <div className="hidden md:flex md:w-64 md:flex-col">
            <div className="flex flex-col flex-grow pt-5 bg-gray-800 overflow-y-auto">
              {/* Logo */}
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  Podcastify
                </h1>
              </div>
              
              {/* Navigation */}
              <div className="mt-5 flex-1 flex flex-col">
                <nav className="flex-1 px-2 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <Icon className={`mr-3 h-5 w-5 ${
                          isActive
                            ? 'text-gray-300'
                            : 'text-gray-400 group-hover:text-gray-300'
                        }`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Credits Display */}
              <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
                <div className="flex-shrink-0 w-full group block">
                  <div className="flex items-center">
                    <div>
                      <UserButton afterSignOutUrl="/" />
                    </div>
                    <div className="ml-3">
                      <CreditDisplay />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
