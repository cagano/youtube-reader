import { InsertFormatTemplate } from "../db/schema";

export const defaultTemplates: InsertFormatTemplate[] = [
  {
    name: "Summary",
    description: "Create a concise summary of the content",
    prompt: "Create a clear and concise summary of the following transcript, highlighting the main themes and key takeaways. Format the output with proper paragraphs and bullet points where appropriate:"
  },
  {
    name: "Key Points",
    description: "Extract main points and insights",
    prompt: "Extract and organize the key points and important insights from this transcript. Format the output as follows:\n\n1. Main Themes:\n[List key themes]\n\n2. Key Points:\n[Bullet points]\n\n3. Important Insights:\n[Numbered insights]"
  },
  {
    name: "Q&A Format",
    description: "Convert content into Q&A format",
    prompt: "Convert this transcript into a structured Q&A format. Each question should be clearly formatted with 'Q:' prefix and each answer with 'A:' prefix. Group related Q&As together under relevant section headings:"
  },
  {
    name: "Study Notes",
    description: "Create structured study notes",
    prompt: "Transform this transcript into comprehensive study notes with the following structure:\n\n1. Overview\n2. Main Concepts\n3. Detailed Notes (with subheadings)\n4. Key Terms & Definitions\n5. Summary Points"
  },
  {
    name: "Executive Brief",
    description: "Create a professional executive summary",
    prompt: "Create a professional executive brief from this transcript with the following sections:\n\n1. Executive Summary\n2. Key Findings\n3. Recommendations\n4. Action Items\n\nKeep it concise and business-focused."
  }
];
