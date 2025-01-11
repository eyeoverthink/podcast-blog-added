import BlogGenerator from "./components/blog-generator";

export const metadata = {
  title: "AI Blog Generation - CreativeAI Studio",
  description: "Generate professional blog posts with AI",
};

export default function BlogPage() {
  return (
    <div className="h-full bg-gray-900 text-white">
      <div className="h-full">
        <div className="px-4 lg:px-8">
          <div className="mb-8 space-y-4">
            <h1 className="text-4xl font-bold">AI Blog Generation</h1>
            <p className="text-gray-400 text-lg">
              Create engaging blog content in seconds
            </p>
          </div>
          <BlogGenerator />
        </div>
      </div>
    </div>
  );
}
