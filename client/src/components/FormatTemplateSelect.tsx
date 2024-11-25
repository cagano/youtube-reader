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

export default function FormatTemplateSelect({
  value,
  onChange
}: FormatTemplateSelectProps) {
  const { data: templates } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const response = await fetch("/api/templates");
      return response.json();
    }
  });

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
          {templates?.map((template: any) => (
            <SelectItem key={template.id} value={template.id.toString()}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
