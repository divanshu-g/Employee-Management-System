const validation = require("validator");

const emailvalidation = async(req, res, next) => {
    
    const {email} = req.body;
    const validemail = validation.isEmail(email);
    const checkdomain = validation.matches(email, /^[\w.-]+@ems\.com$/);

    if(validemail && checkdomain){
        return next();
    }
    return res.status(401).json({message: "Email not valid"});
}

const passwordvalidation = async(req, res, next) => {
    const {password} = req.body;
    const validpassword = validation.isStrongPassword(password);

    if(validpassword){
        return next();
    }
    return res.status(401).json({message: "Please use a strong password"});
}

module.exports = {
    emailvalidation,
    passwordvalidation
}