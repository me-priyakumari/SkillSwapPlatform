import { db } from "../server/db";
import { users, skills } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  console.log("Seeding demo data...");

  // Demo users
  const demoUsers = [
    {
      username: "alice@example.com",
      password: "password123",
      name: "Alice Johnson",
      bio: "Full-stack developer passionate about web technologies. Looking to expand into design.",
      location: "San Francisco, CA",
      availability: "Weekends and evenings",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    },
    {
      username: "bob@example.com",
      password: "password123",
      name: "Bob Smith",
      bio: "Graphic designer with 5+ years experience. Love creating visual stories.",
      location: "New York, NY",
      availability: "Flexible schedule",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    },
    {
      username: "charlie@example.com",
      password: "password123",
      name: "Charlie Brown",
      bio: "Professional guitarist and music producer. Always eager to learn new languages.",
      location: "Los Angeles, CA",
      availability: "Evenings after 6 PM",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    },
    {
      username: "diana@example.com",
      password: "password123",
      name: "Diana Prince",
      bio: "Language enthusiast and Spanish teacher. Interested in coding and tech.",
      location: "Austin, TX",
      availability: "Weekdays 10 AM - 5 PM",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana",
    },
    {
      username: "eve@example.com",
      password: "password123",
      name: "Eve Wilson",
      bio: "Creative professional with diverse interests. Love sharing knowledge and learning new things.",
      location: "Seattle, WA",
      availability: "Weekends only",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eve",
    },
  ];

  // Hash passwords and insert users
  const insertedUsers = [];
  for (const user of demoUsers) {
    const hashedPassword = await hashPassword(user.password);
    const insertedUser = await db.insert(users).values({
      ...user,
      password: hashedPassword,
    }).returning();
    insertedUsers.push(insertedUser[0]);
    console.log(`Inserted user: ${user.name}`);
  }

  // Demo skills
  const demoSkills = [
    // Alice's skills
    { userId: insertedUsers[0].id, title: "React Development", description: "Building modern web applications with React", category: "Tech", type: "teach" },
    { userId: insertedUsers[0].id, title: "UI/UX Design", description: "Creating intuitive user interfaces", category: "Design", type: "learn" },

    // Bob's skills
    { userId: insertedUsers[1].id, title: "Graphic Design", description: "Logo design, branding, and visual identity", category: "Design", type: "teach" },
    { userId: insertedUsers[1].id, title: "Guitar Lessons", description: "Learn to play acoustic guitar", category: "Music", type: "learn" },

    // Charlie's skills
    { userId: insertedUsers[2].id, title: "Guitar Playing", description: "Rock, blues, and fingerstyle guitar techniques", category: "Music", type: "teach" },
    { userId: insertedUsers[2].id, title: "Spanish Conversation", description: "Improve conversational Spanish skills", category: "Language", type: "learn" },

    // Diana's skills
    { userId: insertedUsers[3].id, title: "Spanish Language", description: "Native Spanish speaker offering lessons", category: "Language", type: "teach" },
    { userId: insertedUsers[3].id, title: "JavaScript Programming", description: "Learn the basics of JavaScript", category: "Tech", type: "learn" },

    // Eve's skills
    { userId: insertedUsers[4].id, title: "Photography", description: "Digital photography and editing techniques", category: "Design", type: "teach" },
    { userId: insertedUsers[4].id, title: "Piano Lessons", description: "Beginner to intermediate piano instruction", category: "Music", type: "teach" },
    { userId: insertedUsers[4].id, title: "French Language", description: "Learn French for travel and conversation", category: "Language", type: "learn" },
  ];

  // Insert skills
  for (const skill of demoSkills) {
    await db.insert(skills).values(skill);
    console.log(`Inserted skill: ${skill.title} for user ${skill.userId}`);
  }

  console.log("Seeding completed successfully!");
}

seed().catch(console.error);
