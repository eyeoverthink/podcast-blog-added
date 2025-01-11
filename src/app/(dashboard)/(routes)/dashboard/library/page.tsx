"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface LibraryItem {
  id: string;
  type: string;
  url: string;
  title?: string;
  description?: string;
  prompt?: string;
  duration?: number;
  thumbnail?: string | null;
  createdAt: string;
}

const LibraryPage = () => {
  const { user } = useUser();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [selectedType, setSelectedType] = useState<"all" | "image" | "video" | "podcast" | "audiobook" | "blog" | "music" | "chat" | "transcription">("all");
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  const fetchItems = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/library`);
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data = await response.json();
      console.log("Raw fetched items:", data);
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to fetch library items");
    } finally {
      setLoading(false);
    }
  };

  const importLocalFiles = async () => {
    try {
      setImporting(true);
      const response = await fetch('/api/library/import', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Import failed');
      }
      const data = await response.json();
      toast.success(data.message);
      fetchItems(); // Refresh the list after import
    } catch (error) {
      console.error("Error importing files:", error);
      toast.error("Failed to import local files");
    } finally {
      setImporting(false);
    }
  };

  const handleItemClick = async (item: LibraryItem) => {
    if (item.type === "audiobook") {
      try {
        const response = await fetch(item.url);
        if (!response.ok) throw new Error("Failed to fetch transcription");
        const data = await response.json();
        setSelectedItem(item);
        toast.success("Loaded transcription");
      } catch (error) {
        console.error("Error loading transcription:", error);
        toast.error("Failed to load transcription");
      }
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchItems();
    }
  }, [user?.id]);

  const filteredItems = items.filter(item => 
    selectedType === "all" || item.type === selectedType
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Your Library</h1>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedType === "all" ? "default" : "outline"}
              onClick={() => setSelectedType("all")}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={selectedType === "image" ? "default" : "outline"}
              onClick={() => setSelectedType("image")}
            >
              Images
            </Button>
            <Button
              size="sm"
              variant={selectedType === "video" ? "default" : "outline"}
              onClick={() => setSelectedType("video")}
            >
              Videos
            </Button>
            <Button
              size="sm"
              variant={selectedType === "audiobook" ? "default" : "outline"}
              onClick={() => setSelectedType("audiobook")}
            >
              Audiobooks
            </Button>
            <Button
              size="sm"
              variant={selectedType === "podcast" ? "default" : "outline"}
              onClick={() => setSelectedType("podcast")}
            >
              Podcasts
            </Button>
            <Button
              size="sm"
              variant={selectedType === "blog" ? "default" : "outline"}
              onClick={() => setSelectedType("blog")}
            >
              Blogs
            </Button>
            <Button
              size="sm"
              variant={selectedType === "music" ? "default" : "outline"}
              onClick={() => setSelectedType("music")}
            >
              Music
            </Button>
            <Button
              size="sm"
              variant={selectedType === "chat" ? "default" : "outline"}
              onClick={() => setSelectedType("chat")}
            >
              Chats
            </Button>
            <Button
              size="sm"
              variant={selectedType === "transcription" ? "default" : "outline"}
              onClick={() => setSelectedType("transcription")}
            >
              Transcriptions
            </Button>
          </div>
        </div>
        <Button
          onClick={importLocalFiles}
          disabled={importing}
          variant="default"
          size="sm"
        >
          {importing ? "Importing..." : "Import Local Files"}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No items found in your library
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="group bg-card rounded-lg overflow-hidden border border-border transition-all duration-300 hover:shadow-lg hover:border-primary/50 cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              <div className="aspect-video relative">
                {item.type === "image" ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={item.url}
                      alt={item.title || "Image"}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                  </div>
                ) : item.type === "video" ? (
                  <video
                    src={item.url}
                    controls
                    className="w-full h-full"
                  />
                ) : item.type === "podcast" ? (
                  <div className="relative flex flex-col w-full h-full bg-muted rounded-lg overflow-hidden">
                    <div className="relative w-full h-48">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title || "Podcast thumbnail"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-500 to-pink-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-1">
                        {item.title || "Untitled Podcast"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {item.description || "No description available"}
                      </p>
                      <div className="mt-auto">
                        <audio
                          controls
                          className="w-full focus:outline-none"
                          style={{
                            height: '36px',
                            borderRadius: '8px',
                          }}
                        >
                          <source src={item.url} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                  {item.type}
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                  {item.title || "Untitled"}
                </h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <time dateTime={item.createdAt}>
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </time>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedItem.title}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedItem(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <div className="space-y-4">
              {selectedItem.description && (
                <p className="text-muted-foreground">{selectedItem.description}</p>
              )}
              <div className="space-y-2">
                {/* Add transcription content here */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
