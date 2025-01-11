import { useState } from "react";
import { Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

interface ThumbnailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (thumbnailUrl: string) => void;
}

export function ThumbnailDialog({ isOpen, onClose, onGenerated }: ThumbnailDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    try {
      setIsGenerating(true);
      const response = await fetch("/api/thumbnail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate thumbnail");
      }

      const data = await response.json();
      onGenerated(data.imageUrl);
      toast.success("Thumbnail generated!");
      onClose();
    } catch (error) {
      toast.error("Failed to generate thumbnail");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Generate Thumbnail</h2>
            <p className="text-sm text-gray-400 mt-1">
              Describe the thumbnail you want to generate. Be specific about style, mood, and elements you want to include.
            </p>
          </div>

          <textarea
            className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500 h-32"
            placeholder="E.g., A modern, minimalist podcast cover with a microphone silhouette, vibrant gradient background in purple and blue, professional typography"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition flex items-center ${
                isGenerating ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
