import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const organizedTemplates = React.useMemo(() => {
    if (!templates) return [];
    if (!suggestions) return templates;

    const suggestionIds = new Set(suggestions.map((s: Template) => s.id));
    return [
      ...suggestions,
      ...templates.filter((t: Template) => !suggestionIds.has(t.id))
    ];
  }, [templates, suggestions]);

  return (
    <div className="space-y-2">
      <Label>Format Template</Label>
      <Select
        value={value?.toString()}
        onValueChange={(val) => onChange(val ? parseInt(val) : null)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a format template" />
        </SelectTrigger>
        <SelectContent>
          {suggestions?.length > 0 && (
            <SelectItem value="" disabled className="text-muted-foreground">
              Suggested Templates
            </SelectItem>
          )}
          {organizedTemplates?.map((template: Template) => (
            <SelectItem key={template.id} value={template.id.toString()}>
              {template.score ? `🎯 ${template.name}` : template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
