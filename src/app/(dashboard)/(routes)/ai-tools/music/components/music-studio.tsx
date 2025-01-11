"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Music, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

export const MusicStudio = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(8);
  const [audioUrl, setAudioUrl] = useState<string>();
  const [volume, setVolume] = useState(0.5);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setAudioUrl(undefined);

      const response = await fetch("/api/music/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          duration,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate music");
      }

      const data = await response.json();
      setAudioUrl(data.audioUrl);
      setPrompt("");
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    const audioElement = document.querySelector("audio");
    if (audioElement) {
      audioElement.volume = newVolume;
    }
  };

  return (
    <div>
      <form onSubmit={onSubmit} className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid gap-4">
        <div className="grid gap-2">
          <Label>Music Description</Label>
          <Textarea
            className="resize-none"
            placeholder="Piano melody with a jazz influence..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            rows={4}
          />
        </div>
        
        <div className="grid gap-2">
          <Label>Duration (seconds): {duration}s</Label>
          <Slider
            value={[duration]}
            onValueChange={(value) => setDuration(value[0])}
            min={8}
            max={32}
            step={8}
            disabled={isLoading}
          />
        </div>

        <Button type="submit" disabled={isLoading || !prompt.trim()}>
          {isLoading ? (
            <>
              Generating...
              <Loader className="w-4 h-4 ml-2 animate-spin" />
            </>
          ) : (
            <>
              Generate Music
              <Music className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      {audioUrl && (
        <div className="mt-8 rounded-lg border p-4">
          <div className="mb-4">
            <Label>Volume</Label>
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.1}
              className="mt-2"
            />
          </div>
          <audio
            controls
            className="w-full"
            src={audioUrl}
          >
            Your browser does not support the audio element.
          </audio>
          <Button 
            onClick={() => window.open(audioUrl)} 
            variant="outline" 
            className="w-full mt-4"
          >
            <Music className="h-4 w-4 mr-2" />
            Download Music
          </Button>
        </div>
      )}
    </div>
  );
};
