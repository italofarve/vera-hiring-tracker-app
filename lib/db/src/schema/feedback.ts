import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const feedbackTable = pgTable("feedback", {
  id: serial("id").primaryKey(),
  interviewId: integer("interview_id").notNull(),
  candidateId: integer("candidate_id").notNull(),
  reviewerName: text("reviewer_name").notNull(),
  reviewerEmail: text("reviewer_email"),
  rating: integer("rating").notNull(),
  technicalScore: integer("technical_score"),
  culturalScore: integer("cultural_score"),
  communicationScore: integer("communication_score"),
  strengths: text("strengths"),
  weaknesses: text("weaknesses"),
  recommendation: text("recommendation").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(feedbackTable).omit({ id: true, createdAt: true });
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type FeedbackRecord = typeof feedbackTable.$inferSelect;
