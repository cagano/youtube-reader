import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CustomFormatInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function CustomFormatInput({
  value,
  onChange,
  disabled
}: CustomFormatInputProps) {
  return (
    <div className="space-y-2">
      <Label>Custom Format Instructions</Label>
      <Textarea
        placeholder="Enter custom formatting instructions..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="min-h-[100px]"
      />
      {disabled && (
        <p className="text-sm text-muted-foreground">
          Disabled while a template is selected
        </p>
      )}
    </div>
  );
}
