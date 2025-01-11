'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface GenerateThumbnailProps {
  image: string
  imagePrompt: string
  setImagePrompt: (prompt: string) => void
  setImage: (url: string) => void
}

const GenerateThumbnail = ({
  image,
  imagePrompt,
  setImagePrompt,
  setImage,
}: GenerateThumbnailProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsLoading(true)

      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          input: {
            prompt: imagePrompt,
            negative_prompt: "blurry, bad quality, distorted",
            width: 768,
            height: 768,
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate image')
      }

      const prediction = await response.json()
      const imageUrl = prediction.output[0]
      setImage(imageUrl)

      toast({
        title: "Success",
        description: "Thumbnail generated successfully",
      })

    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to generate thumbnail",
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
          Thumbnail
        </Label>
        <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-4">
          <div className="space-y-2">
            <Label>Prompt</Label>
            <Input
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="Enter a prompt to generate a thumbnail"
              disabled={isLoading}
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

      {image && (
        <div className="space-y-2">
          <Label>Generated Thumbnail</Label>
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src={image}
              alt="Generated thumbnail"
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default GenerateThumbnail
