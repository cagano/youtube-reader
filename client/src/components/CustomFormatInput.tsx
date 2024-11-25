import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CustomFormatInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CustomFormatInput({
  value,
  onChange
}: CustomFormatInputProps) {
  return (
    <div className="space-y-2">
      <Label>Custom Format Instructions</Label>
      <Textarea
        placeholder="Enter custom formatting instructions..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px]"
      />
    </div>
  );
}
