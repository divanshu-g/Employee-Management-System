const prisma = require("../prismaClient");

const ALLOWED_ROLES = ["superAdmin", "subAdmin"];

async function createRoles(req, res, next) {
  try {
    const userRoles = req.user.roles || [];

    const allowed = ALLOWED_ROLES.some((r) => userRoles.includes(r));

    if (!allowed) {
      return res
        .status(403)
        .json({ message: "Forbidden: Not authorized to create roles." });
    }

    const { role_name, role_type, role_description, permissions, is_active } =
      req.body;

    if (!role_name || !role_type) {
      return res
        .status(400)
        .json({ message: "role_name and role_type are required" });
    }

    const newRole = await prisma.role.create({
      // in prisma always send data as object
      data: {
        role_name,
        role_type,
        role_description: role_description || null,
        permissions: permissions || null,
        is_active: is_active !== undefined ? is_active : true,
      },
    });
    res.status(201).json(newRole);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Role name already exists" });
    }
    next(error);
  }
}

async function getAllRoles(req, res, next) {
  try {
    const roles = await prisma.role.findMany();
    res.status(200).json(roles);
  } catch (error) {
    next(error);
  }
}

async function getRoleById(req, res, next) {
  const role_id = parseInt(req.params.id, 10);
  try {
    const role = await prisma.role.findUnique({ where: { role_id } });
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.status(200).json(role);
  } catch (error) {
    next(error);
  }
}

async function updateRole(req, res, next) {
  // Enforce allowed roles
  // .some method check if the element exists in the array or not
  // return boolean value and in params takes a callback
  const userRoles = req.user.roles || [];
  const allowed = ALLOWED_ROLES.some((r) => userRoles.includes(r));
  if (!allowed) {
    return res
      .status(403)
      .json({ message: "Forbidden: Not authorized to update roles." });
  }
  const role_id = parseInt(req.params.id, 10);
  const { role_name, role_type, role_description, permissions, is_active } =
    req.body;
  try {
    const updatedRole = await prisma.role.update({
      where: { role_id },
      data: {
        ...(role_name ? { role_name } : {}),
        ...(role_type ? { role_type } : {}),
        role_description:
          role_description !== undefined ? role_description : undefined,
        permissions: permissions !== undefined ? permissions : undefined,
        is_active: is_active !== undefined ? is_active : undefined,
      },
    });
    res.status(200).json(updatedRole);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Role not found" });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Role name already exists" });
    }
    next(error);
  }
}

async function deleteRole(req, res, next) {
  // Enforce allowed roles
  const userRoles = req.user.roles || [];
  const allowed = ALLOWED_ROLES.some((r) => userRoles.includes(r));
  if (!allowed) {
    return res
      .status(403)
      .json({ message: "Forbidden: Not authorized to delete roles." });
  }
  const role_id = parseInt(req.params.id, 10);
  try {
    // Soft delete
    const deletedRole = await prisma.role.update({
      where: { role_id },
      data: { is_active: false },
    });
    res.status(200).json({ message: "Role soft-deleted", role: deletedRole });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Role not found" });
    }
    next(error);
  }
}

module.exports = {
  createRoles,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
};
