"use client";

import { useState } from "react";
import { Pencil, Type, Image, Bold, Italic, Link as LinkIcon, Save, Wand2, Loader2, X } from "lucide-react";
import { CreditDisplay } from "@/components/shared/credit-display";
import Link from "next/link";
import toast from "react-hot-toast";
import { ThumbnailDialog } from "./thumbnail-dialog";
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const tones = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "humorous", label: "Humorous" },
  { value: "technical", label: "Technical" },
  { value: "storytelling", label: "Storytelling" },
];

const lengths = [
  { value: "short", label: "Short (~500 words)" },
  { value: "medium", label: "Medium (~1000 words)" },
  { value: "long", label: "Long (~2000 words)" },
];

interface ImageSuggestion {
  description: string;
  generated?: boolean;
  url?: string;
}

export default function BlogGenerator() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
  const [uploadedThumbnail, setUploadedThumbnail] = useState<string | null>(null);
  const [isThumbnailDialogOpen, setIsThumbnailDialogOpen] = useState(false);
  const [isAddingToLibrary, setIsAddingToLibrary] = useState(false);
  const [blogId, setBlogId] = useState<string | null>(null);
  const [imageSuggestions, setImageSuggestions] = useState<ImageSuggestion[]>([]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setContent("");
      setImageSuggestions([]);

      const response = await fetch("/api/blog/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          tone,
          length,
        }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let currentContent = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        const updates = chunk.split('\n').filter(Boolean).map(str => JSON.parse(str));

        for (const update of updates) {
          if (update.type === 'outline') {
            currentContent += "## Outline\n" + update.content + "\n\n";
          } else if (update.type === 'section') {
            currentContent += update.content + "\n\n";
            
            // Extract image suggestions from the section
            const imgMatches = update.content.match(/\[IMAGE:([^\]]+)\]/g);
            if (imgMatches) {
              const newSuggestions = imgMatches.map(match => ({
                description: match.slice(7, -1).trim(),
                generated: false
              }));
              setImageSuggestions(prev => [...prev, ...newSuggestions]);
            }
          }
          setContent(currentContent);
        }
      }

      toast.success("Blog generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate blog");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async (description: string, index: number) => {
    try {
      const response = await axios.post("/api/image", {
        prompt: description,
      });

      if (!response.ok) throw new Error("Failed to generate image");

      const data = response.data;
      const newSuggestions = [...imageSuggestions];
      newSuggestions[index] = {
        ...newSuggestions[index],
        generated: true,
        url: data.imageUrl,
      };
      setImageSuggestions(newSuggestions);
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
    }
  };

  const handleSave = async () => {
    if (!content || isAddingToLibrary) return;
    setIsAddingToLibrary(true);

    try {
      const thumbnail = uploadedThumbnail || generatedThumbnail;
      const response = await axios.post("/api/blog", {
        title,
        description,
        content,
        prompt: topic, // Use topic as the prompt
        thumbnail,
      });

      if (!response.ok) {
        const error = await response.text();
        if (error === "Insufficient credits") {
          toast.error("You need more credits to save this blog post");
        } else {
          throw new Error("Failed to save blog");
        }
        return;
      }

      const savedBlog = await response.data;
      setBlogId(savedBlog.id);
      toast.success("Blog saved to library!");
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error("Failed to save blog to library");
    } finally {
      setIsAddingToLibrary(false);
    }
  };

  const handleGenerateThumbnail = () => {
    setIsThumbnailDialogOpen(true);
  };

  const handleThumbnailGenerated = (thumbnailUrl: string) => {
    setGeneratedThumbnail(thumbnailUrl);
    setIsThumbnailDialogOpen(false);
  };

  const handleThumbnailUploaded = (thumbnailUrl: string) => {
    setUploadedThumbnail(thumbnailUrl);
    setIsThumbnailDialogOpen(false);
  };

  return (
    <div className="h-full p-4 space-y-2">
      <CreditDisplay />
      <div className="grid gap-4">
        <div>
          <h3 className="text-lg font-medium">Create a Blog Post</h3>
          <p className="text-sm text-muted-foreground">
            Generate a blog post with AI. You can customize the tone and length.
          </p>
        </div>
        <div className="grid gap-2">
          <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Title</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter blog title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Description</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter blog description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Topic</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter blog topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Tone</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                {tones.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Length</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={length}
                onChange={(e) => setLength(e.target.value)}
              >
                {lengths.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </form>
        </div>
        <div className="grid gap-2 grid-cols-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic}
            className={`px-4 py-2 rounded-md flex items-center justify-center gap-2 ${
              isGenerating ? "bg-muted" : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate Blog
              </>
            )}
          </button>
          <button
            onClick={handleGenerateThumbnail}
            disabled={isGenerating}
            className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center justify-center gap-2"
          >
            <Image className="h-4 w-4" />
            {generatedThumbnail || uploadedThumbnail ? "Change Thumbnail" : "Add Thumbnail"}
          </button>
        </div>
        {content && (
          <div className="space-y-4 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Generated Blog Post</h3>
              <button
                onClick={handleSave}
                disabled={isAddingToLibrary}
                className={`px-4 py-2 rounded-md flex items-center justify-center gap-2 ${
                  isAddingToLibrary ? "bg-muted" : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isAddingToLibrary ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save to Library
                  </>
                )}
              </button>
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {typeof content === 'string' && (
                <ReactMarkdown>
                  {content.replace(/\[IMAGE:.*?\]/g, '')}
                </ReactMarkdown>
              )}
            </div>
            {imageSuggestions.length > 0 && imageSuggestions.map((suggestion, index) => (
              <div key={index} className="my-4 p-4 border rounded-lg bg-muted">
                <p className="font-medium mb-2">Suggested Image:</p>
                <p className="text-sm mb-2">{suggestion.description}</p>
                {suggestion.url ? (
                  <div className="relative w-full h-48">
                    <img
                      src={suggestion.url}
                      alt={suggestion.description}
                      className="rounded-md object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerateImage(suggestion.description, index)}
                    className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center justify-center gap-2"
                  >
                    <Image className="h-4 w-4" />
                    Generate Image
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {blogId && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2">
          <span>Blog saved!</span>
          <Link href="/dashboard/library" className="underline">
            View in Library
          </Link>
          <button onClick={() => setBlogId(null)} className="ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <ThumbnailDialog
        isOpen={isThumbnailDialogOpen}
        onClose={() => setIsThumbnailDialogOpen(false)}
        onGenerate={handleThumbnailGenerated}
        onUpload={handleThumbnailUploaded}
        prompt={title || topic}
      />
    </div>
  );
}
