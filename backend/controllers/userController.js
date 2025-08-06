const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');

const ALLOWED_MANAGEMENT_ROLES = ['superAdmin','subAdmin'];

//get all User
async function getallUsers(req,res,next) {
    try{
        const users = await prisma.user.findMany({
            include : {
                user_roles : {include : {role:true}},
            }
        });

        const result = users.map(user => ({
            user_id : user.user_id,
            email : user.email,
            is_active : user.is_active,
            roles : user.user_roles.map(ur => ur.role.role_type),
            created_at : user.created_at,
            updated_at : user.updated_at,
            last_login : user.last_login
        }));

        res.json(result);
    }

    catch(error){
        next(error);
    }
}


module.exports = {getallUsers};
