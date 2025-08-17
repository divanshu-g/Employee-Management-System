const prisma = require('../prismaClient');
const createEmployee = async (req, res) => {
    const { employee_code , first_name, last_name, personal_email, phone_number, emergency_contact , date_of_birth , gender , address , department_id, position_id , employee_type , work_location , hire_date , probation_end_date , direct_manager_id , skip_level_manager_id , employee_status , is_people_manager , created_by_id , updated_by_id , confirmation_date , termination_date } = req.body;
    const user_id = req.user.user_id;

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
                created_by_id: user_id,
                updated_by_id: user_id,
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

module.exports = {
    createEmployee , getAllEmployees
};