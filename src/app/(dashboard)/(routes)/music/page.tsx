"use client";

import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Music2, Loader, PlayCircle, PauseCircle, Volume2 } from "lucide-react";
import Image from "next/image";
import { CreditDisplay } from "@/components/shared/credit-display";
import { Slider } from "@/components/ui/slider";

interface SavedTrack {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
  title: string;
}

export default function MusicPage() {
  const [prompt, setPrompt] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [recentTracks, setRecentTracks] = useState<SavedTrack[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const { user } = useUser();

  const generateMusic = async () => {
    if (!prompt.trim()) {
      return toast({
        title: "Please provide a prompt to generate music",
        variant: "destructive",
      });
    }

    try {
      setIsGenerating(true);
      const response = await fetch("/api/music/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      setAudioUrl(data.audioUrl);
      
      // Add to recent tracks
      setRecentTracks(prev => [{
        id: Date.now().toString(),
        url: data.audioUrl,
        prompt,
        createdAt: new Date().toISOString(),
        title: prompt.split(' ').slice(0, 3).join(' ') + '...'
      }, ...prev].slice(0, 5));

      toast({
        title: "Music generated successfully",
        description: "Your track has been saved to your library",
      });
    } catch (error: any) {
      toast({
        title: "Error generating music",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">AI Music Studio</h1>
          <p className="text-gray-400">Create original music with AI</p>
        </div>
        <CreditDisplay cost={1} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Music Generation Panel */}
        <div className="lg:col-span-2">
          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Music Description</Label>
                <Textarea 
                  placeholder="Describe the music you want to create (e.g., 'An upbeat electronic dance track with a strong bassline and synth melody')..."
                  className="mt-2 bg-gray-900 border-gray-800 text-white placeholder:text-gray-400"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={generateMusic}
                  disabled={isGenerating || !prompt.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? (
                    <>
                      Generating
                      <Loader className="w-4 h-4 ml-2 animate-spin" />
                    </>
                  ) : (
                    <>
                      Generate Music
                      <Music2 className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {audioUrl && (
              <div className="mt-8 bg-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlayPause}
                    className="text-white hover:text-purple-400 transition"
                  >
                    {isPlaying ? (
                      <PauseCircle className="w-12 h-12" />
                    ) : (
                      <PlayCircle className="w-12 h-12" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className="text-white font-medium mb-2 line-clamp-1">
                      {prompt}
                    </p>
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-gray-400" />
                      <div className="w-32">
                        <Slider
                          value={[volume]}
                          onValueChange={handleVolumeChange}
                          max={1}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>

        {/* Recent Tracks Panel */}
        <div className="lg:col-span-1">
          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Tracks</h2>
            {recentTracks.length === 0 ? (
              <div className="text-center py-8">
                <Music2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No tracks generated yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTracks.map((track) => (
                  <div
                    key={track.id}
                    className="bg-gray-900 rounded-lg p-3 hover:bg-gray-800 transition cursor-pointer"
                    onClick={() => {
                      setAudioUrl(track.url);
                      setPrompt(track.prompt);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-600 rounded-lg p-2">
                        <Music2 className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {track.title}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {new Date(track.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
