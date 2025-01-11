"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";

interface ThumbnailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (thumbnailUrl: string) => void;
  onUpload: (thumbnailUrl: string) => void;
  prompt: string;
}

export function ThumbnailDialog({
  isOpen,
  onClose,
  onGenerate,
  onUpload,
  prompt,
}: ThumbnailDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);

    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Failed to generate image");

      const data = await response.json();
      onGenerate(data.imageUrl);
    } catch (error) {
      console.error("Error generating thumbnail:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");

      const data = await response.json();
      onUpload(data.url);
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Add Thumbnail</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className={`w-full px-4 py-2 rounded-md flex items-center justify-center gap-2 ${
              isGenerating ? "bg-muted" : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Thumbnail"
            )}
          </button>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              id="thumbnail-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="thumbnail-upload"
              className={`w-full px-4 py-2 rounded-md flex items-center justify-center gap-2 cursor-pointer ${
                isUploading ? "bg-muted" : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Image
                </>
              )}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
