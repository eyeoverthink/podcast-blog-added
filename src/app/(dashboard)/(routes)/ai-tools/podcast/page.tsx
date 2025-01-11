import PodcastGenerator from "./components/podcast-generator";

export const metadata = {
  title: "AI Podcast Generation - CreativeAI Studio",
  description: "Transform your ideas into engaging podcast episodes with AI",
};

export default function PodcastPage() {
  return (
    <div className="h-full bg-gray-900 text-white">
      <div className="h-full">
        <div className="px-4 lg:px-8">
          <div className="mb-8 space-y-4">
            <h1 className="text-4xl font-bold">AI Podcast Generator</h1>
            <p className="text-gray-400 text-lg">
              Transform your ideas into engaging podcast episodes
            </p>
          </div>
          <PodcastGenerator />
        </div>
      </div>
    </div>
  );
}
