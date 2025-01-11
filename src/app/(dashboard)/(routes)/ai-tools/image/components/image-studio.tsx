"use client";

import { useState } from "react";
import { CreditDisplay } from "@/components/shared/credit-display";
import Link from "next/link";
import { ImageIcon, Download, Save, Layers } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

export default function ImageStudio() {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("generate");

  const generateImage = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt");
      return;
    }
    setIsProcessing(true);

    try {
      const response = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate image");
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      toast.success("Image generated successfully!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate image");
      setError(error instanceof Error ? error.message : "Failed to generate image");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveToLibrary = async () => {
    try {
      if (!generatedImage) {
        toast.error("Please generate an image first");
        return;
      }
      if (!title || !description) {
        toast.error("Please provide a title and description");
        return;
      }

      setIsSaving(true);
      const response = await axios.post("/api/library", {
        type: "image",
        title,
        description,
        imageUrl: generatedImage,
        prompt,
      });

      if (response.data.success) {
        toast.success("Image saved to library!");
        setTitle("");
        setDescription("");
      } else {
        toast.error("Failed to save image");
      }
    } catch (error) {
      console.error("Error saving to library:", error);
      toast.error("Failed to save image");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-900 p-4 border-r border-gray-800">
        <div className="flex items-center space-x-2 mb-8">
          <ImageIcon className="w-8 h-8 text-purple-400" />
          <span className="text-xl font-semibold text-purple-400">CreativeAI</span>
        </div>
        
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab("generate")}
            className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === "generate" ? "bg-purple-600 text-white" : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span>Generate</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title for your creation..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              
              <textarea
                placeholder="Description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-24 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <textarea
                placeholder="Describe the image you want to create..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <button
                onClick={generateImage}
                disabled={isProcessing}
                className="w-full bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Generating..." : "Generate Image"}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 text-red-500 rounded-lg px-4 py-2">
                {error}
              </div>
            )}

            {generatedImage && (
              <div className="space-y-4">
                <img
                  src={generatedImage}
                  alt="Generated image"
                  className="w-full rounded-lg shadow-2xl"
                />
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => window.open(generatedImage, '_blank')}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download</span>
                  </button>
                  
                  <button
                    onClick={saveToLibrary}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    <span>{isSaving ? "Saving..." : "Save to Library"}</span>
                  </button>

                  <Link
                    href="/library"
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
                  >
                    <Layers className="w-5 h-5" />
                    <span>View Library</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
