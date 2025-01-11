import { prisma } from '@/lib/prisma';

async function main() {
  const transcriptionResult = {
    id: "h5qpdxkvz1rm80ckn55b2jtggm",
    segments: [
      {
        end: 38.78,
        text: "Let me ask you about AI. It seems like this year, for the entirety of the human civilization, is an interesting year for the development of artificial intelligence. A lot of interesting stuff is happening. So Meta is a big part of that. Meta has developed LLama, which is a 65 billion parameter model. There's a lot of interesting questions I can ask here, one of which has to do with open source. But first, can you tell the story of developing of this model and making the complicated decision of how to release it?",
        start: 2.67,
        speaker: "SPEAKER_01"
      },
      {
        end: 255.27,
        text: "Yeah, sure. I think you're right, first of all, that in the last year, there have been a bunch of advances on scaling up these large transformer models. So there's the language equivalent of it with large language models. There's sort of the image generation equivalent with these large diffusion models. There's a lot of fundamental research that's gone into this. And Meta has taken the approach of being quite open and academic in our development of AI.",
        start: 39.18,
        speaker: "SPEAKER_02"
      }
    ],
    version: "cbd15da9f839c5f932742f86ce7def3a03c22e2b4171d42823e83e314547003f"
  };

  try {
    const content = await prisma.content.create({
      data: {
        type: "audiobook",
        url: `https://api.replicate.com/v1/predictions/${transcriptionResult.id}`,
        title: "AI Should Be Open-Sourced",
        description: "Discussion about Meta's approach to open-source AI and LLama model",
        prompt: "Discussion about Meta's approach to open-source AI and LLama model",
        userId: "user_2prK09HKj19WJFukiGYeXRdaHau",
        createdAt: new Date()
      }
    });

    console.log('Successfully saved transcription:', content);
  } catch (error) {
    console.error('Error saving transcription:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
