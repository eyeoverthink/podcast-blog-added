"use client";

import { useState } from "react";
import { Mic } from "lucide-react";
import { CreditDisplay } from "@/components/shared/credit-display";
import Link from "next/link";
import toast from "react-hot-toast";
import { Loader2, X } from "lucide-react";
import { ThumbnailDialog } from "./thumbnail-dialog";

const voiceTypes = [
  { value: "21m00Tcm4TlvDq8ikWAM", label: "Rachel" },
  { value: "AZnzlk1XvdvUeBnXmlld", label: "Domi" },
  { value: "EXAVITQu4vr4xnSDxMaL", label: "Bella" },
  { value: "MF3mGyEYCl7XYWbV9V6O", label: "Elli" },
  { value: "TxGEqnHWrfWFTfGW9XjX", label: "Josh" },
  { value: "VR6AewLTigWG4xSOukaG", label: "Arnold" },
  { value: "pNInz6obpgDQGcFmaJgB", label: "Adam" },
  { value: "yoZ06aMxZJJ28mfd3POQ", label: "Sam" },
];

export default function PodcastGenerator() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [voiceType, setVoiceType] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
  const [uploadedThumbnail, setUploadedThumbnail] = useState<string | null>(null);
  const [isThumbnailDialogOpen, setIsThumbnailDialogOpen] = useState(false);
  const [isAddingToLibrary, setIsAddingToLibrary] = useState(false);
  const [podcastId, setPodcastId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedScript("");
    setGeneratedAudio(null);
    // Don't reset thumbnail here to persist it
    
    try {
      const response = await fetch("/api/podcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          voiceType,
          prompt
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate podcast");
      }

      setGeneratedScript(data.podcast.script);
      setPodcastId(data.podcast.id);
      
      // Create an audio element and set its source
      const audio = new Audio(data.podcast.audioUrl);
      audio.addEventListener('canplaythrough', () => {
        setGeneratedAudio(data.podcast.audioUrl);
      });
      audio.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
        toast.error('Failed to load audio');
      });

      // Only set thumbnail if we don't already have one
      if (!generatedThumbnail && !uploadedThumbnail) {
        setGeneratedThumbnail(data.podcast.thumbnailUrl);
      }
      toast.success("Podcast generated successfully");
    } catch (error) {
      console.error("Error generating podcast:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate podcast");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <Link href="/dashboard" className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition">
          <Mic className="w-8 h-8" />
          <span className="text-xl font-semibold">CreativeAI Studio</span>
        </Link>
        <CreditDisplay cost={1} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your podcast title"
              required
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 h-24"
              placeholder="Describe what your podcast should be about"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Additional Prompt (Optional)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 h-24"
              placeholder="Any additional details or specific instructions"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Voice Type</label>
            <select
              value={voiceType}
              onChange={(e) => setVoiceType(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select a voice type</option>
              {voiceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400">Thumbnail</label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setUploadedThumbnail(reader.result as string);
                        setGeneratedThumbnail(null);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                />
                <span className="text-sm text-gray-500">or</span>
                <button 
                  type="button"
                  onClick={() => setIsThumbnailDialogOpen(true)}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition whitespace-nowrap"
                >
                  Generate AI Thumbnail
                </button>
              </div>
              
              {(generatedThumbnail || uploadedThumbnail) && (
                <div className="relative w-32 h-32">
                  <img
                    src={generatedThumbnail || uploadedThumbnail}
                    alt="Thumbnail"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 p-1 rounded-full bg-red-600 hover:bg-red-700 transition"
                    onClick={() => {
                      setGeneratedThumbnail(null);
                      setUploadedThumbnail(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Generating..." : "Generate Podcast"}
        </button>
      </form>

      {generatedScript && (
        <div className="space-y-4 mt-4">
          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Generated Script</h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-300">
              {generatedScript}
            </pre>
          </div>
          
          {generatedAudio && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Generated Audio</h3>
              <audio
                className="w-full"
                controls
                src={generatedAudio}
              />
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              {(generatedThumbnail || uploadedThumbnail) && (
                <img
                  src={generatedThumbnail || uploadedThumbnail}
                  alt="Thumbnail"
                  className="w-12 h-12 rounded object-cover"
                />
              )}
              <div>
                <h4 className="font-medium">{title}</h4>
                <p className="text-sm text-gray-400">Ready to add to library</p>
              </div>
            </div>
            
            <button
              onClick={async () => {
                try {
                  setIsAddingToLibrary(true);
                  // Use the content that was already saved in the API
                  const response = await fetch(`/api/library/${podcastId}`, {
                    method: "GET",
                  });

                  if (!response.ok) {
                    throw new Error("Failed to find podcast in library");
                  }

                  toast.success("Added to library!");
                  // Redirect to library
                  window.location.href = "/library";
                } catch (error) {
                  console.error(error);
                  toast.error("Failed to add to library");
                } finally {
                  setIsAddingToLibrary(false);
                }
              }}
              disabled={isAddingToLibrary}
              className={`px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 ${
                isAddingToLibrary ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isAddingToLibrary ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>Add to Library</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <ThumbnailDialog
        isOpen={isThumbnailDialogOpen}
        onClose={() => setIsThumbnailDialogOpen(false)}
        onGenerated={(url) => {
          setGeneratedThumbnail(url);
          setUploadedThumbnail(null);
        }}
      />
    </div>
  );
}
