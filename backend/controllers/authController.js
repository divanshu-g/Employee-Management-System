const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")

const ALLOWED_ROLES = ['superAdmin', 'subAdmin', 'employee']; // Allowed roles for login

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

    // Update last login
    await prisma.user.update({
      where: { email },
      data: { last_login: new Date() },
    });

    const token = jwt.sign({
      user_id: user.user_id,
      email: user.email,
      roles,
      is_active: user.is_active
    },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Return success response, no token needed with session
    return res.json({
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        email: user.email,
        roles,
        is_active: user.is_active,
        last_login: user.last_login,
      },
      token
    });

  } catch (error) {
    next(error);
  }
}


module.exports = {
  login,
};
