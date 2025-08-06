function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: 'Unauthorized (no user)' });
    const userRoles = req.user.roles|| [];
    if (!userRoles.some(role => allowedRoles.includes(role)))
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    next();
  };
}

module.exports = roleMiddleware;
