import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Chat - CreativeAI Studio",
  description: "Chat with our advanced AI assistant",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
