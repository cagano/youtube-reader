import type { Express } from "express";
import { db } from "../db";
import { formatTemplates, transcriptHistory } from "@db/schema";
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { YoutubeTranscript } from 'youtube-transcript';
import { defaultTemplates } from "./templates";

function decodeHTMLEntities(text: string): string {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '='
  };
  return text.replace(/&(?:amp|lt|gt|quot|#39|apos|#x27|#x2F|#x60|#x3D);/g, 
    match => entities[match as keyof typeof entities] || match
  );
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
function chunkText(text: string, chunkSize: number = 30000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

function cleanFormattedText(text: string): string {
  return text
    // Preserve markdown headers and lists
    .replace(/^(#{1,6}\s.*$)/gm, (match) => `\n${match.trim()}\n`)
    .replace(/^([*-]\s.*$)/gm, (match) => match.trim())
    // Handle paragraph spacing (max 2 newlines)
    .replace(/\n{3,}/g, '\n\n')
    // Clean up spaces around punctuation
    .replace(/\s+([.,!?:;])/g, '$1')
    .replace(/([.,!?:;])\s+/g, '$1 ')
    // Handle multiple spaces and tabs
    .replace(/[ \t]+/g, ' ')
    // Clean up spaces around newlines
    .replace(/\n +/g, '\n')
    .replace(/ +\n/g, '\n')
    // Handle spacing in markdown lists and code blocks
    .replace(/^(\s*[*-]\s)/gm, '\n$1')
    .replace(/^(\s*```)/gm, '\n$1')
    // Final cleanup
    .replace(/^\s+|\s+$/gm, '')     // Remove leading/trailing spaces
    .replace(/^\n+|\n+$/g, '')      // Remove leading/trailing newlines
    .trim();
}
async function suggestTemplates(transcript: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  
  // Take a sample of the transcript to analyze (first 1000 characters)
  const sampleText = transcript.slice(0, 1000);
  
  const prompt = `Analyze this transcript sample and determine its content type and context. Return the response as a comma-separated list of relevant keywords that best describe the content (e.g., "technical,educational,programming" or "interview,business,career").

Sample text:
${sampleText}`;

  const result = await model.generateContent(prompt);
  const keywords = result.response.text().toLowerCase().split(',').map(k => k.trim());
  
  // Fetch all templates
  const templates = await db.select().from(formatTemplates);
  
  // Score templates based on keyword matches
  const scoredTemplates = templates.map(template => {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (
        template.description.toLowerCase().includes(keyword) ||
        template.name.toLowerCase().includes(keyword) ? 1 : 0
      );
    }, 0);
    return { ...template, score };
  });
  
  // Sort by score and return top matches
  return scoredTemplates
    .sort((a, b) => b.score - a.score)
    .filter(t => t.score > 0);
}


export function registerRoutes(app: Express) {
  // Get format templates with initialization
  app.get("/api/templates", async (req, res) => {
    try {
      let templates = await db.select().from(formatTemplates);
      
      // Initialize with default templates if none exist
      if (templates.length === 0) {
        templates = await db.insert(formatTemplates)
          .values(defaultTemplates)
          .returning();
        console.log('Initialized default templates');
      }
      
      res.json(templates);
    } catch (error) {
      console.error('Error fetching/initializing templates:', error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  // Get YouTube transcript
  app.get("/api/transcript/:videoId", async (req, res) => {
    try {
      const { videoId } = req.params;
      console.log('Fetching English transcript for video:', videoId);
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'en'
      });
      console.log('English transcript fetched successfully');
      const fullText = transcript
        .map((t: { text: string }) => decodeHTMLEntities(t.text))
        .join(" ");
      res.json({ transcript: fullText });
    } catch (error) {
      console.error('Failed to fetch English transcript:', error);
      // Try fetching default language transcript as fallback
      try {
        const { videoId } = req.params;
        console.log('Attempting to fetch transcript in default language');
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        console.log('Fallback transcript fetched successfully');
        const fullText = transcript
          .map((t: { text: string }) => decodeHTMLEntities(t.text))
          .join(" ");
        res.json({ transcript: fullText });
      } catch (fallbackError) {
        console.error('Transcript fetch error:', fallbackError);
        res.status(500).json({ 
          error: "Failed to fetch transcript", 
          details: fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
        });
      }
    }
  });

  // Process transcript with Gemini
  app.post("/api/process-transcript", async (req, res) => {
    try {
      const { transcript, templateId, customPrompt } = req.body;
      
      let prompt;
      if (templateId) {
        const template = await db.select()
          .from(formatTemplates)
          .where(eq(formatTemplates.id, templateId))
          .limit(1);
        if (!template.length) {
          throw new Error('Template not found');
        }
        prompt = template[0].prompt;
      } else if (customPrompt) {
        prompt = customPrompt;
      } else {
        throw new Error('No prompt or template provided');
      }

      console.log('Using prompt:', prompt);
      
  

  

  // Get template suggestions based on transcript
  app.post("/api/suggest-templates", async (req, res) => {
    try {
      const { transcript } = req.body;
      if (!transcript) {
        return res.status(400).json({ error: "Transcript is required" });
      }
      
      const suggestions = await suggestTemplates(transcript);
      res.json(suggestions);
    } catch (error) {
      console.error('Template suggestion error:', error);
      res.status(500).json({ 
        error: "Failed to suggest templates",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      console.log('Model initialized');
      
      // Split transcript into chunks
      const chunks = chunkText(transcript);
      const results: string[] = [];

      // Process each chunk
      for (const chunk of chunks) {
        const result = await model.generateContent(
          `${prompt}

Please follow these formatting guidelines:
- Use minimal spacing between sections (single line break)
- Avoid unnecessary line breaks
- Use consistent markdown formatting
- Keep paragraphs compact while maintaining readability
- Use proper markdown headers (##) for sections
- Ensure clean spacing around punctuation

Transcript chunk:
${chunk}`
        );
        results.push(result.response.text());
        console.log('Chunk processed');
      }

      // Combine results
      const formattedText = cleanFormattedText(results.join("\n"));
      console.log('All chunks combined and cleaned');

      res.json({ formattedTranscript: formattedText });
    } catch (error) {
      console.error('Transcript processing error:', error);
      res.status(500).json({ 
        error: "Failed to process transcript",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Save processed transcript
  app.post("/api/history", async (req, res) => {
    try {
      const historyEntry = await db.insert(transcriptHistory)
        .values(req.body)
        .returning();
      res.json(historyEntry[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to save history" });
    }
  });
}
