const prisma = require("../prismaClient")
const bcrypt = require("bcrypt")

async function assignRolesToUser(req, res) {
  // Log the entire request body to verify incoming data
  console.log('Request Body:', req.body);

  // Destructure snake_case keys from the request body
  const { user_id, role_id } = req.body;
  const assigner_id = req.user.user_id;

  // Log each parameter individually
  console.log('user_id:', user_id);
  console.log('role_id:', role_id);
  console.log('assigned_by_id:', assigner_id);

  // Basic validation to check for missing parameters
  if (!user_id) {
    console.log('user_id is missing or invalid');
    return res.status(400).json({ error: 'user_id is required.' });
  }
  if (!role_id) {
    console.log('role_id is missing or invalid');
    return res.status(400).json({ error: 'role_id is required.' });
  }
  if (!assigner_id) {
    console.log('assigned_by_id is missing or invalid');
    return res.status(400).json({ error: 'assigned_by_id is required.' });
  }

  try {
    // Fetch the role_type of the role to be assigned
    const targetRole = await prisma.role.findUnique({
      where: { role_id: role_id },
      select: { role_type: true }
    });
    console.log('Fetched targetRole:', targetRole);

    if (!targetRole) {
      console.log(`No role found with role_id: ${role_id}`);
      return res.status(404).json({ error: 'Target role not found' });
    }

    // Fetch the assigning user's active role
    const assignedByUserRoleRecord = await prisma.userRole.findFirst({
      where: { user_id: assigner_id, is_active: true },
      include: { role: true }
    });
    console.log('Fetched assignedByUserRoleRecord:', assignedByUserRoleRecord);

    if (!assignedByUserRoleRecord) {
      console.log(`No active role found for assigning user with user_id: ${assigner_id}`);
      return res.status(403).json({ error: 'Assigning user role not found or inactive' });
    }

    const assigningRoleType = assignedByUserRoleRecord.role.role_type;
    const targetRoleType = targetRole.role_type;

    console.log(`Assigning role_type: ${assigningRoleType}, target role_type: ${targetRoleType}`);

    // Permission logic based on the role_type enums
    if (assigningRoleType === 'superAdmin') {
      if (!['superAdmin', 'subAdmin', 'employee'].includes(targetRoleType)) {
        console.log("Permission denied: SuperAdmin can only assign 'superAdmin', 'subAdmin', or 'employee' roles.");
        return res.status(403).json({ error: "SuperAdmin can only assign 'superAdmin', 'subAdmin', or 'employee' roles." });
      }
    } else if (assigningRoleType === 'subAdmin') {
      if (targetRoleType !== 'employee') {
        console.log("Permission denied: SubAdmin can only assign 'employee' role.");
        return res.status(403).json({ error: "SubAdmin can only assign 'employee' role." });
      }
    } else {
      console.log('Permission denied: User is not allowed to assign roles.');
      return res.status(403).json({ error: 'You are not allowed to assign roles.' });
    }

    // Create the user-role assignment
    const userRole = await prisma.userRole.create({
      data: {
        user_id: user_id,
        role_id: role_id,
        assigned_by_id: assigner_id,
        is_active: true
      }
    });

    console.log('Created userRole record:', userRole);
    return res.status(201).json(userRole);

  } catch (error) {
    // Log detailed error information on failure
    console.error('Error assigning user to role:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {assignRolesToUser}