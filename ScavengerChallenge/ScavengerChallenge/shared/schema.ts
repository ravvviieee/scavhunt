import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Scavenger Hunt Schema
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  clues: text("clues").array().notNull(),
  answer: text("answer").notNull(),
});

export const clueLocation = z.object({
  id: z.number().optional(),
  name: z.string(),
  clues: z.array(z.string()),
  answer: z.string()
});

export const insertLocationSchema = createInsertSchema(locations).pick({
  name: true,
  clues: true,
  answer: true,
});

export type ClueLocation = z.infer<typeof clueLocation>;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

// User Submissions Schema
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  locationId: integer("location_id").references(() => locations.id),
  imageUrl: text("image_url").notNull(),
  answer: text("answer").notNull(),
  correctAnswer: boolean("correct_answer").default(false).notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  adminComment: text("admin_comment"),
  reviewed: boolean("reviewed").default(false).notNull(),
});

export const submissionSchema = z.object({
  id: z.number().optional(),
  userId: z.number(),
  locationId: z.number(),
  imageUrl: z.string(),
  answer: z.string(),
  correctAnswer: z.boolean().default(false),
  submittedAt: z.date().optional(),
  adminComment: z.string().optional(),
  reviewed: z.boolean().default(false),
});

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
  userId: true,
  locationId: true,
  imageUrl: true,
  answer: true,
  correctAnswer: true,
});

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

// Game Session Schema
export const gameState = z.object({
  userId: z.number().optional(),
  currentLocationIndex: z.number(),
  visibleClueIndices: z.array(z.number()),
  startTime: z.number().nullable(),
  endTime: z.number().nullable(),
  showIntro: z.boolean(),
  completedLocations: z.array(z.number())
});

export type GameState = z.infer<typeof gameState>;
