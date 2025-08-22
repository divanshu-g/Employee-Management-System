const prisma = require('../prismaClient');


const createEmployee = async (req, res) => {
    const { user_id , employee_code , first_name, last_name, personal_email, phone_number, emergency_contact , date_of_birth , gender , address , department_id, position_id , employee_type , work_location , hire_date , probation_end_date , direct_manager_id , skip_level_manager_id , employee_status , is_people_manager , created_by_id , updated_by_id , confirmation_date , termination_date } = req.body;
    const userid = req.user.user_id;

    //validation 
    if (!employee_code || !first_name || !last_name || !personal_email || !phone_number || !hire_date || !user_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }



    try {
        const newEmployee = await prisma.employee.create({
            data: {
                user_id: user_id,
                employee_code,
                first_name,
                last_name,
                personal_email,
                phone_number,
                emergency_contact,
                date_of_birth,
                gender,
                address,
                department_id,
                position_id,
                employee_type,
                work_location,
                hire_date,
                probation_end_date,
                direct_manager_id,
                skip_level_manager_id,
                employee_status,
                is_people_manager,
                created_by_id: userid,
                updated_by_id: userid,
                confirmation_date,
                termination_date,
            }
        });

        return res.status(201).json({
            message: 'Employee created successfully',
            newEmployee
        });
    }

    catch (error) {
        if(error.code === 'P2002') {
            return res.status(409).json({ message: 'Employee code already exists' });
        }
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

const getAllEmployees = async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({});
        return res.status(200).json({ employees });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
 
async function getEmployeebycode(req,res) {
    const employeecode = req.params.code;
    if(!employeecode){
        return res.status(400).json({message : "Enter the employee code"});
    }

    try {
        const employee = await prisma.employee.findUnique({
            where : {employee_code : employeecode}
        })

        return res.status(200).json({employee});
    } catch (error) {
        return res.status(500).json({message: "Internal server error" , error : error.message});
    }
}

async function getEmployeeByUserEmail(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Please provide the email" });
  }

  try {
    // Step 1: Find the user with given email and include employee
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        employees: {
          include: {
            department: true,
            position: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.employees || user.employees.length === 0) {
      return res.status(404).json({ message: "No employee associated with this user" });
    }

    // Step 2: Return employee data
    return res.status(200).json({
      message: "Employee fetched successfully",
      employee: user.employees[0] // assuming one employee per user
    });

  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

async function updateEmployee(req, res) {
    const {
        first_name,
        last_name,
        personal_email,
        phone_number,
        emergency_contact,
        date_of_birth,
        gender,
        address,
        department_id,
        position_id,
        employee_type,
        work_location,
        hire_date,
        probation_end_date,
        direct_manager_id,
        skip_level_manager_id,
        employee_status,
        is_people_manager,
        confirmation_date,
        termination_date
    } = req.body;

    const userid = req.user.user_id;   // logged-in user id
    const employeeid = req.params.code; // employee_code passed in route as code

    try {
        const employee = await prisma.employee.update({
            where: { employee_code: employeeid },
            data: {
                first_name,
                last_name,
                personal_email,
                phone_number,
                emergency_contact,
                date_of_birth,
                gender,
                address,
                department_id,
                position_id,
                employee_type,
                work_location,
                hire_date,
                probation_end_date,
                direct_manager_id,
                skip_level_manager_id,
                employee_status,
                is_people_manager,
                created_by_id: userid,
                updated_by_id: userid,
                confirmation_date,
                termination_date,
            }
        });

        return res.status(200).json({ message: "Employee updated successfully", employee });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function getEmployeesByDepartment(req, res) {
    try {
        const  department_id  = parseInt(req.params.dptid,10);
        const employees = await prisma.employee.findMany({
            where: { department_id }
        });
        return res.status(200).json({ employees });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}



module.exports = {
    createEmployee , getAllEmployees , getEmployeebycode, getEmployeeByUserEmail, updateEmployee , getEmployeesByDepartment
};