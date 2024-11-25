import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Maximize2, Minimize2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent } from "./ui/dialog";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";

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
        <Button
          variant="outline"
          size="sm"
          className="opacity-90 hover:opacity-100 transition-opacity"
          onClick={() => onFontSizeChange(fontSize - 1)}
          disabled={fontSize <= 12}
        >
          <span className="font-bold">A-</span>
          <span className="sr-only">Decrease font size</span>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">{fontSize}px</span>
        <Button
          variant="outline"
          size="sm"
          className="opacity-90 hover:opacity-100 transition-opacity"
          onClick={() => onFontSizeChange(fontSize + 1)}
          disabled={fontSize >= 24}
        >
          <span className="font-bold">A+</span>
          <span className="sr-only">Increase font size</span>
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="opacity-90 hover:opacity-100 transition-opacity"
        onClick={onCopy}
      >
        <Copy className="w-4 h-4 mr-2" />
        <span>Copy</span>
        <span className="sr-only">Copy text</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="opacity-90 hover:opacity-100 transition-opacity"
        onClick={onToggleFullScreen}
      >
        {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        <span className="sr-only">Toggle full screen</span>
      </Button>
    </div>
    <ScrollArea className={`w-full rounded-lg border bg-muted/10 p-6 ${isFullScreen ? 'h-[90vh]' : 'h-[600px]'}`}>
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

  const contentClass = "transition-all duration-500 ease-in-out animate-in fade-in-0 slide-in-from-left-4";
  const loadingClass = "animate-pulse transition-all duration-500 ease-in-out";
  const tabContentClass = "animate-in fade-in-0 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=active]:slide-in-from-right-1";

  return (
    <Card className="p-8 shadow-lg">
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
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-6">
          <Tabs 
            value={activeTab}
            onValueChange={(value) => onSwitchTab?.(value as 'original' | 'formatted')}
            className="w-full h-full flex flex-col"
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