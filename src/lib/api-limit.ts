import { auth } from "@clerk/nextjs";
import { prismadb } from "@/lib/prismadb";

export async function checkCredits() {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  const user = await prismadb.user.findUnique({
    where: { id: userId }
  });

  return user?.credits ? user.credits > 0 : false;
}

export async function getCreditsCount() {
  const { userId } = auth();

  if (!userId) {
    return 0;
  }

  const user = await prismadb.user.findUnique({
    where: { id: userId }
  });

  return user?.credits ?? 0;
}

export async function decrementCredits(amount: number = 1) {
  const { userId } = auth();

  if (!userId) {
    return;
  }

  const user = await prismadb.user.update({
    where: { id: userId },
    data: {
      credits: {
        decrement: amount
      }
    }
  });

  return user;
}
