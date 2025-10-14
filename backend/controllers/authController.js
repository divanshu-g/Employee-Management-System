const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');

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

    // Set session user info instead of generating JWT
    req.session.user = {
      user_id: user.user_id,
      email: user.email,
      roles: roles,
    };

    // Return success response, no token needed with session
    return res.json({
      message: 'Login successful, session established',
    });

  } catch (error) {
    next(error);
  }
}




module.exports = {
  login,
};
