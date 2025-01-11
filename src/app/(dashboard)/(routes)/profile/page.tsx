"use client";

import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-3xl p-4">
        <UserProfile 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-gray-800 border-0",
              navbar: "bg-gray-800",
              navbarButton: "text-gray-400",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
            },
          }}
        />
      </div>
    </div>
  );
}
