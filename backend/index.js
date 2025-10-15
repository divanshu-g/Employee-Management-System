const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const roleMiddleware = require('./middlewares/roleMiddleware');
const userRoutes = require('./routes/userRoutes'); 
const roleRoutes = require("./routes/roleRoutes");
const userRoleRoutes = require("./routes/userRoleRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const positionRoutes = require("./routes/positionRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const timeSheetRoutes = require("./routes/timeSheetRoutes");

const PORT = process.env.PORT || 3000;

const app = express();

// Parse JSON bodies
app.use(express.json());

// Configure session middleware - must come before routes
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key', // Set strong secret in .env
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true,
    secure: false,             // Set to true if using HTTPS in production
    maxAge: 60 * 60 * 1000    // 1 hour session expiry
  }
}));

// Configure CORS after session middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,          // Allow cookies to be sent by client
}));

// Define your routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); 
app.use('/api/role', roleRoutes);
app.use("/api/userRole", userRoleRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/position", positionRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/timesheet", timeSheetRoutes);

// Example protected route using your middlewares
app.get('/api/protected', authMiddleware, roleMiddleware(['superAdmin', 'subAdmin', 'employee']), (req, res) => {
  res.json({ message: 'Access granted to protected resource!', user: req.user });
});




// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});