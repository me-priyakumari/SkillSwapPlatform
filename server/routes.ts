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
    const categories = ["Tech", "Design", "Language", "Music"];
    const avatars = [
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Aria",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna"
    ];

    // Create a demo user for each category
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const username = `demo_${category.toLowerCase()}`;
      const user = await storage.createUser({
        username,
        password: "password",
        name: `${category} Expert`,
        bio: `I am an expert in ${category} and I love sharing my knowledge with others.`,
        location: "Global",
        availability: "Flexible",
        avatarUrl: avatars[i],
      });

      // Add a 'teach' skill for this category
      await storage.createSkill({
        userId: user.id,
        title: `${category} Mastery`,
        description: `Deep dive into ${category} principles and advanced techniques.`,
        category,
        type: "teach",
      });

      // Add a 'learn' skill for this category
      await storage.createSkill({
        userId: user.id,
        title: `Advanced ${category}`,
        description: `Looking to improve my skills in specialized areas of ${category}.`,
        category,
        type: "learn",
      });
    }

    // Legacy demo user for backward compatibility if needed
    await storage.createUser({
      username: "demo",
      password: "password",
      name: "Demo User",
      bio: "I love learning and teaching!",
      location: "New York",
      availability: "Weekends",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
    });
  }
}
