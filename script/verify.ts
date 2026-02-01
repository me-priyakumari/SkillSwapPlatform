import { db } from "../server/db";
import { users, skills } from "@shared/schema";

async function verify() {
  console.log("Verifying demo data...");

  const userCount = await db.$count(users);
  console.log(`Total users: ${userCount}`);

  const skillCount = await db.$count(skills);
  console.log(`Total skills: ${skillCount}`);

  const allUsers = await db.select().from(users);
  console.log("Users:");
  allUsers.forEach(user => {
    console.log(`- ${user.name} (${user.username})`);
  });

  const allSkills = await db.select({
    skill: skills,
    user: users,
  }).from(skills).innerJoin(users, eq(skills.userId, users.id));

  console.log("Skills:");
  allSkills.forEach(({ skill, user }) => {
    console.log(`- ${skill.title} (${skill.category}, ${skill.type}) by ${user.name}`);
  });
}

verify().catch(console.error);
