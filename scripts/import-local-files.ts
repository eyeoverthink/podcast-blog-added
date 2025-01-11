import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { auth } from '@clerk/nextjs';

const prisma = new PrismaClient();

async function importLocalFiles() {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error("No user ID found. Please make sure you're logged in.");
    }

    console.log('Importing files for user:', userId);

    // Import images
    const imageDir = path.join(process.cwd(), 'images-created');
    if (fs.existsSync(imageDir)) {
      const imageFiles = fs.readdirSync(imageDir)
        .filter(file => !file.startsWith('.') && file.match(/\.(jpg|jpeg|png)$/i));

      for (const file of imageFiles) {
        const url = `/api/local-files/image/${encodeURIComponent(file)}`;
        const title = file.replace(/\.[^/.]+$/, "").replace(/-/g, ' ');
        
        // Check if this file is already in the database
        const existing = await prisma.content.findFirst({
          where: { url, userId }
        });

        if (!existing) {
          await prisma.content.create({
            data: {
              type: 'image',
              url,
              title,
              description: "Local image",
              prompt: "",
              userId,
              createdAt: fs.statSync(path.join(imageDir, file)).birthtime
            }
          });
          console.log(`Added image: ${title}`);
        }
      }
    }

    // Import videos
    const videoDir = path.join(process.cwd(), 'videos-created');
    if (fs.existsSync(videoDir)) {
      const videoFiles = fs.readdirSync(videoDir)
        .filter(file => !file.startsWith('.') && file.match(/\.(mp4|webm)$/i));

      for (const file of videoFiles) {
        const url = `/api/local-files/video/${encodeURIComponent(file)}`;
        const title = file.replace(/\.[^/.]+$/, "").replace(/-/g, ' ');
        
        // Check if this file is already in the database
        const existing = await prisma.content.findFirst({
          where: { url, userId }
        });

        if (!existing) {
          await prisma.content.create({
            data: {
              type: 'video',
              url,
              title,
              description: "Local video",
              prompt: "",
              userId,
              createdAt: fs.statSync(path.join(videoDir, file)).birthtime
            }
          });
          console.log(`Added video: ${title}`);
        }
      }
    }

    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importLocalFiles();
