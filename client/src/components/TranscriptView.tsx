import React, { useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import { useViewportSize } from "@/hooks/use-viewport-size";

interface TranscriptViewProps {
  content: string;
  isFullScreen?: boolean;
  onCopy: () => Promise<void>;
  onToggleFullScreen?: () => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export default function TranscriptView({
  content,
  isFullScreen,
  fontSize,
  onCopy,
  onToggleFullScreen,
  onFontSizeChange
}: TranscriptViewProps) {
  const { height: viewportHeight } = useViewportSize();
  
  const contentHeight = isFullScreen 
    ? `calc(${viewportHeight * 0.9}px - 8rem)`
    : `calc(${Math.min(Math.max(viewportHeight * 0.6, 400), 800)}px)`;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          onFontSizeChange(Math.min(fontSize + 1, 24));
        } else if (e.key === '-') {
          e.preventDefault();
          onFontSizeChange(Math.max(fontSize - 1, 12));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fontSize, onFontSizeChange]);

  return (
    <div className="relative">
      <ScrollArea 
        className="w-full rounded-lg border bg-muted/10 p-6 transition-all duration-300 ease-out" 
        style={{ height: contentHeight }}
      >
        <div className="prose prose-gray dark:prose-invert max-w-none" style={{ fontSize: `${fontSize}px` }}>
          <ReactMarkdown className="whitespace-pre-wrap break-words">
            {content}
          </ReactMarkdown>
        </div>
      </ScrollArea>
    </div>
  );
}
