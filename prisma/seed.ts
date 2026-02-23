import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.eventRsvp.deleteMany();
  await prisma.event.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.category.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash("password123", 12);

  // Create users
  const alice = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@example.com",
      passwordHash,
      bio: "Community builder and educator. Love helping people grow.",
      points: 150,
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Smith",
      email: "bob@example.com",
      passwordHash,
      bio: "Full-stack developer and lifelong learner.",
      points: 85,
    },
  });

  const carol = await prisma.user.create({
    data: {
      name: "Carol Williams",
      email: "carol@example.com",
      passwordHash,
      bio: "Marketing strategist helping brands tell their story.",
      points: 62,
    },
  });

  const dave = await prisma.user.create({
    data: {
      name: "Dave Brown",
      email: "dave@example.com",
      passwordHash,
      bio: "Fitness enthusiast and nutrition coach.",
      points: 40,
    },
  });

  const eve = await prisma.user.create({
    data: {
      name: "Eve Davis",
      email: "eve@example.com",
      passwordHash,
      bio: "UX designer passionate about accessible design.",
      points: 95,
    },
  });

  // Create groups
  const techGroup = await prisma.group.create({
    data: {
      name: "Tech Builders",
      slug: "tech-builders",
      description:
        "A community for developers, designers, and tech entrepreneurs building the future. Share your projects, get feedback, and learn together.",
      privacy: "public",
      ownerId: alice.id,
    },
  });

  const fitnessGroup = await prisma.group.create({
    data: {
      name: "Fitness Academy",
      slug: "fitness-academy",
      description:
        "Transform your health with evidence-based fitness and nutrition advice. Workouts, meal plans, and accountability.",
      privacy: "public",
      ownerId: dave.id,
    },
  });

  const marketingGroup = await prisma.group.create({
    data: {
      name: "Growth Marketing Pro",
      slug: "growth-marketing-pro",
      description:
        "Master digital marketing, SEO, social media, and growth hacking strategies used by top startups.",
      privacy: "public",
      ownerId: carol.id,
    },
  });

  const designGroup = await prisma.group.create({
    data: {
      name: "Design Masters",
      slug: "design-masters",
      description:
        "Level up your design skills. UI/UX, branding, typography, and creative thinking.",
      privacy: "public",
      ownerId: eve.id,
    },
  });

  // Create memberships
  const membershipData = [
    { userId: alice.id, groupId: techGroup.id, role: "owner", points: 150 },
    { userId: bob.id, groupId: techGroup.id, role: "member", points: 85 },
    { userId: carol.id, groupId: techGroup.id, role: "member", points: 30 },
    { userId: eve.id, groupId: techGroup.id, role: "admin", points: 62 },
    { userId: dave.id, groupId: techGroup.id, role: "member", points: 15 },
    { userId: dave.id, groupId: fitnessGroup.id, role: "owner", points: 120 },
    { userId: alice.id, groupId: fitnessGroup.id, role: "member", points: 45 },
    { userId: bob.id, groupId: fitnessGroup.id, role: "member", points: 30 },
    { userId: carol.id, groupId: marketingGroup.id, role: "owner", points: 200 },
    { userId: alice.id, groupId: marketingGroup.id, role: "member", points: 55 },
    { userId: bob.id, groupId: marketingGroup.id, role: "member", points: 22 },
    { userId: eve.id, groupId: designGroup.id, role: "owner", points: 180 },
    { userId: alice.id, groupId: designGroup.id, role: "member", points: 35 },
    { userId: carol.id, groupId: designGroup.id, role: "member", points: 40 },
  ];

  for (const m of membershipData) {
    await prisma.membership.create({ data: m });
  }

  // Create categories for Tech Builders
  const generalCat = await prisma.category.create({
    data: { name: "General", emoji: "💬", groupId: techGroup.id },
  });
  const questionsCat = await prisma.category.create({
    data: { name: "Questions", emoji: "❓", groupId: techGroup.id },
  });
  const winsCat = await prisma.category.create({
    data: { name: "Wins", emoji: "🏆", groupId: techGroup.id },
  });
  const resourcesCat = await prisma.category.create({
    data: { name: "Resources", emoji: "📚", groupId: techGroup.id },
  });

  // Create categories for other groups
  for (const gId of [fitnessGroup.id, marketingGroup.id, designGroup.id]) {
    await prisma.category.create({ data: { name: "General", emoji: "💬", groupId: gId } });
    await prisma.category.create({ data: { name: "Questions", emoji: "❓", groupId: gId } });
    await prisma.category.create({ data: { name: "Wins", emoji: "🏆", groupId: gId } });
    await prisma.category.create({ data: { name: "Resources", emoji: "📚", groupId: gId } });
  }

  // Create posts for Tech Builders
  const post1 = await prisma.post.create({
    data: {
      title: "Welcome to Tech Builders! Introduce yourself here",
      content:
        "Hey everyone! Welcome to Tech Builders. This is the place to connect with fellow developers, share your projects, and learn together.\n\nDrop a comment below and tell us:\n1. What's your name?\n2. What tech stack do you work with?\n3. What are you currently building?\n\nLet's get to know each other!",
      isPinned: true,
      authorId: alice.id,
      groupId: techGroup.id,
      categoryId: generalCat.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: "How to structure a Next.js 14 project for scalability?",
      content:
        "I'm starting a new project with Next.js 14 and want to make sure the architecture is solid from day one. Currently thinking about:\n\n- Using the App Router with route groups\n- Prisma for database access\n- Server components for most pages\n- Client components only where interactivity is needed\n\nWhat patterns have worked well for you? Any pitfalls to avoid?",
      authorId: bob.id,
      groupId: techGroup.id,
      categoryId: questionsCat.id,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: "Just launched my SaaS product! 🎉",
      content:
        "After 6 months of building, I finally launched my project management tool. It's built with React, Node.js, and PostgreSQL.\n\nHere's what I learned:\n- Ship early, iterate fast\n- Talk to users before writing code\n- Don't over-engineer v1\n\nAlready got my first 10 paying customers in the first week!",
      authorId: eve.id,
      groupId: techGroup.id,
      categoryId: winsCat.id,
    },
  });

  const post4 = await prisma.post.create({
    data: {
      title: "Best resources for learning TypeScript in 2024",
      content:
        "Here are my top picks for learning TypeScript:\n\n1. TypeScript Handbook (official docs)\n2. Total TypeScript by Matt Pocock\n3. Type Challenges on GitHub\n4. Execute Program's TypeScript course\n\nThe key is to practice with real projects. Don't just read - build something!",
      authorId: alice.id,
      groupId: techGroup.id,
      categoryId: resourcesCat.id,
    },
  });

  // Create comments
  await prisma.comment.create({
    data: {
      content: "Hi everyone! I'm Bob, a full-stack dev working mostly with React and Node. Currently building an AI-powered writing assistant.",
      authorId: bob.id,
      postId: post1.id,
    },
  });
  await prisma.comment.create({
    data: {
      content: "Hey! I'm Carol. Mostly into marketing tech but learning to code on the side. Excited to be here!",
      authorId: carol.id,
      postId: post1.id,
    },
  });
  await prisma.comment.create({
    data: {
      content: "Great question! I'd recommend separating your data fetching layer from your components. Create a /lib/data folder with functions like getUser(), getPosts() etc.",
      authorId: alice.id,
      postId: post2.id,
    },
  });
  await prisma.comment.create({
    data: {
      content: "Congrats Eve! That's amazing. Would love to hear more about your marketing strategy.",
      authorId: bob.id,
      postId: post3.id,
    },
  });
  await prisma.comment.create({
    data: {
      content: "Total TypeScript is incredible. Matt's teaching style is so clear.",
      authorId: eve.id,
      postId: post4.id,
    },
  });

  // Create likes
  await prisma.like.create({ data: { userId: bob.id, postId: post1.id } });
  await prisma.like.create({ data: { userId: carol.id, postId: post1.id } });
  await prisma.like.create({ data: { userId: eve.id, postId: post1.id } });
  await prisma.like.create({ data: { userId: dave.id, postId: post1.id } });
  await prisma.like.create({ data: { userId: alice.id, postId: post2.id } });
  await prisma.like.create({ data: { userId: eve.id, postId: post2.id } });
  await prisma.like.create({ data: { userId: alice.id, postId: post3.id } });
  await prisma.like.create({ data: { userId: bob.id, postId: post3.id } });
  await prisma.like.create({ data: { userId: carol.id, postId: post3.id } });
  await prisma.like.create({ data: { userId: alice.id, postId: post4.id } });
  await prisma.like.create({ data: { userId: bob.id, postId: post4.id } });

  // Create courses for Tech Builders
  const course1 = await prisma.course.create({
    data: {
      title: "Full-Stack Web Development",
      description: "Learn to build modern web applications from scratch. Covers React, Node.js, databases, and deployment.",
      published: true,
      groupId: techGroup.id,
      order: 1,
    },
  });

  const module1 = await prisma.module.create({
    data: { title: "Getting Started", courseId: course1.id, order: 1 },
  });
  const module2 = await prisma.module.create({
    data: { title: "Frontend with React", courseId: course1.id, order: 2 },
  });
  const module3 = await prisma.module.create({
    data: { title: "Backend with Node.js", courseId: course1.id, order: 3 },
  });

  await prisma.lesson.create({
    data: {
      title: "Setting up your development environment",
      content: "In this lesson, we'll set up VS Code, Node.js, and Git. You'll also learn about essential extensions and configurations for productive development.\n\n## Steps\n1. Install Node.js (LTS version)\n2. Install VS Code\n3. Configure essential extensions\n4. Set up Git and GitHub",
      moduleId: module1.id,
      order: 1,
    },
  });
  await prisma.lesson.create({
    data: {
      title: "Understanding HTML, CSS, and JavaScript",
      content: "A refresher on the three pillars of web development. We'll cover the fundamentals you need before diving into React.\n\n## Topics\n- HTML5 semantic elements\n- CSS Flexbox and Grid\n- ES6+ JavaScript features\n- DOM manipulation basics",
      moduleId: module1.id,
      order: 2,
    },
  });
  await prisma.lesson.create({
    data: {
      title: "Introduction to React",
      content: "Learn the core concepts of React: components, JSX, props, and state. We'll build our first React application step by step.\n\n## What you'll learn\n- Creating components\n- JSX syntax\n- Props and state\n- Event handling\n- Conditional rendering",
      moduleId: module2.id,
      order: 1,
    },
  });
  await prisma.lesson.create({
    data: {
      title: "React Hooks Deep Dive",
      content: "Master React hooks: useState, useEffect, useContext, useReducer, and custom hooks.\n\n## Hooks covered\n- useState for local state\n- useEffect for side effects\n- useContext for global state\n- useReducer for complex state logic\n- Building custom hooks",
      moduleId: module2.id,
      order: 2,
    },
  });
  await prisma.lesson.create({
    data: {
      title: "Building REST APIs with Express",
      content: "Create a RESTful API using Express.js. Learn about routing, middleware, error handling, and best practices.\n\n## Topics\n- Express setup and routing\n- Middleware patterns\n- Request validation\n- Error handling\n- API best practices",
      moduleId: module3.id,
      order: 1,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: "TypeScript Mastery",
      description: "Go from TypeScript beginner to expert. Learn types, generics, utility types, and advanced patterns.",
      published: true,
      groupId: techGroup.id,
      order: 2,
    },
  });

  const tsModule1 = await prisma.module.create({
    data: { title: "TypeScript Basics", courseId: course2.id, order: 1 },
  });
  await prisma.lesson.create({
    data: {
      title: "Why TypeScript?",
      content: "Understanding the benefits of TypeScript and when to use it.\n\n## Benefits\n- Catch errors at compile time\n- Better IDE support\n- Self-documenting code\n- Easier refactoring",
      moduleId: tsModule1.id,
      order: 1,
    },
  });
  await prisma.lesson.create({
    data: {
      title: "Basic Types and Interfaces",
      content: "Learn about primitive types, arrays, objects, interfaces, and type aliases.\n\n## Topics\n- string, number, boolean\n- Arrays and tuples\n- Interfaces vs type aliases\n- Optional and readonly properties",
      moduleId: tsModule1.id,
      order: 2,
    },
  });

  // Create events
  const now = new Date();
  await prisma.event.create({
    data: {
      title: "Weekly Code Review Session",
      description: "Bring your code and get feedback from the community. All skill levels welcome!",
      startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      isOnline: true,
      meetingUrl: "https://meet.example.com/code-review",
      groupId: techGroup.id,
    },
  });

  await prisma.event.create({
    data: {
      title: "TypeScript Workshop: Generics",
      description: "Deep dive into TypeScript generics. Learn patterns used in production codebases.",
      startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      isOnline: true,
      meetingUrl: "https://meet.example.com/ts-workshop",
      groupId: techGroup.id,
    },
  });

  await prisma.event.create({
    data: {
      title: "Monthly Community Meetup",
      description: "Our monthly gathering to share wins, challenges, and connect with fellow builders.",
      startTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      isOnline: false,
      location: "Downtown Coworking Space, 123 Main St",
      groupId: techGroup.id,
    },
  });

  // Fitness group events
  await prisma.event.create({
    data: {
      title: "Morning HIIT Workout",
      description: "30-minute high-intensity interval training. No equipment needed!",
      startTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      isOnline: true,
      meetingUrl: "https://meet.example.com/hiit",
      groupId: fitnessGroup.id,
    },
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
