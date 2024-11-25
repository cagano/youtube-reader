import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface VideoMetadataProps {
  videoUrl: string;
}

export default function VideoMetadata({ videoUrl }: VideoMetadataProps) {
  const { data: metadata } = useQuery({
    queryKey: ["metadata", videoUrl],
    queryFn: async () => {
      const videoId = videoUrl.split("v=")[1];
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${process.env.YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      return data.items[0];
    },
    enabled: !!videoUrl
  });

  if (!metadata) return null;

  return (
    <Card className="p-4 mb-6 flex items-center gap-4">
      <img
        src={metadata.snippet.thumbnails.default.url}
        alt={metadata.snippet.title}
        className="w-24 h-24 object-cover rounded"
      />
      <div>
        <h2 className="text-xl font-semibold">{metadata.snippet.title}</h2>
        <p className="text-sm text-muted-foreground">
          Duration: {metadata.contentDetails.duration}
        </p>
      </div>
    </Card>
  );
}
