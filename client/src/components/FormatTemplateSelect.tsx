import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { getSuggestedTemplates } from '../lib/api';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface FormatTemplateSelectProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

interface Template {
  id: number;
  name: string;
  description: string;
  score?: number;
}

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
          <div className="template-buttons-container">
            {suggestions.map((template: Template) => (
              <Button
                key={template.id}
                variant={value === template.id ? "default" : "outline"}
                className="w-full text-left flex items-center gap-2"
                onClick={() => onChange(template.id)}
              >
                <span>🎯</span>
                <div>
                  <div>{template.name}</div>
                  <div className="text-xs text-muted-foreground">{template.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </>
      )}

      <div className="template-buttons-container">
        {remainingTemplates.map((template: Template) => (
          <Button
            key={template.id}
            variant={value === template.id ? "default" : "outline"}
            className="w-full text-left"
            onClick={() => onChange(template.id)}
          >
            <div>
              <div>{template.name}</div>
              <div className="text-xs text-muted-foreground">{template.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
