import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const formatTemplates = pgTable("format_templates", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  prompt: text("prompt").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertFormatTemplateSchema = createInsertSchema(formatTemplates);
export const selectFormatTemplateSchema = createSelectSchema(formatTemplates);
export type InsertFormatTemplate = z.infer<typeof insertFormatTemplateSchema>;
export type FormatTemplate = z.infer<typeof selectFormatTemplateSchema>;

export const transcriptHistory = pgTable("transcript_history", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  videoId: text("video_id").notNull(),
  videoTitle: text("video_title").notNull(),
  originalTranscript: text("original_transcript").notNull(),
  formattedTranscript: text("formatted_transcript").notNull(),
  formatTemplateId: integer("format_template_id").references(() => formatTemplates.id),
  customPrompt: text("custom_prompt"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertTranscriptHistorySchema = createInsertSchema(transcriptHistory);
export const selectTranscriptHistorySchema = createSelectSchema(transcriptHistory);
export type InsertTranscriptHistory = z.infer<typeof insertTranscriptHistorySchema>;
export type TranscriptHistory = z.infer<typeof selectTranscriptHistorySchema>;
