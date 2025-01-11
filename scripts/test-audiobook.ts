const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAudiobook() {
  try {
    // 1. Check if our audiobook exists in the database
    const audiobook = await prisma.content.findFirst({
      where: {
        type: "audiobook",
        url: `https://api.replicate.com/v1/predictions/h5qpdxkvz1rm80ckn55b2jtggm`
      }
    });

    console.log('Found audiobook:', audiobook);

    if (!audiobook) {
      console.error('Audiobook not found in database');
      return;
    }

    // 2. Verify the content type and URL
    if (audiobook.type !== 'audiobook') {
      console.error('Wrong type:', audiobook.type);
      return;
    }

    // 3. Test fetching from Replicate
    const response = await fetch(`https://api.replicate.com/v1/predictions/${audiobook.url.split('/').pop()}`, {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch from Replicate:', response.statusText);
      return;
    }

    const data = await response.json();
    console.log('Replicate data:', data);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAudiobook();
