import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setAdminSecurityCode() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: npx ts-node scripts/setAdminSecurityCode.ts <email> <security-code>');
    console.log('Example: npx ts-node scripts/setAdminSecurityCode.ts admin@snipfit.com ABC123');
    process.exit(1);
  }

  const email = args[0];
  const securityCode = args[1];

  // Validate that both arguments are provided
  if (!email || !securityCode) {
    console.log('Error: Both email and security code are required');
    process.exit(1);
  }

  // Validate security code format (exactly 6 alphanumeric characters)
  if (securityCode.length !== 6 || !/^[a-zA-Z0-9]+$/.test(securityCode)) {
    console.log('Error: Security code must be exactly 6 alphanumeric characters');
    process.exit(1);
  }

  try {
    // Find user by email (with type assertion for Prisma)
    const user = await prisma.user.findUnique({
      where: { email: email as string },
    });

    if (!user) {
      console.log(`Error: User with email ${email} not found`);
      process.exit(1);
    }

    if (user.role !== 'ADMIN') {
      console.log(`Error: User ${email} is not an admin`);
      process.exit(1);
    }

    // Update security code (with type assertion for Prisma)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { adminSecurityCode: securityCode as string },
    });

    console.log(`✅ Security code set successfully for ${email}`);
    console.log(`User: ${updatedUser.name} (${updatedUser.email})`);
    console.log(`Security Code: ${securityCode}`);
    console.log(`⚠️  Store this code securely! Do not share it.`);
    
  } catch (error) {
    console.error('Error setting security code:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setAdminSecurityCode();