"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CreditCard, History } from "lucide-react";

export default function CreditsPage() {
  const [currentBalance, setCurrentBalance] = useState(1000);

  const creditPackages = [
    { amount: 100, price: 10 },
    { amount: 500, price: 45 },
    { amount: 1000, price: 80 },
    { amount: 5000, price: 350 },
  ];

  const usageGuide = [
    { action: "Generate Video", credits: 50 },
    { action: "Create Podcast", credits: 30 },
    { action: "Generate Images", credits: 20 },
    { action: "Create Music", credits: 40 },
    { action: "Write Blog", credits: 25 },
  ];

  const usageHistory = [
    { action: "Generated Video", date: "2024-12-07", credits: -50 },
    { action: "Created Podcast", date: "2024-12-06", credits: -30 },
    { action: "Generated Images", date: "2024-12-05", credits: -20 },
    { action: "Purchased Credits", date: "2024-12-04", credits: 500 },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Credits Management</h1>
          <p className="text-gray-400">Manage your AI creation credits</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
          <CreditCard className="text-purple-500" />
          <span className="text-white font-bold">{currentBalance} Credits</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credit Packages */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">Purchase Credits</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {creditPackages.map((pkg) => (
                  <div key={pkg.amount} className="bg-gray-900 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-medium text-white">{pkg.amount} Credits</span>
                      <span className="text-purple-500">${pkg.price}</span>
                    </div>
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => console.log(`Purchase ${pkg.amount} credits`)}
                    >
                      PURCHASE
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Usage History */}
          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">Usage History</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageHistory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      <Clock className="text-gray-400 w-5 h-5" />
                      <div>
                        <p className="text-white">{item.action}</p>
                        <p className="text-sm text-gray-400">{item.date}</p>
                      </div>
                    </div>
                    <span className={`font-medium ${item.credits > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.credits > 0 ? '+' : ''}{item.credits}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side */}
        <div className="space-y-6">
          {/* Current Balance */}
          <Card>
            <CardContent className="text-center">
              <h3 className="text-sm text-gray-400 mb-2">Current Balance</h3>
              <div className="text-3xl font-bold text-white mb-4">{currentBalance} Credits</div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                TOP UP CREDITS
              </Button>
            </CardContent>
          </Card>

          {/* Credit Usage Guide */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Credit Usage Guide</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usageGuide.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-300">{item.action}</span>
                    <span className="text-gray-400">{item.credits} credits</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
