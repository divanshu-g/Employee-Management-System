const prisma = require("../prismaClient");

const createDepartment = async (req, res) => {
  const {
    department_name,
    department_code,
    description,
    parent_department_id,
    is_active,
    department_head_id,
  } = req.body;

  try {
    if (!department_name || !department_code) {
      return res
        .status(400)
        .json({ message: "Department name and depatment code are required" });
    }

    const user_id = req.user.user_id;

    const department = await prisma.department.create({
      data: {
        department_name,
        department_code,
        description,
        parent_department_id,
        is_active,
        department_head_id,
        created_by_id: user_id,
        updated_by_id: user_id,
      },
    });
    return res.status(201).json({ message: "Department Created", department });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Department already exists" });
    }
    return res
      .status(500)
      .json({ message: "Intenal Server Error", error: error.message });
  }
};

const getAllDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany();
    if (departments.length === 0) {
      return res.status(404).json({ message: "No department found" });
    }
    return res.status(200).json({ message: "Departments", departments });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", err: error.message });
  }
};

const getDepartmentById = async (req, res) => {
  const department_id = parseInt(req.params.id, 10);

  try {
    const department = await prisma.department.findUnique({
      where: { department_id },
    });
    if (!department) {
      return res.status(400).json({ message: "department not found" });
    }
    return res.status(200).json({ department });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", err: error.message });
  }
};

const getDepartmentByCode = async(req, res) => {
  const dpt_code = req.params.code;
  
  try{
    const departmentcode = await prisma.department.findUnique({
      where: {department_code: dpt_code}
    })
    if(!departmentcode){
      return res.status(400).json({message: "Give department code"})
    }
    return res.status(200).json({message: "Departments", departmentcode})
  }catch(error){
    if(error.code == "P2005"){
      return res.status(404).json({message: "Department not found"})
    }
    return res.status(500).json({message: "Internal server error"})

  }
}

const updateDepartment = async (req, res) => {
  const department_id = parseInt(req.params.id, 10);

  const {
    department_name,
    department_code,
    description,
    parent_department_id,
    is_active,
    department_head_id,
  } = req.body;

  const user_id = req.user.user_id;

  try {
    const updatedepartment = await prisma.department.update({
      where: { department_id },
      data: {
        ...(department_name ? { department_name } : {}),
        ...(department_code ? { department_code } : {}),
        description: description !== undefined ? description : undefined,
        parent_department_id:
          parent_department_id !== undefined ? parent_department_id : undefined,
        is_active: is_active !== undefined ? is_active : undefined,
        department_head_id:
          department_head_id !== undefined ? department_head_id : undefined,
        updated_by_id: user_id,
      },
    });
    return res
      .status(200)
      .json({ message: "Department updated successfully", updatedepartment });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Department not found" });
    }
    return res.status(500).json({ message: "Department not updated" });
  }
};

const deleteDepartment = async (req, res) => {
  const department_id = parseInt(req.params.id, 10);

  try {
    const deletedpeartment = await prisma.department.update({
      where: { department_id },
      data: { is_active: false },
    });
    return res
      .status(200)
      .json({ message: "Department Deleted", deletedpeartment });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Department not found" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

const activateDepartment = async (req, res) => {
  const department_id = parseInt(req.params.id, 10);

  try {
    const deletedpeartment = await prisma.department.update({
      where: { department_id },
      data: { is_active: true },
    });
    return res
      .status(200)
      .json({ message: "Department Deleted", deletedpeartment });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Department not found" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getDepartmentByCode,
  activateDepartment
};
