import AudiobookGenerator from "./components/audiobook-generator";

export const metadata = {
  title: "AI Audiobook Creation - CreativeAI Studio",
  description: "Transform your text into professional audiobooks with AI",
};

export default function AudiobookPage() {
  return (
    <div className="h-full bg-gray-900 text-white">
      <div className="h-full">
        <div className="px-4 lg:px-8">
          <div className="mb-8 space-y-4">
            <h1 className="text-4xl font-bold">AI Audiobook Creation</h1>
            <p className="text-gray-400 text-lg">
              Transform your text into professional audiobooks with AI narration
            </p>
          </div>
          <AudiobookGenerator />
        </div>
      </div>
    </div>
  );
}
