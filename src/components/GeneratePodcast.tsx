'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader } from "lucide-react"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"

interface GeneratePodcastProps {
  voiceType: string
  audio: string
  voicePrompt: string
  setVoicePrompt: (prompt: string) => void
  setAudio: (url: string) => void
  setAudioDuration: (duration: number) => void
}

const GeneratePodcast = ({ 
  voiceType,
  audio,
  voicePrompt,
  setVoicePrompt,
  setAudio,
  setAudioDuration
}: GeneratePodcastProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsLoading(true)

      if (!voiceType) {
        toast({
          title: "Please select a voice type",
          variant: "destructive",
        })
        return
      }

      // Step 1: Generate initial audio from text using Bark
      const ttsResponse = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait'
        },
        body: JSON.stringify({
          version: "b76242b40d67c76ab6742e987628478ed2fb916b6f3f5258e16164c2d344752d",
          input: {
            text: voicePrompt,
            voice_preset: voiceType === "male" ? "v2/en_speaker_6" : "v2/en_speaker_9"
          }
        })
      })

      if (!ttsResponse.ok) {
        throw new Error('Failed to generate initial audio')
      }

      const ttsData = await ttsResponse.json()
      const initialAudioUrl = ttsData.output

      if (!initialAudioUrl) {
        throw new Error('No audio URL in TTS response')
      }

      // Step 2: Use the generated audio for podcast creation
      const podcastResponse = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait'
        },
        body: JSON.stringify({
          version: "cbd15da9f839c5f932742f86ce7def3a03c22e2b4171d42823e83e314547003f",
          input: {
            file: initialAudioUrl,
            prompt: voicePrompt,
            file_url: "",
            language: "en",
            num_speakers: 2
          }
        })
      })

      if (!podcastResponse.ok) {
        throw new Error('Failed to generate podcast')
      }

      const podcastData = await podcastResponse.json()
      
      if (podcastData.output && podcastData.output.file) {
        setAudio(podcastData.output.file)
        
        // Create an audio element to get duration
        const audio = new Audio(podcastData.output.file)
        audio.addEventListener('loadedmetadata', () => {
          setAudioDuration(audio.duration)
        })

        toast({
          title: "Success",
          description: "Podcast generated successfully",
        })
      } else {
        throw new Error('No audio URL in podcast response')
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to generate podcast",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <Label>
          Podcast Script
        </Label>
        <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-4">
          <div className="space-y-2">
            <Label>Script</Label>
            <Textarea
              value={voicePrompt}
              onChange={(e) => setVoicePrompt(e.target.value)}
              placeholder="Enter your podcast script"
              disabled={isLoading}
              className="min-h-[200px] resize-none"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </Button>
          </div>
        </form>
      </div>

      {audio && (
        <div className="space-y-2">
          <Label>Generated Podcast</Label>
          <audio controls className="w-full">
            <source src={audio} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  )
}

export default GeneratePodcast
