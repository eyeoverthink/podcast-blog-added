"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import ReactMarkdown from 'react-markdown';
import { format } from "date-fns";

interface Blog {
  id: string;
  title: string;
  description: string;
  script: string; // Full blog content
  thumbnail: string | null;
  createdAt: Date;
}

export default function BlogLibrary() {
  const { user } = useUser();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("/api/blog/list");
        if (!response.ok) throw new Error("Failed to fetch blogs");
        const data = await response.json();
        setBlogs(data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Blog Posts</h1>
        <button
          onClick={() => window.location.href = "/ai-tools/blog"}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Pencil className="w-4 h-4" />
          Create New Blog
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Card key={blog.id} className="overflow-hidden">
            {blog.thumbnail && (
              <div className="relative aspect-video">
                <img
                  src={blog.thumbnail}
                  alt={blog.title}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{blog.title}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {format(new Date(blog.createdAt), "MMMM d, yyyy")}
              </p>
              <div className="prose prose-sm max-h-32 overflow-hidden mb-4">
                <ReactMarkdown>{blog.description}</ReactMarkdown>
              </div>
              <button
                onClick={() => {/* Add view/edit functionality */}}
                className="text-primary hover:underline text-sm"
              >
                Read More
              </button>
            </div>
          </Card>
        ))}
      </div>

      {blogs.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No blog posts yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
}
