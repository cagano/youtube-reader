import { useState, useEffect, useMemo } from "react";
import { useViewportSize } from "@/hooks/use-viewport-size";
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
  fontSize,
  onCopy,
  onToggleFullScreen,
  onFontSizeChange,
}) => {
  const { height: viewportHeight } = useViewportSize();
  
  const contentHeight = useMemo(() => {
    if (isFullScreen) {
      return `calc(${viewportHeight * 0.9}px - 8rem)`;
    }
    return `calc(${Math.min(Math.max(viewportHeight * 0.6, 400), 800)}px)`;
  }, [viewportHeight, isFullScreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          handleFontSizeChange(fontSize + 1);
        } else if (e.key === '-') {
          e.preventDefault();
          handleFontSizeChange(fontSize - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fontSize]);

  return (
    <div className="relative">
      <ScrollArea className={`w-full rounded-lg border bg-muted/10 p-6 transition-all duration-300 ease-out`} style={{ height: contentHeight }}>
        <div className="prose prose-gray dark:prose-invert max-w-none" style={{ fontSize: `${fontSize}px` }}>
        <ReactMarkdown className="whitespace-pre-wrap break-words">
          {content}
        </ReactMarkdown>
      </div>
    </ScrollArea>
  </div>
  );
};

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
      const button = document.activeElement as HTMLButtonElement;
      button?.blur();
      toast({
        title: "Success",
        description: "Text copied to clipboard",
        duration: 2000
      });
      return true;
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: "Error",
        description: "Failed to copy text. Please try again or copy manually.",
        variant: "destructive",
        duration: 3000
      });
      return false;
    }
  };

  const handleCopyWithFeedback = async (text: string) => {
    const success = await handleCopy(text);
    if (success) {
      // Visual feedback animation
      const copyButton = document.querySelector('[data-copy-button]');
      if (copyButton) {
        copyButton.classList.add('copy-success');
        setTimeout(() => copyButton.classList.remove('copy-success'), 1000);
      }
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

  const handleCopyClick = async () => {
    const text = activeTab === 'original' ? original : formatted;
    if (text) {
      const button = document.activeElement as HTMLButtonElement;
      button?.blur();
      await handleCopy(text);
    }
  };

  const handleFontSizeChange = (newSize: number) => {
    if (newSize >= 12 && newSize <= 24) {
      setFontSize(newSize);
    }
  };

  const handleToggleFullScreen = () => {
    setIsFullScreen(prev => !prev);
  };

  return (
    <Card className="p-8 shadow-lg w-full max-w-none">
      <Tabs 
        value={activeTab}
        onValueChange={(value) => onSwitchTab?.(value as 'original' | 'formatted')}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <TabsList>
              <TabsTrigger value="original" className="text-base">Original</TabsTrigger>
              <TabsTrigger value="formatted" className="text-base">Formatted</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-200"
                      onClick={() => handleFontSizeChange(fontSize - 1)}
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
                      onClick={() => handleFontSizeChange(fontSize + 1)}
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
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-200"
                    onClick={handleCopyClick}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Copy</span>
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
                    onClick={handleToggleFullScreen}
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
        <DialogContent className="max-w-[95vw] w-full h-[95vh] max-h-[95vh] p-6 overflow-hidden flex flex-col">
          <DialogTitle className="sr-only">Full Screen Transcript View</DialogTitle>
          <DialogDescription className="sr-only">
            Full screen view of the transcript with enhanced readability
          </DialogDescription>
          <Tabs 
            value={activeTab}
            onValueChange={(value) => onSwitchTab?.(value as 'original' | 'formatted')}
            className="w-full h-full flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <TabsList>
                  <TabsTrigger value="original" className="text-base">Original</TabsTrigger>
                  <TabsTrigger value="formatted" className="text-base">Formatted</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-200"
                          onClick={() => handleFontSizeChange(fontSize - 1)}
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
                          onClick={() => handleFontSizeChange(fontSize + 1)}
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
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-200"
                        onClick={handleCopyClick}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Copy</span>
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
                        onClick={() => setIsFullScreen(false)}
                      >
                        <Minimize2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Exit full screen (Alt + F)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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