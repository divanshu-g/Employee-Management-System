const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");

async function assignRolesToUser(req, res) {
  // Destructure snake_case keys from the request body
  const { user_id, role_id } = req.body;
  const assigner_id = req.user.user_id;

  // Basic validation to check for missing parameters
  if (!user_id) {
    return res.status(400).json({ error: "user_id is required." });
  }
  if (!role_id) {
    return res.status(400).json({ error: "role_id is required." });
  }
  if (!assigner_id) {
    return res.status(400).json({ error: "assigned_by_id is required." });
  }

  try {
    // Fetch the role_type of the role to be assigned
    const targetRole = await prisma.role.findUnique({
      where: { role_id: role_id },
      select: { role_type: true },
    });

    if (!targetRole) {
      return res.status(404).json({ error: "Target role not found" });
    }

    // Fetch the assigning user's active role
    const assignedByUserRoleRecord = await prisma.userRole.findFirst({
      where: { user_id: assigner_id, is_active: true },
      include: { role: true },
    });

    if (!assignedByUserRoleRecord) {
      return res
        .status(403)
        .json({ error: "Assigning user role not found or inactive" });
    }

    const assigningRoleType = assignedByUserRoleRecord.role.role_type;
    const targetRoleType = targetRole.role_type;

    // Permission logic based on the role_type enums
    if (assigningRoleType === "superAdmin") {
      if (!["superAdmin", "subAdmin", "employee"].includes(targetRoleType)) {
        return res
          .status(403)
          .json({
            error:
              "SuperAdmin can only assign 'superAdmin', 'subAdmin', or 'employee' roles.",
          });
      }
    } else if (assigningRoleType === "subAdmin") {
      if (targetRoleType !== "employee") {
        return res
          .status(403)
          .json({ error: "SubAdmin can only assign 'employee' role." });
      }
    } else {
      return res
        .status(403)
        .json({ error: "You are not allowed to assign roles." });
    }

    // Create the user-role assignment
    const userRole = await prisma.userRole.create({
      data: {
        user_id: user_id,
        role_id: role_id,
        assigned_by_id: assigner_id,
        is_active: true,
      },
    });

    return res.status(201).json(userRole);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", err: error.message});
  }
}

async function getUserRole(req, res) {
  try {
    const UserRole = await prisma.userRole.findMany();
    return res.status(200).json({ UserRole });
  } catch (error) {
    return res.status(500).json({ message: "UserRole not found" });
  }
}

async function getUserRoleById(req, res) {
  const id = parseInt(req.params.id, 10);
  try {
    const UserRoleById = await prisma.userRole.findUnique({
      where: { user_role_id: id },
    });

    if (!UserRoleById) {
      return res.status(400).json({ message: "UserRole id not found" });
    }

    return res.status(200).json({ message: "Userfound", UserRoleById });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error 500" });
  }
}

async function updateUserRole(req, res) {
  const id = parseInt(req.params.id, 10);

  // Only allow is_active to be updated for safety
  const { is_active } = req.body;

  if (typeof is_active !== "boolean") {
    return res
      .status(400)
      .json({ message: "is_active (boolean) is required for update." });
  }

  try {
    const userRole = await prisma.userRole.update({
      where: { user_role_id: id },
      data: { is_active },
    });
    return res.status(200).json(userRole);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "UserRole not found" });
    }
    return res.status(500).json({ message: "Internal server error 500" });
  }
}

module.exports = {
  assignRolesToUser,
  getUserRole,
  getUserRoleById,
  updateUserRole,
};
