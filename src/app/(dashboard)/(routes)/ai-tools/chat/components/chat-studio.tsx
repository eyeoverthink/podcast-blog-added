"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Loader, Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const ChatStudio = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    try {
      setIsLoading(true);
      const userMessage: Message = { role: "user", content: prompt };
      setMessages((prev) => [...prev, userMessage]);
      setPrompt("");

      const response = await fetch("/api/chat/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate response");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="px-4 lg:px-8">
      <div className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid gap-4">
        <div className="h-[600px] flex flex-col gap-4">
          <ScrollArea className="flex-grow rounded-lg border p-4 bg-secondary/10">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 mb-4 rounded-lg",
                  message.role === "user"
                    ? "bg-violet-500/10 ml-12"
                    : "bg-secondary/50 mr-12"
                )}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={cn(
                      "p-2 w-8 h-8 rounded-lg flex items-center justify-center",
                      message.role === "user"
                        ? "bg-violet-500"
                        : "bg-secondary/50"
                    )}
                  >
                    {message.role === "user" ? (
                      <MessageSquare className="w-4 h-4 text-white" />
                    ) : (
                      <MessageSquare className="w-4 h-4" />
                    )}
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>
          <form onSubmit={onSubmit} className="flex items-center gap-2">
            <Textarea
              placeholder="Ask anything about your content..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="resize-none"
              rows={3}
            />
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={isLoading || !prompt.trim()}>
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={clearChat}
                disabled={messages.length === 0}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
