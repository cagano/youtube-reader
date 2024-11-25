import { useState, useCallback, useEffect } from "react";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import TranscriptCard from "../components/TranscriptCard";
import VideoMetadata from "../components/VideoMetadata";
import CustomFormatInput from "../components/CustomFormatInput";
import FormatTemplateSelect from "../components/FormatTemplateSelect";
import { fetchTranscript, processTranscript } from "../lib/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'original' | 'formatted'>('original');
  const [videoUrl, setVideoUrl] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
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

  const handleSwitchTab = useCallback((tab: 'original' | 'formatted') => {
    setActiveTab(tab);
  }, []);

  // Process transcript automatically when template is selected or custom prompt changes
  useEffect(() => {
    if (!transcript) return;
    
    // If template is selected, process immediately
    if (selectedTemplateId) {
      processMutation.mutate({
        transcript,
        templateId: selectedTemplateId
      });
      // Switch to formatted tab when processing starts
      setActiveTab('formatted');
    }
    // If custom prompt is provided and no template is selected, process with delay
    else if (customPrompt.trim()) {
      const timer = setTimeout(() => {
        processMutation.mutate({
          transcript,
          customPrompt
        });
        // Switch to formatted tab when processing starts
        setActiveTab('formatted');
      }, 1000); // Debounce custom prompt processing
      
      return () => clearTimeout(timer);
    }
  }, [transcript, selectedTemplateId, customPrompt]);

  useKeyboardShortcuts({
    onFetchTranscript: handleFetchTranscript,
    onSwitchTab: handleSwitchTab,
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex justify-end mb-6">
        <ThemeSwitcher />
      </div>
      <div className="space-y-2 text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          YouTube Reader
        </h1>
        <p className="text-muted-foreground">
          Your AI-powered companion for enhanced video content understanding
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleFetchTranscript}
                    size="lg"
                    className="w-full sm:w-auto transition-all duration-300 ease-in-out"
                    disabled={!videoUrl.trim() || transcript !== undefined}
                  >
                    <span className="flex items-center gap-2">
                      {transcript === undefined ? (
                        <>
                          {transcriptError ? (
                            "Try Again"
                          ) : (
                            <>
                              {!videoUrl.trim() ? (
                                "Enter URL First"
                              ) : (
                                <>
                                  {processMutation.isPending && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  )}
                                  Fetch Transcript
                                </>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      )}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Press Ctrl/Cmd + Enter</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
            <div className="space-y-6">
              <FormatTemplateSelect
                value={selectedTemplateId}
                onChange={setSelectedTemplateId}
                transcript={transcript}
              />
              
              {!selectedTemplateId && (
                <CustomFormatInput
                  value={customPrompt}
                  onChange={setCustomPrompt}
                />
              )}
            </div>
            
            
          </div>

          <TranscriptCard
            original={transcript}
            formatted={processMutation.data?.formattedTranscript}
            isLoading={processMutation.isPending}
            activeTab={activeTab}
            onSwitchTab={handleSwitchTab}
          />
        </div>
      )}
    </div>
  );
}
