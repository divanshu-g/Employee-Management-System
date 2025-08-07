const prisma = require('../prismaClient');

const ALLOWED_ROLES = ["superAdmin", "subAdmin"]

async function createRoles(req, res, next) {
    try{
        const userRoles = req.user.roles || [];
        // .some method check if the element exists in the array or not 
        // return boolean value and in params takes a callback
        const allowed = ALLOWED_ROLES.some(r => userRoles.includes(r));
    
        if(!allowed){
            return res.status(403).json({message: "Forbidden: Not authorized to create roles."});
        }

        const {role_name, role_type, role_description, permissions, is_active} = req.body;

        if(!role_name || !role_type){
            return res.status(400).json({message: "role_name and role_type are required"});   
        }

        const newRole = await prisma.role.create({
            // in prisma always send data as object
            data: {
                role_name,
                role_type,
                role_description: role_description || null,
                permissions: permissions || null,
                is_active: is_active !== undefined ? is_active : true
            }
        })
        res.status(201).json(newRole);
    }
    catch(error){
        if(error.code === 'P2002'){
            return res.status(409).json({message: 'Role name already exists'});
        }
        next(error);
    }

}

module.exports = {
    createRoles
};