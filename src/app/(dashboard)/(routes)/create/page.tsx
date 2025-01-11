'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import GeneratePodcast from "@/components/GeneratePodcast"
import GenerateThumbnail from "@/components/GenerateThumbnail"
import { Loader } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

const voiceCategories = ['male', 'female']

const formSchema = z.object({
  podcastTitle: z.string().min(2),
  podcastDescription: z.string().min(2),
})

const CreatePodcast = () => {
  const router = useRouter()
  const [imagePrompt, setImagePrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [audioDuration, setAudioDuration] = useState(0)
  const [voiceType, setVoiceType] = useState<string | null>(null)
  const [voicePrompt, setVoicePrompt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      podcastTitle: "",
      podcastDescription: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

      if (!imageUrl) {
        toast({
          title: "Please generate a thumbnail first",
          variant: "destructive",
        })
        return
      }

      if (!audioUrl) {
        toast({
          title: "Please generate audio first",
          variant: "destructive",
        })
        return
      }

      // Save podcast data to your backend here
      const response = await fetch('/api/podcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.podcastTitle,
          description: values.podcastDescription,
          imageUrl,
          audioUrl,
          duration: audioDuration
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save podcast')
      }

      toast({
        title: "Success",
        description: "Your podcast has been created",
      })

      router.push("/")
      router.refresh()

    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto flex md:items-center md:justify-center h-full p-6">
      <div>
        <h1 className="text-3xl font-bold text-center mb-10">
          Create a Podcast
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
            <div className="space-y-2 w-full col-span-2">
              <FormField
                name="podcastTitle"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Podcast Title</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="Enter podcast title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2 w-full">
              <FormField
                name="podcastDescription"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Podcast Description</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isSubmitting}
                        placeholder="Enter podcast description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2 w-full">
              <div>
                <Label>
                  Select AI Voice
                </Label>

                <select 
                  className="text-16 w-full border-none bg-black-1 text-gray-1 focus-visible:ring-offset-orange-1 p-2 rounded-md"
                  onChange={(e) => setVoiceType(e.target.value)}
                >
                  <option value="">Select voice type</option>
                  {voiceCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <GeneratePodcast 
                voiceType={voiceType || ''}
                audio={audioUrl}
                voicePrompt={voicePrompt}
                setVoicePrompt={setVoicePrompt}
                setAudio={setAudioUrl}
                setAudioDuration={setAudioDuration}
              />
            </div>

            <div className="space-y-2 w-full">
              <GenerateThumbnail
                imagePrompt={imagePrompt}
                image={imageUrl}
                setImagePrompt={setImagePrompt}
                setImage={setImageUrl}
              />
            </div>

            <div className="w-full flex justify-center">
              <Button size="lg" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default CreatePodcast
