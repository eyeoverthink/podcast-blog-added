"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { CreditDisplay } from "@/components/shared/credit-display";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader, Copy, Upload, Download, Mic, PlayCircle, PauseCircle, Plus, Edit3, Wand2, Save, Book, Library, Loader2 } from "lucide-react";
import Image from "next/image";

interface Chapter {
  id: string;
  title: string;
  content: string;
  audioUrl?: string;
}

const voiceOptions = [
  { value: "alloy", label: "Alloy" },
  { value: "echo", label: "Echo" },
  { value: "fable", label: "Fable" },
  { value: "onyx", label: "Onyx" },
  { value: "nova", label: "Nova" },
  { value: "shimmer", label: "Shimmer" },
];

export default function AudiobookGenerator() {
  const [chapters, setChapters] = useState<Chapter[]>([{ id: "1", title: "Chapter 1", content: "" }]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter>(chapters[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [isProcessing, setIsProcessing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<"short" | "medium" | "long">("medium");
  const [generatedScript, setGeneratedScript] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [coverPrompt, setCoverPrompt] = useState("");
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      
      // Convert file to base64
      const buffer = await file.arrayBuffer();
      const base64Audio = Buffer.from(buffer).toString('base64');

      console.log('Sending request to Replicate API...');
      const response = await fetch("/api/audiobook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio: base64Audio,
          title: title || file.name,
          prompt: title || "",
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to create audiobook: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Received response:', result);
      
      if (!result.output?.segments) {
        console.error('Invalid response format:', result);
        throw new Error('Invalid response format from API');
      }

      // Update chapter content with transcription
      const transcribedText = result.output.segments
        .map((s: any) => `${s.speaker}: ${s.text}`)
        .join('\n\n');

      setSelectedChapter({
        ...selectedChapter,
        content: transcribedText,
        audioUrl: URL.createObjectURL(file)
      });
      updateChapter({
        ...selectedChapter,
        content: transcribedText,
        audioUrl: URL.createObjectURL(file)
      });

      toast({
        title: "Success",
        description: "Audio transcribed successfully",
      });

    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process audio",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("audio", audioBlob);

        try {
          const response = await fetch("/api/audiobook/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error("Failed to transcribe audio");

          const { text } = await response.json();
          setSelectedChapter({ ...selectedChapter, content: text });
          updateChapter({ ...selectedChapter, content: text });
        } catch (error) {
          console.error("Error transcribing audio:", error);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const generateAudio = async () => {
    if (!selectedChapter.content) return;
    setIsProcessing(true);

    try {
      const response = await fetch("/api/audiobook/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: selectedChapter.content,
          voice: selectedVoice,
          chapterId: selectedChapter.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate audio");

      const { audioUrl } = await response.json();
      setSelectedChapter({ ...selectedChapter, audioUrl });
      updateChapter({ ...selectedChapter, audioUrl });
    } catch (error) {
      console.error("Error generating audio:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateChapter = (updatedChapter: Chapter) => {
    setChapters(chapters.map(ch => 
      ch.id === updatedChapter.id ? updatedChapter : ch
    ));
  };

  const addChapter = () => {
    const newChapter = {
      id: (chapters.length + 1).toString(),
      title: `Chapter ${chapters.length + 1}`,
      content: "",
    };
    setChapters([...chapters, newChapter]);
    setSelectedChapter(newChapter);
  };

  const handleAIAssist = async () => {
    if (!selectedChapter.content) return;
    setIsProcessing(true);

    try {
      const response = await fetch("/api/audiobook/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: selectedChapter.content }),
      });

      if (!response.ok) throw new Error("Failed to enhance content");

      const { enhancedContent } = await response.json();
      setSelectedChapter({ ...selectedChapter, content: enhancedContent });
      updateChapter({ ...selectedChapter, content: enhancedContent });
    } catch (error) {
      console.error("Error enhancing content:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateScript = async () => {
    if (!title || !description) return;
    
    setIsGeneratingScript(true);
    try {
      const response = await fetch("/api/audiobook/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          duration
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate script");
      }

      const { script } = await response.json();
      setGeneratedScript(script);
      
      // Update the content of the selected chapter with the generated script
      setSelectedChapter({ ...selectedChapter, content: script });
      updateChapter({ ...selectedChapter, content: script });
      
      toast({
        title: "Success",
        description: "Script generated successfully",
      });
    } catch (error) {
      console.error("Error generating script:", error);
      toast({
        title: "Error",
        description: "Failed to generate script",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const generateCover = async () => {
    if (!title) {
      toast({
        title: "Please enter a title first",
        description: "The title will help generate a relevant cover image",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGeneratingCover(true);

      const response = await fetch("/api/audiobook/generate-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: coverPrompt,
          title,
          description
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate cover image");
      }

      const { imageUrl } = await response.json();
      setCoverImage(imageUrl);

      toast({
        title: "Success",
        description: "Cover image generated successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate cover image",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!generatedScript) return;
    setIsSaving(true);
    
    try {
      const response = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "audiobook",
          title,
          description,
          prompt: `${title} - ${description}`,
          content: generatedScript
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save to library");
      }

      toast({
        title: "Success",
        description: "Saved to library successfully",
      });
    } catch (error) {
      console.error("Error saving to library:", error);
      toast({
        title: "Error",
        description: "Failed to save to library",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <Link href="/dashboard" className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition">
          <Book className="w-8 h-8" />
          <span className="text-xl font-semibold">CreativeAI Studio</span>
        </Link>
        <CreditDisplay cost={10} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Chapter List */}
        <div className="col-span-1 bg-gray-800/30 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Chapters</h3>
            <button
              onClick={addChapter}
              className="p-2 hover:bg-gray-700 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => setSelectedChapter(chapter)}
                className={`w-full text-left p-2 rounded-lg transition ${
                  selectedChapter.id === chapter.id
                    ? "bg-purple-600 text-white"
                    : "hover:bg-gray-700"
                }`}
              >
                {chapter.title}
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="col-span-3 space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <input
              type="text"
              value={selectedChapter.title}
              onChange={(e) => {
                const updated = { ...selectedChapter, title: e.target.value };
                setSelectedChapter(updated);
                updateChapter(updated);
              }}
              className="bg-gray-800/50 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="bg-gray-800/50 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {voiceOptions.map((voice) => (
                <option key={voice.value} value={voice.value}>
                  {voice.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.doc,.docx,.pdf"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-700 rounded-lg transition"
                title="Upload File"
              >
                <Upload className="w-5 h-5" />
              </button>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 hover:bg-gray-700 rounded-lg transition ${
                  isRecording ? "text-red-500" : ""
                }`}
                title={isRecording ? "Stop Recording" : "Start Recording"}
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={handleAIAssist}
                className="p-2 hover:bg-gray-700 rounded-lg transition"
                title="AI Enhance"
              >
                <Wand2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your audiobook title"
                    disabled={isProcessing || isGeneratingScript}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value as "short" | "medium" | "long")}
                    className="w-full bg-gray-800/50 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isProcessing || isGeneratingScript}
                  >
                    <option value="short">Short (10-15 mins)</option>
                    <option value="medium">Medium (20-30 mins)</option>
                    <option value="long">Long (45-60 mins)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a brief description or outline of your audiobook"
                  className="min-h-[100px]"
                  disabled={isProcessing || isGeneratingScript}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Cover Image</Label>
                  {coverImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCoverImage("");
                        setCoverPrompt("");
                      }}
                    >
                      Reset
                    </Button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Textarea
                    value={coverPrompt}
                    onChange={(e) => setCoverPrompt(e.target.value)}
                    placeholder="Enter a prompt for the cover image, or leave empty to auto-generate based on title and description"
                    className="min-h-[80px]"
                    disabled={isGeneratingCover}
                  />
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={generateCover}
                      disabled={!title || isGeneratingCover}
                    >
                      {isGeneratingCover ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Generating Cover...
                        </>
                      ) : (
                        'Generate Cover'
                      )}
                    </Button>
                  </div>

                  {coverImage && (
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-800">
                      <Image
                        src={coverImage}
                        alt="Book cover"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={generateScript}
                disabled={!title || !description || isGeneratingScript || isProcessing}
                className="w-full"
              >
                {isGeneratingScript ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Generating Script...
                  </>
                ) : (
                  'Generate Script'
                )}
              </Button>

              {generatedScript && (
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <pre className="whitespace-pre-wrap text-sm text-gray-300">
                      {generatedScript}
                    </pre>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveToLibrary}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-4 py-2 transition"
                      disabled={!generatedScript || isSaving}
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

            <textarea
              value={selectedChapter.content}
              onChange={(e) => {
                const updated = { ...selectedChapter, content: e.target.value };
                setSelectedChapter(updated);
                updateChapter(updated);
              }}
              className="w-full h-[400px] bg-gray-800/50 text-white rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your chapter content..."
            />

            <div className="flex justify-between mt-4">
              <div className="flex items-center gap-2">
                {selectedChapter.audioUrl && (
                  <button
                    onClick={() => {
                      if (audioRef.current) {
                        if (isPlaying) {
                          audioRef.current.pause();
                        } else {
                          audioRef.current.play();
                        }
                        setIsPlaying(!isPlaying);
                      }
                    }}
                    className="p-2 hover:bg-gray-700 rounded-lg transition"
                  >
                    {isPlaying ? (
                      <PauseCircle className="w-5 h-5" />
                    ) : (
                      <PlayCircle className="w-5 h-5" />
                    )}
                  </button>
                )}
                {selectedChapter.audioUrl && (
                  <audio ref={audioRef} src={selectedChapter.audioUrl} onEnded={() => setIsPlaying(false)} />
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={generateAudio}
                  disabled={isProcessing || !selectedChapter.content}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mic className="w-4 h-4" />
                  Generate Audio
                </button>
                <button
                  onClick={() => {/* Implement save functionality */}}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <Save className="w-4 h-4" />
                  Save Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
