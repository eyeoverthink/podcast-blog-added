"use client";

import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export const Navbar = () => {
  const { isSignedIn } = useUser();

  return (
    <div className="fixed w-full z-50 flex justify-between items-center py-2 px-4 border-b border-primary/10 bg-secondary">
      <div className="flex items-center">
        <Link href="/">
          <h1 className="text-xl md:text-3xl font-bold text-primary">
            Podcastify
          </h1>
        </Link>
      </div>
      <div className="flex items-center gap-x-3">
        {!isSignedIn && (
          <>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">
                Get Started
              </Button>
            </Link>
          </>
        )}
        {isSignedIn && (
          <UserButton afterSignOutUrl="/" />
        )}
      </div>
    </div>
  );
};
