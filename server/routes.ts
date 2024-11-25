import type { Express } from "express";
import { db } from "../db";
import { formatTemplates, transcriptHistory } from "@db/schema";
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import YoutubeTranscript from 'youtube-transcript';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      const fullText = transcript.map((t: { text: string }) => t.text).join(" ");
      res.json({ transcript: fullText });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transcript" });
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
        prompt = template[0].prompt;
      } else {
        prompt = customPrompt;
      }

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(
        `${prompt}\n\nTranscript:\n${transcript}`
      );
      const formattedText = result.response.text();

      res.json({ formattedTranscript: formattedText });
    } catch (error) {
      res.status(500).json({ error: "Failed to process transcript" });
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
