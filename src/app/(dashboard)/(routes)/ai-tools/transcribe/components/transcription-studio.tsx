"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { Mic, Upload, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  file_url: z.string().optional(),
  file_string: z.string().optional(),
  file: z.string().optional(),
  group_segments: z.boolean().default(true),
  transcript_output_format: z.enum(["words_only", "segments_only", "both"]).default("both"),
  num_speakers: z.number().min(1).max(50).optional(),
  translate: z.boolean().default(false),
  language: z.string().optional(),
  prompt: z.string().optional(),
  offset_seconds: z.number().min(0).default(0)
});

export const TranscriptionStudio = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      group_segments: true,
      transcript_output_format: "both",
      translate: false,
      offset_seconds: 0
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setTranscriptionResult(null);

      const response = await axios.post("/api/audio/transcribe", values);
      setTranscriptionResult(response.data);
      
      toast({
        title: "Success",
        description: "Audio transcribed successfully",
      });

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveToLibrary = async () => {
    if (!transcriptionResult) return;

    try {
      setIsSaving(true);
      await axios.post("/api/library", {
        type: "audiobook",
        content: transcriptionResult,
        title: form.getValues("file") || form.getValues("file_url") || "Transcription",
      });

      toast({
        title: "Saved",
        description: "Transcription saved to library",
      });

      router.refresh();
    } catch (error) {
      console.error(error);
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
    <div className="p-4">
      <div className="mb-8 space-y-4">
        <h2 className="text-2xl font-bold text-center">
          Audio Transcription Studio
        </h2>
        <p className="text-muted-foreground text-sm text-center">
          Upload an audio file or provide a URL to get started
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="file_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audio URL</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Enter audio file URL"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transcript_output_format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Output Format</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select output format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="words_only">Words Only</SelectItem>
                        <SelectItem value="segments_only">Segments Only</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="num_speakers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Speakers</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={isLoading}
                      placeholder="Leave empty to autodetect"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="e.g., 'en' (leave empty to autodetect)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Vocabulary</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      placeholder="Enter names, acronyms, and loanwords"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="translate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Translate to English
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="group_segments"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Group Segments
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-center gap-4">
            <Button size="lg" type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mic className="w-4 h-4 mr-2" />
              )}
              Transcribe Audio
            </Button>

            {transcriptionResult && (
              <Button
                size="lg"
                type="button"
                variant="secondary"
                onClick={saveToLibrary}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save to Library
              </Button>
            )}
          </div>
        </form>
      </Form>

      {transcriptionResult && (
        <div className="mt-8 space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-lg font-semibold mb-2">Transcription Result</h3>
            <div className="space-y-4">
              {transcriptionResult.output?.segments?.map((segment: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Speaker {segment.speaker}</span>
                    <span>{Math.floor(segment.start)}s - {Math.floor(segment.end)}s</span>
                  </div>
                  <p className="text-sm">{segment.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
