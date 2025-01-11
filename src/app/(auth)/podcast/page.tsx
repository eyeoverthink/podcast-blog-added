import { UserButton } from "@clerk/nextjs";
import PodcastGenerator from "@/components/podcast/PodcastGenerator";

export default function PodcastPage() {
  return (
    <div className="relative">
      <div className="absolute top-4 right-4">
        <UserButton afterSignOutUrl="/"/>
      </div>
      <PodcastGenerator />
    </div>
  );
}
