import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Music Generation - CreativeAI Studio",
  description: "Create amazing music with AI",
};

export default function MusicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
