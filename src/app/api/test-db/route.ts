import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";

export async function GET() {
  try {
    // Check if we can connect to the database
    await prismadb.$connect();

    // Get database statistics
    const [userCount, contentCount, transactionCount] = await Promise.all([
      prismadb.user.count(),
      prismadb.content.count(),
      prismadb.creditTransaction.count(),
    ]);

    return NextResponse.json({ 
      status: "Connected to MongoDB",
      stats: {
        users: userCount,
        content: contentCount,
        transactions: transactionCount,
      }
    });
  } catch (error: any) {
    console.error("[DATABASE_TEST_ERROR]", error);
    return NextResponse.json({ 
      status: "Error", 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { 
      status: 500 
    });
  } finally {
    await prismadb.$disconnect();
  }
}
