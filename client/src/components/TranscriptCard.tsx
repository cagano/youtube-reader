import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Maximize2, Minimize2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TranscriptCardProps {
  original: string;
  formatted?: string;
  isLoading: boolean;
  activeTab?: 'original' | 'formatted';
  onSwitchTab?: (tab: 'original' | 'formatted') => void;
}

interface TranscriptViewProps {
  content: string;
  isFullScreen?: boolean;
  onCopy: () => Promise<void>;
  onToggleFullScreen?: () => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

const TranscriptView: React.FC<TranscriptViewProps> = ({
  content,
  isFullScreen,
  onCopy,
  onToggleFullScreen,
  fontSize,
  onFontSizeChange
}) => (
  <div className="relative">
    <div className="absolute right-4 top-4 z-10 flex gap-2">
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-200"
                onClick={() => onFontSizeChange(fontSize - 1)}
                disabled={fontSize <= 12}
              >
                <span className="font-bold">A-</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Decrease font size</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <span className="text-sm font-medium text-muted-foreground">{fontSize}px</span>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-200"
                onClick={() => onFontSizeChange(fontSize + 1)}
                disabled={fontSize >= 24}
              >
                <span className="font-bold">A+</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Increase font size</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-200"
              onClick={onCopy}
            >
              <Copy className="w-4 h-4 mr-2" />
              <span>Copy</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy text to clipboard</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-200"
              onClick={onToggleFullScreen}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isFullScreen ? 'Exit full screen (Alt + F)' : 'Enter full screen (Alt + F)'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <ScrollArea className={`w-full rounded-lg border bg-muted/10 p-6 ${isFullScreen ? 'h-[calc(90vh-4rem)]' : 'h-[600px]'} transition-all duration-300 ease-out`}>
      <div className="prose prose-gray dark:prose-invert max-w-none" style={{ fontSize: `${fontSize}px` }}>
        <ReactMarkdown className="whitespace-pre-wrap break-words">
          {content}
        </ReactMarkdown>
      </div>
    </ScrollArea>
  </div>
);

export default function TranscriptCard({
  original,
  formatted,
  isLoading,
  activeTab = 'original',
  onSwitchTab,
}: TranscriptCardProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFullScreen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Automatically enter full-screen mode when formatted content becomes available
  useEffect(() => {
    if (formatted && !isLoading && activeTab === 'formatted') {
      setIsFullScreen(true);
      toast({
        title: "Full Screen Mode",
        description: "Press Alt + F or use the button to exit full screen",
        duration: 3000
      });
    }
  }, [formatted, isLoading, activeTab]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Text copied to clipboard",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text to clipboard",
        variant: "destructive"
      });
    }
  };

  const contentClass = "transition-all duration-500 ease-out animate-in fade-in-50 slide-in-from-left-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-8";
  const loadingClass = "animate-pulse transition-all duration-500 ease-out";
  const tabContentClass = [
    "animate-in fade-in-0 zoom-in-98",
    "data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:zoom-out-95 data-[state=inactive]:slide-out-to-left-8",
    "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-right-8 data-[state=active]:zoom-in-98",
    "transition-all duration-500 ease-in-out motion-reduce:transition-none",
    "transform-gpu backface-hidden"
  ].join(" ");

  return (
    <Card className="p-8 shadow-lg w-full max-w-none">
      <Tabs 
        value={activeTab}
        onValueChange={(value) => onSwitchTab?.(value as 'original' | 'formatted')}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="original" className="text-base">Original</TabsTrigger>
            <TabsTrigger value="formatted" className="text-base">Formatted</TabsTrigger>
          </TabsList>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Switch between original and processed versions (Alt + F for full screen)
          </p>
        </div>

        <TabsContent value="original" className={tabContentClass}>
          <div className={`relative ${contentClass}`}>
            <TranscriptView 
              content={original}
              isFullScreen={isFullScreen}
              onCopy={async () => {
                const button = document.activeElement as HTMLButtonElement;
                button?.blur();
                await handleCopy(original);
              }}
              onToggleFullScreen={() => setIsFullScreen(prev => !prev)}
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
            />
          </div>
        </TabsContent>

        <TabsContent value="formatted" className={tabContentClass}>
          <div className={`relative ${contentClass}`}>
            {isLoading ? (
              <div className={`space-y-4 ${loadingClass}`}>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[95%]" />
              </div>
            ) : formatted ? (
              <TranscriptView 
                content={formatted}
                isFullScreen={isFullScreen}
                onCopy={async () => {
                  const button = document.activeElement as HTMLButtonElement;
                  button?.blur();
                  await handleCopy(formatted);
                }}
                onToggleFullScreen={() => setIsFullScreen(prev => !prev)}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
              />
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Process the transcript to see the formatted version
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-4 overflow-hidden">
          <DialogTitle className="sr-only">Full Screen Transcript View</DialogTitle>
          <DialogDescription className="sr-only">
            Full screen view of the transcript with enhanced readability
          </DialogDescription>
          <Tabs 
            value={activeTab}
            onValueChange={(value) => onSwitchTab?.(value as 'original' | 'formatted')}
            className="w-full h-full flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="original" className="text-base">Original</TabsTrigger>
                <TabsTrigger value="formatted" className="text-base">Formatted</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="original" className={`${tabContentClass} flex-grow`}>
              <TranscriptView 
                content={original}
                isFullScreen={true}
                onCopy={async () => {
                  const button = document.activeElement as HTMLButtonElement;
                  button?.blur();
                  await handleCopy(original);
                }}
                onToggleFullScreen={() => setIsFullScreen(false)}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
              />
            </TabsContent>

            <TabsContent value="formatted" className={`${tabContentClass} flex-grow`}>
              {isLoading ? (
                <div className={`space-y-4 ${loadingClass}`}>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[95%]" />
                </div>
              ) : formatted ? (
                <TranscriptView 
                  content={formatted}
                  isFullScreen={true}
                  onCopy={async () => {
                    const button = document.activeElement as HTMLButtonElement;
                    button?.blur();
                    await handleCopy(formatted);
                  }}
                  onToggleFullScreen={() => setIsFullScreen(false)}
                  fontSize={fontSize}
                  onFontSizeChange={setFontSize}
                />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Process the transcript to see the formatted version
                </p>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </Card>
  );
}