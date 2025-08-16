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

async function getUserById(req, res, next) {
    const userId = parseInt(req.params.id, 10);
    try{
        const user = await prisma.user.findUnique({
            where: {user_id: userId},
            include:{
                user_roles: {include: {role: true}}
            }
        })
        if(!user) return res.status(404).json({message: "User Not Found"});

        res.json({
            user_id : user.user_id,
            email : user.email,
            is_active : user.is_active,
            roles : user.user_roles.map(ur => ur.role.role_type),
            created_at : user.created_at,
            updated_at : user.updated_at,
            last_login : user.last_login    
        });
    }
    catch(error){
        next(error);
    }
    
}

async function createUser(req, res, next) {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Hash password with bcrypt
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        is_active: true,
      },
    });

    // Return success response without password_hash
    res.status(201).json({
      message: 'User created successfully',
      user: {
        user_id: user.user_id,
        email: user.email,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
        
      },
    });
  } catch (error) {
    // Prisma unique constraint violation code for email
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    next(error);
  }
}

async function updateUserPass(req,res){  //forgot password functionality
  const id = parseInt(req.params.id);
  const {password} = req.body;

  if(!password){
    return res.status(400).json({message : "Enter Email"});
  }

  try{
    const salt = 10;
    const hashedpass = await bcrypt.hash(password , salt);
    const userpass = await prisma.user.update({
      where : {user_id  : id},
      data : {
        password_hash : hashedpass
      }
    })
    return res.status(200).json({message : "Password updated successfully"},userpass);
  }
  catch(error){
    return res.status(500).json({message : "Failed to update"});
  }
}

async function inactiveUser(req,res){
 const userid = parseInt(req.params.id, 10);
  if(!userid){
    return res.status(400).json({message : "Please enter Email"});
  }
  try{

  const inactive = await prisma.user.update({
    where : {user_id : userid},
    data:{
      is_active : false
    }
  })
  

  return res.status(200).json({message : "user Deactivated"})
}
catch(error){
  return res.status.json({message: "Unable to Update"});
}
}

async function activeUser(req,res){
 const userid = parseInt(req.params.id,10);
  if(!userid){
    return res.status(400).json({message : "Please enter Email"});
  }
  try{

  const inactive = await prisma.user.update({
    where : {user_id : userid},
    data:{
      is_active : true
    }
  })

  return res.status(200).json({message : "user Activated"})
}
catch(error){
  return res.status.json({message: "Unable to Update"});
}
}

module.exports = {getallUsers, getUserById, createUser , updateUserPass , inactiveUser,  activeUser};
