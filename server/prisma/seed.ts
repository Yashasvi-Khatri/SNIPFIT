import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('Admin@123', 12);
  const trainerPasswordHash = await bcrypt.hash('Trainer@123', 12);
  const memberPasswordHash = await bcrypt.hash('Member@123', 12);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@snipfit.in' },
    update: {},
    create: {
      email: 'admin@snipfit.in',
      name: 'SNIPFIT Admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create trainer
  const trainer = await prisma.user.upsert({
    where: { email: 'trainer@snipfit.in' },
    update: {},
    create: {
      email: 'trainer@snipfit.in',
      name: 'Rahul Sharma',
      passwordHash: trainerPasswordHash,
      role: 'TRAINER',
      phone: '+919876543210',
    },
  });
  console.log('✅ Created trainer:', trainer.email);

  // Create sample members
  const member1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      passwordHash: memberPasswordHash,
      role: 'MEMBER',
      phone: '+919876543211',
    },
  });
  console.log('✅ Created member:', member1.email);

  const member2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      passwordHash: memberPasswordHash,
      role: 'MEMBER',
      phone: '+919876543212',
    },
  });
  console.log('✅ Created member:', member2.email);

  // Create PLUS memberships for members
  const now = new Date();
  const membershipStart = new Date(now);
  const membershipEnd = new Date(now);
  membershipEnd.setMonth(membershipEnd.getMonth() + 1);

  await prisma.membership.upsert({
    where: { id: 'membership-1' },
    update: {},
    create: {
      id: 'membership-1',
      userId: member1.id,
      plan: 'PLUS',
      status: 'ACTIVE',
      startDate: membershipStart,
      endDate: membershipEnd,
      price: 7999,
    },
  });
  console.log('✅ Created PLUS membership for John Doe');

  await prisma.membership.upsert({
    where: { id: 'membership-2' },
    update: {},
    create: {
      id: 'membership-2',
      userId: member2.id,
      plan: 'PLUS',
      status: 'ACTIVE',
      startDate: membershipStart,
      endDate: membershipEnd,
      price: 7999,
    },
  });
  console.log('✅ Created PLUS membership for Jane Smith');

  // Create sample gym classes for this week (Mon-Fri)
  const classTypes = ['YOGA', 'STRENGTH', 'CARDIO', 'HIIT', 'ZUMBA'];

  const classNames = [
    'Morning Yoga Flow',
    'Strength Training Basics',
    'Cardio Blast',
    'HIIT Intensity',
    'Zumba Dance Party',
  ];

  const startOfWeek = new Date(now);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday

  for (let i = 0; i < 5; i++) {
    const classDate = new Date(startOfWeek);
    classDate.setDate(classDate.getDate() + i);
    
    const startTime = new Date(classDate);
    startTime.setHours(18, 0, 0, 0); // 6:00 PM

    const endTime = new Date(classDate);
    endTime.setHours(19, 0, 0, 0); // 7:00 PM

    await prisma.gymClass.create({
      data: {
        name: classNames[i],
        type: classTypes[i] as any,
        trainerId: trainer.id,
        startTime,
        endTime,
        capacity: 20,
        location: 'Main Floor',
        description: `A ${classNames[i].toLowerCase()} session suitable for all fitness levels.`,
      },
    });
    console.log(`✅ Created class: ${classNames[i]} on ${classDate.toDateString()}`);
  }

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
