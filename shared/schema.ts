import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(), // This will be the email
  password: text("password").notNull(),
  name: text("name").notNull(),
  bio: text("bio"),
  location: text("location"),
  availability: text("availability"),
  avatarUrl: text("avatar_url"),
});

export const skills = sqliteTable("skills", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id", { mode: 'number' }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Tech, Design, Language, Music
  type: text("type").notNull(), // 'teach' or 'learn'
});

export const swapRequests = sqliteTable("swap_requests", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  senderId: integer("sender_id", { mode: 'number' }).notNull(),
  receiverId: integer("receiver_id", { mode: 'number' }).notNull(),
  skillId: integer("skill_id", { mode: 'number' }).notNull(), // The skill originally requested
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  message: text("message"),
  createdAt: integer("created_at", { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
});

export const messages = sqliteTable("messages", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  senderId: integer("sender_id", { mode: 'number' }).notNull(),
  receiverId: integer("receiver_id", { mode: 'number' }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
});

export const reviews = sqliteTable("reviews", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  authorId: integer("author_id", { mode: 'number' }).notNull(),
  targetId: integer("target_id", { mode: 'number' }).notNull(),
  rating: integer("rating", { mode: 'number' }).notNull(),
  feedback: text("feedback").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertSkillSchema = createInsertSchema(skills).omit({ id: true });
export const insertRequestSchema = createInsertSchema(swapRequests).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type SwapRequest = typeof swapRequests.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
