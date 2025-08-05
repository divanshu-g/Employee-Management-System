const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function login(email, password) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log('User not found');
      return false;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      console.log('Invalid password');
      return false;
    }

    // Optionally check for a specific role like 'SuperAdmin'
    const superAdminRole = await prisma.role.findFirst({ where: { role_name: 'CEO' } });
    if (!superAdminRole) {
      console.log('SuperAdmin role not found');
      return false;
    }

    const userRole = await prisma.userRole.findFirst({
      where: {
        user_id: user.user_id,
        role_id: superAdminRole.role_id,
        is_active: true,
      },
    });

    if (!userRole) {
      console.log('User does not have SuperAdmin role');
      return false;
    }

    console.log('Login successful!');
    return true;

  } catch (err) {
    console.error('Login error:', err);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Replace with your test credentials
const email = 'admin123@ems.com';
const password = 'mySecret123';

login(email, password).then(result => {
  if (result) {
    console.log('Test passed: Credentials are correct.');
  } else {
    console.log('Test failed: Credentials are incorrect.');
  }
});
