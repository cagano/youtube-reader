import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TranscriptCardProps {
  original: string;
  formatted?: string;
  isLoading: boolean;
}

export default function TranscriptCard({
  original,
  formatted,
  isLoading
}: TranscriptCardProps) {
  const { toast } = useToast();

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard"
    });
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="original">
        <TabsList className="mb-4">
          <TabsTrigger value="original">Original</TabsTrigger>
          <TabsTrigger value="formatted">Formatted</TabsTrigger>
        </TabsList>

        <TabsContent value="original">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="absolute right-2 top-2"
              onClick={() => handleCopy(original)}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              <div className="prose max-w-none">
                {original}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="formatted">
          <div className="relative">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[95%]" />
              </div>
            ) : formatted ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => handleCopy(formatted)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                  <div className="prose max-w-none">
                    {formatted}
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
