export async function fetchTranscript(videoId: string) {
  const response = await fetch(`/api/transcript/${videoId}`);
  if (!response.ok) throw new Error("Failed to fetch transcript");
  const data = await response.json();
  return data.transcript;
}

export async function processTranscript({
  transcript,
  templateId,
  customPrompt
}: {
  transcript: string;
  templateId?: number;
  customPrompt?: string;
}) {
  const response = await fetch("/api/process-transcript", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transcript,
      templateId,
      customPrompt
    }),
  });

  if (!response.ok) throw new Error("Failed to process transcript");
  return response.json();
}
export async function getSuggestedTemplates(transcript: string) {
  const response = await fetch("/api/suggest-templates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ transcript }),
  });

  if (!response.ok) throw new Error("Failed to get template suggestions");
  return response.json();
}
