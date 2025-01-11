"use client";

import { MusicStudio } from "./components/music-studio";
import { CreditDisplay } from "@/components/shared/credit-display";

export default function MusicPage() {
  return (
    <div className="h-full bg-gray-900 text-white">
      <div className="h-full">
        <div className="px-4 lg:px-8">
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">AI Music Generation</h1>
                <p className="text-gray-400 text-lg">
                  Create amazing music with AI
                </p>
              </div>
              <CreditDisplay />
            </div>
          </div>
          <MusicStudio />
        </div>
      </div>
    </div>
  );
}
