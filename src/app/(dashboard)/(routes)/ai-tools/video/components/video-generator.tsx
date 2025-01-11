"use client";

import { useState } from "react";
import { WandSparkles, Loader2, Download, Library } from "lucide-react";
import { CreditDisplay } from "@/components/shared/credit-display";
import { toast } from "react-hot-toast";

const durations = [
  { value: "60", label: "60 frames (~2s)" },
  { value: "90", label: "90 frames (~3s)" },
  { value: "129", label: "129 frames (~4s)" },
];

const resolutions = [
  { value: "480p", label: "480p (854x480)", width: 854, height: 480 },
  { value: "720p", label: "720p (1280x720)", width: 1280, height: 720 },
];

const styles = [
  { value: "realistic", label: "Realistic" },
  { value: "cinematic", label: "Cinematic" },
  { value: "artistic", label: "Artistic" },
  { value: "animated", label: "Animated" },
];

interface VideoResponse {
  url: string;
  status: string;
}

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("60");
  const [resolution, setResolution] = useState("480p");
  const [style, setStyle] = useState("realistic");
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setVideoUrl(null);
    
    try {
      const selectedResolution = resolutions.find(r => r.value === resolution);
      if (!selectedResolution) throw new Error("Invalid resolution selected");

      const stylePrompt = style === "realistic" ? "realistic style, photorealistic" :
                         style === "cinematic" ? "cinematic style, movie quality" :
                         style === "artistic" ? "artistic style, creative" :
                         "animated style, cartoon";

      const response = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${prompt}, ${stylePrompt}`,
          width: selectedResolution.width,
          height: selectedResolution.height,
          video_length: parseInt(duration),
          flow_shift: 7,
          infer_steps: 50,
          embedded_guidance_scale: 6
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate video");
      }

      const data = await response.json() as VideoResponse;
      setVideoUrl(data.url);
      toast.success("Video generated successfully!");
      
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Failed to generate video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoUrl) return;
    
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-created/generated-video-${new Date().getTime()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Video downloaded successfully!");
    } catch (error) {
      console.error("Error downloading video:", error);
      toast.error("Failed to download video");
    }
  };

  const handleSaveToLibrary = async () => {
    if (!videoUrl) return;
    setIsSaving(true);
    
    try {
      const response = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "video",
          url: videoUrl,
          prompt,
          title: prompt.substring(0, 50)
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save to library");
      }

      toast.success("Saved to library!");
    } catch (error) {
      console.error("Error saving to library:", error);
      toast.error("Failed to save to library");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <CreditDisplay cost={25} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Prompt</label>
          <textarea
            placeholder="Describe your video (e.g., A cat walks on the grass)"
            className="w-full h-32 bg-gray-800/50 text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Duration</label>
            <select
              className="w-full bg-gray-800/50 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              {durations.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Resolution</label>
            <select
              className="w-full bg-gray-800/50 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            >
              {resolutions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Style</label>
            <select
              className="w-full bg-gray-800/50 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              {styles.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl py-4 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating Video...</span>
            </>
          ) : (
            <>
              <WandSparkles className="w-5 h-5" />
              <span>Generate Video</span>
            </>
          )}
        </button>
      </form>

      <div className="flex flex-col space-y-4">
        {videoUrl && (
          <div className="space-y-4 mt-4">
            <video
              className="w-full aspect-video rounded-lg border border-gray-800 bg-black"
              src={videoUrl}
              controls
              autoPlay
              loop
              muted
            />
            
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 transition"
                disabled={!videoUrl}
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleSaveToLibrary}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-4 py-2 transition"
                disabled={!videoUrl || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Library className="w-4 h-4" />
                )}
                {isSaving ? "Saving..." : "Save to Library"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
