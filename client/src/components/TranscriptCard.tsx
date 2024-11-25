import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';

interface TranscriptCardProps {
  original: string;
  formatted?: string;
  isLoading: boolean;
  activeTab?: 'original' | 'formatted';
  onSwitchTab?: (tab: 'original' | 'formatted') => void;
}

export default function TranscriptCard({
  original,
  formatted,
  isLoading,
  activeTab = 'original',
  onSwitchTab
}: TranscriptCardProps) {
  const { toast } = useToast();

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
            Switch between original and processed versions
          </p>
        </div>

        <TabsContent value="original" className={tabContentClass}>
          <div className="relative animate-in fade-in-0 slide-in-from-left-1">
            <Button
              variant="outline"
              size="sm"
              className="absolute right-4 top-4 z-10 opacity-90 hover:opacity-100 transition-opacity"
              onClick={async () => {
                const button = document.activeElement as HTMLButtonElement;
                button?.blur();
                await handleCopy(original);
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              <span>Copy</span>
              <span className="sr-only">Copy original text</span>
            </Button>
            <ScrollArea className="h-[600px] w-full rounded-lg border bg-muted/10 p-6">
              <div className={`prose prose-gray dark:prose-invert max-w-none ${contentClass}`}>
                <ReactMarkdown className="whitespace-pre-wrap break-words">
                  {original}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="formatted" className={tabContentClass}>
          <div className="relative animate-in fade-in-0 slide-in-from-right-1">
            {isLoading ? (
              <div className={`space-y-4 ${loadingClass}`}>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[95%]" />
              </div>
            ) : formatted ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-4 top-4 z-10 opacity-90 hover:opacity-100 transition-opacity"
                  onClick={async () => {
                    const button = document.activeElement as HTMLButtonElement;
                    button?.blur();
                    await handleCopy(formatted);
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  <span>Copy</span>
                  <span className="sr-only">Copy formatted text</span>
                </Button>
                <ScrollArea className="h-[600px] w-full rounded-lg border bg-muted/10 p-6">
                  <div className={`prose prose-gray dark:prose-invert max-w-none ${contentClass}`}>
                    <ReactMarkdown className="whitespace-pre-wrap break-words">
                      {formatted}
                    </ReactMarkdown>
                  </div>
                </ScrollArea>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Process the transcript to see the formatted version
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
