"use client";

import { CreditCard } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export const CreditDisplay = ({ cost }: { cost?: number }) => {
  const { user } = useUser();
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/credits`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (typeof data.credits === 'number') {
          setCredits(data.credits);
        }
      } catch (error) {
        console.error("Error fetching credits:", error);
        // Keep the existing credits value on error
      }
    };

    fetchCredits();
  }, [user?.id]);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2">
        <CreditCard className="w-4 h-4 text-purple-400" />
        <span className="text-white font-medium">{credits} Credits</span>
      </div>
      {cost && (
        <div className="text-sm text-gray-400">
          (Cost: {cost} credits)
        </div>
      )}
    </div>
  );
};
