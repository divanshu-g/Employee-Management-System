const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');

async function createUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists with this email.' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create User record (no related roles or employee yet)
  const user = await prisma.user.create({
    data: {
      email,
      password_hash: hashedPassword,
      // You can add other core fields here if you want (e.g. is_active default is true)
    }
  });

  return res.status(201).json({ message: 'User created successfully', userId: user.user_id });
}

module.exports = {
  createUser,
};
