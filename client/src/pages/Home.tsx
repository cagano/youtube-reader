import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import TranscriptCard from "../components/TranscriptCard";
import VideoMetadata from "../components/VideoMetadata";
import FormatTemplateSelect from "../components/FormatTemplateSelect";
import CustomFormatInput from "../components/CustomFormatInput";
import { fetchTranscript, processTranscript } from "../lib/api";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const { toast } = useToast();

  const getVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const { data: transcript, refetch: refetchTranscript, error: transcriptError } = useQuery({
    queryKey: ["transcript", videoUrl],
    queryFn: async () => {
      const videoId = getVideoId(videoUrl);
      if (!videoId) throw new Error("Invalid YouTube URL");
      try {
        return await fetchTranscript(videoId);
      } catch (error: any) {
        throw new Error(error.response?.data?.error || error.message || "Failed to fetch transcript");
      }
    },
    enabled: false
  });

  const processMutation = useMutation({
    mutationFn: (data: { transcript: string, templateId?: number, customPrompt?: string }) =>
      processTranscript(data),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Transcript processed successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process transcript",
        variant: "destructive"
      });
    }
  });

  const handleFetchTranscript = async () => {
    try {
      if (!videoUrl.trim()) {
        toast({
          title: "Error",
          description: "Please enter a valid YouTube URL",
          variant: "destructive"
        });
        return;
      }
      await refetchTranscript();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch transcript",
        variant: "destructive"
      });
    }
  };

  const handleProcessTranscript = () => {
    if (!transcript) return;
    
    processMutation.mutate({
      transcript,
      templateId: selectedTemplateId || undefined,
      customPrompt: customPrompt || undefined
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="space-y-2 text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          YouTube Transcript Processor
        </h1>
        <p className="text-muted-foreground">
          Transform YouTube video transcripts with AI-powered processing
        </p>
      </div>

      <Card className="p-8 mb-12 shadow-lg">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Enter YouTube video URL"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleFetchTranscript}
              size="lg"
              className="w-full sm:w-auto"
            >
              Fetch Transcript
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Paste a YouTube URL to get started with transcript processing
          </p>
        </div>
      </Card>

      {transcript && (
        <div className="animate-in fade-in-0 slide-in-from-bottom-8 duration-700 ease-in-out">
          <VideoMetadata videoUrl={videoUrl} />
          
          <div className="grid gap-6 mb-8 transition-all duration-500 animate-in fade-in-0 slide-in-from-bottom-4 ease-in-out">
            <FormatTemplateSelect
              value={selectedTemplateId}
              onChange={setSelectedTemplateId}
            />
            
            <CustomFormatInput
              value={customPrompt}
              onChange={setCustomPrompt}
              disabled={!!selectedTemplateId}
            />
            
            <Button
              onClick={handleProcessTranscript}
              disabled={processMutation.isPending}
              className="w-full"
            >
              Process Transcript
            </Button>
          </div>

          <TranscriptCard
            original={transcript}
            formatted={processMutation.data?.formattedTranscript}
            isLoading={processMutation.isPending}
          />
        </div>
      )}
    </div>
  );
}
