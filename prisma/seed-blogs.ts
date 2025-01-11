const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = "user_2prK09HKj19WJFukiGYeXRdaHau"; // Your Clerk user ID

  const dummyBlogs = [
    {
      title: "The History of Jazz",
      description: "A comprehensive exploration of Miles Davis's revolutionary impact on jazz history.",
      prompt: "Create a blog post about Miles Davis's influence on jazz history",
      script: `# The Evolution of Jazz Through Miles Davis

A comprehensive exploration of jazz history, focusing on Miles Davis's revolutionary impact on the genre. From his early days with Charlie Parker to the birth of cool jazz and fusion, this story traces the evolution of jazz through the lens of one of its greatest innovators.

## Key Periods
- Bebop Era (1944-1948)
- Birth of the Cool (1949-1950)
- Hard Bop Period (1955-1959)
- Modal Jazz (1959-1964)
- Fusion Years (1968-1975)

Davis's innovations changed not just how we play jazz, but how we think about music itself.`,
      type: "blog",
      url: "/blogs/miles-davis-jazz-history",
      thumbnail: "/blogs/jazz-history.png",
      createdAt: new Date("2024-12-09T04:54:00Z")
    },
    {
      title: "The Art of Holiday Romance",
      description: "Exploring the unique dynamics of finding love during the festive season.",
      prompt: "Write about finding love during the holiday season",
      script: `# Finding Love in the Holiday Season

The holiday season brings unique challenges and opportunities for finding love. This exploration looks at how the festive period affects relationships and dating.

## Holiday Dating Dynamics
- Increased social gatherings
- Family pressures and expectations
- The "cuffing season" phenomenon
- New Year's resolutions

Whether you're single or in a relationship, the holidays add an extra layer of complexity to matters of the heart.`,
      type: "blog",
      url: "/blogs/holiday-romance",
      thumbnail: "/blogs/holiday-love.png",
      createdAt: new Date("2024-12-09T04:19:00Z")
    }
  ];

  // Delete existing blogs first to avoid duplicates
  await prisma.content.deleteMany({
    where: {
      userId,
      type: "blog"
    }
  });

  // Create new blogs
  for (const blog of dummyBlogs) {
    await prisma.content.create({
      data: {
        userId,
        ...blog,
        updatedAt: blog.createdAt
      }
    });
  }

  console.log('Added dummy blogs to the database');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
