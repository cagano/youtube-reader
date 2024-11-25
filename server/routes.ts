import type { Express } from "express";
import { db } from "../db";
import { formatTemplates, transcriptHistory } from "@db/schema";
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { YoutubeTranscript } from 'youtube-transcript';

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


export function registerRoutes(app: Express) {
  // Get format templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await db.select().from(formatTemplates);
      res.json(templates);
    } catch (error) {
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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      console.log('Model initialized');
      
      // Split transcript into chunks
      const chunks = chunkText(transcript);
      const results: string[] = [];

      // Process each chunk
      for (const chunk of chunks) {
        const result = await model.generateContent(
          `${prompt}

Transcript chunk:
${chunk}`
        );
        results.push(result.response.text());
        console.log('Chunk processed');
      }

      // Combine results
      const formattedText = results.join("\n\n");
      console.log('All chunks combined');

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
