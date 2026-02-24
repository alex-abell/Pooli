import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.transaction.deleteMany();
  await prisma.contribution.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.rsvp.deleteMany();
  await prisma.move.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.member.deleteMany();
  await prisma.pool.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash("password123", 12);

  // Create users
  const alice = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@example.com",
      passwordHash,
      bio: "Loves organizing group adventures and keeping the funds transparent.",
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Smith",
      email: "bob@example.com",
      passwordHash,
      bio: "Always down for a road trip. Contributor extraordinaire.",
    },
  });

  const carol = await prisma.user.create({
    data: {
      name: "Carol Williams",
      email: "carol@example.com",
      passwordHash,
      bio: "The one who finds the best Airbnbs.",
    },
  });

  const dave = await prisma.user.create({
    data: {
      name: "Dave Brown",
      email: "dave@example.com",
      passwordHash,
      bio: "Fitness crew organizer. Weekend warrior.",
    },
  });

  const eve = await prisma.user.create({
    data: {
      name: "Eve Davis",
      email: "eve@example.com",
      passwordHash,
      bio: "Design-minded. Makes sure every trip has good vibes.",
    },
  });

  // Create pools
  const adventurePool = await prisma.pool.create({
    data: {
      name: "Weekend Adventure Fund",
      description:
        "A shared fund for weekend trips, hikes, and outdoor adventures. We pool our money monthly and vote on where to go next.",
      purpose: "Fund group adventures and outdoor experiences",
      contributionAmount: 50,
      hostId: alice.id,
    },
  });

  const fitnessPool = await prisma.pool.create({
    data: {
      name: "Fitness Crew",
      description:
        "Monthly fund for group fitness activities — gym passes, yoga retreats, race entries, and gear splits.",
      purpose: "Stay active together without breaking the bank",
      contributionAmount: 30,
      hostId: dave.id,
    },
  });

  // Create members
  const memberData = [
    { userId: alice.id, poolId: adventurePool.id, role: "owner" },
    { userId: bob.id, poolId: adventurePool.id, role: "member" },
    { userId: carol.id, poolId: adventurePool.id, role: "member" },
    { userId: eve.id, poolId: adventurePool.id, role: "member" },
    { userId: dave.id, poolId: adventurePool.id, role: "member" },
    { userId: dave.id, poolId: fitnessPool.id, role: "owner" },
    { userId: alice.id, poolId: fitnessPool.id, role: "member" },
    { userId: bob.id, poolId: fitnessPool.id, role: "member" },
  ];

  const members: Record<string, { id: string }> = {};
  for (const m of memberData) {
    const member = await prisma.member.create({ data: m });
    members[`${m.userId}-${m.poolId}`] = member;
  }

  // Create proposals for Adventure Pool
  const cabinProposal = await prisma.proposal.create({
    data: {
      poolId: adventurePool.id,
      authorId: carol.id,
      title: "Lake Tahoe Cabin Weekend",
      description:
        "Rent a cabin at Lake Tahoe for a long weekend. 3 nights, 5 people. Includes lodging and a group dinner out.",
      estimatedCost: 800,
      status: "approved",
      voteCount: 4,
    },
  });

  const hikingProposal = await prisma.proposal.create({
    data: {
      poolId: adventurePool.id,
      authorId: bob.id,
      title: "Yosemite Day Hike + Gear",
      description:
        "Day trip to Yosemite. Cover gas, park entry, and rent any gear people need (trekking poles, etc).",
      estimatedCost: 200,
      status: "submitted",
      voteCount: 2,
    },
  });

  await prisma.proposal.create({
    data: {
      poolId: fitnessPool.id,
      authorId: alice.id,
      title: "Group Yoga Retreat",
      description:
        "Weekend yoga retreat at a local studio. Includes classes, meals, and shared accommodation.",
      estimatedCost: 450,
      status: "submitted",
      voteCount: 1,
    },
  });

  // Create votes
  const adventureMembers = memberData.filter(m => m.poolId === adventurePool.id);
  for (const m of adventureMembers.slice(0, 4)) {
    const member = members[`${m.userId}-${m.poolId}`];
    await prisma.vote.create({
      data: {
        proposalId: cabinProposal.id,
        memberId: member.id,
      },
    });
  }
  for (const m of adventureMembers.slice(0, 2)) {
    const member = members[`${m.userId}-${m.poolId}`];
    await prisma.vote.create({
      data: {
        proposalId: hikingProposal.id,
        memberId: member.id,
      },
    });
  }

  // Create moves for Adventure Pool
  const now = new Date();
  const cabinTrip = await prisma.move.create({
    data: {
      title: "Lake Tahoe Cabin Weekend",
      description: "3 nights at a cabin by the lake. Departure Friday 4pm.",
      startTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 17 * 24 * 60 * 60 * 1000),
      location: "Lake Tahoe, CA",
      cost: 800,
      status: "upcoming",
      poolId: adventurePool.id,
      proposalId: cabinProposal.id,
    },
  });

  await prisma.move.create({
    data: {
      title: "Sunset Hike at Twin Peaks",
      description: "Easy 3-mile loop with amazing sunset views. Meet at the trailhead at 5pm.",
      startTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      location: "Twin Peaks Trailhead, SF",
      cost: 0,
      status: "upcoming",
      poolId: adventurePool.id,
    },
  });

  await prisma.move.create({
    data: {
      title: "Morning Group Run",
      description: "5K loop around the park. All paces welcome.",
      startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      location: "Golden Gate Park, SF",
      cost: 0,
      status: "upcoming",
      poolId: fitnessPool.id,
    },
  });

  // Create RSVPs
  await prisma.rsvp.create({ data: { userId: alice.id, moveId: cabinTrip.id, status: "in" } });
  await prisma.rsvp.create({ data: { userId: bob.id, moveId: cabinTrip.id, status: "in" } });
  await prisma.rsvp.create({ data: { userId: carol.id, moveId: cabinTrip.id, status: "in" } });
  await prisma.rsvp.create({ data: { userId: eve.id, moveId: cabinTrip.id, status: "in" } });
  await prisma.rsvp.create({ data: { userId: dave.id, moveId: cabinTrip.id, status: "out" } });

  // Create contributions
  const contributionData = [
    { memberId: members[`${alice.id}-${adventurePool.id}`].id, poolId: adventurePool.id, amount: 50 },
    { memberId: members[`${bob.id}-${adventurePool.id}`].id, poolId: adventurePool.id, amount: 50 },
    { memberId: members[`${carol.id}-${adventurePool.id}`].id, poolId: adventurePool.id, amount: 50 },
    { memberId: members[`${eve.id}-${adventurePool.id}`].id, poolId: adventurePool.id, amount: 50 },
    { memberId: members[`${dave.id}-${adventurePool.id}`].id, poolId: adventurePool.id, amount: 50 },
    { memberId: members[`${alice.id}-${adventurePool.id}`].id, poolId: adventurePool.id, amount: 50 },
    { memberId: members[`${bob.id}-${adventurePool.id}`].id, poolId: adventurePool.id, amount: 50 },
    { memberId: members[`${carol.id}-${adventurePool.id}`].id, poolId: adventurePool.id, amount: 50 },
  ];

  for (const c of contributionData) {
    await prisma.contribution.create({ data: c });
  }

  // Create transactions (contributions in)
  for (const c of contributionData) {
    const member = await prisma.member.findUnique({ where: { id: c.memberId }, include: { user: true } });
    await prisma.transaction.create({
      data: {
        poolId: c.poolId,
        type: "contribution",
        amount: c.amount,
        description: `${member?.user.name} contributed $${c.amount}`,
      },
    });
  }

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
