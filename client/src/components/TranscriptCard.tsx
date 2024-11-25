import { useState, useEffect, useMemo } from "react";
import { useViewportSize } from "@/hooks/use-viewport-size";
import ReactMarkdown from "react-markdown";
import { Copy, Maximize2, Minimize2, Download, FileDown } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { jsPDF } from "jspdf";
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
  videoTitle?: string;
}

interface ExportProgress {
  status: 'idle' | 'processing' | 'success' | 'error';
  message: string;
}

type ExportFormat = 'pdf' | 'markdown' | 'text';

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
          onFontSizeChange(fontSize + 1);
        } else if (e.key === '-') {
          e.preventDefault();
          onFontSizeChange(fontSize - 1);
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

  type ExportFormat = 'pdf' | 'markdown' | 'text';

  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    status: 'idle',
    message: ''
  });

  const handleExport = async (format: ExportFormat) => {
    const text = activeTab === 'original' ? original : formatted;
    if (!text) {
      toast({
        title: "Error",
        description: "No content available to export",
        variant: "destructive"
      });
      return;
    }

    setExportProgress({ status: 'processing', message: `Preparing ${format.toUpperCase()} export...` });
    const timestamp = new Date().toISOString().split('T')[0];
    const title = videoTitle || 'transcript';
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    try {
      switch (format) {
        case 'pdf': {
          setExportProgress({ status: 'processing', message: 'Generating PDF...' });
          const doc = new jsPDF();
          
          // Add title and metadata
          doc.setFontSize(16);
          doc.text(title, 20, 20);
          
          // Add metadata
          doc.setFontSize(12);
          doc.text(`Exported on: ${timestamp}`, 20, 30);
          doc.text(`Source: ${activeTab === 'original' ? 'Original' : 'Formatted'} Transcript`, 20, 40);
          
          // Set document properties
          doc.setProperties({
            title: title,
            subject: `YouTube Transcript - ${activeTab === 'original' ? 'Original' : 'Formatted'}`,
            creator: 'YouTube Reader',
            author: 'YouTube Reader',
            keywords: 'transcript,youtube,content'
          });
          
          // Add content with word wrap
          doc.setFontSize(12);
          const textLines = doc.splitTextToSize(text, 170);
          doc.text(textLines, 20, 50);
          
          // Save PDF
          doc.save(`${sanitizedTitle}_${timestamp}.pdf`);
          setExportProgress({ status: 'success', message: 'PDF exported successfully!' });
          break;
        }
        case 'markdown': {
          setExportProgress({ status: 'processing', message: 'Generating Markdown...' });
          const mdContent = `---
title: ${title}
date: ${timestamp}
type: ${activeTab === 'original' ? 'Original' : 'Formatted'} Transcript
source: YouTube Reader
---

# ${title}

_Generated on: ${timestamp}_

## Content

${text}`;
          const blob = new Blob([mdContent], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${sanitizedTitle}_${timestamp}.md`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setExportProgress({ status: 'success', message: 'Markdown exported successfully!' });
          break;
        }
        case 'text': {
          setExportProgress({ status: 'processing', message: 'Generating text file...' });
          const txtContent = `Title: ${title}
Date: ${timestamp}
Type: ${activeTab === 'original' ? 'Original' : 'Formatted'} Transcript
Source: YouTube Reader

Content:
--------

${text}`;
          const blob = new Blob([txtContent], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${sanitizedTitle}_${timestamp}.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setExportProgress({ status: 'success', message: 'Text file exported successfully!' });
          break;
        }
      }
      
      toast({
        title: "Success",
        description: exportProgress.message,
        duration: 3000
      });
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setExportProgress({ 
        status: 'error', 
        message: `Failed to export as ${format.toUpperCase()}: ${errorMessage}` 
      });
      toast({
        title: "Error",
        description: exportProgress.message,
        variant: "destructive",
        duration: 4000
      });
    } finally {
      // Reset progress after a delay
      setTimeout(() => {
        setExportProgress({ status: 'idle', message: '' });
      }, 3000);
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

              <DropdownMenu.Root>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenu.Trigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-200"
                        >
                          <FileDown className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Export</span>
                        </Button>
                      </DropdownMenu.Trigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export transcript</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                    <DropdownMenu.Item
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      onClick={() => handleExport('pdf')}
                    >
                      Export as PDF
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      onClick={() => handleExport('markdown')}
                    >
                      Export as Markdown
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      onClick={() => handleExport('text')}
                    >
                      Export as Text
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
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