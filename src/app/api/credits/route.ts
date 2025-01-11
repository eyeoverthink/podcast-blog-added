import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs";
import { prismadb } from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    console.log("Auth userId:", userId);
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First try to find by userId
    let user = await prismadb.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });
    console.log("Found user by ID:", user);

    if (!user) {
      // Get Clerk user details
      const clerkUser = await currentUser();
      console.log("Clerk user:", clerkUser);
      
      if (!clerkUser) {
        return new NextResponse("User not found", { status: 404 });
      }

      const email = clerkUser.emailAddresses[0].emailAddress;
      console.log("User email:", email);

      // Try to find by email
      const existingUser = await prismadb.user.findUnique({
        where: { email },
        select: { id: true, credits: true }
      });
      console.log("Existing user by email:", existingUser);

      if (!existingUser) {
        try {
          // Create new user if no existing user found
          user = await prismadb.user.create({
            data: {
              id: userId,
              email: email,
              name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : undefined,
              imageUrl: clerkUser.imageUrl,
              credits: 1000,
            },
            select: { credits: true }
          });
          console.log("Created new user:", user);
        } catch (createError) {
          console.error("Error creating user:", createError);
          throw createError;
        }
      } else {
        // If we found a user by email but with different ID, we'll use that user's credits
        user = existingUser;
      }
    }

    return NextResponse.json({ credits: user.credits });
  } catch (error) {
    console.error("[CREDITS_GET] Error:", error);
    return NextResponse.json({ error: "Internal Error", details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
