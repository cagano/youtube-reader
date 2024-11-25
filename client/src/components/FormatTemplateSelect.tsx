import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { getSuggestedTemplates } from '../lib/api';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  FileText, 
  List, 
  MessageSquare, 
  Book, 
  HelpCircle,
  Target
} from 'lucide-react';

interface FormatTemplateSelectProps {
  value: number | null;
  onChange: (value: number | null) => void;
  transcript?: string;
}

interface Template {
  id: number;
  name: string;
  description: string;
  score?: number;
}

// Map template names to icons
const templateIcons: Record<string, React.ReactNode> = {
  'Summary': <FileText className="w-4 h-4" />,
  'Q&A Format': <MessageSquare className="w-4 h-4" />,
  'Chapter Outline': <List className="w-4 h-4" />,
  'Study Notes': <Book className="w-4 h-4" />,
  'Custom Template': <Target className="w-4 h-4" />,
};

export default function FormatTemplateSelect({
  value,
  onChange,
  transcript
}: FormatTemplateSelectProps & { transcript?: string }) {
  const { data: templates } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const response = await fetch("/api/templates");
      return response.json();
    }
  });

  const { data: suggestions } = useQuery({
    queryKey: ["template-suggestions", transcript],
    queryFn: async () => {
      if (!transcript) return [];
      return getSuggestedTemplates(transcript);
    },
    enabled: !!transcript
  });

  const remainingTemplates = React.useMemo(() => {
    if (!templates) return [];
    if (!suggestions) return templates;

    const suggestionIds = new Set(suggestions.map((s: Template) => s.id));
    return templates.filter((t: Template) => !suggestionIds.has(t.id));
  }, [templates, suggestions]);

  return (
    <div className="space-y-4">
      <Label>Format Templates</Label>
      
      {suggestions?.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground mb-2">Suggested Templates</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
            {suggestions.map((template: Template) => (
              <TooltipProvider key={template.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={value === template.id ? "default" : "outline"}
                      className="w-full text-left flex items-center gap-3 py-4 px-5 hover:scale-[1.02] hover:shadow-md transition-all duration-200 ease-in-out"
                      onClick={() => onChange(template.id)}
                    >
                      <Target className="w-5 h-5 flex-shrink-0" />
                      <div className="font-medium truncate">{template.name}</div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[300px]">
                    <p>{template.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {remainingTemplates.map((template: Template) => (
          <TooltipProvider key={template.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={value === template.id ? "default" : "outline"}
                  className="w-full text-left flex items-center gap-3 py-4 px-5 hover:scale-[1.02] hover:shadow-md transition-all duration-200 ease-in-out"
                  onClick={() => onChange(template.id)}
                >
                  {templateIcons[template.name] || <HelpCircle className="w-5 h-5 flex-shrink-0" />}
                  <div className="font-medium truncate">{template.name}</div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[300px]">
                <p>{template.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}
