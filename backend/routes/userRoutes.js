const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const{emailvalidation, passwordvalidation} = require("../middlewares/validatorMiddleware");

// All user management routes require authentication and either superAdmin or subAdmin role
const managementRoles = ['superAdmin', 'subAdmin'];

router.post('/',authMiddleware, roleMiddleware(managementRoles), emailvalidation, passwordvalidation, userController.createUser);
router.get('/', authMiddleware, roleMiddleware(managementRoles), userController.getallUsers);
router.get('/:id', authMiddleware, roleMiddleware(managementRoles), userController.getUserById);
router.put('/:id', authMiddleware, userController.updateUserPass);
router.delete('/deactivate/:id',authMiddleware,roleMiddleware(managementRoles),userController.inactiveUser);
router.put('/activate/:id',authMiddleware,roleMiddleware(managementRoles),userController.activeUser);

router.get('/by-email/:email', async (req, res, next) => {
  try {
    const { email } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        user_roles: {
          where: { is_active: true },
          include: { role: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user_id: user.user_id,
      email: user.email,
      is_active: user.is_active,
      roles: user.user_roles.map(ur => ur.role.role_type),
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
