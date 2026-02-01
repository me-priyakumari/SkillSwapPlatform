import { db } from "./db";
import { eq, or, and } from "drizzle-orm";
import {
  users, skills, swapRequests, messages, reviews,
  type User, type InsertUser,
  type Skill, type InsertSkill,
  type SwapRequest, type InsertRequest,
  type Message, type InsertMessage,
  type Review, type InsertReview
} from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

export interface IStorage {
  // Auth & User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  
  // Skills
  getSkill(id: number): Promise<Skill | undefined>;
  getSkills(filters?: { category?: string; search?: string; type?: 'teach' | 'learn' }): Promise<(Skill & { user: User })[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  
  // Requests
  getRequests(userId: number): Promise<(SwapRequest & { skill: Skill, otherUser: User })[]>;
  createRequest(request: InsertRequest): Promise<SwapRequest>;
  updateRequestStatus(id: number, status: 'accepted' | 'rejected'): Promise<SwapRequest>;
  
  // Messages
  getMessages(user1Id: number, user2Id: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Reviews
  getReviews(userId: number): Promise<(Review & { author: User })[]>;
  createReview(review: InsertReview): Promise<Review>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new (SQLiteStore(session))({
      db: "sessions.db",
      dir: ".",
    });
  }

  // User
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  // Skills
  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill;
  }

  async getSkills(filters?: { category?: string; search?: string; type?: 'teach' | 'learn' }): Promise<(Skill & { user: User })[]> {
    let query = db.select({
      skill: skills,
      user: users,
    }).from(skills).innerJoin(users, eq(skills.userId, users.id));

    if (filters) {
      if (filters.category) {
        query.where(eq(skills.category, filters.category));
      }
      if (filters.type) {
        // Note: Chaining where clauses in simple query builder adds AND condition
        // But here we need to be careful if we already added a where clause.
        // Usually better to build an array of conditions and use and(...conditions)
        // For simplicity in this implementation, assume one filter or robust check.
        // Refactoring to use conditions array:
      }
      // Re-implementing with conditions array for safety
    }
    
    // Proper implementation
    const conditions = [];
    if (filters?.category) conditions.push(eq(skills.category, filters.category));
    if (filters?.type) conditions.push(eq(skills.type, filters.type));
    // Search is basic implementation
    
    // Execute
    let finalQuery = db.select({
      skill: skills,
      user: users,
    }).from(skills).innerJoin(users, eq(skills.userId, users.id));
    
    if (conditions.length > 0) {
      finalQuery.where(and(...conditions));
    }
    
    const results = await finalQuery;
    
    // Filter by search in JS for simplicity if search term provided
    // In production, use ILIKE
    let finalResults = results.map(r => ({ ...r.skill, user: r.user }));
    if (filters?.search) {
      const lowerSearch = filters.search.toLowerCase();
      finalResults = finalResults.filter(s => s.title.toLowerCase().includes(lowerSearch) || s.description.toLowerCase().includes(lowerSearch));
    }
    
    return finalResults;
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const [skill] = await db.insert(skills).values(insertSkill).returning();
    return skill;
  }

  // Requests
  async getRequests(userId: number): Promise<(SwapRequest & { skill: Skill, otherUser: User })[]> {
    // Get sent requests
    const sent = await db.select({
      request: swapRequests,
      skill: skills,
      otherUser: users, // Receiver
    })
    .from(swapRequests)
    .innerJoin(skills, eq(swapRequests.skillId, skills.id))
    .innerJoin(users, eq(swapRequests.receiverId, users.id))
    .where(eq(swapRequests.senderId, userId));

    // Get received requests
    const received = await db.select({
      request: swapRequests,
      skill: skills,
      otherUser: users, // Sender
    })
    .from(swapRequests)
    .innerJoin(skills, eq(swapRequests.skillId, skills.id))
    .innerJoin(users, eq(swapRequests.senderId, users.id))
    .where(eq(swapRequests.receiverId, userId));

    return [
      ...sent.map(r => ({ ...r.request, skill: r.skill, otherUser: r.otherUser })),
      ...received.map(r => ({ ...r.request, skill: r.skill, otherUser: r.otherUser }))
    ];
  }

  async createRequest(insertRequest: InsertRequest): Promise<SwapRequest> {
    const [request] = await db.insert(swapRequests).values(insertRequest).returning();
    return request;
  }

  async updateRequestStatus(id: number, status: 'accepted' | 'rejected'): Promise<SwapRequest> {
    const [request] = await db.update(swapRequests).set({ status }).where(eq(swapRequests.id, id)).returning();
    return request;
  }

  // Messages
  async getMessages(user1Id: number, user2Id: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, user1Id), eq(messages.receiverId, user2Id)),
          and(eq(messages.senderId, user2Id), eq(messages.receiverId, user1Id))
        )
      )
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  // Reviews
  async getReviews(userId: number): Promise<(Review & { author: User })[]> {
    const results = await db.select({
      review: reviews,
      author: users,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.authorId, users.id))
    .where(eq(reviews.targetId, userId));

    return results.map(r => ({ ...r.review, author: r.author }));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }
}

export const storage = new DatabaseStorage();
