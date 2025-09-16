import { PrismaClient, Role, EventType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@necf.org' },
    update: {},
    create: {
      email: 'admin@necf.org',
      firstName: 'System',
      lastName: 'Administrator',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      phone: '+1234567890',
      isActive: true,
    },
  });

  console.log('Created admin user:', adminUser.email);

  // Create sample pastor
  const pastorPassword = await bcrypt.hash('pastor123', 12);
  const pastor = await prisma.user.upsert({
    where: { email: 'pastor@necf.org' },
    update: {},
    create: {
      email: 'pastor@necf.org',
      firstName: 'John',
      lastName: 'Smith',
      password: pastorPassword,
      role: Role.PASTOR,
      phone: '+1234567891',
      isActive: true,
    },
  });

  console.log('Created pastor user:', pastor.email);

  // Create sample members
  const members = [
    {
      email: 'member1@example.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: Role.MEMBER,
    },
    {
      email: 'member2@example.com',
      firstName: 'Michael',
      lastName: 'Brown',
      role: Role.MEMBER,
    },
    {
      email: 'leader@necf.org',
      firstName: 'David',
      lastName: 'Wilson',
      role: Role.LEADER,
    },
  ];

  for (const member of members) {
    const memberPassword = await bcrypt.hash('member123', 12);
    const createdMember = await prisma.user.upsert({
      where: { email: member.email },
      update: {},
      create: {
        ...member,
        password: memberPassword,
        phone: `+123456789${Math.floor(Math.random() * 10)}`,
        isActive: true,
      },
    });
    console.log('Created member:', createdMember.email);
  }

  // Create sample events
  const now = new Date();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + (7 - now.getDay()));

  const events = [
    {
      title: 'Sunday Morning Service',
      description: 'Weekly Sunday morning worship service',
      eventType: EventType.SUNDAY_SERVICE,
      startTime: new Date(nextSunday.setHours(10, 0, 0, 0)),
      endTime: new Date(nextSunday.setHours(12, 0, 0, 0)),
      location: 'Main Sanctuary',
      isRecurring: true,
      maxCapacity: 200,
      createdById: pastor.id,
    },
    {
      title: 'Midweek Prayer Meeting',
      description: 'Wednesday evening prayer and fellowship',
      eventType: EventType.PRAYER_MEETING,
      startTime: new Date(new Date().setDate(now.getDate() + 3)).setHours(19, 0, 0, 0),
      endTime: new Date(new Date().setDate(now.getDate() + 3)).setHours(20, 30, 0, 0),
      location: 'Fellowship Hall',
      isRecurring: true,
      maxCapacity: 100,
      createdById: pastor.id,
    },
    {
      title: 'Youth Bible Study',
      description: 'Weekly youth Bible study session',
      eventType: EventType.BIBLE_STUDY,
      startTime: new Date(new Date().setDate(now.getDate() + 5)).setHours(18, 0, 0, 0),
      endTime: new Date(new Date().setDate(now.getDate() + 5)).setHours(19, 30, 0, 0),
      location: 'Youth Room',
      isRecurring: true,
      maxCapacity: 50,
      createdById: pastor.id,
    },
  ];

  for (const event of events) {
    const createdEvent = await prisma.event.create({
      data: {
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
      },
    });
    console.log('Created event:', createdEvent.title);
  }

  // Create memberships for sample users
  const allUsers = await prisma.user.findMany();
  
  for (const user of allUsers) {
    if (user.role !== Role.SUPER_ADMIN) {
      await prisma.membership.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          membershipId: `NECF${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          joinDate: new Date(2020, 0, 1),
          status: 'ACTIVE',
        },
      });
      console.log('Created membership for:', user.email);
    }
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
