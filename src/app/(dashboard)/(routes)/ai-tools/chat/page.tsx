"use client";

import { ChatStudio } from "./components/chat-studio";
import { CreditDisplay } from "@/components/shared/credit-display";

export default function ChatPage() {
  return (
    <div className="h-full bg-gray-900 text-white">
      <div className="px-4 lg:px-8">
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">AI Chat</h1>
              <p className="text-gray-400 text-lg">
                Chat with our advanced AI assistant
              </p>
            </div>
            <CreditDisplay />
          </div>
        </div>
        <ChatStudio />
      </div>
    </div>
  );
}
