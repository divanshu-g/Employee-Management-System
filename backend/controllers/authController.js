const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const ALLOWED_ROLES = ['superAdmin', 'subAdmin', 'employee']; // Only these roles allowed for login

async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        user_roles: {
          where: { is_active: true },
          include: { role: true }
        }
      }
    });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // 2. Compare passwords
    const validPass = await bcrypt.compare(password, user.password_hash);
    if (!validPass) return res.status(401).json({ message: 'Invalid credentials' });

    // 3. Check if user has at least one allowed role
    const roles = user.user_roles.map(ur => ur.role.role_type);
    const hasAllowedRole = roles.some(r => ALLOWED_ROLES.includes(r));

    if (!hasAllowedRole) {
      return res.status(403).json({ message: 'User is not authorized to login' });
    }

    //last login attached whenever login happens 
    await prisma.user.update({
      where: { email },
      data: {
        last_login: new Date(), // stores current timestamp
      },
    });

    // 4. Generate JWT token with user info and roles
    const tokenPayload = {
      userId: user.user_id,
      email: user.email,
      roles: roles,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

    // 5. Return token and user info (excluding sensitive fields)
    return res.json({
      message: 'Login successful',
      token,
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
};
