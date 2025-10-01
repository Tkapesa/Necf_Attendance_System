import { PrismaClient, RoleType, SessionType, AttendanceStatus, QRTokenPurpose, Member } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Roles
  console.log('Seeding roles...');
  for (const role of Object.values(RoleType)) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: {
        id: uuidv4(),
        name: role,
        description: `${role} role`,
      },
    });
  }

  // Super Admin User
  console.log('Creating super admin user...');
  const superAdminRole = await prisma.role.findUnique({
    where: { name: RoleType.SUPER_ADMIN },
  });

  const hashedPassword = await bcrypt.hash('admin123', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@necf.org' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'admin@necf.org',
      firstName: 'Super',      // camelCase
      lastName: 'Admin',       // camelCase
      password: hashedPassword,
      roleId: superAdminRole!.id,  // camelCase
      isActive: true,              // camelCase
    },
  });

  // Members
  console.log('Seeding members...');
  const members: Member[] = await Promise.all([
    prisma.member.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        id: uuidv4(),
        membershipId: 'M001',     // camelCase
        firstName: 'John',        // camelCase
        lastName: 'Doe',          // camelCase
        email: 'john.doe@example.com',
        joinDate: new Date(),     // camelCase
        createdById: superAdmin.id, // camelCase
      },
    }),
    prisma.member.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        id: uuidv4(),
        membershipId: 'M002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        joinDate: new Date(),
        createdById: superAdmin.id,
      },
    }),
  ]);

  // Sessions
  console.log('Seeding sessions...');
  const sessions = await Promise.all([
    prisma.session.upsert({
      where: { title: 'Sunday Service' },
      update: {},
      create: {
        id: uuidv4(),
        title: 'Sunday Service',
        description: 'Weekly Sunday Service',
        sessionType: SessionType.SUNDAY_SERVICE, // camelCase
        startTime: new Date(),                   // camelCase
        endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
        location: 'Main Auditorium',
      },
    }),
    prisma.session.upsert({
      where: { title: 'Bible Study' },
      update: {},
      create: {
        id: uuidv4(),
        title: 'Bible Study',
        description: 'Weekly Bible Study',
        sessionType: SessionType.BIBLE_STUDY,
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + 90 * 60 * 1000),
        location: 'Conference Room',
      },
    }),
  ]);

  // Attendance
  console.log('Seeding attendance...');
  await prisma.attendance.createMany({
    data: members.map((member: Member, index: number) => ({
      id: uuidv4(),
      memberId: member.id,                       // camelCase
      sessionId: sessions[index % sessions.length].id, // camelCase
      status: AttendanceStatus.PRESENT,
      checkInTime: new Date(),                  // camelCase
      recordedById: superAdmin.id,
    })),
    skipDuplicates: true,
  });

  // QR Tokens
  console.log('Seeding QR tokens...');
  for (const member of members) {
    await prisma.qRToken.create({             //  Model: QrToken → Client: qrToken
      data: {
        id: uuidv4(),
        token: uuidv4(),
        purpose: QRTokenPurpose.ATTENDANCE,
        expiresAt: new Date(new Date().getTime() + 60 * 60 * 1000), //  camelCase
        memberId: member.id,                   //  camelCase
        createdById: superAdmin.id,
      },
    });
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });