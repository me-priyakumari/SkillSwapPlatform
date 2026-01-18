import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Auth (Passport + Session)
  setupAuth(app);

  // === User Routes ===
  app.get(api.users.get.path, async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.patch(api.users.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = Number(req.params.id);
    if (req.user!.id !== userId) return res.sendStatus(403);
    
    const user = await storage.updateUser(userId, req.body);
    res.json(user);
  });

  // === Skills Routes ===
  app.get(api.skills.list.path, async (req, res) => {
    // Parse query params manually if needed, or rely on loose parsing
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const type = req.query.type as 'teach' | 'learn' | undefined;
    
    const skills = await storage.getSkills({ category, search, type });
    res.json(skills);
  });

  app.post(api.skills.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const validatedData = api.skills.create.input.parse(req.body);
    const skill = await storage.createSkill({
      ...validatedData,
      userId: req.user!.id,
    });
    res.status(201).json(skill);
  });

  // === Requests Routes ===
  app.get(api.requests.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const requests = await storage.getRequests(req.user!.id);
    res.json(requests);
  });

  app.post(api.requests.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const validatedData = api.requests.create.input.parse(req.body);
    const request = await storage.createRequest({
      ...validatedData,
      senderId: req.user!.id,
      status: 'pending',
    });
    res.status(201).json(request);
  });

  app.patch(api.requests.updateStatus.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { status } = req.body; // already validated by Zod in frontend/shared, but good to check
    const request = await storage.updateRequestStatus(Number(req.params.id), status);
    res.json(request);
  });

  // === Messages Routes ===
  app.get(api.messages.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const otherUserId = Number(req.params.userId);
    const messages = await storage.getMessages(req.user!.id, otherUserId);
    res.json(messages);
  });

  app.post(api.messages.send.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const validatedData = api.messages.send.input.parse(req.body);
    const message = await storage.createMessage({
      ...validatedData,
      senderId: req.user!.id,
    });
    res.status(201).json(message);
  });

  // === Reviews Routes ===
  app.get(api.reviews.list.path, async (req, res) => {
    const reviews = await storage.getReviews(Number(req.params.userId));
    res.json(reviews);
  });

  app.post(api.reviews.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const validatedData = api.reviews.create.input.parse(req.body);
    const review = await storage.createReview({
      ...validatedData,
      authorId: req.user!.id,
    });
    res.status(201).json(review);
  });
  
  // Seed Database if empty
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingUsers = await storage.getUserByUsername("demo");
  if (!existingUsers) {
    const demoUser = await storage.createUser({
      username: "demo",
      password: "password",
      name: "Demo User",
      bio: "I love learning and teaching!",
      location: "New York",
      availability: "Weekends",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
    });
    
    await storage.createSkill({
      userId: demoUser.id,
      title: "React Development",
      description: "I can teach you React from scratch.",
      category: "Tech",
      type: "teach",
    });

     await storage.createSkill({
      userId: demoUser.id,
      title: "Spanish Basics",
      description: "Looking to learn basic Spanish conversation.",
      category: "Language",
      type: "learn",
    });
  }
}
