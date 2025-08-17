const express = require('express');
const cors = require('cors');
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

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); 
app.use('/api/role', roleRoutes);
app.use("/api/userRole", userRoleRoutes)
app.use("/api/department", departmentRoutes);
app.use("/api/position", positionRoutes);
app.use("/api/employee", employeeRoutes);


// Example protected route:
app.get('/api/protected', authMiddleware, roleMiddleware(['superAdmin', 'subAdmin', 'employee']), (req, res) => {
  res.json({ message: 'Access granted to protected resource!', user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
